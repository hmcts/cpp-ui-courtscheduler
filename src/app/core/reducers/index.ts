import { routerReducer as router, RouterReducerState } from '@ngrx/router-store';
import { apiReducer as api, ApiState } from './api.reducer';
import { ActionReducerMap } from '@ngrx/store';
import { configReducer as config, ConfigState } from '../../config/reducers/config.reducer';
import { usersGroups, UsersGroupsState } from '@cpp/users-groups';
import { referenceDataReducer as referenceData, ReferenceDataState } from '@cpp/reference-data';

// The top level Court Scheduler application state interface.
export interface AppState extends UsersGroupsState, ReferenceDataState {
  readonly api: ApiState;
  readonly config: ConfigState;
  readonly router: RouterReducerState;
}

export const reducers: ActionReducerMap<AppState> = {
  api,
  config,
  router,
  usersGroups,
  referenceData
};
