import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CppHttpConfig, GtmService } from '@cpp/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { setAppConfiguration } from '../actions/config.actions';
import { AppState } from '../../core/reducers';
import { AppConfig } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AppConfigService implements CppHttpConfig {
  private http = inject(HttpClient);
  private store = inject<Store<AppState>>(Store);
  private gtmService = inject(GtmService);

  baseUrl!: string;
  appUrl!: string;
  accountUrl!: string;
  logoutUrl!: string;
  cppHomeUrl?: string;

  load() {
    return new Promise((resolve, reject) => {
      this.http
        .get<AppConfig>('./app.override.config.json')
        .pipe(
          tap({
            next: (appConfig) => {
              this.baseUrl = appConfig.apiRoot;
              this.appUrl = appConfig.appUrl;
              this.cppHomeUrl = appConfig.cppHomeUrl;
              this.accountUrl = appConfig.idamProfilePage;
              this.logoutUrl = appConfig.idamLogoutPage;
              if (appConfig.gtmId) {
                this.gtmService.configure({ containerId: appConfig.gtmId });
              }
              this.store.dispatch(setAppConfiguration({ appConfig }));
            }
          })
        )
        .subscribe({ next: resolve, error: reject });
    });
  }
}
