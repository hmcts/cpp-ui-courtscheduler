import { ApiActions } from '../../actions';
import { apiReducer } from '../api.reducer';

describe('apiReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const result = apiReducer(undefined, {} as any);

      expect(result).toMatchSnapshot();
    });
  });

  describe('ApiActions.pendingApiRequest', () => {
    it('should add a pending request', () => {
      const request = { url: '/' } as any;
      const action = ApiActions.pendingApiRequest({ request });
      const result = apiReducer(undefined, action);

      expect(result).toMatchSnapshot();
    });
  });

  describe('ApiActions.completedApiRequest', () => {
    it('should clear a pending request', () => {
      const request = { url: '/' } as any;
      const action = ApiActions.completedApiRequest({ request });
      const result = apiReducer(
        {
          errors: [],
          requests: [request]
        },
        action
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe('ApiActions.apiError', () => {
    it('should caputure a failed request', () => {
      const error = { status: 400 } as any;
      const action = ApiActions.apiError({ error });
      const result = apiReducer(
        {
          errors: [],
          requests: [{ url: '/' } as any]
        },
        action
      );

      expect(result).toMatchSnapshot();
    });
  });
});
