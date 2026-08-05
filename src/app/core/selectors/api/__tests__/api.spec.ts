import { HttpErrorResponse } from '@angular/common/http';
import { getHasApiActivity, getHasApiError } from '../api.selector';
import { RequestOptions } from '../../../services';
import { AppState } from '../../../reducers';

describe('Api selectors', () => {
  const url = '/courtscheduler-query-api/query/api/rest/session/1';
  const requestType = 'application/vnd.courtscheduler.session+json';
  const request = { url, requestType } as RequestOptions;

  it('should return true when there are pending Api requests', () => {
    const state = {
      api: {
        requests: [request],
        errors: []
      }
    } as AppState;

    const result = getHasApiActivity(state);

    expect(result).toEqual(true);
  });

  it('should return false when all api requests are complete', () => {
    const state = {
      api: {
        requests: [],
        errors: []
      }
    } as AppState;

    const result = getHasApiActivity(state);

    expect(result).toEqual(false);
  });

  it('should return true when there are Api errors', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const state = {
      api: {
        requests: [],
        errors: [error]
      }
    } as AppState;

    const result = getHasApiError(state);

    expect(result).toEqual(true);
  });

  it('should return false when there are no Api errors', () => {
    const state = {
      api: {
        requests: [],
        errors: []
      }
    } as AppState;

    const result = getHasApiError(state);

    expect(result).toEqual(false);
  });
});
