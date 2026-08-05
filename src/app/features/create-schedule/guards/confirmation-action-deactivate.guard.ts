import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { CreateScheduleState } from '../state/create-schedule.state';
import { CreateScheduleActions } from '../state/actions';
import { ConfirmationActionContainer } from '../containers/confirmation-action/confirmation-action.container';

export const confirmationActionDeactivateGuard: CanDeactivateFn<ConfirmationActionContainer> = (
  _component,
  currentRoute,
  _currentState,
  nextState
) => {
  const store = inject(Store<CreateScheduleState>);
  store.dispatch(CreateScheduleActions.clearJourney());
  return true;
};
