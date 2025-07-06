# vrich

## Getting Started

Follow the steps below to set up and run the vrich project locally.

### Prerequisites

- Ensure you have **Node.js** version **20** installed. You can manage this version using **nvm** (Node Version Manager).

### Running the Development Server

1. **Switch to the correct Node version:**
   ```bash
   nvm use 20
   ```
2. **Install the project dependencies:**
   ```bash
   pnpm install
   ```
3. **Start the development server:**
   ```bash
   pnpm dev
   ```

# Project Setup Guide

## Recommended VSCode Extensions

To optimize your development workflow, it is recommended to install the following extensions in Visual Studio Code:

1. **[CSS Modules](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules)**  
   This extension provides autocompletion for class names in `.module.css` files, improving development efficiency.

2. **[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)**  
   Offers autocompletion and linting for Tailwind CSS class names, making it easier to work with utility-first CSS in your project.

---

## Recommended VSCode User Settings

To further improve your coding experience and ensure consistent formatting and linting, add the following settings to your VSCode `settings.json` file:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.scss": "tailwindcss"
  }
}
```

## Test Docker

```bash
pnpm run docker:dev
```

or

```bash
docker build -t vrich-web .
docker run --env-file .env -p 3000:3000 vrich-web
```
