# ALSH Extension for VS Code

Syntax highlighting and language server support for the ALSH shell language.

## Installation (End Users)

1. Download the `.vsix` file
2. In VS Code, open Command Palette (`Ctrl+Shift+P`)
3. Run: `Extensions: Install from VSIX...`
4. Select the `.vsix` file
5. Reload VS Code

The extension will automatically activate for `.alsh` files.

## Features

- `#` comments
- `@` directives (`@stdlib`, `@include`, `@main`, `@justrunit`, `@define`, `@import`)
- function definitions (`function`)
- shell-style command names highlighted as functions
- `c::` calls highlighted as functions
- control flow keywords (`if`, `else`, `elif`, `while`, `for`, `loop`, `break`, `continue`, `return`)
- variable interpolation (`$var`, `${var}`)
- strings, numbers, and operators
- basic LSP support:
  - go to definition for user-defined functions and variables
  -Development Setup

### Prerequisites
- Node.js 14+ and npm

### Setup
```bash
cd vscode-alsh
npm install
```

### Debug the Extension
1. Open the extension folder in VS Code: `code .`
2. Press `F5` to launch Extension Development Host
3. A new VS Code window opens with the extension running
4. Open any `.alsh` file to test syntax highlighting and LSP features

## Packaging

### Build the `.vsix` file
```bash
cd vscode-alsh
npm install --save-dev vsce
npx vsce package
```

This generates `alsh-syntax-0.0.1.vsix`.

## Publishing

To publish on the Visual Studio Code Marketplace:

1. Create a publisher account at https://marketplace.visualstudio.com
2. Update `package.json`:
   ```json
   {
     "publisher": "your-publisher-name",
     "repository": "https://github.com/yourusername/alsh-rs"
   }
   ```
3. Login to vsce:
   ```bash
   npx vsce login your-publisher-name
   ```
4. Publish:
   ```bash
   npx vsce publish
   ```

The extension will be available in VS Code's Marketplace
   - Choose `Extensions: Install from VSIX...`
   - Select the generated `alsh-syntax-0.0.1.vsix`

After that, `.alsh` files should activate the ALSH language mode in your normal VS Code window.
