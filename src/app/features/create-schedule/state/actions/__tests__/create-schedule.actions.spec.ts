import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import {
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockRepeatPattern,
  mockSession
} from '../../../../../shared';
import {
  addSession,
  clearJourney,
  clearSessions,
  createCourtSchedule,
  removeSession,
  setBusinessType,
  setCourtCentre,
  setRepeatPattern,
  setCreateSessionsToRemove,
  setSessionToCopy,
  setCreateBanner,
  setJurisdiction
} from '../create-schedule.actions';
import { Session } from '../../../../../shared/model/session';
import { RepeatPattern } from '../../../model/repeat-pattern';
import { JurisdictionType } from '../../../../../shared/model/jurisdiction';

describe('CourtScheduleDraft actions', () => {
  it('should create set court centre action', () => {
    const courtCentre: OrganisationUnit = mockMagistratesCourtCentre;

    const action = setCourtCentre({ courtCentre });

    expect(action.type).toBe('SET_COURT_CENTRE');
    expect(action.courtCentre).toEqual(courtCentre);
  });

  it('should create set business type action', () => {
    const businessType: RotaBusinessType = mockBusinessType;

    const action = setBusinessType({ businessType });

    expect(action.type).toBe('SET_BUSINESS_TYPE');
    expect(action.businessType).toEqual(businessType);
  });

  it('should create add session action', () => {
    const session: Session = mockSession;

    const action = addSession({ session });

    expect(action.type).toBe('ADD_SESSION');
    expect(action.session).toEqual(session);
  });

  it('should create remove session action', () => {
    const sessions: Session[] = [mockSession];

    const action = removeSession({ sessions });

    expect(action.type).toBe('REMOVE_SESSION');
    expect(action.sessions).toEqual(sessions);
  });

  it('should create set success banner action', () => {
    const banner = {
      message: 'Sessions updated successfully',
      bannerType: 'success'
    };

    const action = setCreateBanner(banner);

    expect(action.type).toBe('SET_CREATE_BANNER');
    expect(action.message).toEqual(banner.message);
  });

  it('should create set session to copy action', () => {
    const session: Session = mockSession;

    const action = setSessionToCopy({ session });

    expect(action.type).toBe('SET_SESSION_TO_COPY');
    expect(action.session).toEqual(session);
  });

  it('should create set sessions to remove action', () => {
    const session: Session = mockSession;

    const action = setCreateSessionsToRemove({ sessionsToRemove: [session] });

    expect(action.type).toBe('SET_CREATE_SESSIONS_TO_REMOVE');
    expect(action.sessionsToRemove).toEqual([session]);
  });

  it('should create set repeat pattern action', () => {
    const repeatPattern: RepeatPattern = mockRepeatPattern;

    const action = setRepeatPattern({ repeatPattern });

    expect(action.type).toBe('SET_REPEAT_PATTERN');
    expect(action.repeatPattern).toEqual(repeatPattern);
  });

  it('should create create court schedule action', () => {
    const action = createCourtSchedule();

    expect(action.type).toBe('CREATE_COURT_SCHEDULE');
  });

  it('should create clear journey action', () => {
    const action = clearJourney();

    expect(action.type).toBe('CLEAR_JOURNEY');
  });

  it('should create clear sessions action', () => {
    const action = clearSessions();

    expect(action.type).toBe('CLEAR_SESSIONS');
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

  it('should create set jurisdiction action with null', () => {
    const jurisdiction: JurisdictionType | null = null;

    const action = setJurisdiction({ jurisdiction });

    expect(action.type).toBe('SET_JURISDICTION');
    expect(action.jurisdiction).toBeNull();
  });
});
