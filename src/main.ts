import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePortugueseBrazil from '@angular/common/locales/pt';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localePortugueseBrazil);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
