import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, UrlTree } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { editSessionNavGuard } from './edit-session-nav.guard';
import { ViewScheduleState } from '../state/view-schedule.state';

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  createUrlTreeFromSnapshot: jest.fn()
}));

describe('editSessionNavGuard', () => {
  let store: MockStore<ViewScheduleState>;
  let route: ActivatedRouteSnapshot;
  const mockState = {
    viewSchedule: {
      sessionToEdit: null
    }
  } as ViewScheduleState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: mockState
        })
      ]
    });

    store = TestBed.inject(MockStore);
    route = new ActivatedRouteSnapshot();
  });

  it('should redirect if sessionToEdit is not available', () => {
    const mockUrlTree: UrlTree = {
      toString: () => '/courtscheduler/view'
    } as UrlTree;

    const mockRoute: ActivatedRouteSnapshot = {
      url: [{ path: 'edit' }],
      parent: {
        url: [{ path: 'courtscheduler/view' }],
        parent: null
      }
    } as ActivatedRouteSnapshot;

    (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

    const expected = cold('(a|)', { a: mockUrlTree });

    const result = TestBed.runInInjectionContext(() => editSessionNavGuard(mockRoute));
    expect(result).toBeObservable(expected);

    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(mockRoute, ['..']);
  });

  it('should allow activation if sessionToEdit is available', () => {
    const sessionToEdit = {
      businessType: 'businessType 1',
      courtRoomId: 'courtRoomId1',
      sessionDate: '2023-07-24',
      panel: 'panel1',
      totalBooked: 0
    };

    store.setState({
      ...mockState,
      viewSchedule: {
        sessionToEdit
      }
    } as ViewScheduleState);

    const expected = cold('(a|)', { a: true });

    const result = TestBed.runInInjectionContext(() => editSessionNavGuard(route));
    expect(result).toBeObservable(expected);
  });
});
