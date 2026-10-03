import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const LOADER_MIN_MS = 800;
const LOADER_FADE_MS = 300;
const startedAt = Date.now();

function hideLoader(): void {
  const loader = document.getElementById('app-loader');
  if (!loader) { return; }
  setTimeout(() => {
    loader.classList.add('app-loader-hide');
    setTimeout(() => loader.remove(), LOADER_FADE_MS);
  }, Math.max(0, LOADER_MIN_MS - (Date.now() - startedAt)));
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(hideLoader)
  .catch(err => {
    console.error(err);
    hideLoader();
  });
