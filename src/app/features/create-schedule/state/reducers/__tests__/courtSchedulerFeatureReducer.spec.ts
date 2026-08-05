import { Action } from '@ngrx/store';
import { initialState } from '../../create-schedule.state';
import { createScheduleFeatureReducer } from '../create-schedule.reducer';

describe('courtSchedulerFeatureReducer', () => {
  it('should return the default state', () => {
    const action = { type: 'ANY_ACTION' } as Action;
    const state = createScheduleFeatureReducer(undefined, action);

    expect(state).toEqual(initialState);
  });
});
