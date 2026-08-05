import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { apiError } from '../actions/api.actions';
import { withLatestFrom } from 'rxjs';
import { getCurrentUrl } from '../selectors';
import { select, Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { ERROR_ROUTE_PATHS, ErrorRouteState } from '@cpp/application';
import { Router } from '@angular/router';
import { AppState } from '../reducers';

@Injectable()
export class RouterEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private store = inject<Store<AppState>>(Store);

  navigateApiError$;

  constructor() {
    this.navigateApiError$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(apiError),
          withLatestFrom(this.store.pipe(select(getCurrentUrl))),
          map(([{ error }, currentUrl]): ErrorRouteState => {
            const state = {
              redirectUrl: `/courtscheduler${currentUrl}`
            } as ErrorRouteState;

            switch (error.status) {
              case 0:
                return {
                  ...state,
                  errorPath: `/${ERROR_ROUTE_PATHS.timedOutError}`
                };
              case 403:
                return {
                  ...state,
                  errorPath: `/${ERROR_ROUTE_PATHS.unauthorised}`
                };
              case 404:
                return {
                  ...state,
                  errorPath: `/${ERROR_ROUTE_PATHS.pageNotFound}`
                };
              case 401:
                return {
                  ...state,
                  errorPath: `/${ERROR_ROUTE_PATHS.signedOutError}`
                };
              default:
                return {
                  ...state,
                  errorPath: `/${ERROR_ROUTE_PATHS.technicalError}`
                };
            }
          }),
          tap((state) => this.router.navigate([state.errorPath], { state }))
        ),
      { dispatch: false }
    );
  }
}
