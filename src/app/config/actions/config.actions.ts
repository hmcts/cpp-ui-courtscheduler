import { createAction, props } from '@ngrx/store';
import { AppConfig } from '../interfaces';

export const setAppConfiguration = createAction(
  'SET_APP_CONFIGURATION',
  props<{ appConfig: AppConfig }>()
);
