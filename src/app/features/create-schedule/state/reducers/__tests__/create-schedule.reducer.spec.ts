import { CreateScheduleActions } from '../../actions';
import {
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockCrownCourtCentre,
  mockRepeatPattern,
  mockSession
} from '../../../../../shared';
import { initialState } from '../../create-schedule.state';
import { createScheduleReducer } from '../create-schedule.reducer';
import { JurisdictionType } from '../../../../../shared/model/jurisdiction';

describe('CourtScheduleDraft Reducer', () => {
  it('should set the court centre and derive jurisdiction', () => {
    const action = CreateScheduleActions.setCourtCentre({
      courtCentre: mockMagistratesCourtCentre
    });
    const state = createScheduleReducer(initialState, action);

    expect(state.selectedCourtCentre).toEqual(mockMagistratesCourtCentre);
    expect(state.jurisdiction).toBe(JurisdictionType.MAGISTRATES);
  });

  it('should set the court centre and derive CROWN jurisdiction for crown court', () => {
    const action = CreateScheduleActions.setCourtCentre({
      courtCentre: mockCrownCourtCentre
    });
    const state = createScheduleReducer(initialState, action);

    expect(state.selectedCourtCentre).toEqual(mockCrownCourtCentre);
    expect(state.jurisdiction).toBe(JurisdictionType.CROWN);
  });

  it('should set the business type', () => {
    const action = CreateScheduleActions.setBusinessType({ businessType: mockBusinessType });
    const state = createScheduleReducer(initialState, action);

    expect(state.selectedBusinessType).toEqual(mockBusinessType);
  });

  it('should clear sessions', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessions: [mockSession]
    };

    const action = CreateScheduleActions.clearSessions();
    const state = createScheduleReducer(initialStateWithSessions, action);

    expect(state.sessions).toEqual([]);
  });

  it('should add a session', () => {
    const action = CreateScheduleActions.addSession({ session: mockSession });
    const state = createScheduleReducer(initialState, action);

    expect(state.sessions).toEqual([mockSession]);
    expect(state.bannerMessage).toEqual(null);
  });

  it('should remove a session', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessions: [mockSession]
    };

    const action = CreateScheduleActions.removeSession({ sessions: [mockSession] });
    const state = createScheduleReducer(initialStateWithSessions, action);

    expect(state.sessions).toEqual([]);
    expect(state.bannerMessage).toEqual(null);
  });

  it('should set the success banner message', () => {
    const banner = {
      message: 'Sessions added successfully',
      bannerType: 'success'
    };
    const action = CreateScheduleActions.setCreateBanner(banner);
    const state = createScheduleReducer(initialState, action);

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
    const action = CreateScheduleActions.clearCreateBanner();
    const state = createScheduleReducer(initialStateWithBanner, action);

    expect(state.bannerMessage).toEqual({ message: null, bannerType: null });
  });

  it('should set the session to copy', () => {
    const session = mockSession;
    const action = CreateScheduleActions.setSessionToCopy({ session });
    const state = createScheduleReducer(initialState, action);

    expect(state.sessionToCopy).toEqual(session);
  });

  it('should set the repeat pattern', () => {
    const action = CreateScheduleActions.setRepeatPattern({ repeatPattern: mockRepeatPattern });
    const state = createScheduleReducer(initialState, action);

    expect(state.repeatPattern).toEqual(mockRepeatPattern);
  });

  it('should set the isPersisted flag', () => {
    const action = CreateScheduleActions.createCourtScheduleSuccess({ isPersisted: true });
    const state = createScheduleReducer(initialState, action);

    expect(state.isPersisted).toBe(true);
  });

  it('should clear the journey while keeping the selected court centre and jurisdiction', () => {
    const initialStateWithCourtCentre = {
      ...initialState,
      selectedCourtCentre: mockMagistratesCourtCentre,
      jurisdiction: JurisdictionType.MAGISTRATES,
      selectedBusinessType: mockBusinessType,
      sessions: [mockSession]
    };

    const action = CreateScheduleActions.clearJourney();
    const state = createScheduleReducer(initialStateWithCourtCentre, action);

    expect(state.selectedCourtCentre).toEqual(mockMagistratesCourtCentre);
    expect(state.jurisdiction).toBe(JurisdictionType.MAGISTRATES);
    expect(state.selectedBusinessType).toBeNull();
    expect(state.sessions).toEqual([]);
    expect(state.repeatPattern).toEqual({});
  });

  it('should set sessions to remove', () => {
    const initialStateWithSessions = {
      ...initialState,
      sessionsToRemove: [mockSession]
    };

    const action = CreateScheduleActions.setCreateSessionsToRemove({
      sessionsToRemove: [mockSession]
    });
    const state = createScheduleReducer(initialStateWithSessions, action);

    expect(state.sessionsToRemove).toEqual([mockSession]);
  });

  it('should set the jurisdiction', () => {
    const action = CreateScheduleActions.setJurisdiction({
      jurisdiction: JurisdictionType.MAGISTRATES
    });
    const state = createScheduleReducer(initialState, action);

    expect(state.jurisdiction).toBe(JurisdictionType.MAGISTRATES);
  });

  it('should set the jurisdiction to CROWN', () => {
    const action = CreateScheduleActions.setJurisdiction({
      jurisdiction: JurisdictionType.CROWN
    });
    const state = createScheduleReducer(initialState, action);

    expect(state.jurisdiction).toBe(JurisdictionType.CROWN);
  });

  it('should set the jurisdiction to null', () => {
    const action = CreateScheduleActions.setJurisdiction({
      jurisdiction: null
    });
    const state = createScheduleReducer(initialState, action);

    expect(state.jurisdiction).toBeNull();
  });

  it('should update existing jurisdiction', () => {
    const initialStateWithJurisdiction = {
      ...initialState,
      jurisdiction: JurisdictionType.MAGISTRATES
    };

    const action = CreateScheduleActions.setJurisdiction({
      jurisdiction: JurisdictionType.CROWN
    });
    const state = createScheduleReducer(initialStateWithJurisdiction, action);

    expect(state.jurisdiction).toBe(JurisdictionType.CROWN);
  });

  it('should clear court centre when jurisdiction changes', () => {
    const initialStateWithCourtCentre = {
      ...initialState,
      selectedCourtCentre: mockMagistratesCourtCentre,
      jurisdiction: JurisdictionType.MAGISTRATES
    };

    const action = CreateScheduleActions.setJurisdiction({
      jurisdiction: JurisdictionType.CROWN
    });
    const state = createScheduleReducer(initialStateWithCourtCentre, action);

    expect(state.jurisdiction).toBe(JurisdictionType.CROWN);
    expect(state.selectedCourtCentre).toBeNull();
  });

  it('should clear court centre when jurisdiction is set to null', () => {
    const initialStateWithCourtCentre = {
      ...initialState,
      selectedCourtCentre: mockMagistratesCourtCentre,
      jurisdiction: JurisdictionType.MAGISTRATES
    };

    const action = CreateScheduleActions.setJurisdiction({
      jurisdiction: null
    });
    const state = createScheduleReducer(initialStateWithCourtCentre, action);

    expect(state.jurisdiction).toBeNull();
    expect(state.selectedCourtCentre).toBeNull();
  });
});
