import { AppState } from '../../../core/reducers';
import { AppConfig } from '../../interfaces';
import { getAppConfig } from '../config.selector';

describe('Config selectors', () => {
  const initialState = {
    config: {
      appConfig: {
        apiRoot: '#',
        appUrl: 'https://api.example.com'
      }
    }
  } as AppState;

  it('should select the appConfig from the state', () => {
    const appConfig = {
      apiRoot: '#',
      appUrl: 'https://api.example.com'
    } as AppConfig;

    const selectedAppConfig = getAppConfig(initialState);
    expect(selectedAppConfig).toEqual(appConfig);
  });
});
