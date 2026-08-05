import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import {
  PdkButton,
  PdkCheckBox,
  PdkDividerComponent,
  PdkForm,
  PdkGrid,
  PdkInput,
  PdkMarginDirective,
  PdkRadio,
  PdkSelectComponent,
  PdkTextInput,
  PdkTimeInputComponent,
  PdkTypographyDirective,
  SelectOption,
  ValidationError,
  PdkPaddingDirective
} from '@cpp/pdk';
import { RotaBusinessType, RotaBusinessTypeSelectComponent } from '@cpp/reference-data';
import { CourtCentre } from '../../../../shared';
import { CourtScheduleSession, EditSessionFormValues } from '../../model/view-schedule.model';
import { SessionsListComponent } from '../sessions-list/sessions-list.component';
import {
  isPastSession,
  hasHearingsBooked,
  canBeAssigned
} from '../../../../shared/utils/session-criteria.utils';
import { TimeRangeValidatorDirective } from '../../../../shared/directives/time-range-validator.directive';
import {
  COURTROOM_ASSIGNMENT_OPTIONS,
  PANEL_OPTIONS,
  VALIDATION
} from '../../../../shared/utils/session-form.config';
import { CUSTOM_SESSION_TIME_LIMITS } from '@cpp/scheduling';
import { SessionType } from '../../../../shared/model/session';
import * as TimeRangeUtils from '../../../../shared/utils/time-range.utils';
import { FormatTimePipe } from '../../../../shared/pipes/format-time.pipe';
import { FormsModule, ValidationErrors } from '@angular/forms';
import { PanelType } from '../../../../shared/model/panel';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { CourtroomAssignmentType } from '../../../../shared/model/courtroom-assignment';

@Component({
  selector: 'edit-sessions-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-from.component.scss'],
  imports: [
    FormsModule,
    PdkButton,
    PdkCheckBox,
    PdkDividerComponent,
    PdkForm,
    PdkGrid,
    PdkInput,
    PdkMarginDirective,
    PdkRadio,
    PdkSelectComponent,
    PdkTextInput,
    PdkTimeInputComponent,
    PdkTypographyDirective,
    SessionsListComponent,
    TimeRangeValidatorDirective,
    PdkPaddingDirective,
    RotaBusinessTypeSelectComponent
  ],
  providers: [FormatTimePipe]
})
export class EditSessionComponent {
  private formatTimePipe = inject(FormatTimePipe);
  readonly jurisdiction = input<JurisdictionType | null>();

  readonly courtCentres = input<CourtCentre[]>([]);
  readonly sessionToEdit = input<CourtScheduleSession>();

  readonly errors = output<ValidationError[] | null>();
  readonly submitForm = output<EditSessionFormValues>();
  readonly handleBackNav = output<void>();

  readonly panelOptions = PANEL_OPTIONS;
  readonly JurisdictionType = JurisdictionType;
  readonly VALIDATION = VALIDATION;
  readonly CUSTOM_SESSION_TIME_LIMITS = CUSTOM_SESSION_TIME_LIMITS;
  readonly courtroomAssignmentOptions = COURTROOM_ASSIGNMENT_OPTIONS;
  readonly startTimeErrorMessages = TimeRangeUtils.getTimeRangeErrorMessages().start;
  readonly endTimeErrorMessages = TimeRangeUtils.getTimeRangeErrorMessages().end;

  readonly courtroomOptions = computed((): SelectOption<string>[] => {
    const courtrooms = this.courtCentres().find(
      (orgUnit) => orgUnit.id === this.sessionToEdit()?.courtHouseId
    )?.courtRooms;
    return courtrooms?.map((courtroom) => ({ value: courtroom.id, label: courtroom.name })) ?? [];
  });

  readonly isPastDate = computed(() => isPastSession(this.sessionToEdit()!));
  readonly hasHearingsBooked = computed(() => hasHearingsBooked(this.sessionToEdit()!));
  readonly canBeAssigned = computed(() => canBeAssigned(this.sessionToEdit()!));

  readonly formValues = computed((): EditSessionFormValues => {
    const session = this.sessionToEdit()!;
    return {
      courtRoomId: session.courtRoomId,
      businessType: session.businessType,
      courtSession: session.courtSession,
      panel: session.panel,
      sessionStartTime: this.formatTimePipe.transform(session.sessionStartTime, {
        format24h: true,
        hideMeridiem: true,
        sessionDate: session.sessionDate
      }),
      sessionEndTime: this.formatTimePipe.transform(session.sessionEndTime, {
        format24h: true,
        hideMeridiem: true,
        sessionDate: session.sessionDate
      }),
      isOverbookingAllowed: session.isOverbookingAllowed,
      maxSlots: session.maxSlots,
      maxDuration: session.maxDuration,
      maxDurationForMorning: session.maxDurationForMorning,
      maxDurationForAfternoon: session.maxDurationForAfternoon,
      courtroomAssignment: session.isDraft
        ? CourtroomAssignmentType.DRAFT
        : CourtroomAssignmentType.ASSIGNED
    };
  });

