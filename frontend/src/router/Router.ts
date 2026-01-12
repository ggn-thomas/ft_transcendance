import { AppState } from '../state/AppState.ts';
import type { Page, PageConstructor } from '../types/index.ts';

export class Router {
  private routes: Map<string, PageConstructor> = new Map();
  private currentPage: Page | null = null;

  constructor() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  register(path: string, PageClass: PageConstructor): void {
    this.routes.set(path, PageClass);
  }

  navigate(path: string): void {
    window.location.hash = path;
  }

  async handleRoute(): Promise<void> {
    let hash = window.location.hash.slice(1) || '/';

    // Handle OAuth callback
    if (hash.startsWith('/oauth')) {
      // Extract token using regex (more reliable than URLSearchParams for hash)
      const tokenMatch = hash.match(/token=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1])) as { id: number; username: string };
          AppState.setAuth(token, payload.id, payload.username);
          window.location.hash = '/home';
          return;
        } catch (e) {
          console.error('Failed to decode OAuth token:', e);
        }
      }
      window.location.hash = '/login';
      return;
    }

    const PageClass = this.routes.get(hash) || this.routes.get('/');

    if (this.currentPage?.destroy) {
      this.currentPage.destroy();
    }

    const appDiv = document.getElementById('app')!;
    appDiv.innerHTML = '';

    if (PageClass) {
      this.currentPage = new PageClass();
      const content = this.currentPage.render();
      appDiv.innerHTML = content;

      if (this.currentPage.mount) {
        await this.currentPage.mount();
      }
    }
  }
}
