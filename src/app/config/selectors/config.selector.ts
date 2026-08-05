import { AppState } from '../../core/reducers';

export const getAppConfig = (state: AppState) => state.config.appConfig;