  readonly selectedCourtSession = linkedSignal(() => this.formValues().courtSession);

  readonly timeRange = computed(() => {
    const sessionTypeRange = CUSTOM_SESSION_TIME_LIMITS[this.selectedCourtSession() as SessionType];
    const session = this.sessionToEdit();
    return {
      start: {
        min: sessionTypeRange?.min,
        max: this.hasHearingsBooked()
          ? this.formatHearingTime(session?.minHearingTime)
          : sessionTypeRange?.max
      },
      end: {
        min: this.hasHearingsBooked()
          ? this.formatHearingTime(session?.maxHearingTime)
          : sessionTypeRange?.min,
        max: sessionTypeRange?.max
      }
    };
  });

  readonly showAM = computed(() => {
    const session = this.sessionToEdit();
    return (
      (session?.allDaySplit === false && !this.hasHearingsBooked()) ||
      (this.hasHearingsBooked() && session?.courtSession === 'AM')
    );
  });

  readonly showPM = computed(() => {
    const session = this.sessionToEdit();
    return (
      (session?.allDaySplit === false && !this.hasHearingsBooked()) ||
      (this.hasHearingsBooked() && session?.courtSession === 'PM')
    );
  });

  readonly showAD = computed(() => {
    const session = this.sessionToEdit();
    return (
      !this.hasHearingsBooked() || (this.hasHearingsBooked() && session?.courtSession === 'AD')
    );
  });

  readonly durationErrorMessages = computed((): ValidationErrors[] => {
    const session = this.sessionToEdit()!;
    return [
      { rule: 'required', message: session.slotBased ? VALIDATION.slot : VALIDATION.duration },
      this.createMinValidationMessage(session.totalBooked, session.slotBased)
    ];
  });

  readonly morningDurationErrorMessages = computed((): ValidationErrors[] => {
    const session = this.sessionToEdit()!;
    return [
      { rule: 'required', message: VALIDATION.morningDuration },
      this.createMinValidationMessage(session.totalBookedForMorning, session.slotBased, 'AM')
    ];
  });

  readonly afternoonDurationErrorMessages = computed((): ValidationErrors[] => {
    const session = this.sessionToEdit()!;
    return [
      { rule: 'required', message: VALIDATION.afternoonDuration },
      this.createMinValidationMessage(session.totalBookedForAfternoon, session.slotBased, 'PM')
    ];
  });

  getMatchingSlotTypeFilter(): (businessType: RotaBusinessType) => boolean {
    return (businessType: RotaBusinessType) =>
      businessType.slot === this.sessionToEdit()?.slotBased;
  }

  handleSubmitForm({
    courtSession = this.formValues().courtSession,
    businessType = this.formValues().businessType,
    panel = this.formValues().panel,
    courtRoomId = this.formValues().courtRoomId,
    maxSlots,
    maxDuration,
    maxDurationForMorning,
    maxDurationForAfternoon,
    sessionStartTime,
    sessionEndTime,
    isOverbookingAllowed,
    courtroomAssignment = this.formValues().courtroomAssignment
  }: EditSessionFormValues) {
    const isCrown = this.jurisdiction() === JurisdictionType.CROWN;
    this.submitForm.emit({
      courtRoomId,
      courtRoomName: this.courtroomOptions().find((option) => option.value === courtRoomId)?.label,
      businessType,
      courtSession,
      panel: isCrown ? PanelType.ADULT : panel,
      sessionStartTime,
      sessionEndTime,
      isOverbookingAllowed: !!isOverbookingAllowed,
      maxSlots,
      maxDuration,
      maxDurationForMorning,
      maxDurationForAfternoon,
      isDraft: isCrown ? courtroomAssignment === CourtroomAssignmentType.DRAFT : undefined,
      courtroomAssignment: undefined
    });
  }

  private formatHearingTime(time: string | undefined): string {
    return this.formatTimePipe.transform(time, {
      format24h: true,
      hideMeridiem: true,
      sessionDate: this.sessionToEdit()?.sessionDate
    });
  }

  private createMinValidationMessage(
    booked: number,
    slotBased: boolean | undefined,
    period?: 'AM' | 'PM'
  ): ValidationErrors {
    const message = period
      ? `Maximum duration for ${period} cannot be less than total already booked of ${booked} mins`
      : `Maximum ${slotBased ? 'slots' : 'duration'} cannot be less than total already booked of ${booked} ${slotBased ? 'slot(s)' : 'min(s)'}`;
    return { rule: 'min', message };
  }
}
