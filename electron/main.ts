import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import type { GlobalKeyboardListener as GKLType, IGlobalKeyEvent } from 'node-global-key-listener'
import type { UiohookKey } from 'uiohook-napi'

// Try to load native modules with error handling
let GlobalKeyboardListener: typeof GKLType | null = null
let uIOhook: any = null

try {
  const { GlobalKeyboardListener: GKL } = require('node-global-key-listener')
  GlobalKeyboardListener = GKL
  console.log('Successfully loaded node-global-key-listener')
} catch (error) {
  console.error('Failed to load node-global-key-listener:', error)
}

try {
  const { uIOhook: uio } = require('uiohook-napi')
  uIOhook = uio
  console.log('Successfully loaded uiohook-napi')
} catch (error) {
  console.error('Failed to load uiohook-napi:', error)
}

const settingsPath = path.join(app.getPath('userData'), 'settings.json')
let keyboardListener: InstanceType<typeof GKLType> | null = null
let lastHotkeyUpdateTime = 0
const HOTKEY_UPDATE_DEBOUNCE = 1000 // 1 second

// Get the correct path to WinKeyServer.exe
const getWinKeyServerPath = () => {
  const isDev = process.env.NODE_ENV === 'development'
  const basePath = isDev 
    ? path.join(process.cwd(), 'node_modules', 'node-global-key-listener', 'bin', 'WinKeyServer.exe')
    : path.join(process.resourcesPath, 'node_modules', 'node-global-key-listener', 'bin', 'WinKeyServer.exe')
  return basePath
}

function loadSettings() {
  try {
    console.log('Loading settings from:', settingsPath)
    if (fs.existsSync(settingsPath)) {
      const rawData = fs.readFileSync(settingsPath, 'utf8')
      console.log('Raw settings data:', rawData)
      
      const settings = JSON.parse(rawData)
      console.log('Parsed settings:', settings)
      
      const finalSettings = {
        ...settings,
        hotkey: settings.hotkey || 'CommandOrControl+Shift+T',
        triggerType: settings.triggerType || 'keyboard',
        mouseButton: settings.mouseButton || null
      }
      console.log('Final settings:', finalSettings)
      return finalSettings
    }
    
    console.log('Settings file does not exist, creating with defaults')
    const defaultSettings = { 
      hotkey: 'CommandOrControl+Shift+T',
      triggerType: 'keyboard',
      mouseButton: null
    }
    console.log('[loadSettings] Calling saveSettings with default settings')
    saveSettings(defaultSettings)
    return defaultSettings
  } catch (error) {
    console.error('Error loading settings:', error)
    console.log('Falling back to default settings due to error')
    const defaultSettings = { 
      hotkey: 'CommandOrControl+Shift+T',
      triggerType: 'keyboard',
      mouseButton: null
    }
    return defaultSettings
  }
}

