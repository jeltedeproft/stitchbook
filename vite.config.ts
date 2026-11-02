/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Files from public/ the app needs offline (sw.js itself is handled by the browser).
const PUBLIC_FILES = ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

/** Writes precache.json: every file of the build, which public/sw.js saves for offline use. */
function precacheList(): Plugin {
  return {
    name: 'stitchbook-precache-list',
    apply: 'build',
    generateBundle(_, bundle) {
      const built = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const files = [...new Set(['./', 'index.html', ...built, ...PUBLIC_FILES])];
      this.emitFile({ type: 'asset', fileName: 'precache.json', source: JSON.stringify(files) });
    },
  };
}

export default defineConfig({
  // Relative base so the static build works from any folder or GitHub Pages sub-path.
  base: './',
  plugins: [react(), precacheList()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
