import { eurekaBackend } from './backend.service';

export type BgThemeType =
  | 'desk_wood'
  | 'cabin'
  | 'library'
  | 'office'
  | 'zen_garden'
  | 'cyber_grid'
  | 'space_station'
  | 'modern_black' | 'holo_cyber' | 'emerald_vision' | 'digital_blue' | 'sunset_magenta'
  | 'clean_glass';

/** Personalización avanzada por elemento. Los valores 'default' o vacíos dejan intacto el estilo del ambiente. */
export interface AdvancedStyle {
  // Fondo
  bgDim: number; // 0-70 · oscurecimiento extra (%)
  bgBlur: number; // 0-24 · desenfoque (px)
  bgSaturate: number; // 40-160 · saturación (%)
  bgColor: string; // color sólido que sustituye al fondo
  // Botones
  btnShape: 'default' | 'pill' | 'rounded' | 'square';
  btnStyle: 'default' | 'solid' | 'gradient' | 'glass' | 'outline';
  btnColor: string;
  btnSize: 'default' | 'compact' | 'large';
  btnShadow: 'default' | 'none' | 'glow';
  // Cuadernos
  nbStyle: 'default' | 'flat' | 'glass';
  nbRadius: number; // -1 = el del ambiente
  nbShadow: 'default' | 'none' | 'deep';
  // Tarjetas y listas
  cardBg: string;
  cardOpacity: number; // 30-100
  cardBorder: 'default' | 'none' | 'thin' | 'accent';
  cardBlur: number; // 0-30
  // Flashcards
  fcBg: string;
  fcText: string;
  fcFont: 'default' | 'serif' | 'mono' | 'hand' | 'rounded';
  fcScale: number; // 80-150
  fcRadius: number; // -1 = el del ajuste general
  fcBar: 'default' | 'none' | 'top' | 'left';
  // Contenido (hoja de lectura)
  paperBg: string;
  paperInk: string;
  contentFont: 'default' | 'serif' | 'sans' | 'mono' | 'hand';
  contentScale: number; // 85-150
  contentLine: number; // 120-210 · interlineado (%), 0 = el del ambiente
  // Navegación y texto general
  navStyle: 'default' | 'glass' | 'solid' | 'minimal';
  uiFont: 'default' | 'inter' | 'outfit' | 'serif' | 'mono';
  textColor: string;
}

export const DEFAULT_ADVANCED: AdvancedStyle = {
  bgDim: 0,
  bgBlur: 0,
  bgSaturate: 100,
  bgColor: '',
  btnShape: 'default',
  btnStyle: 'default',
  btnColor: '',
  btnSize: 'default',
  btnShadow: 'default',
  nbStyle: 'default',
  nbRadius: -1,
  nbShadow: 'default',
  cardBg: '',
  cardOpacity: 100,
  cardBorder: 'default',
  cardBlur: 0,
  fcBg: '',
  fcText: '',
  fcFont: 'default',
  fcScale: 100,
  fcRadius: -1,
  fcBar: 'default',
  paperBg: '',
  paperInk: '',
  contentFont: 'default',
  contentScale: 100,
  contentLine: 0,
  navStyle: 'default',
  uiFont: 'default',
  textColor: ''
};

export interface AppCustomizationTheme {
  accentColor: string;
  accentName: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'red';
  bgTheme: BgThemeType;
  cardRadius: 'super_rounded' | 'standard' | 'sharp';
  cardSurface: 'matte' | 'glass' | 'obsidian' | 'holo';
  uiScale: 'comfortable' | 'normal';
  paperStyle: 'auto' | 'classic' | 'night';
  advanced: AdvancedStyle;
}

const STORAGE_KEY = 'eureka_customization_theme_v2';

