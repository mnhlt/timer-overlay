# Development Guide

This document provides detailed information for developers who want to contribute to or modify the Timer Overlay application.

## Tech Stack

Timer Overlay is built with the following technologies:

- **Electron**: Cross-platform desktop application framework
- **React**: UI component library for building interfaces
- **TypeScript**: Type-safe JavaScript
- **Vite**: Modern build tool and development server
- **node-global-key-listener**: Global keyboard shortcut detection
- **uiohook-napi**: Mouse hook functionality

## Prerequisites

Before you begin development, ensure you have the following installed:

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **Git**: For version control

## Project Structure

```
timer-overlay/
├── electron/                # Electron main process code
│   ├── main.ts              # Main process entry point
│   └── preload.ts           # Preload script for IPC
├── src/                     # Renderer process code
│   ├── components/          # React components
│   │   ├── HotkeySelector.tsx  # Hotkey configuration component
│   │   ├── Timer.tsx        # Timer display component
│   │   └── TimerOverlay.tsx # Overlay mode component
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main window React app
│   ├── OverlayApp.tsx       # Overlay window React app
│   ├── main.tsx             # Main renderer entry point
│   ├── overlay.tsx          # Overlay renderer entry point
│   └── vite-env.d.ts        # Vite environment types
├── public/                  # Static assets
├── dist/                    # Production build output
├── dist-electron/           # Compiled Electron files
├── node_modules/            # Dependencies
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Development Workflow

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mnhlt/timer-overlay.git
   cd timer-overlay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run electron:dev
   ```

This will launch the application in development mode with hot reloading enabled.

### Build Process

To create a production build:

```bash
npm run electron:build
```

This will:
1. Compile TypeScript files
2. Build the React application with Vite
3. Package everything using electron-builder
4. Generate installers in the `dist` directory

### Code Structure

#### Main Process (Electron)

The `electron/` directory contains all code related to the Electron main process:

- **main.ts**: Main entry point that creates windows, sets up IPC, and manages global shortcuts
- **preload.ts**: Exposes safe APIs to the renderer process via contextBridge

#### Renderer Process (React)

The `src/` directory contains the React application that runs in the renderer process:

- **App.tsx**: Main window with setup interface
- **OverlayApp.tsx**: Overlay window with transparent timer display
- **components/**: Reusable React components

### IPC Communication

Communication between the main process (Electron) and renderer process (React) is handled through IPC (Inter-Process Communication):

```typescript
// In preload.ts (exposing APIs)
contextBridge.exposeInMainWorld('electronAPI', {
  onTimerTrigger: (callback) => ipcRenderer.on('trigger-timer', callback),
  toggleOverlayMode: (isOverlay) => ipcRenderer.send('toggle-overlay-mode', isOverlay),
  updateTrigger: (type, value) => ipcRenderer.send('update-trigger', { type, value })
})

// In React components (using exposed APIs)
window.electronAPI.toggleOverlayMode(true)
```

## Key Features Implementation

### Global Hotkeys

Global hotkeys are implemented using:

1. **node-global-key-listener**: For keyboard shortcuts
2. **uiohook-napi**: For mouse button triggers

The main process (`electron/main.ts`) sets up listeners for both keyboard and mouse events, checking them against the user's configured trigger.

### Overlay Window

The transparent overlay is created using Electron's BrowserWindow with specific configurations:

```typescript
overlayWindow = new BrowserWindow({
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  // ...
})
```

### Settings Persistence

User settings are saved to and loaded from the application's user data directory using Node.js's `fs` module.

## Testing

There are no automated tests at this time. Manual testing should focus on:

1. Global hotkey functionality across different applications
2. Overlay window behavior, especially z-index and transparency
3. Settings persistence between application restarts
4. Cross-platform compatibility issues

## Building for Different Platforms

The project is configured to build for Windows, macOS, and Linux using electron-builder.

### Windows

For Windows, the app is packaged as an NSIS installer:

```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64"]
    }
  ]
}
```

### macOS

For macOS, the app is packaged as a DMG:

```json
"mac": {
  "target": "dmg"
}
```

### Linux

For Linux, the app is packaged as an AppImage:

```json
"linux": {
  "target": "AppImage"
}
```

## Known Issues and Limitations

### Native Modules

The application uses native modules which may require rebuilding for different Electron versions. If you encounter issues with native modules:

```bash
npm rebuild
```

### Mouse Hook Detection

Due to security restrictions on some platforms, the mouse hook functionality may require:

1. Administrator privileges on Windows
2. Accessibility permissions on macOS

### Cross-Platform Compatibility

Some features may work differently across platforms:

- **Windows**: Full support for all features
- **macOS**: May require accessibility permissions
- **Linux**: May have limited global hotkey support depending on the desktop environment

## Contributing

We welcome contributions to Timer Overlay! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit with descriptive messages
6. Push to your fork: `git push origin feature/my-feature`
7. Create a pull request

## Debugging

### Development Console

When running in development mode, you can:

1. Access the renderer process console through the standard DevTools (F12)
2. Access the main process logs in the terminal where you ran `npm run electron:dev`

### Common Issues

1. **Global shortcuts not working**: Check for conflicts with system shortcuts
2. **Transparent window issues**: Ensure your OS/desktop environment supports transparent windows
3. **Native module errors**: Try rebuilding with `npm rebuild`

## Publishing

To create a new release:

1. Update the version in `package.json`
2. Create a new build: `npm run electron:build`
3. Test the packaged application
4. Create a new GitHub release with the built installers 