function saveSettings(settings: any) {
  try {
    console.log('Saving settings to:', settingsPath)
    console.log('Settings to save:', JSON.stringify(settings, null, 2))
    
    // Ensure directory exists
    const settingsDir = path.dirname(settingsPath)
    if (!fs.existsSync(settingsDir)) {
      console.log('Creating settings directory:', settingsDir)
      fs.mkdirSync(settingsDir, { recursive: true })
    }

    // Save settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    console.log('Settings saved successfully')
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let currentHotkey: string | null = null
let lastTriggerTime = 0
const DEBOUNCE_TIME = 400 // ms
const isDev = process.env.NODE_ENV === 'development'

function parseHotkey(hotkey: string) {
  const parts = hotkey.split('+')
  let mainKey = parts[parts.length - 1].toUpperCase()
  
  const keyMap: { [key: string]: string } = {
    'T': 'T',
    'CONTROL': 'CTRL',
    'COMMAND': 'META',
    'OPTION': 'META',
    'ALT': 'ALT',
    'SHIFT': 'SHIFT',
    'COMMANDORCONTROL': 'CTRL',
  }

  mainKey = keyMap[mainKey] || mainKey
  const modifiers = parts.slice(0, -1).map(mod => {
    const upperMod = mod.toUpperCase()
    return keyMap[upperMod] || upperMod
  })

  return { mainKey, modifiers }
}

function setupKeyboardListener() {
  try {
    if (!GlobalKeyboardListener) {
      console.error('GlobalKeyboardListener is not available')
      return
    }

    if (keyboardListener) {
      keyboardListener.kill()
    }

    keyboardListener = new GlobalKeyboardListener({
      windows: {
        serverPath: getWinKeyServerPath(),
      }
    })

    // @ts-ignore - Complex type issue with node-global-key-listener
    keyboardListener.addListener(function (e: IGlobalKeyEvent, isDown: IGlobalKeyEvent['state']) {
      if (!currentHotkey || !isDown || !e.name) return

      const now = Date.now()
      if (now - lastTriggerTime < DEBOUNCE_TIME) {
        return // Ignore triggers that are too close together
      }

      const { mainKey, modifiers } = parseHotkey(currentHotkey)
      const pressedKey = e.name.toUpperCase()

      // Check if the main key matches
      if (pressedKey !== mainKey) return

      // For single key shortcuts, trigger immediately
      if (modifiers.length === 0) {
        triggerTimer()
        return
      }

      // For shortcuts with modifiers, check if they're pressed
      const hasRequiredModifiers = modifiers.every(mod => {
        switch (mod.toLowerCase()) {
          case 'control': return e.state.includes('CTRL')
          case 'alt': return e.state.includes('ALT')
          case 'shift': return e.state.includes('SHIFT')
          case 'command':
          case 'option': return e.state.includes('META')
          default: return false
        }
      })

      if (hasRequiredModifiers) {
        triggerTimer()
      }
    })
  } catch (error) {
    console.error('Error setting up keyboard listener:', error)
  }
}

function setupMouseMonitor() {
  try {
    if (!uIOhook) {
      console.error('uIOhook is not available')
      return
    }

    const settings = loadSettings()
    if (settings.triggerType !== 'mouse' || !settings.mouseButton) {
      console.log('Mouse monitoring disabled')
      uIOhook.stop()
      return
    }

    console.log('Starting mouse monitoring for button:', settings.mouseButton)

    // Map mouse button names to uIOhook button numbers
    const buttonMap: { [key: string]: number } = {
      'LEFT': 1,
      'RIGHT': 2,
      'MIDDLE': 3,
      'BUTTON4': 4,
      'BUTTON5': 5
    }

    const targetButton = buttonMap[settings.mouseButton || '']
    if (!targetButton) {
      console.error('Invalid mouse button:', settings.mouseButton)
      return
    }

    // Remove any existing listeners
    uIOhook.removeAllListeners('mousedown')

    uIOhook.on('mousedown', (event: { button: number }) => {
      if (event.button === targetButton) {
        const now = Date.now()
        if (now - lastTriggerTime >= DEBOUNCE_TIME) {
          console.log('Mouse button pressed:', settings.mouseButton)
          triggerTimer()
        }
      }
    })

    // Start uIOhook
    try {
      uIOhook.start()
    } catch (error) {
      // Ignore error if already started
      console.log('uIOhook start error (might be already running):', error)
    }
  } catch (error) {
    console.error('Error setting up mouse monitor:', error)
  }
}

function registerShortcut(hotkey: string) {
  try {
    const settings = loadSettings()
    if (settings.triggerType === 'keyboard') {
      currentHotkey = hotkey
      setupKeyboardListener()
      // Stop mouse monitoring when switching to keyboard
      uIOhook.stop()
    } else if (settings.triggerType === 'mouse') {
      currentHotkey = null
      setupMouseMonitor()
    }
  } catch (error) {
    console.error('Error registering shortcut:', error)
  }
}

function triggerTimer() {
  const now = Date.now()
  lastTriggerTime = now
  
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('trigger-timer')
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('trigger-timer')
  }
}

async function createOverlayWindow() {
  // Only create a new window if it doesn't exist
  if (!overlayWindow) {
    console.log('Creating overlay window')
    overlayWindow = new BrowserWindow({
      width: 200,
      height: 100,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        devTools: true,
      },
      frame: false,
      transparent: true,
      resizable: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      hasShadow: false,
      focusable: false,
      fullscreenable: false,
      titleBarStyle: 'hidden',
    })

    overlayWindow.setAlwaysOnTop(true, 'screen-saver')
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    overlayWindow.setMovable(true)

    try {
      console.log('Setting up window load events...')
      const loadPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for overlay window to load'))
        }, 10000)

        // Add event listeners before loading URL
        overlayWindow?.webContents.on('did-start-loading', () => {
          console.log('Overlay window started loading')
        })

        overlayWindow?.webContents.on('dom-ready', () => {
          console.log('Overlay window DOM ready')
        })

        overlayWindow?.webContents.on('did-finish-load', () => {
          console.log('Overlay window finished loading')
          clearTimeout(timeout)
          resolve()
        })

        overlayWindow?.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
          console.error('Overlay window failed to load:', errorCode, errorDescription)
          reject(new Error(`Failed to load: ${errorDescription}`))
        })
      })

      // Now load the URL after setting up listeners
      if (isDev) {
        console.log('Loading overlay URL in dev mode...')
        await overlayWindow.loadURL('http://localhost:5173/overlay.html')
        console.log('Overlay URL loaded')
      } else {
        console.log('Loading overlay file in production mode...')
        await overlayWindow.loadFile(path.join(__dirname, '../dist/overlay.html'))
        console.log('Overlay file loaded')
      }

      // Wait for the load to complete
      await loadPromise
      console.log('Overlay window loaded successfully')

      // Move DevTools opening here, after content is loaded
      if (isDev) {
        console.log('Opening DevTools...')
        overlayWindow.webContents.openDevTools({ mode: 'detach' })
      }

      // Handle overlay window closed event
      overlayWindow.on('closed', () => {
        overlayWindow = null
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show()
        }
      })
    } catch (error) {
      console.error('Error creating overlay window:', error)
      if (overlayWindow) {
        overlayWindow.destroy()
        overlayWindow = null
      }
      return null
    }
  }

  return overlayWindow
}