const DEFAULT_THEME: AppCustomizationTheme = {
  accentColor: '#38bdf8',
  accentName: 'blue',
  bgTheme: 'desk_wood',
  cardRadius: 'super_rounded',
  cardSurface: 'glass',
  uiScale: 'comfortable',
  paperStyle: 'auto',
  advanced: { ...DEFAULT_ADVANCED }
};

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: AppCustomizationTheme;

  private getThemeStorageKey(): string {
    const uid = eurekaBackend.getUserId();
    return `${STORAGE_KEY}_${uid}`;
  }

  private constructor() {
    this.currentTheme = { ...DEFAULT_THEME };
    this.loadFromStorage();
    this.applyTheme();
    this.syncWithCloud();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.getThemeStorageKey()) || localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.currentTheme = { ...DEFAULT_THEME, ...JSON.parse(saved) };
        this.currentTheme.advanced = { ...DEFAULT_ADVANCED, ...(this.currentTheme.advanced || {}) };
        // Versiones anteriores guardaban 'cream' como valor por defecto: ahora el papel sigue al ambiente
        if ((this.currentTheme.paperStyle as string) === 'cream') this.currentTheme.paperStyle = 'auto';
      } catch {
        this.currentTheme = { ...DEFAULT_THEME };
      }
    } else {
      this.currentTheme = { ...DEFAULT_THEME };
    }
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  public getTheme(): AppCustomizationTheme {
    return { ...this.currentTheme, advanced: { ...DEFAULT_ADVANCED, ...(this.currentTheme.advanced || {}) } };
  }

  public getAdvanced(): AdvancedStyle {
    return { ...DEFAULT_ADVANCED, ...(this.currentTheme.advanced || {}) };
  }

  /** Cambia opciones avanzadas y las aplica al instante (sin volver a dibujar la pantalla). */
  public setAdvanced(partial: Partial<AdvancedStyle>): void {
    this.setTheme({ advanced: { ...this.getAdvanced(), ...partial } });
  }

  /** Vista previa en vivo: aplica sin guardar (útil mientras se arrastra un control deslizante). */
  public previewAdvanced(partial: Partial<AdvancedStyle>): void {
    this.currentTheme = { ...this.currentTheme, advanced: { ...this.getAdvanced(), ...partial } };
    this.applyTheme();
  }

  public resetAdvanced(): void {
    this.setTheme({ advanced: { ...DEFAULT_ADVANCED } });
  }

  public setTheme(partial: Partial<AppCustomizationTheme>): void {
    this.currentTheme = { ...this.currentTheme, ...partial };
    localStorage.setItem(this.getThemeStorageKey(), JSON.stringify(this.currentTheme));
    this.applyTheme();

    eurekaBackend.saveUserSettings({
      theme: this.currentTheme.bgTheme,
      settingsJson: { customizationTheme: this.currentTheme }
    }).catch(() => {});
  }

  public async syncWithCloud(): Promise<void> {
    try {
      this.loadFromStorage();
      const userSettings = await eurekaBackend.fetchUserSettings();
      if (userSettings?.settingsJson?.customizationTheme) {
        this.currentTheme = { ...DEFAULT_THEME, ...userSettings.settingsJson.customizationTheme };
        this.currentTheme.advanced = { ...DEFAULT_ADVANCED, ...(this.currentTheme.advanced || {}) };
        if ((this.currentTheme.paperStyle as string) === 'cream') this.currentTheme.paperStyle = 'auto';
        localStorage.setItem(this.getThemeStorageKey(), JSON.stringify(this.currentTheme));
        this.applyTheme();
      }
    } catch {}
  }

  public applyTheme(): void {
    const root = document.documentElement;
    const body = document.body;

    const accents: Record<string, string> = {
      blue: '#38bdf8',
      green: '#10b981',
      purple: '#a855f7',
      amber: '#f59e0b',
      pink: '#ec4899',
      red: '#ef4444'
    };

    const color = accents[this.currentTheme.accentName] || this.currentTheme.accentColor || '#38bdf8';
    root.style.setProperty('--f-blue', color);
    root.style.setProperty('--f-accent', color);
    const rgb = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
    if (rgb) {
      root.style.setProperty('--f-accent-rgb', `${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)}`);
    }

    // Color de la barra de estado / navegador según el ambiente
    const barColors: Record<string, string> = {
      desk_wood: '#1d130b',
      cabin: '#2a1709',
      library: '#0b1712',
      office: '#141a23',
      zen_garden: '#14171a',
      cyber_grid: '#050a17',
      space_station: '#050615',
      modern_black: '#0e0f14',
      holo_cyber: '#0c0d12',
      emerald_vision: '#0a110e',
      digital_blue: '#090e17',
      sunset_magenta: '#120b14',
      clean_glass: '#0f1220'
    };
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', barColors[this.currentTheme.bgTheme] || '#0e0f14');

    body.className = '';
    body.classList.add(`theme-${this.currentTheme.bgTheme}`);
    body.classList.add(`radius-${this.currentTheme.cardRadius}`);
    body.classList.add(`surface-${this.currentTheme.cardSurface}`);
    body.classList.add(`scale-${this.currentTheme.uiScale}`);
    const paperStyle = this.currentTheme.paperStyle || 'auto';
    body.classList.add(`paper-${paperStyle}`);
    this.applyAdvanced();
    // Ambientes cuyo papel nativo es oscuro (pantallas / HUD)
    const darkPaperEnvs: string[] = ['cyber_grid', 'space_station'];
    if (paperStyle === 'night' || (paperStyle === 'auto' && darkPaperEnvs.includes(this.currentTheme.bgTheme))) {
      body.classList.add('paper-dark');
    }
  }

  /** Traduce la personalización avanzada a clases del body y variables CSS (--u-*). */
  private applyAdvanced(): void {
    const a = this.getAdvanced();
    const root = document.documentElement;
    const body = document.body;
    const setVar = (name: string, value: string | null) => {
      if (value === null || value === '') root.style.removeProperty(name);
      else root.style.setProperty(name, value);
    };

    const flags: [string, string][] = [
      ['adv-btn-shape', a.btnShape],
      ['adv-btn-style', a.btnStyle],
      ['adv-btn-size', a.btnSize],
      ['adv-btn-shadow', a.btnShadow],
      ['adv-nb', a.nbStyle],
      ['adv-nb-shadow', a.nbShadow],
      ['adv-card-border', a.cardBorder],
      ['adv-fc-font', a.fcFont],
      ['adv-fc-bar', a.fcBar],
      ['adv-content-font', a.contentFont],
      ['adv-nav', a.navStyle],
      ['adv-ui-font', a.uiFont]
    ];
    flags.forEach(([prefix, value]) => {
      if (value && value !== 'default') body.classList.add(`${prefix}-${value}`);
    });

    // Fondo
    const filtered = a.bgBlur || a.bgSaturate !== 100 || a.bgDim;
    setVar('--u-bg-filter', filtered ? `blur(${a.bgBlur}px) saturate(${a.bgSaturate}%) brightness(${1 - a.bgDim / 100})` : '');
    setVar('--u-bg-color', a.bgColor);
    if (filtered) body.classList.add('adv-bg-filter');
    if (a.bgColor) body.classList.add('adv-bg-color');

    // Botones
    setVar('--u-btn-color', a.btnColor);
    if (a.btnColor) {
      body.classList.add('adv-btn-color');
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(a.btnColor);
      if (m) {
        const r = parseInt(m[1], 16);
        const g = parseInt(m[2], 16);
        const b = parseInt(m[3], 16);
        setVar('--u-btn-rgb', `${r}, ${g}, ${b}`);
        setVar('--u-btn-ink', (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0b1220' : '#ffffff');
      }
    } else {
      setVar('--u-btn-rgb', '');
      setVar('--u-btn-ink', '');
    }

    // Cuadernos
    setVar('--u-nb-radius', a.nbRadius >= 0 ? `${a.nbRadius}px` : '');
    if (a.nbRadius >= 0) body.classList.add('adv-nb-radius');

    // Tarjetas
    setVar('--u-card-bg', a.cardBg);
    if (a.cardBg) body.classList.add('adv-card-bg');
    setVar('--u-card-opacity', a.cardOpacity < 100 ? String(a.cardOpacity / 100) : '');
    if (a.cardOpacity < 100) body.classList.add('adv-card-opacity');
    setVar('--u-card-blur', a.cardBlur ? `${a.cardBlur}px` : '');
    if (a.cardBlur) body.classList.add('adv-card-blur');

    // Flashcards
    setVar('--u-fc-bg', a.fcBg);
    setVar('--u-fc-text', a.fcText);
    if (a.fcBg) body.classList.add('adv-fc-bg');
    if (a.fcText) body.classList.add('adv-fc-text');
    setVar('--u-fc-scale', a.fcScale !== 100 ? String(a.fcScale / 100) : '');
    if (a.fcScale !== 100) body.classList.add('adv-fc-scale');
    setVar('--u-fc-radius', a.fcRadius >= 0 ? `${a.fcRadius}px` : '');
    if (a.fcRadius >= 0) body.classList.add('adv-fc-radius');

    // Contenido
    setVar('--u-paper-bg', a.paperBg);
    setVar('--u-paper-ink', a.paperInk);
    if (a.paperBg) body.classList.add('adv-paper-bg');
    if (a.paperInk) body.classList.add('adv-paper-ink');
    setVar('--u-content-scale', a.contentScale !== 100 ? String(a.contentScale / 100) : '');
    if (a.contentScale !== 100) body.classList.add('adv-content-scale');
    setVar('--u-content-line', a.contentLine ? String(a.contentLine / 100) : '');
    if (a.contentLine) body.classList.add('adv-content-line');

    // Texto general
    setVar('--u-text-color', a.textColor);
    if (a.textColor) body.classList.add('adv-text-color');
  }
}

export const themeService = ThemeService.getInstance();
