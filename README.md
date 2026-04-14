<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ArcturusIDE

ArcturusIDE is a local development project that runs with `npm` and Vite.

## Prerequisites

- Node.js 18+ recommended
- `npm`

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the app in your browser at the local URL shown by Vite.

## Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Notes

- Hot Module Replacement is enabled through Vite's default development server behavior.
- No Gemini API key is required in the Vite config.
- If you need environment variables for local development, use a local `.env` file.