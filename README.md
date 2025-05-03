# Timer Overlay

A customizable timer overlay application built with Electron and React. Features a countdown timer that can be triggered from anywhere using global hotkeys.

## Features

- Countdown timer with customizable duration
- Global hotkey support to trigger the timer from any application
- Two modes:
  - Setup mode with timer configuration and hotkey settings
  - Overlay mode with transparent background and minimal UI
- Configurable hotkey combinations with up to three keys

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run electron:dev
```

### Building

To create a production build:

```bash
npm run electron:build
```

The built application will be available in the `dist` directory.

## Usage

1. Launch the application
2. Set your desired countdown duration (in seconds)
3. Configure your preferred hotkey combination
4. Switch to overlay mode using the button at the bottom
5. Use your configured hotkey combination from any application to trigger the timer
6. Switch back to setup mode using the button in the overlay

## Known Issues

Please check [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for:
- Native module rebuilding requirements
- Mouse hook functionality issues
- Administrator privileges requirements
- Installation size considerations

## License

MIT
