export interface DeviceStatus {
  platform: 'ios' | 'android' | 'web';
  isNative: boolean;
  model: string;
  osVersion: string;
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon: string;
  colorClass: 'icon-purple' | 'icon-cyan' | 'icon-pink' | 'icon-emerald';
}

export type TabType = 'home' | 'plugins' | 'insights' | 'settings';

export interface AppState {
  currentTab: TabType;
  device: DeviceStatus;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  hapticsCount: number;
}
