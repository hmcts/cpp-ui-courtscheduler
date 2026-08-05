import {
  mockCourtScheduleResponse,
  mockCourtScheduleSession,
  mockErrors,
  mockSearchFormValues
} from '../../../../../shared';
import {
  CourtSchedule,
  CourtScheduleSession,
  SearchFormValues
} from '../../../model/view-schedule.model';
import {
  removeSessions,
  removeSessionsSuccess,
  searchSchedules,
  searchSchedulesSuccess,
  setActiveCourtroomsIndexes,
  setViewSessionsToRemove,
  setViewSessionsToAssign,
  clearViewSessionsToRemove,
  clearViewSessionsToAssign,
  setErrors,
  setJurisdiction
} from '../view-schedule.actions';
import { ValidationError } from '@cpp/pdk';
import { JurisdictionType } from '../../../../../shared/model/jurisdiction';

describe('ViewSchedule actions', () => {
  it('should create search schedules action', () => {
    const searchFormValues: SearchFormValues = mockSearchFormValues as SearchFormValues;

    const action = searchSchedules({ searchFormValues });

    expect(action.type).toBe('SEARCH_SCHEDULES');
    expect(action.searchFormValues).toEqual(searchFormValues);
  });

  it('should create search schedules success action', () => {
    const courtSchedules: CourtSchedule[] = mockCourtScheduleResponse.courtSchedules;

    const action = searchSchedulesSuccess({ courtSchedules });

    expect(action.type).toBe('SEARCH_SCHEDULES_SUCCESS');
    expect(action.courtSchedules).toEqual(courtSchedules);
  });

  it('should create remove sessions action', () => {
    const sessionsToRemove = [{ courtScheduleId: 'id' }] as CourtScheduleSession[];

    const action = removeSessions({ sessionsToRemove });

    expect(action.type).toBe('REMOVE_SESSIONS');
    expect(action.sessionsToRemove).toEqual(sessionsToRemove);
  });

  it('should create remove sessions success action', () => {
    const action = removeSessionsSuccess({});

    expect(action.type).toBe('REMOVE_SESSIONS_SUCCESS');
  });

  it('should create setActiveCourtroomsIndexes action', () => {
    const activeCourtroomsIndexes = [1];

    const action = setActiveCourtroomsIndexes({ activeCourtroomsIndexes });

    expect(action.type).toBe('SET_ACTIVE_COURTROOMS_INDEXES');
    expect(action.activeCourtroomsIndexes).toEqual(activeCourtroomsIndexes);
  });

  it('should create set sessions to remove action', () => {
    const sessionsToRemove: CourtScheduleSession[] = [mockCourtScheduleSession];

    const action = setViewSessionsToRemove({ sessionsToRemove });

    expect(action.type).toBe('SET_VIEW_SESSION_TO_REMOVE');
    expect(action.sessionsToRemove).toEqual(sessionsToRemove);
  });

  it('should create set sessions to assign action', () => {
    const sessionsToAssign: CourtScheduleSession[] = [mockCourtScheduleSession];

    const action = setViewSessionsToAssign({ sessionsToAssign });

    expect(action.type).toBe('SET_VIEW_SESSIONS_TO_ASSIGN');
    expect(action.sessionsToAssign).toEqual(sessionsToAssign);
  });

  it('should create clear sessions to remove action', () => {
    const action = clearViewSessionsToRemove();

    expect(action.type).toBe('CLEAR_VIEW_SESSIONS_TO_REMOVE');
  });

  it('should create clear sessions to assign action', () => {
    const action = clearViewSessionsToAssign();

    expect(action.type).toBe('CLEAR_VIEW_SESSIONS_TO_ASSIGN');
  });

  it('should create set errors', () => {
    const errors: ValidationError[] = mockErrors;
    const action = setErrors({ errors });

    expect(action.type).toBe('SET_ERRORS');
    expect(action.errors).toEqual(errors);
  });

  it('should create set jurisdiction action', () => {
    const jurisdiction = JurisdictionType.MAGISTRATES;
    const action = setJurisdiction({ jurisdiction });

    expect(action.type).toBe('SET_JURISDICTION');
    expect(action.jurisdiction).toEqual(jurisdiction);
  });

  it('should create set jurisdiction action with CROWN jurisdiction', () => {
    const jurisdiction = JurisdictionType.CROWN;
    const action = setJurisdiction({ jurisdiction });

    expect(action.type).toBe('SET_JURISDICTION');
    expect(action.jurisdiction).toEqual(jurisdiction);
  });
});
