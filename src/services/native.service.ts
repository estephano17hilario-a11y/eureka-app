import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import type { DeviceStatus } from '../types';

export class NativeService {
  private static instance: NativeService;

  private constructor() {}

  public static getInstance(): NativeService {
    if (!NativeService.instance) {
      NativeService.instance = new NativeService();
    }
    return NativeService.instance;
  }

  /**
   * Inicializa la configuración de la barra de estado y oculta el splash screen.
   */
  public async initialize(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#090d16' });
        await SplashScreen.hide();
      }
    } catch (err) {
      console.warn('NativeService: Initialization running in web fallback mode', err);
    }
  }

  /**
   * Obtiene la información técnica del dispositivo o entorno.
   */
  public async getDeviceInfo(): Promise<DeviceStatus> {
    const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
    const isNative = Capacitor.isNativePlatform();

    try {
      const info = await Device.getInfo();
      let batteryLevel: number | undefined;
      let isCharging: boolean | undefined;

      try {
        const battery = await Device.getBatteryInfo();
        batteryLevel = battery.batteryLevel ? Math.round(battery.batteryLevel * 100) : undefined;
        isCharging = battery.isCharging;
      } catch {
        // En navegadores o entornos sin soporte de batería
      }

      return {
        platform,
        isNative,
        model: info.model || (isNative ? 'Dispositivo Nativo' : 'Navegador Web'),
        osVersion: `${info.operatingSystem} ${info.osVersion}`,
        batteryLevel,
        isCharging
      };
    } catch {
      return {
        platform,
        isNative,
        model: isNative ? 'Dispositivo Nativo' : 'Navegador Web',
        osVersion: navigator.userAgent.includes('Windows') ? 'Windows' : 'Web Engine'
      };
    }
  }

  /**
   * Dispara una vibración háptica con soporte para dispositivos móviles y web.
   */
  public async triggerHaptics(style: 'light' | 'medium' | 'heavy' | 'success' = 'medium'): Promise<void> {
    try {
      if (style === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        const impactStyle =
          style === 'light'
            ? ImpactStyle.Light
            : style === 'heavy'
            ? ImpactStyle.Heavy
            : ImpactStyle.Medium;
        await Haptics.impact({ style: impactStyle });
      }
    } catch {
      // Fallback web: navigator.vibrate si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate(style === 'heavy' ? 40 : 20);
      }
    }
  }

  /**
   * Almacena valores clave-valor persistentes mediante Preferences.
   */
  public async setStorage(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  /**
   * Obtiene un valor almacenado.
   */
  public async getStorage(key: string): Promise<string | null> {
    const result = await Preferences.get({ key });
    return result.value;
  }

  private isLandscape: boolean = false;

  /**
   * Alterna la orientación de la pantalla entre horizontal (Landscape) y vertical (Portrait)
   * de forma nativa en Android y navegadores móviles con soporte W3C Screen Orientation,
   * aplicando sincronización por clase CSS en documentElement.
   */
  public async toggleScreenOrientation(): Promise<boolean> {
    this.isLandscape = !this.isLandscape;

    try {
      const screenAny = screen as any;
      if (this.isLandscape) {
        if (screenAny?.orientation?.lock) {
          await screenAny.orientation.lock('landscape').catch(() => {});
        } else if (screenAny?.lockOrientation) {
          screenAny.lockOrientation('landscape');
        }
      } else {
        if (screenAny?.orientation?.unlock) {
          screenAny.orientation.unlock();
        } else if (screenAny?.orientation?.lock) {
          await screenAny.orientation.lock('portrait').catch(() => {});
        } else if (screenAny?.unlockOrientation) {
          screenAny.unlockOrientation();
        }
      }
    } catch (err) {
      console.info('Screen orientation lock managed:', err);
    }

    if (this.isLandscape) {
      document.documentElement.classList.add('eureka-landscape-mode');
    } else {
      document.documentElement.classList.remove('eureka-landscape-mode');
    }

    await this.triggerHaptics('light');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eureka-orientation-change', { detail: { isLandscape: this.isLandscape } }));
    }

    return this.isLandscape;
  }

  public getIsLandscape(): boolean {
    return this.isLandscape;
  }
}

export const nativeService = NativeService.getInstance();
