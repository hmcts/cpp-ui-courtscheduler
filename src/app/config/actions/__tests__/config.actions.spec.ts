import { AppConfig } from '../../interfaces';
import { setAppConfiguration } from '../config.actions';

describe('Config actions', () => {
  it('should create an action to set app configuration', () => {
    const appConfig = {
      appUrl: 'https://api.example.com'
    } as AppConfig;

    const action = setAppConfiguration({ appConfig });

    expect(action.type).toBe('SET_APP_CONFIGURATION');
    expect(action.appConfig).toEqual(appConfig);
  });
});
