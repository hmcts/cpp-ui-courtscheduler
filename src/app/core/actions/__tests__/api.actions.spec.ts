import { HttpErrorResponse } from '@angular/common/http';
import { apiError, completedApiRequest, pendingApiRequest } from '../api.actions';
import { HttpQueryOptions } from '@cpp/core';

describe('Api actions', () => {
  it('should create pending API request action', () => {
    const request: HttpQueryOptions = {
      url: 'http://localhost',
      requestType: 'GET'
    };

    const action = pendingApiRequest({ request });

    expect(action.type).toBe('PENDING_API_REQUEST');
    expect(action.request).toEqual(request);
  });

  it('should create completed API request action', () => {
    const completedRequest: HttpQueryOptions = {
      url: 'http://localhost',
      requestType: 'GET'
    };

    const action = completedApiRequest({ request: completedRequest });

    expect(action.type).toBe('API_RESPONSE');
    expect(action.request).toEqual(completedRequest);
  });

  it('should create API error action', () => {
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: 'error',
      status: 500,
      statusText: 'Internal Server Error'
    });

    const action = apiError({ error });

    expect(action.type).toBe('API_ERROR');
    expect(action.error).toEqual(error);
  });
});
