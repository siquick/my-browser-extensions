# Web to Markdown

A Chrome extension that converts web pages to clean, formatted Markdown with a single click.

## Features

- One-click conversion of web pages to Markdown
- Automatically copies converted Markdown to clipboard
- Cleans up unnecessary HTML elements (scripts, forms, styles)
- Supports GitHub Flavored Markdown (GFM)
- Preserves links and images with absolute URLs
- Visual feedback for successful/failed conversions

## Installation

### Development Setup

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd web-to-markdown
bun install
```

2. Build the extension:

```bash
# One-time build
bun run build

# Or watch mode for development
bun run watch
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `dist` directory from your project folder

The extension icon should now appear in your Chrome toolbar!

### Development Workflow

1. Make changes to files in the `src` directory
2. Run `bun run build` (or keep `bun run watch` running)
3. Chrome will automatically reload the extension when `dist` is updated
4. If changes don't appear, click the "Reload" (🔄) button on the extension card in `chrome://extensions/`

## Project Structure

```
web-to-markdown/
├── src/
│   ├── background.ts    # Extension background script
│   ├── content.ts       # Page conversion script
│   ├── utils/
│   │   └── converter.ts # Markdown conversion logic
│   └── types/          # TypeScript definitions
├── public/
│   ├── manifest.json   # Extension manifest
│   └── icons/         # Extension icons
└── dist/              # Built extension files
```

## Development Scripts

- `bun run build` - Build the extension
- `bun run watch` - Watch mode for development

## Technologies

- [Bun](https://bun.sh) - JavaScript runtime and bundler
- [Turndown](https://github.com/mixmark-io/turndown) - HTML to Markdown converter
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/)
- TypeScript for type safety

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Extension not appearing in toolbar**
   - Ensure Developer mode is enabled
   - Check if the extension is enabled in `chrome://extensions/`
   - Try reloading the extension

2. **Changes not reflecting**
   - Click the reload button in `chrome://extensions/`
   - Check the console for errors
   - Ensure `bun run build` completed successfully

3. **Conversion fails**
   - Check the console for error messages
   - Verify the page has a main content area
   - Ensure clipboard permissions are granted

## License

This project is licensed under the MIT License - see the LICENSE file for details.
