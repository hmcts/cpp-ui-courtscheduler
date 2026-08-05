import { Component, OnInit, inject, input, output } from '@angular/core';
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
import { CourtScheduleSession } from '../../model/view-schedule.model';

import { SessionsListComponent } from '../sessions-list/sessions-list.component';
import {
  isPastSession,
  hasHearingsBooked,
  canBeAssigned
} from '../../../../shared/utils/session-criteria.utils';
import { TimeRangeValidatorDirective } from '../../../../shared/pipes/time-range-validator.pipe';
import {
  COURTROOM_ASSIGNMENT_OPTIONS,
  PANEL_OPTIONS,
  VALIDATION
} from '../../../../shared/utils/session-form.config';
import { CUSTOM_SESSION_TIME_LIMITS } from '@cpp/scheduling';
import { SessionType } from '../../../../shared/model/session';
import * as TimeRangeUtils from '../../../../shared/utils/time-range.utils';
import { TimeRangeError } from '../../../../shared/utils/time-range.utils';
import { FormatTimePipe } from '../../../../shared/pipes/format-time.pipe';
import { FormsModule, ValidationErrors } from '@angular/forms';
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
export class EditSessionComponent implements OnInit {
  private formatTimePipe = inject(FormatTimePipe);
  readonly jurisdiction = input<JurisdictionType | null>();

  readonly courtCentres = input<CourtCentre[]>([]);
  readonly sessionToEdit = input<CourtScheduleSession>();
  readonly errors = output<ValidationError[] | null>();
  readonly submitForm = output<CourtScheduleSession>();
  readonly handleBackNav = output<void>();

  readonly panelOptions = PANEL_OPTIONS;
  readonly JurisdictionType = JurisdictionType;
  readonly VALIDATION = VALIDATION;
  readonly CUSTOM_SESSION_TIME_LIMITS = CUSTOM_SESSION_TIME_LIMITS;
  readonly courtroomAssignmentOptions = COURTROOM_ASSIGNMENT_OPTIONS;

  courtroomOptions: SelectOption<string>[] = [];

  isPastDate: boolean = false;
  hasHearingsBooked: boolean;
  canBeAssigned: boolean;
  showAM: boolean;
  showPM: boolean;
  showAD: boolean;

  startTimeErrorMessages: TimeRangeError[] = [];
  endTimeErrorMessages: TimeRangeError[] = [];

  durationErrorMessages: ValidationErrors[];

  morningDurationErrorMessages: ValidationErrors[] = [
    { rule: 'required', message: VALIDATION.morningDuration }
  ];
  afternoonDurationErrorMessages: ValidationErrors[] = [
    { rule: 'required', message: VALIDATION.afternoonDuration }
  ];

  formValues: CourtScheduleSession;
  ineligiblePastSessions: CourtScheduleSession[] = [];

  getMatchingSlotTypeFilter(): (businessType: RotaBusinessType) => boolean {
    return (businessType: RotaBusinessType) => businessType.slot === this.formValues?.slotBased;
  }

  private formatHearingTime(time: string | undefined): string {
    return this.formatTimePipe.transform(time, {
      format24h: true,
      hideMeridiem: true,
      sessionDate: this.formValues.sessionDate
    });
  }

  private createMinValidationMessage(booked: number, period?: 'AM' | 'PM'): ValidationErrors {
    const message = period
      ? `Maximum duration for ${period} cannot be less than total already booked of ${booked} mins`
      : `Maximum ${
          this.formValues.slotBased ? 'slots' : 'duration'
        } cannot be less than total already booked of ${booked} ${
          this.formValues.slotBased ? 'slot(s)' : 'min(s)'
        }`;

    return { rule: 'min', message };
  }

  get timeRange() {
    const sessionTypeRange =
      CUSTOM_SESSION_TIME_LIMITS[this.formValues?.courtSession as SessionType];
    return {
      start: {
        min: sessionTypeRange?.min,
        max: this.hasHearingsBooked
          ? this.formatHearingTime(this.formValues?.minHearingTime)
          : sessionTypeRange?.max
      },
      end: {
        min: this.hasHearingsBooked
          ? this.formatHearingTime(this.formValues?.maxHearingTime)
          : sessionTypeRange?.min,
        max: sessionTypeRange?.max
      }
    };
  }

