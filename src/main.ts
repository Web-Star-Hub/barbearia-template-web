const script = document.createElement('script');
script.src =
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyAUCZBr73JS8997NAzr2CGI1qKp8_y2iXs&libraries=places';
script.async = true;
document.head.appendChild(script);

import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePortugueseBrazil from '@angular/common/locales/pt';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localePortugueseBrazil);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
