# Timer Overlay

<div align="center">
  <img src="public/timer-icon.png" alt="Timer Overlay Icon" width="128" height="128">
</div>

> A global countdown timer that floats above your applications with hotkey/mouse trigger support

<div align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#faq">FAQ</a> •
  <a href="#development">Development</a> •
  <a href="#license">License</a>
</div>

## Key Features

- **Global Overlay Timer**: Countdown timer that remains visible on top of all other applications
- **Flexible Triggers**: Start your timer with customizable keyboard shortcuts or mouse buttons
- **Dual-Mode Interface**:
  - **Setup Mode**: Configure your timer and triggers with an intuitive interface
  - **Overlay Mode**: Minimalist, transparent display that stays out of your way
- **Advanced Hotkey Support**:
  - Up to three keys per shortcut (including modifiers)
  - Supports all major modifier keys (Ctrl, Alt, Shift, Command)
  - Dedicated mouse button trigger options
- **Transparency Control**: Adjust the overlay visibility to your preferences
- **Draggable Interface**: Position the timer anywhere on your screen
- **Lock/Unlock Function**: Prevent accidental movement during use
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### Windows

1. Download the latest `Timer-Overlay-Setup-x.x.x.exe` from the [Releases](https://github.com/mnhlt/timer-overlay/releases) page
2. Run the installer and follow the on-screen instructions
3. Launch Timer Overlay from your Start menu or desktop shortcut

### macOS

1. Download the latest `Timer-Overlay-x.x.x.dmg` from the [Releases](https://github.com/mnhlt/timer-overlay/releases) page
2. Open the DMG file and drag Timer Overlay to your Applications folder
3. Launch Timer Overlay from your Applications folder or Launchpad

### Linux

1. Download the latest `Timer-Overlay-x.x.x.AppImage` from the [Releases](https://github.com/mnhlt/timer-overlay/releases) page
2. Make the AppImage executable: `chmod +x Timer-Overlay-x.x.x.AppImage`
3. Run the AppImage: `./Timer-Overlay-x.x.x.AppImage`

## Usage

### Quick Start

1. Launch Timer Overlay
2. Set your desired countdown duration (in seconds)
3. Configure your preferred hotkey combination or mouse button
4. Click "Switch to Overlay" to enable the transparent overlay
5. Use your configured hotkey or mouse button to trigger the timer from any application
6. Click "Main" to return to the setup interface

### Setting Up Keyboard Shortcuts

1. In the Hotkey Setup section, select "Keyboard Shortcut" as the trigger type
2. Choose your preferred modifier keys (Control, Alt, Shift, etc.)
3. Select a trigger key (letter, number, or function key)
4. Your hotkey is saved automatically

### Setting Up Mouse Triggers

1. In the Hotkey Setup section, select "Mouse Button" as the trigger type
2. Select your preferred mouse button from the dropdown menu
3. Your mouse trigger is saved automatically

### Working with the Overlay

- **Move**: Click and drag the overlay to position it anywhere on your screen
- **Lock**: Click the lock button (🔒) to prevent accidental movement
- **Unlock**: Click the unlock button (🔓) to make the overlay movable again
- **Return to Main**: Click the "Main" button to go back to the setup interface

## Screenshots

<div align="center">
  <img src="public/screenshots/setup-mode.png" alt="Setup Mode" width="400">
  <p><em>Setup Mode - Configure your timer and triggers</em></p>
  
  <img src="public/screenshots/overlay-mode.png" alt="Overlay Mode" width="400">
  <p><em>Overlay Mode - Minimal interface that stays on top</em></p>
</div>

## FAQ

**Q: Why isn't my hotkey working?**  
A: Some applications may capture certain hotkeys before Timer Overlay can detect them. Try using a different combination that doesn't conflict with your applications.

**Q: Can I use Timer Overlay with streaming software?**  
A: Yes! Timer Overlay works great with OBS, Streamlabs, and other streaming software. The transparent overlay can be captured in your streaming window.

**Q: Does Timer Overlay work with multiple monitors?**  
A: Yes, you can place the overlay on any connected display.

**Q: Will the overlay appear in screenshots or recordings?**  
A: Yes, the overlay will be visible in screenshots and screen recordings.

## Development

For information on building and contributing to Timer Overlay, please see [DEVELOPMENT.md](DEVELOPMENT.md).

## License

MIT

---

<div align="center">
  Created with ❤️ for productivity enthusiasts everywhere
</div>
