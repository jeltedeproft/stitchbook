import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { beforeEach } from 'vitest';

// jsdom has no layout engine; the router scrolls to top on navigation.
window.scrollTo = () => {};

// The chosen language is remembered in localStorage; start every test from the browser default.
beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = '';
});
