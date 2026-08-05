import { createReducer, on } from '@ngrx/store';
import { setAppConfiguration } from '../actions/config.actions';
import { AppConfig } from '../interfaces';

export interface ConfigState {
  appConfig: AppConfig | null;
}

const initialState: ConfigState = {
  appConfig: null
};

export const configReducer = createReducer(
  initialState,
  on(setAppConfiguration, (state, { appConfig }) => ({
    ...state,
    appConfig
  }))
);
