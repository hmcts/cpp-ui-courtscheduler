import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, UrlTree } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { CourtScheduleSession } from '../model/view-schedule.model';
import { ViewScheduleState } from '../state/view-schedule.state';
import { assignCourtroomNavGuard } from './assign-courtroom-nav.guard';

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  createUrlTreeFromSnapshot: jest.fn()
}));

describe('assignCourtroomNavGuard', () => {
  let store: MockStore<ViewScheduleState>;
  let route: ActivatedRouteSnapshot;
  const mockState = {
    viewSchedule: {
      sessionsToAssign: []
    }
  } as ViewScheduleState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: mockState })]
    });

    store = TestBed.inject(MockStore);
    route = new ActivatedRouteSnapshot();
  });

  it('should redirect to parent route when no sessions to assign', () => {
    const mockUrlTree: UrlTree = {
      toString: () => '/courtscheduler/view'
    } as UrlTree;

    const mockRoute: ActivatedRouteSnapshot = {
      url: [{ path: 'assign-courtroom' }],
      parent: {
        url: [{ path: 'courtscheduler/view' }],
        parent: null
      }
    } as ActivatedRouteSnapshot;

    (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

    const expected = cold('(a|)', { a: mockUrlTree });

    const result = TestBed.runInInjectionContext(() => assignCourtroomNavGuard(mockRoute));
    expect(result).toBeObservable(expected);

    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(mockRoute, ['..']);
  });

  it('should allow navigation when sessions to assign are present', () => {
    store.setState({
      viewSchedule: {
        sessionsToAssign: [{ courtScheduleId: '1' }] as CourtScheduleSession[]
      }
    } as ViewScheduleState);

    const expected = cold('(a|)', { a: true });

    const result = TestBed.runInInjectionContext(() => assignCourtroomNavGuard(route));
    expect(result).toBeObservable(expected);
  });

  it('should redirect when sessionsToAssign is null', () => {
    const mockUrlTree: UrlTree = {
      toString: () => '/courtscheduler/view'
    } as UrlTree;

    const mockRoute: ActivatedRouteSnapshot = {
      url: [{ path: 'assign-courtroom' }],
      parent: {
        url: [{ path: 'courtscheduler/view' }],
        parent: null
      }
    } as ActivatedRouteSnapshot;

    store.setState({
      viewSchedule: {
        sessionsToAssign: null
      }
    } as ViewScheduleState);

    (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

    const expected = cold('(a|)', { a: mockUrlTree });

    const result = TestBed.runInInjectionContext(() => assignCourtroomNavGuard(mockRoute));
    expect(result).toBeObservable(expected);

    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(mockRoute, ['..']);
  });
});
