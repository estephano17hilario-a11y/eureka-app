import { eurekaBackend } from './backend.service';

export type BgThemeType =
  | 'desk_wood'
  | 'cabin'
  | 'library'
  | 'office'
  | 'zen_garden'
  | 'cyber_grid'
  | 'space_station'
  | 'modern_black' | 'holo_cyber' | 'emerald_vision' | 'digital_blue' | 'sunset_magenta';

export interface AppCustomizationTheme {
  accentColor: string;
  accentName: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'red';
  bgTheme: BgThemeType;
  cardRadius: 'super_rounded' | 'standard' | 'sharp';
  cardSurface: 'matte' | 'glass' | 'obsidian' | 'holo';
  uiScale: 'comfortable' | 'normal';
  paperStyle: 'auto' | 'classic' | 'night';
}

const STORAGE_KEY = 'eureka_customization_theme_v2';

const DEFAULT_THEME: AppCustomizationTheme = {
  accentColor: '#38bdf8',
  accentName: 'blue',
  bgTheme: 'desk_wood',
  cardRadius: 'super_rounded',
  cardSurface: 'glass',
  uiScale: 'comfortable',
  paperStyle: 'auto'
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
    return { ...this.currentTheme };
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
      sunset_magenta: '#120b14'
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
    // Ambientes cuyo papel nativo es oscuro (pantallas / HUD)
    const darkPaperEnvs: string[] = ['cyber_grid', 'space_station'];
    if (paperStyle === 'night' || (paperStyle === 'auto' && darkPaperEnvs.includes(this.currentTheme.bgTheme))) {
      body.classList.add('paper-dark');
    }
  }
}

export const themeService = ThemeService.getInstance();
