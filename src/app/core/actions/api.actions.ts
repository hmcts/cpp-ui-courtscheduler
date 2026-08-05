import { HttpErrorResponse } from '@angular/common/http';
import { createAction, props } from '@ngrx/store';
import { RequestOptions } from '../services';

export const pendingApiRequest = createAction(
  'PENDING_API_REQUEST',
  props<{ request: RequestOptions }>()
);

export const completedApiRequest = createAction(
  'API_RESPONSE',
  props<{ request: RequestOptions }>()
);

export const apiError = createAction('API_ERROR', props<{ error: HttpErrorResponse }>());
