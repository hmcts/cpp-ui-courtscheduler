import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { Session } from '../../../shared/model/session';
import { RepeatPattern } from './repeat-pattern';
import { DayOfWeek } from '../../../shared/model/days';
import { BannerMessage } from '../../../shared/model/banner-message';
import { ValidationError } from '@cpp/pdk';
import { JurisdictionType } from '../../../shared/model/jurisdiction';

export interface CourtScheduleDraft {
  selectedCourtCentre: OrganisationUnit | null;
  selectedBusinessType: RotaBusinessType | null;
  sessions: Session[];
  sessionToCopy?: Session;
  sessionsToRemove?: Session[];
  bannerMessage?: BannerMessage;
  repeatPattern: RepeatPattern;
  isPersisted: boolean;
  errors: ValidationError[];
  jurisdiction?: JurisdictionType;
}

export interface CourtSchedulePayload {
  sessions: SessionPayload[];
  repeatPattern: RepeatPattern;
}

export interface ValidateSessionPayload {
  sessions: SessionPayload[];
  sessionToBeAdded: SessionPayload;
  repeatPattern: RepeatPattern;
}

export interface SessionPayload {
  courtCentreId: string;
  jurisdiction: JurisdictionType;
  courtRoomId: string;
  sessionType: string;
  businessType: string;
  duration: number;
  allDaySplit?: boolean;
  maxDurationForMorning?: number;
  maxDurationForAfternoon?: number;
  sessionStartTime?: string;
  sessionEndTime?: string;
  isOverbookingAllowed?: boolean;
  panel: string;
  repeatDays: (keyof typeof DayOfWeek)[];
  isDraft?: boolean;
  index?: number;
}
