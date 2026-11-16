export class TtsService {
  private static instance: TtsService;
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private onStateChangeListeners: Array<(isSpeaking: boolean) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Las voces se cargan de forma asíncrona: al llegar se vuelve a elegir la mejor
      this.synth.addEventListener?.('voiceschanged', () => this.voiceCache.clear());
    }
  }

  public static getInstance(): TtsService {
    if (!TtsService.instance) {
      TtsService.instance = new TtsService();
    }
    return TtsService.instance;
  }

  public addListener(listener: (isSpeaking: boolean) => void): () => void {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  private notify(isSpeaking: boolean): void {
    this.isSpeaking = isSpeaking;
    this.onStateChangeListeners.forEach(fn => fn(isSpeaking));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /** Velocidad por defecto: un poco más ágil que la normal, sin perder claridad */
  private static readonly DEFAULT_RATE = 1.18;

  private voiceCache = new Map<string, SpeechSynthesisVoice | null>();

  /** Elige la voz más natural para el idioma (neuronales/«Natural» primero, luego Google, Apple premium…) */
  private pickVoice(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices.length) return null;
    const cached = this.voiceCache.get(lang);
    if (cached) return cached;
    const base = lang.split('-')[0].toLowerCase();
    const want = lang.toLowerCase();
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -1;
    for (const v of voices) {
      const vl = v.lang.replace('_', '-').toLowerCase();
      if (!vl.startsWith(base)) continue;
      let score = vl === want ? 100 : 50;
      const n = v.name;
      if (/natural|neural|online/i.test(n)) score += 80;
      if (/premium|enhanced|siri|mejorada/i.test(n)) score += 45;
      if (/google/i.test(n)) score += 30;
      if (!v.localService) score += 8;
      if (/espeak|compact/i.test(n)) score -= 60;
      if (score > bestScore) {
        best = v;
        bestScore = score;
      }
    }
    if (best) this.voiceCache.set(lang, best);
    return best;
  }

  /** Quita el formato (Markdown, huecos, enlaces, fórmulas) para que solo se lea el contenido */
  private cleanForSpeech(text: string): string {
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\$\$?([^$]+)\$\$?/g, (_m, f: string) => ' ' + f.replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}^_]/g, ' ') + ' ')
      .replace(/^\s*(?:#{1,4}|>|-|\d+\.)\s+/gm, '')
      .replace(/[*_~=`|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Trozos por frases: suena más natural y evita que el navegador corte textos largos */
  private chunk(text: string): string[] {
    const sentences = text.match(/[^.!?;:\n]+[.!?;:]*\s*/g) || [text];
    const out: string[] = [];
    let cur = '';
    for (const s of sentences) {
      if (cur && (cur + s).length > 180) {
        out.push(cur.trim());
        cur = '';
      }
      cur += s;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  public speak(
    text: string,
    lang: string = 'es-ES',
    options?: { rate?: number; pitch?: number; onEnd?: () => void }
  ): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis no está disponible en este entorno.');
      return;
    }

    this.stop();

    const cleanText = this.cleanForSpeech(text);
    if (!cleanText) return;

    const chunks = this.chunk(cleanText);
    const voice = this.pickVoice(lang);
    const rate = options?.rate || TtsService.DEFAULT_RATE;
    const token = ++this.session;

    chunks.forEach((part, idx) => {
      const utterance = new SpeechSynthesisUtterance(part);
      utterance.lang = voice?.lang || lang;
      utterance.rate = rate;
      utterance.pitch = options?.pitch || 1.0;
      if (voice) utterance.voice = voice;

      if (idx === 0) utterance.onstart = () => this.notify(true);
      utterance.onend = () => {
        if (token !== this.session || idx < chunks.length - 1) return;
        this.notify(false);
        options?.onEnd?.();
      };
      utterance.onerror = (e) => {
        if (token !== this.session) return;
        if ((e as SpeechSynthesisErrorEvent).error !== 'interrupted' && (e as SpeechSynthesisErrorEvent).error !== 'canceled') console.warn('Error en reproducción TTS:', e);
        this.notify(false);
      };
      this.synth!.speak(utterance);
    });
  }

  private session = 0;

  public stop(): void {
    this.session++;
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = TtsService.getInstance();