  ngOnInit(): void {
    this.formValues = {
      ...this.sessionToEdit(),
      sessionStartTime: this.formatTimePipe.transform(this.sessionToEdit().sessionStartTime, {
        format24h: true,
        hideMeridiem: true,
        sessionDate: this.sessionToEdit().sessionDate
      }),
      sessionEndTime: this.formatTimePipe.transform(this.sessionToEdit().sessionEndTime, {
        format24h: true,
        hideMeridiem: true,
        sessionDate: this.sessionToEdit().sessionDate
      }),
      courtroomAssignment: this.sessionToEdit()?.isDraft
        ? CourtroomAssignmentType.DRAFT
        : CourtroomAssignmentType.ASSIGNED
    };

    this.isPastDate = isPastSession(this.formValues);
    if (!this.courtroomOptions.length) {
      const courtrooms = this.courtCentres().find(
        (orgUnit) => orgUnit.id === this.formValues.courtHouseId
      )?.courtRooms;
      this.courtroomOptions =
        courtrooms?.map((courtroom) => ({
          value: courtroom.id,
          label: courtroom.name
        })) ?? [];
    }
    this.hasHearingsBooked = hasHearingsBooked(this.formValues);
    this.canBeAssigned = canBeAssigned(this.formValues);
    this.showAM =
      (this.formValues?.allDaySplit === false && !this.hasHearingsBooked) ||
      (this.hasHearingsBooked && this.formValues.courtSession === 'AM');
    this.showPM =
      (this.formValues?.allDaySplit === false && !this.hasHearingsBooked) ||
      (this.hasHearingsBooked && this.formValues.courtSession === 'PM');
    this.showAD =
      !this.hasHearingsBooked || (this.hasHearingsBooked && this.formValues.courtSession === 'AD');

    this.startTimeErrorMessages = TimeRangeUtils.getTimeRangeErrorMessages(
      this.formValues?.courtSession as SessionType,
      this.timeRange.start
    ).start;
    this.endTimeErrorMessages = TimeRangeUtils.getTimeRangeErrorMessages(
      this.formValues?.courtSession as SessionType,
      this.timeRange.end
    ).end;

    this.durationErrorMessages = [
      ...[
        {
          rule: 'required',
          message: this.formValues.slotBased ? VALIDATION.slot : VALIDATION.duration
        }
      ],
      this.createMinValidationMessage(this.formValues.totalBooked)
    ];

    this.morningDurationErrorMessages = [
      ...this.morningDurationErrorMessages,
      this.createMinValidationMessage(this.formValues.totalBookedForMorning, 'AM')
    ];

    this.afternoonDurationErrorMessages = [
      ...this.afternoonDurationErrorMessages,
      this.createMinValidationMessage(this.formValues.totalBookedForAfternoon, 'PM')
    ];

    this.ineligiblePastSessions = [this.formValues];
  }

  onCourtSessionChange(value: string) {
    this.formValues = { ...this.formValues, courtSession: value };
    this.handleCustomTimesErrorMessages();
  }

  handleCustomTimesErrorMessages() {
    TimeRangeUtils.updateErrorMessages(
      this.startTimeErrorMessages,
      this.endTimeErrorMessages,
      this.formValues?.courtSession as SessionType,
      this.timeRange.start
    );
  }

  handleSubmitForm({
    courtSession = this.formValues.courtSession,
    businessType = this.formValues.businessType,
    panel = this.formValues.panel,
    courtRoomId = this.formValues.courtRoomId,
    maxSlots,
    maxDuration,
    maxDurationForMorning,
    maxDurationForAfternoon,
    sessionStartTime,
    sessionEndTime,
    isOverbookingAllowed,
    courtroomAssignment = this.formValues.courtroomAssignment
  }: CourtScheduleSession) {
    const { allDaySplit } = this.formValues;
    const sessionToEdit = {
      courtScheduleId: this.formValues.courtScheduleId,
      courtRoomId,
      businessType,
      courtSession,
      panel,
      sessionStartTime,
      sessionEndTime,
      isOverbookingAllowed: isOverbookingAllowed ?? false,
      ...(maxSlots !== undefined ? { maxSlots } : { maxDuration }),
      ...(maxDurationForMorning !== undefined && { maxDurationForMorning }),
      ...(maxDurationForAfternoon !== undefined && { maxDurationForAfternoon }),
      ...(allDaySplit !== undefined && { allDaySplit }),
      courtroomAssignment
    };
    this.submitForm.emit(sessionToEdit as CourtScheduleSession);
  }
}
