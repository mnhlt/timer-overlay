import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    onTimerTrigger: (callback: (event: any) => void) => {
      const subscription = (_event: any, value: any) => callback(value)
      ipcRenderer.on('trigger-timer', subscription)
      return () => {
        ipcRenderer.removeListener('trigger-timer', subscription)
      }
    },
    updateTrigger: (type: 'keyboard' | 'mouse', value: string) => {
      ipcRenderer.send('update-trigger', { type, value })
    },
    toggleOverlayMode: (isOverlay: boolean) => {
      ipcRenderer.send('toggle-overlay-mode', isOverlay)
    }
  }
) 