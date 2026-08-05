import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, UrlTree } from '@angular/router';
import { CreateScheduleState, initialState } from '../state/create-schedule.state';
import { CreateScheduleRoutes } from '../create-schedule.routes';
import {
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockCourtScheduleDraft,
  mockSession
} from '../../../shared';
import { createScheduleNavGuard } from './create-schedule-nav.guard';
import { cold } from 'jasmine-marbles';

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  createUrlTreeFromSnapshot: jest.fn()
}));

describe('createScheduleNavGuard', () => {
  let store: MockStore<CreateScheduleState>;

  const mockUrlTree = {
    toString: () => `/${CreateScheduleRoutes.SELECT_COURT}`
  } as UrlTree;

  (createUrlTreeFromSnapshot as jest.Mock).mockReturnValue(mockUrlTree);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })]
    });
    store = TestBed.inject(MockStore);
  });

  it('should redirect to SELECT_COURT if path is invalid', () => {
    const route = {
      firstChild: { routeConfig: { path: 'not-valid-path' } }
    } as ActivatedRouteSnapshot;

    const result$ = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));
    const expected$ = cold('(a|)', { a: mockUrlTree });

    expect(result$).toBeObservable(expected$);
    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(route, [
      CreateScheduleRoutes.SELECT_COURT
    ]);
  });

  it('should allow navigation to SELECT_COURT if path is SELECT_COURT', () => {
    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SELECT_COURT } }
    } as ActivatedRouteSnapshot;

    const expected$ = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
  });

  it('should redirect to SELECT_COURT if no selectedCourt is set and path is SELECT_BUSINESS_TYPE', () => {
    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SELECT_BUSINESS_TYPE } }
    } as ActivatedRouteSnapshot;

    store.setState({
      courtScheduleDraft: {
        selectedCourtCentre: null,
        selectedBusinessType: null,
        isPersisted: false
      }
    } as CreateScheduleState);

    const expected$ = cold('(a|)', { a: mockUrlTree });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(route, [
      CreateScheduleRoutes.SELECT_COURT
    ]);
  });

  it('should allow navigation to SELECT_BUSINESS_TYPE if selectedCourt is set and path is SELECT_BUSINESS_TYPE', () => {
    store.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: null,
        isPersisted: false
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SELECT_BUSINESS_TYPE } }
    } as ActivatedRouteSnapshot;

    const expected$ = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
  });

  it('should redirect to SELECT_COURT if no selectedBusinessType and path is SESSIONS_FORM', () => {
    store.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: null,
        isPersisted: false
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SESSIONS_FORM } }
    } as ActivatedRouteSnapshot;

    const expected$ = cold('(a|)', { a: mockUrlTree });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(route, [
      CreateScheduleRoutes.SELECT_COURT
    ]);
  });

  it('should allow navigation to SESSIONS_FORM if selectedCourt and selectedBusinessType are set', () => {
    store.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: mockBusinessType,
        isPersisted: false
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SESSIONS_FORM } }
    } as ActivatedRouteSnapshot;

    const expected$ = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
  });

  it('should allow navigation to REPEAT_PATTERN if previous steps are set', () => {
    store.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: mockBusinessType,
        sessions: [mockSession],
        isPersisted: false
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.REPEAT_PATTERN } }
    } as ActivatedRouteSnapshot;

    const expected$ = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
  });

  it('should allow navigation to SUMMARY if previous steps are set', () => {
    store.setState({
      courtScheduleDraft: mockCourtScheduleDraft
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SUMMARY } }
    } as ActivatedRouteSnapshot;

    const expected = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected);
  });

  it('should allow navigation to SUCCESS when isPersisted is true', () => {
    store.setState({
      courtScheduleDraft: {
        ...mockCourtScheduleDraft,
        isPersisted: true
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SUCCESS } }
    } as ActivatedRouteSnapshot;

    const result$ = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));
    const expected$ = cold('(a|)', { a: true });

    expect(result$).toBeObservable(expected$);
  });

  it('should redirect when navigating to SUCCESS when isPersisted is false', () => {
    store.setState({
      courtScheduleDraft: {
        ...mockCourtScheduleDraft,
        isPersisted: false
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.SUCCESS } }
    } as ActivatedRouteSnapshot;

    const result$ = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));
    const expected$ = cold('(a|)', { a: mockUrlTree });

    expect(result$).toBeObservable(expected$);
    expect(createUrlTreeFromSnapshot).toHaveBeenCalledWith(route, [
      CreateScheduleRoutes.SELECT_COURT
    ]);
  });

  it('should allow navigation to REMOVE_SESSIONS if selectedCourt, selectedBusinessType and sessionsToRemove are set', () => {
    store.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: mockBusinessType,
        sessionsToRemove: [mockSession],
        isPersisted: false
      }
    } as CreateScheduleState);

    const route = {
      firstChild: { routeConfig: { path: CreateScheduleRoutes.REMOVE_SESSIONS } }
    } as ActivatedRouteSnapshot;

    const expected$ = cold('(a|)', { a: true });
    const result = TestBed.runInInjectionContext(() => createScheduleNavGuard(route));

    expect(result).toBeObservable(expected$);
  });
});
