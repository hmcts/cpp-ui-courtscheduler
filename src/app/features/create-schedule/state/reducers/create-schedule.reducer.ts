import { Action, createReducer, on } from '@ngrx/store';
import { OrganisationUnit } from '@cpp/reference-data';
import { initialState } from '../create-schedule.state';
import { CreateScheduleActions } from '../actions';
import { CourtScheduleDraft } from '../../model';
import { BannerMessage } from '../../../../shared';
import { Session } from '../../../../shared/model/session';
import { getJurisdiction } from '../../../../shared/utils/jurisdiction.utils';

export function createScheduleFeatureReducer(
  state: CourtScheduleDraft | undefined,
  action: Action
) {
  return createScheduleReducer(state, action);
}

export const createScheduleReducer = createReducer(
  initialState,
  // Every time a court is set or updated, a clean journey is being enforced.
  on(CreateScheduleActions.setCourtCentre, (_, { courtCentre }) => {
    return {
      ...initialState,
      selectedCourtCentre: courtCentre,
      jurisdiction: getJurisdiction(courtCentre)
    };
  }),
  // Every time a business type is set or updated, sessions will be wiped as multiple business types per schedule are not supported.
  on(CreateScheduleActions.setBusinessType, (state, { businessType }) => {
    return {
      ...state,
      selectedBusinessType: businessType
    };
  }),
  on(CreateScheduleActions.clearSessions, (state) => {
    return {
      ...state,
      sessions: [] as Session[]
    };
  }),
  on(CreateScheduleActions.addSession, (state, { session }) => {
    return {
      ...state,
      bannerMessage: null as BannerMessage,
      sessions: [...state.sessions, session]
    };
  }),
  on(CreateScheduleActions.removeSession, (state, { sessions: [sessionToRemove] }) => {
    return {
      ...state,
      sessions: state.sessions.filter((session) => session.id !== sessionToRemove.id)
    };
  }),
  on(CreateScheduleActions.setErrors, (state, { errors }) => {
    return {
      ...state,
      errors
    };
  }),
  on(CreateScheduleActions.setCreateSessionsToRemove, (state, { sessionsToRemove }) => {
    return {
      ...state,
      sessionsToRemove
    };
  }),
  on(CreateScheduleActions.setCreateBanner, (state, { message, bannerType }) => {
    return {
      ...state,
      bannerMessage: { message, bannerType }
    };
  }),
  on(CreateScheduleActions.clearCreateBanner, (state) => {
    return {
      ...state,
      bannerMessage: {
        message: null,
        bannerType: null
      } as BannerMessage
    };
  }),
  on(CreateScheduleActions.setSessionToCopy, (state, { session }) => {
    return {
      ...state,
      sessionToCopy: session
    };
  }),
  on(CreateScheduleActions.setRepeatPattern, (state, { repeatPattern }) => {
    return { ...state, repeatPattern };
  }),
  on(CreateScheduleActions.createCourtScheduleSuccess, (state, { isPersisted }) => {
    return {
      ...state,
      isPersisted
    };
  }),
  // Court is not cleared after finishing a journey to allow the user to keep adding sessions against the same court.
  on(CreateScheduleActions.clearJourney, (state) => {
    return {
      ...initialState,
      selectedCourtCentre: state.selectedCourtCentre,
      jurisdiction: state.jurisdiction
    };
  }),
  // When jurisdiction changes, clear court centre
  on(CreateScheduleActions.setJurisdiction, (state, { jurisdiction }) => {
    return {
      ...state,
      jurisdiction,
      selectedCourtCentre: null as OrganisationUnit | null
    };
  })
);
