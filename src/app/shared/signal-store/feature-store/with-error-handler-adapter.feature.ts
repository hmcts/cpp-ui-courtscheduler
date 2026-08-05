import { signalStoreFeature, withMethods } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { apiError } from '../../../core/actions/api.actions';
import { AppState } from '../../../core/reducers';

export function withErrorHandlerAdapter() {
  return signalStoreFeature(
    withMethods((_, globalStore = inject(Store<AppState>)) => {
      return {
        handleError: (error: HttpErrorResponse): void => {
          globalStore.dispatch(apiError({ error }));
        }
      };
    })
  );
}