async function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      frame: true,
      backgroundColor: '#ffffff',
      resizable: true,
      minWidth: 200,
      minHeight: 100,
    })

    if (isDev) {
      await mainWindow.loadURL('http://localhost:5173')
    } else {
      await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.show()
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }

    const settings = loadSettings()
    registerShortcut(settings.hotkey)

    mainWindow.on('closed', () => {
      if (overlayWindow) {
        overlayWindow.close()
      }
      mainWindow = null
    })

  } catch (error) {
    console.error('Error during window creation:', error)
    if (mainWindow) {
      mainWindow.destroy()
      mainWindow = null
    }
  }
}

// Update the ipcMain handler to handle both keyboard and mouse triggers
ipcMain.on('update-trigger', (_, { type, value }: { type: 'keyboard' | 'mouse', value: string }) => {
  const now = Date.now()
  if (now - lastHotkeyUpdateTime < HOTKEY_UPDATE_DEBOUNCE) {
    console.log('Debouncing trigger update, last update was', now - lastHotkeyUpdateTime, 'ms ago')
    return
  }
  lastHotkeyUpdateTime = now

  console.log('Updating trigger settings:', { type, value })
  const currentSettings = loadSettings()
  
  const newSettings = {
    ...currentSettings,
    triggerType: type,
    hotkey: type === 'keyboard' ? value : currentSettings.hotkey,
    mouseButton: type === 'mouse' ? value : null
  }

  console.log('[update-trigger] Calling saveSettings with new settings')
  saveSettings(newSettings)

  if (type === 'keyboard') {
    registerShortcut(value)
  } else {
    // Disable keyboard shortcut and enable mouse monitoring
    currentHotkey = null
    setupMouseMonitor()
  }
})

// Add the toggle-overlay-mode handler
ipcMain.on('toggle-overlay-mode', async (_, isOverlay: boolean) => {
  console.log('Toggling overlay mode:', isOverlay)
  try {
    if (isOverlay) {
      // Create overlay window if it doesn't exist
      const overlay = await createOverlayWindow()
      if (overlay) {
        overlay.show()
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.hide()
        }
      }
    } else {
      // Hide overlay and show main window
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.hide()
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show()
      }
    }
  } catch (error) {
    console.error('Error toggling overlay mode:', error)
  }
  console.log('Overlay mode toggled:', isOverlay)
})

// Clean up on app quit
app.on('will-quit', () => {
  if (keyboardListener) {
    keyboardListener.kill()
    keyboardListener = null
  }
  if (overlayWindow) {
    overlayWindow.destroy()
    overlayWindow = null
  }
  uIOhook.stop()
})

// Initialize the appropriate trigger on app start
app.whenReady().then(() => {
  const settings = loadSettings()
  if (settings.triggerType === 'keyboard') {
    setupKeyboardListener()
    registerShortcut(settings.hotkey)
  } else if (settings.triggerType === 'mouse') {
    setupMouseMonitor()
  }
  createWindow()
}).catch(console.error)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!mainWindow) {
    createWindow()
  }
}) 