export class TtsService {
  private static instance: TtsService;
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private onStateChangeListeners: Array<(isSpeaking: boolean) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
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

    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/\$+/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;

    // Buscar mejor voz para el idioma
    const voices = this.getAvailableVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices.find(v => v.default);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Error en reproducción TTS:', e);
      this.notify(false);
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
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
