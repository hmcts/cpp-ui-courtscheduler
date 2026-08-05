import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { ViewScheduleState } from '../view-schedule.state';

export const getCourtSchedules = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.courtSchedules;
export const getBannerMessage = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.bannerMessage;
export const getSearchValues = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.searchValues;
export const getActiveCourtroomsIndexes = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.activeCourtroomsIndexes;
export const getSessionsToRemove = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.sessionsToRemove;
export const getSessionsToAssign = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.sessionsToAssign;
export const getErrors = (state: ViewScheduleState) =>
  state.viewSchedule && state.viewSchedule.errors;
export const getJurisdiction = (state: ViewScheduleState): JurisdictionType | null =>
  state.viewSchedule?.jurisdiction ?? null;
