export type BgThemeType = 'modern_black' | 'holo_cyber' | 'emerald_vision' | 'digital_blue' | 'sunset_magenta';

export interface AppCustomizationTheme {
  accentColor: string;
  accentName: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'red';
  bgTheme: BgThemeType;
  cardRadius: 'super_rounded' | 'standard' | 'sharp';
  cardSurface: 'matte' | 'glass' | 'obsidian' | 'holo';
  uiScale: 'comfortable' | 'normal';
}

const STORAGE_KEY = 'eureka_customization_theme_v2';

const DEFAULT_THEME: AppCustomizationTheme = {
  accentColor: '#38bdf8',
  accentName: 'blue',
  bgTheme: 'modern_black',
  cardRadius: 'super_rounded',
  cardSurface: 'glass',
  uiScale: 'comfortable'
};

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: AppCustomizationTheme;

  private constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.currentTheme = { ...DEFAULT_THEME, ...JSON.parse(saved) };
      } catch {
        this.currentTheme = { ...DEFAULT_THEME };
      }
    } else {
      this.currentTheme = { ...DEFAULT_THEME };
    }
    this.applyTheme();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentTheme));
    this.applyTheme();
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

    body.className = '';
    body.classList.add(`theme-${this.currentTheme.bgTheme}`);
    body.classList.add(`radius-${this.currentTheme.cardRadius}`);
    body.classList.add(`surface-${this.currentTheme.cardSurface}`);
    body.classList.add(`scale-${this.currentTheme.uiScale}`);
  }
}

export const themeService = ThemeService.getInstance();
