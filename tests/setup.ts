import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// jsdom has no layout engine; the router scrolls to top on navigation.
window.scrollTo = () => {};
