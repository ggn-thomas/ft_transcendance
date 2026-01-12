import './style.css';
import { Router } from './router/Router.ts';
import { AppState } from './state/AppState.ts';
import { RegisterPage } from './pages/RegisterPage.ts';
import { LoginPage } from './pages/LoginPage.ts';
import { HomePage } from './pages/HomePage.ts';
import { LobbyPage } from './pages/LobbyPage.ts';
import { GamePage } from './pages/GamePage.ts';

const router = new Router();

router.register('/', LoginPage);
router.register('/register', RegisterPage);
router.register('/login', LoginPage);
router.register('/home', HomePage);
router.register('/lobby', LobbyPage);
router.register('/game', GamePage);

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) || '/';

  // Skip auth check for OAuth callback (Router handles it)
  if (hash.startsWith('/oauth')) {
    return;
  }

  const publicRoutes = ['/', '/register', '/login'];

  if (!AppState.isAuthenticated() && !publicRoutes.includes(hash)) {
    window.location.hash = '/login';
  }
});

if (AppState.isAuthenticated()) {
  if (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#/login') {
    window.location.hash = '/home';
  }
} else {
  const hash = window.location.hash.slice(1);
  // Skip auth check for OAuth callback
  if (hash.startsWith('/oauth')) {
    // Let Router handle it
  } else if (!['/register', '/login', '/'].includes(hash)) {
    window.location.hash = '/login';
  }
}
