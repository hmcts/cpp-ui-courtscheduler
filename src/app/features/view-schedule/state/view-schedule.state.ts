import { AppState } from '../../../core/reducers';
import { ViewCourtSchedule } from '../model/view-schedule.model';

export const VIEW_SCHEDULE_FEATURE_KEY = 'viewSchedule';

export interface ViewScheduleState extends AppState {
  viewSchedule: ViewCourtSchedule;
}

export const initialState: ViewCourtSchedule = {
  courtSchedules: [],
  bannerMessage: null,
  searchValues: null,
  sessionsToRemove: [],
  sessionsToAssign: [],
  errors: [],
  activeCourtroomsIndexes: [],
  jurisdiction: null
};
