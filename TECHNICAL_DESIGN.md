# Technical Design

## Architecture Overview

### Core Technologies
- **Electron**: Cross-platform desktop application framework
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server

### Application Structure
```
timer-overlay/
├── electron/               # Electron main process code
│   ├── main.ts            # Main process entry point
│   └── preload.ts         # Preload script for IPC
├── src/
│   ├── components/        # React components
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main window React app
│   ├── OverlayApp.tsx    # Overlay window React app
│   ├── overlay.css       # Overlay-specific styles
│   └── index.css         # Main window styles
```

## Core Components

### 1. Main Process (electron/main.ts)
- **Window Management**
  - Creates and manages two windows:
    - Main setup window (`mainWindow`)
    - Transparent overlay window (`overlayWindow`)
  - Handles window state transitions
  - Manages window visibility and z-index

- **Global Hotkey System**
  - Uses `node-global-key-listener` for keyboard shortcuts
  - Uses `uiohook-napi` for mouse button triggers
  - Supports multiple modifier keys (Control, Alt, Shift)
  - Handles both keyboard and mouse input modes

- **Settings Management**
  - Persists user preferences in JSON format
  - Stores hotkey configurations
  - Manages trigger type (keyboard/mouse)
  - Auto-loads settings on startup

### 2. Preload Script (electron/preload.ts)
- **IPC Bridge**
  - Exposes safe APIs to renderer process
  - Handles timer trigger events
  - Manages overlay mode toggling
  - Updates trigger settings

### 3. Main Window (src/App.tsx)
- **Features**
  - Timer duration configuration
  - Hotkey/mouse trigger setup
  - Visual countdown display
  - Overlay mode toggle

- **Components**
  - `Timer`: Displays countdown
  - `HotkeySelector`: Configures triggers
  - Main setup interface

### 4. Overlay Window (src/OverlayApp.tsx)
- **Features**
  - Transparent background
  - Draggable interface
  - Lock/unlock functionality
  - Always-on-top display

- **Components**
  - `TimerOverlay`: Main overlay interface
  - Lock/unlock toggle
  - Return to main window button

## Implementation Details

### 1. Window Management
```typescript
// Create transparent overlay window
overlayWindow = new BrowserWindow({
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
})
```

### 2. IPC Communication
```typescript
// Preload script
contextBridge.exposeInMainWorld('electronAPI', {
  onTimerTrigger: (callback) => ipcRenderer.on('trigger-timer', callback),
  toggleOverlayMode: (isOverlay) => ipcRenderer.send('toggle-overlay-mode', isOverlay),
  updateTrigger: (type, value) => ipcRenderer.send('update-trigger', { type, value })
})
```

### 3. Global Hotkey System
```typescript
// Keyboard listener setup
keyboardListener = new GlobalKeyboardListener({
  windows: {
    serverPath: getWinKeyServerPath()
  }
})

// Mouse hook setup
uIOhook.on('mousedown', (event) => {
  if (event.button === targetButton) {
    triggerTimer()
  }
})
```

### 4. Style Management
- **Main Window**: Traditional window with standard UI
- **Overlay Window**: Transparent background with minimal UI
  ```css
  .overlay-window {
    background: transparent !important;
    -webkit-app-region: drag;
    pointer-events: auto;
  }
  ```

## Build System

### Development
- Vite dev server for hot reloading
- Electron process with auto-restart
- TypeScript compilation in watch mode

### Production
- TypeScript compilation
- Vite production build
- Electron-builder packaging
  - NSIS installer for Windows
  - Asar archive for resources
  - Native module handling

## Recent Improvements

1. **Style Isolation**
   - Separated overlay and main window styles
   - Prevented style leakage between windows
   - Added scoped CSS classes

2. **Native Module Handling**
   - Improved error handling for native modules
   - Added automatic rebuilding support
   - Enhanced cross-platform compatibility

3. **Build Optimization**
   - Reduced installer size
   - Improved compression settings
   - Optimized asset packaging

4. **UI Enhancements**
   - Added pointer-events control
   - Improved overlay dragging
   - Enhanced button accessibility 