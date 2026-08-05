import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { confirmationActionDeactivateGuard } from '../confirmation-action-deactivate.guard';
import { CreateScheduleActions } from '../../state/actions';

describe('confirmationActionDeactivateGuard', () => {
  it('should dispatch clearJourney and return true', () => {
    expect.assertions(2);
    const dispatch = jest.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: { dispatch } }],
      teardown: { destroyAfterEach: false }
    });
    let result: boolean | undefined;
    TestBed.runInInjectionContext(() => {
      result = confirmationActionDeactivateGuard(
        {} as never,
        {} as never,
        {} as never,
        {} as never
      ) as boolean;
    });
    expect(dispatch).toHaveBeenCalledWith(CreateScheduleActions.clearJourney());
    expect(result).toBe(true);
  });
});
