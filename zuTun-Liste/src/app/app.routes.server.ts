import { RenderMode, ServerRoute } from '@angular/ssr';

// Only prerender public routes. Protected routes (like /dashboard) should be
// rendered client-side to ensure guards/auth checks run in the browser.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'dashboard', renderMode: RenderMode.Client },
];
