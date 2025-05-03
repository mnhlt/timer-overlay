# Known Issues

## Native Module Rebuilding Required

### Issue
Native modules (`uiohook-napi` and `node-global-key-listener`) may fail to work after installation or when switching Node.js/Electron versions. You might see errors like:
```
Error: The module was compiled against a different Node.js version
```
or
```
Error: Cannot find module [module_name]
```

### Cause
1. Native modules are compiled for specific versions of Node.js and Electron
2. When Node.js or Electron version changes, these modules need to be rebuilt
3. Different platforms (Windows, Mac, Linux) require different binary builds

### Solutions
1. Rebuild native modules for your Electron version:
```bash
# Install electron-rebuild if not already installed
npm install --save-dev @electron/rebuild

# Rebuild native modules
npx electron-rebuild

# Or use the specific Electron version
npx electron-rebuild -v [electron-version]
```

2. If using npm install:
```bash
# After npm install, rebuild native modules
npm install
npx electron-rebuild
```

3. For development, you might need to rebuild after:
   - Updating Electron version
   - Switching Node.js versions
   - Cleaning node_modules
   - Switching between platforms

## uiohook-napi Mouse Hook Issues

### Issue
The mouse hook functionality using `uiohook-napi` may fail to work properly in certain scenarios:
1. Mouse button triggers might not work immediately after installation
2. Mouse hooks may stop working after system sleep/resume
3. Some antivirus software may block the mouse hooks

### Cause
1. `uiohook-napi` uses low-level system hooks that require proper initialization
2. System events like sleep/resume can disrupt the hook connections
3. The module requires proper permissions to monitor mouse events

### Solutions
1. For installation issues:
   - Restart the application after installation
   - Run the application as administrator for the first time
   - Allow the application through Windows Security

2. For sleep/resume issues:
   - The application automatically attempts to reconnect hooks
   - If hooks don't recover, restart the application

3. For antivirus issues:
   - Add the application to your antivirus whitelist
   - Allow the application through Windows Security > App & Browser Control

## Native Modules and Administrator Privileges

### Issue
When building the application, you might encounter errors related to symbolic links and native modules, particularly with `node-global-key-listener` and `uiohook-napi`. The error message might look like:

```
ERROR: Cannot create symbolic link : A required privilege is not held by the client
```

### Cause
1. The application uses native modules for global keyboard and mouse hooks:
   - `node-global-key-listener` for keyboard shortcuts
   - `uiohook-napi` for mouse button monitoring
2. During the build process, electron-builder tries to create symbolic links
3. Windows requires administrator privileges to create symbolic links by default

### Solutions

#### Option 1: Run as Administrator
You can run the build command in an administrator PowerShell:
```powershell
# Run PowerShell as Administrator and then:
npm run electron:build
```

#### Option 2: Disable Code Signing (Recommended)
Add `"sign": false` to the Windows build configuration in package.json:
```json
"win": {
  "target": "nsis",
  "sign": false
}
```
This allows building without administrator privileges.

#### Option 3: Enable Developer Mode
Enable Windows Developer Mode in Windows Settings:
1. Open Windows Settings
2. Go to Privacy & Security > For Developers
3. Turn on Developer Mode

This allows creating symbolic links without administrator privileges.

## Large Installer Size

### Issue
The installer size is relatively large (around 165MB).

### Cause
1. Electron includes a complete Chromium browser engine (~120MB)
2. Native modules add additional size
3. Dependencies like React and development tools

### Solutions
1. Using maximum compression in electron-builder
2. Excluding unnecessary files (source maps, TypeScript declarations)
3. Using asar packaging
4. Removing unused dependencies

Configuration in package.json:
```json
{
  "build": {
    "asar": true,
    "compression": "maximum",
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "!**/*.map",
      "!**/*.d.ts"
    ]
  }
}
``` 