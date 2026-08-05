import { CreateScheduleState } from '../create-schedule.state';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

export const getSelectedCourtCentre = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.selectedCourtCentre;
export const getSelectedBusinessType = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.selectedBusinessType;
export const getSessions = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.sessions;
export const getSessionToCopy = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.sessionToCopy;
export const getSessionsToRemove = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.sessionsToRemove;
export const getBannerMessage = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.bannerMessage;
export const getRepeatPattern = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.repeatPattern;
export const getIsPersisted = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.isPersisted;
export const getErrors = (state: CreateScheduleState) =>
  state.courtScheduleDraft && state.courtScheduleDraft.errors;
export const getJurisdiction = (state: CreateScheduleState): JurisdictionType | null =>
  state.courtScheduleDraft?.jurisdiction ?? null;
