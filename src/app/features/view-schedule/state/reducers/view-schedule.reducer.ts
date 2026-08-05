import { Action, createReducer, on } from '@ngrx/store';
import { initialState } from '../view-schedule.state';
import { ViewScheduleActions } from '../actions';
import {
  SearchFormValues,
  ViewCourtSchedule,
  CourtSchedule,
  CourtScheduleSession
} from '../../model/view-schedule.model';
import { BannerMessage } from '../../../../shared';
import { ValidationError } from '@cpp/pdk';

export function viewScheduleFeatureReducer(state: ViewCourtSchedule | undefined, action: Action) {
  return viewScheduleReducer(state, action);
}

export const viewScheduleReducer = createReducer(
  initialState,
  on(ViewScheduleActions.searchSchedulesSuccess, (state, { courtSchedules }) => {
    return {
      ...state,
      courtSchedules
    };
  }),
  on(ViewScheduleActions.setViewBanner, (state, { message, bannerType, courtRoomName }) => {
    return {
      ...state,
      bannerMessage: { message, bannerType, courtRoomName }
    };
  }),
  on(ViewScheduleActions.clearViewBanner, (state) => {
    return {
      ...state,
      bannerMessage: {
        message: null,
        bannerType: null
      } as BannerMessage
    };
  }),
  on(ViewScheduleActions.searchSchedules, (state, { searchFormValues }) => ({
    ...state,
    searchValues: searchFormValues
  })),
  on(ViewScheduleActions.setViewSessionsToRemove, (state, { sessionsToRemove }) => {
    return {
      ...state,
      sessionsToRemove
    };
  }),
  on(ViewScheduleActions.clearViewSessionsToRemove, (state) => {
    return {
      ...state,
      sessionsToRemove: [] as CourtScheduleSession[]
    };
  }),
  on(ViewScheduleActions.setViewSessionsToAssign, (state, { sessionsToAssign }) => {
    return {
      ...state,
      sessionsToAssign
    };
  }),
  on(ViewScheduleActions.clearViewSessionsToAssign, (state) => {
    return {
      ...state,
      sessionsToAssign: [] as CourtScheduleSession[]
    };
  }),
  on(ViewScheduleActions.setActiveCourtroomsIndexes, (state, { activeCourtroomsIndexes }) => {
    return {
      ...state,
      activeCourtroomsIndexes
    };
  }),
  on(ViewScheduleActions.setErrors, (state, { errors }) => {
    return {
      ...state,
      errors
    };
  }),
  on(ViewScheduleActions.setJurisdiction, (state, { jurisdiction }) => {
    return {
      ...state,
      jurisdiction,
      searchValues: null as SearchFormValues | null,
      courtSchedules: [] as CourtSchedule[],
      errors: [] as ValidationError[]
    };
  })
);
