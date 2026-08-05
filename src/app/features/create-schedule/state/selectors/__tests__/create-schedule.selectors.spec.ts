import {
  mockBanner,
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockRepeatPattern,
  mockSession
} from '../../../../../shared';
import { JurisdictionType } from '../../../../../shared/model/jurisdiction';
import {
  getBannerMessage,
  getIsPersisted,
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getSessions,
  getSessionsToRemove,
  getSessionToCopy,
  getJurisdiction
} from '../create-schedule.selectors';
import { CreateScheduleState } from '../../create-schedule.state';

describe('CourtScheduleDraft selectors', () => {
  const state = {
    courtScheduleDraft: {
      selectedCourtCentre: mockMagistratesCourtCentre,
      selectedBusinessType: mockBusinessType,
      sessions: [mockSession],
      sessionToCopy: mockSession,
      sessionsToRemove: [mockSession],
      bannerMessage: mockBanner,
      repeatPattern: mockRepeatPattern,
      isPersisted: true
    }
  } as CreateScheduleState;

  it('should return selected court', () => {
    const result = getSelectedCourtCentre(state);
    expect(result).toEqual(mockMagistratesCourtCentre);
  });

  it('should return selected business type', () => {
    const result = getSelectedBusinessType(state);
    expect(result).toEqual(mockBusinessType);
  });

  it('should return sessions', () => {
    const result = getSessions(state);
    expect(result).toEqual([mockSession]);
  });

  it('should return session to copy', () => {
    const result = getSessionToCopy(state);
    expect(result).toEqual(mockSession);
  });

  it('should return sessions to remove', () => {
    const result = getSessionsToRemove(state);
    expect(result).toEqual([mockSession]);
  });

  it('should return banner message', () => {
    const result = getBannerMessage(state);
    expect(result).toEqual(mockBanner);
  });

  it('should return repeat pattern', () => {
    const result = getRepeatPattern(state);
    expect(result).toEqual(mockRepeatPattern);
  });
  it('should return whether the state is persisted', () => {
    const result = getIsPersisted(state);
    expect(result).toEqual(true);
  });

  it('should return MAGISTRATES jurisdiction when jurisdiction is set to MAGISTRATES', () => {
    const stateWithJurisdiction = {
      ...state,
      courtScheduleDraft: {
        ...state.courtScheduleDraft,
        jurisdiction: JurisdictionType.MAGISTRATES
      }
    } as CreateScheduleState;
    const result = getJurisdiction(stateWithJurisdiction);
    expect(result).toBe(JurisdictionType.MAGISTRATES);
  });

  it('should return CROWN jurisdiction when jurisdiction is set to CROWN', () => {
    const stateWithJurisdiction = {
      ...state,
      courtScheduleDraft: {
        ...state.courtScheduleDraft,
        jurisdiction: JurisdictionType.CROWN
      }
    } as CreateScheduleState;
    const result = getJurisdiction(stateWithJurisdiction);
    expect(result).toBe(JurisdictionType.CROWN);
  });

  it('should return null when jurisdiction is not set', () => {
    const result = getJurisdiction(state);
    expect(result).toBeNull();
  });

  it('should return null when jurisdiction is explicitly set to null', () => {
    const stateWithNullJurisdiction = {
      ...state,
      courtScheduleDraft: {
        ...state.courtScheduleDraft,
        jurisdiction: null
      }
    } as CreateScheduleState;
    const result = getJurisdiction(stateWithNullJurisdiction);
    expect(result).toBeNull();
  });

  it('should return null when courtScheduleDraft is undefined', () => {
    const emptyState = {
      courtScheduleDraft: undefined
    } as CreateScheduleState;
    const result = getJurisdiction(emptyState);
    expect(result).toBeNull();
  });

  it('should return null when jurisdiction is undefined in courtScheduleDraft', () => {
    const stateWithoutJurisdiction = {
      ...state,
      courtScheduleDraft: {
        ...state.courtScheduleDraft,
        jurisdiction: undefined
      }
    } as CreateScheduleState;
    const result = getJurisdiction(stateWithoutJurisdiction);
    expect(result).toBeNull();
  });
});
