import { createAction, props } from '@ngrx/store';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { Session } from '../../../../shared/model/session';
import { RepeatPattern } from '../../model/repeat-pattern';
import { ValidationError } from '@cpp/pdk';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

export const setCourtCentre = createAction(
  'SET_COURT_CENTRE',
  props<{
    courtCentre: OrganisationUnit;
  }>()
);

export const setBusinessType = createAction(
  'SET_BUSINESS_TYPE',
  props<{
    businessType: RotaBusinessType;
  }>()
);

export const addSession = createAction(
  'ADD_SESSION',
  props<{
    session: Session;
  }>()
);

export const removeSession = createAction(
  'REMOVE_SESSION',
  props<{
    sessions: Session[];
  }>()
);

export const clearSessions = createAction('CLEAR_SESSIONS');

export const setCreateSessionsToRemove = createAction(
  'SET_CREATE_SESSIONS_TO_REMOVE',
  props<{
    sessionsToRemove: Session[];
  }>()
);

export const setSessionToCopy = createAction(
  'SET_SESSION_TO_COPY',
  props<{
    session: Session;
  }>()
);

export const setCreateBanner = createAction(
  'SET_CREATE_BANNER',
  props<{
    message: string;
    bannerType: string;
  }>()
);

export const setRepeatPattern = createAction(
  'SET_REPEAT_PATTERN',
  props<{
    repeatPattern: RepeatPattern;
  }>()
);

export const submitSession = createAction(
  'SUBMIT_SESSION',
  props<{
    existingSessions: Session[];
    sessionToBeAdded: Session;
    repeatPattern: RepeatPattern;
  }>()
);

export const copySession = createAction(
  'COPY_SESSION',
  props<{
    existingSessions: Session[];
    sessionToBeAdded: Session;
    repeatPattern: RepeatPattern;
  }>()
);

export const setErrors = createAction(
  'SET_VALIDATION_ERRORS',
  props<{
    errors: ValidationError[];
  }>()
);

export const createCourtSchedule = createAction('CREATE_COURT_SCHEDULE');
export const createCourtScheduleSuccess = createAction(
  'CREATE_COURT_SCHEDULE_SUCCESS',
  props<{
    isPersisted: boolean;
  }>()
);

export const clearJourney = createAction('CLEAR_JOURNEY');

export const clearCreateBanner = createAction('CLEAR_CREATE_BANNER');

export const submitSessionSuccess = createAction('SUBMIT_SESSION_SUCCESS');

export const setJurisdiction = createAction(
  'SET_JURISDICTION',
  props<{
    jurisdiction: JurisdictionType | null;
  }>()
);
