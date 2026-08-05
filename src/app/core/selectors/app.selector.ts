import { getRouterSelectors } from '@ngrx/router-store';
import { AppState } from '../reducers';

export const getRouter = (state: AppState) => state.router;
const { selectQueryParam, selectUrl } = getRouterSelectors(getRouter);

export const getQueryParam = selectQueryParam;
export const getCurrentUrl = selectUrl;
