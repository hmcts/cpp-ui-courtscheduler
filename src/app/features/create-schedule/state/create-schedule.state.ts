import { AppState } from '../../../core/reducers';
import { CourtScheduleDraft } from '../model';
import { RepeatPattern } from '../model/repeat-pattern';

export const CREATE_SCHEDULE_FEATURE_KEY = 'courtScheduleDraft';

export interface CreateScheduleState extends AppState {
  courtScheduleDraft: CourtScheduleDraft;
}

export const initialState: CourtScheduleDraft = {
  selectedCourtCentre: null,
  selectedBusinessType: null,
  sessions: [],
  sessionToCopy: null,
  sessionsToRemove: [],
  bannerMessage: null,
  repeatPattern: {} as RepeatPattern,
  isPersisted: false,
  errors: [],
  jurisdiction: null
};
