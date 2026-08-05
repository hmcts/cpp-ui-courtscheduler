import { OrganisationUnit } from '@cpp/reference-data';
import { BannerMessage } from '../../../shared/model/banner-message';
import { ValidationError } from '@cpp/pdk';
import { JurisdictionType } from '../../../shared/model/jurisdiction';

export interface CourtScheduleSession {
  courtScheduleId?: string;
  active?: boolean;
  allDaySplit: boolean;
  businessType: string;
  businessDescription?: string;
  courtHouseId?: string;
  courtHouseName?: string;
  courtRoomId: string;
  courtRoomName?: string;
  courtRoomNumber?: number;
  courtSession?: string;
  createdOn?: string;
  listingProfileId?: string;
  maxDuration?: number;
  maxDurationForAfternoon?: number;
  maxDurationForMorning?: number;
  maxSlots?: number;
  minHearingTime?: string;
  maxHearingTime?: string;
  isOverbookingAllowed?: boolean;
  operationalUnit?: string;
  ouCode?: string;
  panel: string;
  sessionDate?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  slotBased?: boolean;
  totalBooked?: number;
  totalBookedForMorning?: number;
  totalBookedForAfternoon?: number;
  updatedOn?: string;
  jurisdiction: JurisdictionType;
  isDraft?: boolean;
  courtroomAssignment?: string;
}

export type CourtScheduleSessionSortFieldsKeys = keyof Pick<
  CourtScheduleSession,
  'courtRoomName' | 'sessionDate' | 'panel' | 'courtSession' | 'isDraft'
>;

export interface CourtSchedule {
  courtRoomId: string;
  courtRoomName: string;
  sessions: CourtScheduleSession[];
}

export interface ViewCourtSchedule {
  courtSchedules: CourtSchedule[];
  bannerMessage?: BannerMessage;
  searchValues?: SearchFormValues;
  sessionToEdit?: CourtScheduleSession;
  sessionsToRemove?: CourtScheduleSession[];
  sessionsToAssign?: CourtScheduleSession[];
  errors?: ValidationError[];
  activeCourtroomsIndexes?: number[];
  jurisdiction?: JurisdictionType;
}

export interface SearchSchedulesPayload {
  courtCentreId: string;
  courtRoomId?: string;
  businessType?: string;
  sessionStartDate: string;
  sessionEndDate: string;
}

export interface SearchFormValues {
  courtCentre: OrganisationUnit;
  businessType: string;
  courtroomId: string;
  startDate: string;
  minEndDate: Date;
  endDate: string;
}

export enum BulkActionType {
  REMOVE = 'remove',
  ASSIGN = 'assign'
}

export interface BulkActionPayload {
  action: BulkActionType;
  sessions: CourtScheduleSession[];
}

export interface AssignCourtroomErrorGroup {
  sessions: CourtScheduleSession[];
  error: string;
}
