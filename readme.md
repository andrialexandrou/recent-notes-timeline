# Recent Notes Timeline for Obsidian

A clean, Twitter-like timeline view of your recently edited and created notes in Obsidian.

## Features

- Shows a chronological timeline of recently modified and created notes
- Displays note previews with properly rendered Markdown
- Groups notes by date with a clean date format (e.g., "March 16" or "March 16, 2024")
- Automatically refreshes when notes are updated
- Can replace the default "No file is open" view
- Accessible interface focused on content

## Installation

<!-- ### From Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click "Browse" and search for "Recent Notes Timeline"
4. Install the plugin and enable it -->

### Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the zip file
3. Move the extracted folder to your vault's `.obsidian/plugins/` directory
4. In Obsidian, go to Settings > Community Plugins
5. Refresh the list and enable "Recent Notes Timeline"

## Usage

There are several ways to access your Recent Notes Timeline:

### As a Regular View

- Click the clock icon in the ribbon sidebar
- Use the command palette and search for "Show Recent Notes Timeline"
- Create a hotkey in Obsidian settings for quick access

### As the Default "No File is Open" View

The plugin can automatically replace the default "No file is open" message with your timeline. This happens automatically when:

1. You close all open files/tabs
2. You start Obsidian with no files open

## Development

If you want to modify or contribute to this plugin, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Basic knowledge of TypeScript and Obsidian plugin development

### Setup Development Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/obsidian-recent-notes-timeline.git
   ```

2. Install dependencies:

   ```bash
   cd obsidian-recent-notes-timeline
   npm install
   ```

3. Build the plugin:

   ```bash
   npm run build
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

### Development Workflow

1. Link the built plugin to your test vault:
   - Create a test vault or use an existing one
   - Create the plugins directory if it doesn't exist: `.obsidian/plugins/`
   - Create a directory for this plugin: `.obsidian/plugins/recent-notes-timeline/`
   - Copy/symlink the built files (`main.js`, `styles.css`, and `manifest.json`) to this directory

2. Make your changes to the source code
3. Run the build command to compile your changes
4. Refresh Obsidian to load the updated plugin (Ctrl+R or Cmd+R)

### Project Structure

- `main.ts`: Plugin initialization and core functionality
- `view.ts`: Timeline view implementation
- `styles.css`: Styling for the timeline
- `manifest.json`: Plugin metadata
- `tsconfig.json`: TypeScript configuration
- `package.json`: Node package definition
- `esbuild.config.mjs`: Build configuration

### Building for Release

To build the plugin for release:

```bash
npm run build
```

This will create the following files in the project root:

- `main.js`: The compiled plugin
- `styles.css`: The CSS styles
- `manifest.json`: The plugin manifest

### Troubleshooting Development Issues

If you encounter build errors:

1. Make sure you have the correct dependencies installed:

   ```bash
   npm install --save-dev @types/node typescript esbuild builtin-modules
   ```

2. If esbuild.config.mjs isn't working, you can use a simpler approach:

   ```bash
   tsc main.ts view.ts
   ```

3. Check the console in Developer Tools for any runtime errors (Ctrl+Shift+I or Cmd+Option+I in Obsidian)

## License

[MIT License](LICENSE)

## Credits

Developed by Andri Alexandrou and Claude

---

Want to support this plugin? Consider:

- Star the GitHub repository
- Submit bug reports or feature requests
- Contribute code via pull requests
