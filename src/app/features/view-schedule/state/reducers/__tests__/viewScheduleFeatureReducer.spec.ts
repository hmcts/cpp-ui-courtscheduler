import { Action } from '@ngrx/store';
import { viewScheduleFeatureReducer } from '../view-schedule.reducer';
import { initialState } from '../../view-schedule.state';

describe('viewScheduleFeatureReducer', () => {
  it('should return the default state', () => {
    const action = { type: 'ANY_ACTION' } as Action;
    const state = viewScheduleFeatureReducer(undefined, action);

    expect(state).toEqual(initialState);
  });
});
