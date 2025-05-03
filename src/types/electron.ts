export type ElectronAPI = {
  onTimerTrigger: (callback: (event: any) => void) => () => void
  updateTrigger: (type: 'keyboard' | 'mouse', value: string) => void
  toggleOverlayMode: (isOverlay: boolean) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export interface Settings {
  hotkey: string;
  triggerType: 'keyboard' | 'mouse';
  mouseButton: 'LEFT' | 'RIGHT' | 'MIDDLE' | null;
}

export interface IpcEvents {
  'trigger-timer': () => void;
  'update-trigger': (options: { type: 'keyboard' | 'mouse', value: string }) => void;
} 