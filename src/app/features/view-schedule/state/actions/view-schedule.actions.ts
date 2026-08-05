import { createAction, props } from '@ngrx/store';
import {
  CourtSchedule,
  CourtScheduleSession,
  SearchFormValues
} from '../../model/view-schedule.model';
import { ValidationError } from '@cpp/pdk';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

export const searchSchedules = createAction(
  'SEARCH_SCHEDULES',
  props<{
    searchFormValues: SearchFormValues;
  }>()
);

export const searchSchedulesSuccess = createAction(
  'SEARCH_SCHEDULES_SUCCESS',
  props<{
    courtSchedules: CourtSchedule[];
  }>()
);

export const removeSessions = createAction(
  'REMOVE_SESSIONS',
  props<{
    sessionsToRemove: CourtScheduleSession[];
  }>()
);

export const removeSessionsSuccess = createAction(
  'REMOVE_SESSIONS_SUCCESS',
  props<{ courtRoomName?: string }>()
);

export const setViewSessionsToRemove = createAction(
  'SET_VIEW_SESSION_TO_REMOVE',
  props<{
    sessionsToRemove: CourtScheduleSession[];
  }>()
);

export const setViewSessionsToAssign = createAction(
  'SET_VIEW_SESSIONS_TO_ASSIGN',
  props<{
    sessionsToAssign: CourtScheduleSession[];
  }>()
);

export const clearViewSessionsToAssign = createAction('CLEAR_VIEW_SESSIONS_TO_ASSIGN');

export const clearViewSessionsToRemove = createAction('CLEAR_VIEW_SESSIONS_TO_REMOVE');

export const setViewBanner = createAction(
  'SET_VIEW_BANNER',
  props<{
    message: string;
    bannerType: string;
    courtRoomName?: string;
  }>()
);

export const clearViewBanner = createAction('CLEAR_VIEW_BANNER');

export const setActiveCourtroomsIndexes = createAction(
  'SET_ACTIVE_COURTROOMS_INDEXES',
  props<{
    activeCourtroomsIndexes: number[];
  }>()
);

export const setErrors = createAction(
  'SET_ERRORS',
  props<{
    errors: ValidationError[];
  }>()
);

export const setJurisdiction = createAction(
  'SET_JURISDICTION',
  props<{
    jurisdiction: JurisdictionType;
  }>()
);

export const assignCourtroom = createAction(
  'ASSIGN_COURTROOM',
  props<{
    sessionsToAssign: CourtScheduleSession[];
    courtroomId: string;
    courtRoomName: string;
  }>()
);

export const assignCourtroomSuccess = createAction(
  'ASSIGN_COURTROOM_SUCCESS',
  props<{ courtRoomName?: string }>()
);
