import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { reducers } from './core/reducers';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { appRoutes } from './app-routes';
import { provideRouterStore, RouterState } from '@ngrx/router-store';
import { environment } from '../environments/environment';
import { AppConfigService } from './config';
import { provideEffects } from '@ngrx/effects';
import { GENERATE_UNIQUE_KEY, provideCppCoreHttpServices, withCppHttpOverrides } from '@cpp/core';
import { CPPMonitorHttp } from './core/services/http/http';
import { provideUserGroupsEnvironmentContext } from '@cpp/users-groups';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { provideSchedulingEnvironmentContext } from '@cpp/scheduling';
import {
  provideReferenceDataEnvironmentContext,
  JudicialMemberNamePipe
} from '@cpp/reference-data';
import { v4 as uuid } from 'uuid';

export const appBootstrapConfig: ApplicationConfig = {
  providers: [
    {
      provide: GENERATE_UNIQUE_KEY,
      useValue: uuid
    },
    provideProtractorTestingSupport(),
    provideRouter(
      appRoutes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),
    provideAppInitializer(async () => await inject(AppConfigService).load()),
    provideStore(reducers, {
      runtimeChecks: {
        strictActionImmutability: true,
        strictStateImmutability: true
      }
    }),
    provideRouterStore({ routerState: RouterState.Minimal }),
    provideEffects([]),
    provideCppCoreHttpServices(withCppHttpOverrides(AppConfigService, CPPMonitorHttp)),
    provideUserGroupsEnvironmentContext(),
    provideCPPApplicationEnvironment(environment),
    provideSchedulingEnvironmentContext(),
    provideReferenceDataEnvironmentContext(),
    JudicialMemberNamePipe,
    ...environment.providers
  ]
};
