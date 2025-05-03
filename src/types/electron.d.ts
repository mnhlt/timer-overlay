export interface ElectronAPI {
  onTimerTrigger: (callback: (event: any) => void) => () => void
  updateTrigger: (type: 'keyboard' | 'mouse', value: string) => void
  toggleOverlayMode: (isOverlay: boolean) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} 