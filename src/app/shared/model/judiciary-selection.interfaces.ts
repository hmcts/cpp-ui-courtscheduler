import type { JudiciaryTypePayload } from '@cpp/reference-data';
import type { ExtendedJudicialMember } from './extended-judicial-member';
import type { FormControl } from '@angular/forms';

export interface MagistrateSlotConfig {
  label: string;
  required?: boolean;
}

interface BaseJudiciarySearchParams {
  search: string;
  limit?: number;
  judiciaryGroup: JudiciaryTypePayload;
  ignoreAvailability?: boolean;
}

interface DateJudiciarySearchParams extends BaseJudiciarySearchParams {
  dates: string;
  courtHouseId: string;
  courtScheduleIds?: never;
}

interface CourtScheduleJudiciarySearchParams extends BaseJudiciarySearchParams {
  courtScheduleIds: string;
  courtHouseId?: never;
  dates?: never;
}

export type JudiciarySearchParams = DateJudiciarySearchParams | CourtScheduleJudiciarySearchParams;

export interface JudiciarySelectionSuggestion {
  type: JudiciaryTypePayload;
  judicialMembers: ExtendedJudicialMember[];
}

export type JudiciarySelectionValue = Partial<
  Record<Exclude<JudiciaryTypePayload, 'Magistrate' | ''>, ExtendedJudicialMember | null> & {
    Magistrate: ExtendedJudicialMember[] | null;
  }
>;

export type JudiciarySelectionFormGroup = Partial<
  Record<
    Exclude<JudiciaryTypePayload, 'Magistrate' | ''>,
    FormControl<ExtendedJudicialMember | null>
  > & {
    Magistrate: FormControl<ExtendedJudicialMember[] | null>;
  }
>;
