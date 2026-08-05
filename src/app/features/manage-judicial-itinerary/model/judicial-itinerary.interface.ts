import { DayOfWeek, ExtendedJudicialMember, SessionType } from '../../../shared/model';
import { Unavailability } from './unavailability.interface';

export interface RuleDto {
  id: string;
  judiciaryId: string;
  courtHouseId: string;
  startDate: string;
  endDate: string;
  sessionType: SessionType;
  repeatDays: Array<keyof typeof DayOfWeek>;
  unavailabilities: Array<Unavailability>;
}

export interface SpecialismDto {
  judiciaryId: string;
  specialism: string[];
}

export interface FindAvailabilityDtoResponse {
  rules: RuleDto[];
  judiciaries: ExtendedJudicialMember[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface Itinerary extends Omit<RuleDto, 'judiciaryId'> {
  judiciaryMember: ExtendedJudicialMember;
}

export interface FindAvailabilityVM {
  itineraries: Itinerary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface FindAvailabilityParams {
  startDate: string;
  endDate: string;
  courtCentreId: string;
  pageNumber: number;
  pageSize: number;
}

export interface DraftItinerary {
  availability: {
    startDate: string | null;
    endDate: string | null;
  };
  sittingDays: DayOfWeek[];
  session: SessionType | null;
  unavailabilities?: Unavailability[];
}

export interface AddAvailabilityPayload {
  judiciaryId: string;
  courtHouseId: string;
  repeatDays: Array<string>;
  startDate: string;
  endDate: string;
  sessionType: SessionType;
}

export interface UpdateAvailabilityPayload extends AddAvailabilityPayload {
  ruleId: string;
  unavailabilities: Array<Unavailability>;
}

export interface ServerSubmissionError {
  message: string;
  isSourceForm: boolean;
  linkText?: string;
  linkAction?: () => void;
}

export interface ServerSubmissionErrorDTO {
  validationResult: {
    status: 'FAILURE';
    validationError: string;
  };
}
