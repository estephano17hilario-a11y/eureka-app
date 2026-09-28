import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import type { DeviceStatus } from '../types';

export type VibrationIntensity = 'light' | 'medium' | 'heavy';

export class NativeService {
  private static instance: NativeService;
  private vibrationEnabled: boolean = true;
  private vibrationIntensity: VibrationIntensity = 'medium';
  private notificationsEnabled: boolean = false;
  private notificationTime: string = '20:00';
  private isLandscape: boolean = false;

  private constructor() {
    this.restoreSettings();
  }

  public static getInstance(): NativeService {
    if (!NativeService.instance) {
      NativeService.instance = new NativeService();
    }
    return NativeService.instance;
  }

  private async restoreSettings(): Promise<void> {
    try {
      const vibStored = localStorage.getItem('eureka_setting_vibration_enabled');
      if (vibStored !== null) {
        this.vibrationEnabled = vibStored === 'true';
      }

      const intensityStored = localStorage.getItem('eureka_setting_vibration_intensity') as VibrationIntensity;
      if (intensityStored && ['light', 'medium', 'heavy'].includes(intensityStored)) {
        this.vibrationIntensity = intensityStored;
      }

      const notifStored = localStorage.getItem('eureka_setting_notifications_enabled');
      if (notifStored !== null) {
        this.notificationsEnabled = notifStored === 'true';
      }

      const timeStored = localStorage.getItem('eureka_setting_notification_time');
      if (timeStored) {
        this.notificationTime = timeStored;
      }

      // Sincronización nativa con Preferences de Capacitor
      const [prefVib, prefInt, prefNotif, prefTime] = await Promise.all([
        Preferences.get({ key: 'eureka_setting_vibration_enabled' }).catch(() => ({ value: null })),
        Preferences.get({ key: 'eureka_setting_vibration_intensity' }).catch(() => ({ value: null })),
        Preferences.get({ key: 'eureka_setting_notifications_enabled' }).catch(() => ({ value: null })),
        Preferences.get({ key: 'eureka_setting_notification_time' }).catch(() => ({ value: null }))
      ]);

      if (prefVib.value !== null) this.vibrationEnabled = prefVib.value === 'true';
      if (prefInt.value && ['light', 'medium', 'heavy'].includes(prefInt.value as any)) {
        this.vibrationIntensity = prefInt.value as VibrationIntensity;
      }
      if (prefNotif.value !== null) this.notificationsEnabled = prefNotif.value === 'true';
      if (prefTime.value) this.notificationTime = prefTime.value;
    } catch {
      // Usar valores por defecto en fallback
    }
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
        osVersion: typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows') ? 'Windows' : 'Web Engine'
      };
    }
  }

  // --- GESTIÓN DE VIBRACIÓN & RESPUESTA HÁPTICA ---

  public getVibrationEnabled(): boolean {
    return this.vibrationEnabled;
  }

  public setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
    localStorage.setItem('eureka_setting_vibration_enabled', enabled ? 'true' : 'false');
    Preferences.set({ key: 'eureka_setting_vibration_enabled', value: enabled ? 'true' : 'false' }).catch(() => {});
    if (enabled) {
      this.triggerHaptics('light');
    }
  }

  public getVibrationIntensity(): VibrationIntensity {
    return this.vibrationIntensity;
  }

  public setVibrationIntensity(intensity: VibrationIntensity): void {
    this.vibrationIntensity = intensity;
    localStorage.setItem('eureka_setting_vibration_intensity', intensity);
    Preferences.set({ key: 'eureka_setting_vibration_intensity', value: intensity }).catch(() => {});
    if (this.vibrationEnabled) {
      this.triggerHaptics(intensity);
    }
  }

  /**
   * Dispara una vibración háptica calibrada a la intensidad y preferencia del usuario.
   */
  public async triggerHaptics(style: 'light' | 'medium' | 'heavy' | 'success' = 'medium'): Promise<void> {
    if (!this.vibrationEnabled) return;

    // Calibrar estilo según la intensidad global configurada
    let effectiveStyle = style;
    if (style !== 'success') {
      if (this.vibrationIntensity === 'light') {
        effectiveStyle = 'light';
      } else if (this.vibrationIntensity === 'heavy') {
        effectiveStyle = style === 'light' ? 'medium' : 'heavy';
      }
    }

    try {
      if (effectiveStyle === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        const impactStyle =
          effectiveStyle === 'light'
            ? ImpactStyle.Light
            : effectiveStyle === 'heavy'
            ? ImpactStyle.Heavy
            : ImpactStyle.Medium;
        await Haptics.impact({ style: impactStyle });
      }
    } catch {
      // Fallback web: navigator.vibrate si está disponible
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = effectiveStyle === 'heavy' ? 45 : effectiveStyle === 'light' ? 12 : 25;
        navigator.vibrate(duration);
      }
    }
  }

  // --- GESTIÓN DE NOTIFICACIONES Y RECORDATORIOS DE ESTUDIO ---

  public getNotificationsEnabled(): boolean {
    return this.notificationsEnabled;
  }

  public async setNotificationsEnabled(enabled: boolean): Promise<boolean> {
    if (enabled) {
      const granted = await this.requestNotificationPermission();
      if (!granted) {
        this.notificationsEnabled = false;
        localStorage.setItem('eureka_setting_notifications_enabled', 'false');
        Preferences.set({ key: 'eureka_setting_notifications_enabled', value: 'false' }).catch(() => {});
        return false;
      }
    }
    this.notificationsEnabled = enabled;
    localStorage.setItem('eureka_setting_notifications_enabled', enabled ? 'true' : 'false');
    Preferences.set({ key: 'eureka_setting_notifications_enabled', value: enabled ? 'true' : 'false' }).catch(() => {});
    return true;
  }

  public getNotificationTime(): string {
    return this.notificationTime;
  }

  public setNotificationTime(time: string): void {
    this.notificationTime = time;
    localStorage.setItem('eureka_setting_notification_time', time);
    Preferences.set({ key: 'eureka_setting_notification_time', value: time }).catch(() => {});
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (typeof Notification !== 'undefined') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Envía una notificación local de prueba o recordatorio
   */
  public async scheduleTestNotification(): Promise<void> {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('🌟 Eureka - ¡Hora de Repasar!', {
          body: 'Tienes tarjetas pendientes para consolidar en tu memoria a largo plazo.',
          icon: '/favicon.ico'
        });
      }
    } catch {}
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

  /**
   * Alterna la orientación de la pantalla entre horizontal (Landscape) y vertical (Portrait)
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
