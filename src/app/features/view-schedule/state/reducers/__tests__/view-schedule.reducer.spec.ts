import { CourtSchedule, SearchFormValues } from '../../../model/view-schedule.model';
import { ViewScheduleActions } from '../../actions';
import { initialState } from '../../view-schedule.state';
import { viewScheduleReducer } from '../view-schedule.reducer';
import {
  mockCourtScheduleSession,
  mockErrors,
  mockMagistratesCourtCentre,
  mockActiveCourtroomIndexes,
  mockSearchFormValues
} from '../../../../../shared';
import { ValidationError } from '@cpp/pdk';
import { JurisdictionType } from '../../../../../shared/model/jurisdiction';
import { CourtScheduleSession } from '../../../model/view-schedule.model';

describe('ViewSchedule Reducer', () => {
  const mockCourtSchedules: CourtSchedule[] = [
    {
      courtRoomId: 'courtroom id 1',
      courtRoomName: 'Courtroom 1',
      sessions: [
        {
          courtScheduleId: 'id1',
          listingProfileId: 'bIAkijRvqQYzYSGk',
          ouCode: 'SJQBDOnjjqrL',
          courtRoomId: 'courtroom id 1',
          courtHouseName: 'courthouse name 1',
          courtRoomName: 'Courtroom 1',
          operationalUnit: 'uEWrahOuMBmfaULmQrBTpyQyMUhRajH',
          businessType: 'Applications',
          panel: 'ADULT',
          courtSession: 'AM',
          active: true,
          slotBased: false,
          sessionDate: 'Dec 27, 2027, 6:06:32 PM',
          maxSlots: 2097164855,
          maxDuration: 1569984805,
          totalBooked: 0,
          createdOn: 'Dec 24, 2027, 6:06:32 PM',
          updatedOn: 'Apr 24, 2017, 7:34:23 AM',
          allDaySplit: false,
          totalBookedForMorning: 0,
          totalBookedForAfternoon: 0,
          jurisdiction: JurisdictionType.MAGISTRATES
        }
      ]
    }
  ];

  it('should set court schedules on search success', () => {
    const action = ViewScheduleActions.searchSchedulesSuccess({
      courtSchedules: mockCourtSchedules
    });
    const state = viewScheduleReducer(initialState, action);

    expect(state.courtSchedules).toEqual(mockCourtSchedules);
  });

  it('should return the default state when an unknown action is provided', () => {
    const action = { type: 'UNKNOWN' } as any;
    const state = viewScheduleReducer(initialState, action);

    expect(state).toEqual(initialState);
  });

  it('should set the success banner message', () => {
    const banner = {
      message: 'Sessions updated successfully',
      bannerType: 'success'
    };
    const action = ViewScheduleActions.setViewBanner(banner);
    const state = viewScheduleReducer(initialState, action);

    expect(state.bannerMessage).toEqual(banner);
  });

  it('should clear the banner message', () => {
    const initialStateWithBanner = {
      ...initialState,
      bannerMessage: {
        message: 'Some message',
        bannerType: 'success'
      }
    };
    const action = ViewScheduleActions.clearViewBanner();
    const state = viewScheduleReducer(initialStateWithBanner, action);

    expect(state.bannerMessage).toEqual({ message: null, bannerType: null });
  });

  it('should set sessions to remove', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessionsToRemove: [mockCourtScheduleSession]
    };

    const action = ViewScheduleActions.setViewSessionsToRemove({
      sessionsToRemove: [mockCourtScheduleSession]
    });
    const state = viewScheduleReducer(initialStateWithSessions, action);

    expect(state.sessionsToRemove).toEqual([mockCourtScheduleSession]);
  });

  it('should set sessions to assign', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessionsToAssign: [] as CourtScheduleSession[]
    };

    const action = ViewScheduleActions.setViewSessionsToAssign({
      sessionsToAssign: [mockCourtScheduleSession]
    });
    const state = viewScheduleReducer(initialStateWithSessions, action);

    expect(state.sessionsToAssign).toEqual([mockCourtScheduleSession]);
  });

  it('should clear sessions to remove', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessionsToRemove: [mockCourtScheduleSession]
    };

    const action = ViewScheduleActions.clearViewSessionsToRemove();
    const state = viewScheduleReducer(initialStateWithSessions, action);

    expect(state.sessionsToRemove).toEqual([]);
  });

  it('should clear sessions to assign', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessionsToAssign: [mockCourtScheduleSession]
    };

    const action = ViewScheduleActions.clearViewSessionsToAssign();
    const state = viewScheduleReducer(initialStateWithSessions, action);

    expect(state.sessionsToAssign).toEqual([]);
  });

  it('should set search form values on searchSchedules', () => {
    const searchFormValues: SearchFormValues = {
      courtCentre: mockMagistratesCourtCentre,
      businessType: 'Trial',
      courtroomId: 'courtRoomId1',
      startDate: '2024-7-7',
      minEndDate: undefined,
      endDate: ''
    };
    const action = ViewScheduleActions.searchSchedules({
      searchFormValues
    });
    const state = viewScheduleReducer(initialState, action);

    expect(state.searchValues).toEqual(searchFormValues);
  });

  it('should set the session to edit', () => {
    const session = mockCourtScheduleSession;
    const action = ViewScheduleActions.setSessionToEdit({
      session
    });
    const state = viewScheduleReducer(initialState, action);

    expect(state.sessionToEdit).toEqual(session);
  });

  it('should set setActiveCourtroomsIndexes', () => {
    const activeCourtroomsIndexes = mockActiveCourtroomIndexes;
    const action = ViewScheduleActions.setActiveCourtroomsIndexes({
      activeCourtroomsIndexes
    });
    const state = viewScheduleReducer(initialState, action);

    expect(state.activeCourtroomsIndexes).toEqual(activeCourtroomsIndexes);
  });

  it('should set errors', () => {
    const errors: ValidationError[] = mockErrors;
    const action = ViewScheduleActions.setErrors({
      errors
    });
    const state = viewScheduleReducer(initialState, action);

    expect(state.errors).toEqual(errors);
  });

  it('should set jurisdiction and clear searchValues, courtSchedules, and errors', () => {
    const stateWithData = {
      ...initialState,
      searchValues: mockSearchFormValues as SearchFormValues,
      courtSchedules: mockCourtSchedules,
      errors: mockErrors
    };

    const action = ViewScheduleActions.setJurisdiction({
      jurisdiction: JurisdictionType.MAGISTRATES
    });
    const state = viewScheduleReducer(stateWithData, action);

    expect(state.jurisdiction).toBe(JurisdictionType.MAGISTRATES);
    expect(state.searchValues).toBeNull();
    expect(state.courtSchedules).toEqual([]);
    expect(state.errors).toEqual([]);
  });
});
