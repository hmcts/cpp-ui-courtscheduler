import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appBootstrapConfig } from './app/bootstrap-app.config';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appBootstrapConfig).catch((err) => console.error(err));
