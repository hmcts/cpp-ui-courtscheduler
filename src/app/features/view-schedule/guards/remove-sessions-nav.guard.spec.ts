import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, UrlTree } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { removeSessionsNavGuard } from './remove-sessions-nav.guard';
import { ViewScheduleState } from '../state/view-schedule.state';
import { CourtScheduleSession } from '../model/view-schedule.model';

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  createUrlTreeFromSnapshot: jest.fn()
}));

describe('removeSessionsNavGuard', () => {
  let store: MockStore<ViewScheduleState>;
  let route: ActivatedRouteSnapshot;
  const mockState = {
    viewSchedule: {
      sessionsToRemove: []
    }
  } as ViewScheduleState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: mockState })]
    });

    store = TestBed.inject(MockStore);
    route = new ActivatedRouteSnapshot();
  });

  it('should redirect to VIEW route when no sessions to remove', () => {
    const mockUrlTree: UrlTree = {
      toString: () => '/courtscheduler/view'
    } as UrlTree;

    const mockRoute: ActivatedRouteSnapshot = {
      url: [{ path: 'remove' }],
      parent: {
        url: [{ path: 'courtscheduler/view' }],
        parent: null
      }
    } as ActivatedRouteSnapshot;

    (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

    const expected = cold('(a|)', { a: mockUrlTree });

    const result = TestBed.runInInjectionContext(() => removeSessionsNavGuard(mockRoute));
    expect(result).toBeObservable(expected);

    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(mockRoute, ['..']);
  });

  it('should allow navigation when sessions to remove are present', () => {
    store.setState({
      viewSchedule: {
        sessionsToRemove: [{ courtScheduleId: '1' }] as CourtScheduleSession[]
      }
    } as ViewScheduleState);

    const expected = cold('(a|)', { a: true });

    const result = TestBed.runInInjectionContext(() => removeSessionsNavGuard(route));
    expect(result).toBeObservable(expected);
  });
});
