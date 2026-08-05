import { configReducer, ConfigState } from '../config.reducer';
import { AppConfig } from '../../interfaces';
import { setAppConfiguration } from '../../actions/config.actions';

describe('Config Reducer', () => {
  const initialState: ConfigState = {
    appConfig: null
  };

  it('should handle setAppConfiguration action', () => {
    const appConfig = {
      appUrl: '#'
    } as AppConfig;

    const action = setAppConfiguration({ appConfig });
    const state = configReducer(initialState, action);

    expect(state).toEqual({
      ...initialState,
      appConfig
    });
  });
});
