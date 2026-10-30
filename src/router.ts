import { useEffect, useState } from 'react';

export type Route =
  | { name: 'overview' }
  | { name: 'new' }
  | { name: 'project'; id: string; focus?: string }
  | { name: 'edit'; id: string }
  | { name: 'settings' };

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(query);
  if (parts[0] === 'new') return { name: 'new' };
  if (parts[0] === 'settings') return { name: 'settings' };
  if (parts[0] === 'project' && parts[1]) {
    if (parts[2] === 'edit') return { name: 'edit', id: parts[1] };
    return { name: 'project', id: parts[1], focus: params.get('c') ?? undefined };
  }
  return { name: 'overview' };
}

export const href = {
  overview: () => '#/',
  newProject: () => '#/new',
  settings: () => '#/settings',
  project: (id: string, focus?: string) =>
    `#/project/${encodeURIComponent(id)}${focus ? `?c=${encodeURIComponent(focus)}` : ''}`,
  edit: (id: string) => `#/project/${encodeURIComponent(id)}/edit`,
};

export function navigate(to: string) {
  window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo?.(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
