import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
  viewChild
} from '@angular/core';
import {
  PdkDetailsSummary,
  PdkForm,
  PdkGrid,
  PdkRadio,
  PdkSelectComponent,
  SelectOption,
  ValidationError,
  PdkInput,
  PdkDividerComponent,
  PdkCheckBox,
  PdkPaddingDirective,
  PdkMarginDirective,
  PdkButton,
  PdkBorderColorDirective,
  PdkTypographyDirective,
  PdkTextInput,
  PdkTimeInputComponent,
  ErrorMessageConfig
} from '@cpp/pdk';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { FormsModule, NgForm } from '@angular/forms';
import { Session } from '../../../../shared/model/session';
import { DayOfWeek } from '../../../../shared/model/days';
import { NgTemplateOutlet } from '@angular/common';
import { TimeRangeValidatorDirective } from '../../../../shared/directives/time-range-validator.directive';
import { FormatTimePipe } from '../../../../shared/pipes/format-time.pipe';
import {
  COURTROOM_ASSIGNMENT_OPTIONS,
  INDEX_OCURRENCE_OPTIONS,
  PANEL_OPTIONS,
  REPEAT_DAYS,
  VALIDATION
} from '../../../../shared/utils/session-form.config';
import * as TimeRangeUtils from '../../../../shared/utils/time-range.utils';
import { CUSTOM_SESSION_TIME_LIMITS, NATIONAL_STANDARD_TIMES } from '@cpp/scheduling';
import { isCrownJurisdiction } from '../../../../shared/utils/jurisdiction.utils';
import { FrequencyType, RepeatPattern } from '../../model/repeat-pattern';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

type AddSessionFormValues = Omit<Session, 'courtroom' | 'repeatDay'> & {
  courtroomId: string;
  repeatDay?: DayOfWeek;
};
type FormModel = AddSessionFormValues & {
  customTimes: boolean;
  isOverbookingAllowed?: boolean;
};

@Component({
  selector: 'add-sessions-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-sessions-form.component.html',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    PdkBorderColorDirective,
    PdkButton,
    PdkCheckBox,
    PdkDetailsSummary,
    PdkDividerComponent,
    PdkForm,
    PdkGrid,
    PdkInput,
    PdkMarginDirective,
    PdkPaddingDirective,
    PdkRadio,
    PdkSelectComponent,
    PdkTextInput,
    PdkTimeInputComponent,
    PdkTypographyDirective,
    FormatTimePipe,
    TimeRangeValidatorDirective
  ],
  styles: [
    `
      :host ::ng-deep .courtroom-assignment-wrapper fieldset legend {
        margin-bottom: 5px !important;
      }
      .monthly-selects-wrapper {
        display: flex;
      }

      .monthly-selects-wrapper ::ng-deep select {
        width: auto;
        min-width: fit-content;
      }
    `
  ]
})
export class AddSessionsFormComponent implements OnInit {
  readonly form = viewChild<NgForm>('form');
  readonly courtCentre = input.required<OrganisationUnit>();
  readonly isSlot = input<boolean>();
  readonly businessType = input.required<RotaBusinessType>();
  readonly initialValues = input<Session>();
  readonly jurisdiction = input<JurisdictionType | null>(null);
  readonly repeatPattern = input<RepeatPattern | null>(null);

  readonly errors = output<ValidationError[] | null>();
  readonly submitForm = output<Session>();

  readonly panelOptions = PANEL_OPTIONS;
  readonly repeatedDaysOptions = computed(() => {
    if (this.isCrownCourt()) {
      return REPEAT_DAYS.filter((day) => day.value !== DayOfWeek.Saturday);
    }
    return REPEAT_DAYS;
  });

  readonly indexOptions = INDEX_OCURRENCE_OPTIONS;

  readonly monthlyDayOptions = computed(() => {
    const days = this.isCrownCourt()
      ? REPEAT_DAYS.filter((day) => day.value !== DayOfWeek.Saturday)
      : REPEAT_DAYS;

    return days.map((day) => ({ value: day.value, label: day.label }));
  });
  readonly VALIDATION = VALIDATION;
  readonly CUSTOM_SESSION_TIME_LIMITS = CUSTOM_SESSION_TIME_LIMITS;
  readonly NATIONAL_STANDARD_TIMES = NATIONAL_STANDARD_TIMES;
  readonly courtroomAssignmentOptions = COURTROOM_ASSIGNMENT_OPTIONS;

  readonly isCrownCourt = computed(() => isCrownJurisdiction(this.jurisdiction()));
  readonly isMonthlyFrequency = computed(
    () => this.repeatPattern()?.frequency === FrequencyType.EVERY_MONTH
  );

  courtroomOptions: SelectOption<string>[] = [];

  formModel: FormModel = {
    businessType: undefined!,
    courtroomId: null,
    sessionType: undefined!,
    panelType: undefined!,
    repeatDays: [],
    duration: undefined,
    allDaySplit: undefined,
    maxDurationForMorning: undefined,
    maxDurationForAfternoon: undefined,
    customTimes: false,
    sessionStartTime: undefined,
    sessionEndTime: undefined,
    isOverbookingAllowed: undefined,
    courtroomAssignment: undefined,
    index: undefined
  };

  startTimeErrorMessages: ErrorMessageConfig[] = [];
  endTimeErrorMessages: ErrorMessageConfig[] = [];

  constructor() {
    // Initialize form model from initialValues (copy mode)
    effect(() => {
      const initialValues = this.initialValues();
      if (initialValues) {
        let repeatDays = initialValues.repeatDays;

        const isCrown = this.isCrownCourt();
        if (isCrown) {
          repeatDays = repeatDays.filter((day) => day !== DayOfWeek.Saturday);
        }

        const {
          repeatDay: sessionRepeatDay,
          courtroom,
          ...sessionWithoutRepeatDay
        } = initialValues;
        this.formModel = {
          ...sessionWithoutRepeatDay,
          courtroomId: courtroom?.id ?? null,
          customTimes: !!initialValues.sessionStartTime && !!initialValues.sessionEndTime,
          repeatDays,
          repeatDay: sessionRepeatDay
        };
      }

      const { start, end } = TimeRangeUtils.getTimeRangeErrorMessages();
      this.startTimeErrorMessages = start;
      this.endTimeErrorMessages = end;
    });
  }

  ngOnInit(): void {
    const courtCentre = this.courtCentre();
    this.courtroomOptions =
      courtCentre?.courtrooms?.map((courtroom) => ({
        value: courtroom.id,
        label: courtroom.courtroomName
      })) ?? [];
  }

  get timeRange() {
    return TimeRangeUtils.getTimeRange(this.formModel.sessionType, CUSTOM_SESSION_TIME_LIMITS);
  }

  handleCustomTimesChange = (checked: boolean): void => {
    this.formModel.customTimes = checked;
    if (!checked) {
      this.formModel.sessionStartTime = this.formModel.sessionEndTime = undefined;
    }
  };

  isAllDaysSelected = (): boolean => {
    const availableDays = this.repeatedDaysOptions().map((day) => day.value);
    const currentDays = this.formModel.repeatDays || [];
    return availableDays.length > 0 && availableDays.every((day) => currentDays.includes(day));
  };

  selectAllDays = (isChecked: boolean): void => {
    if (isChecked) {
      this.formModel.repeatDays = [...this.repeatedDaysOptions().map((day) => day.value)];
    } else {
      this.formModel.repeatDays = [];
    }
  };

  handleFormErrors = (errorList: ValidationError[]): void => {
    const shouldValidateTimes = this.formModel.customTimes && !!this.formModel.sessionType;

    const filtered = shouldValidateTimes
      ? errorList
      : errorList?.filter(
          (e) =>
            ![
              VALIDATION.startTime,
              VALIDATION.endTime,
              VALIDATION.endTimeAfterStartTime,
              this.startTimeErrorMessages.find((err) => err.rule === 'timeRange')?.message,
              this.endTimeErrorMessages.find((err) => err.rule === 'timeRange')?.message
            ].includes(e.message)
        );

    this.errors.emit(filtered);
  };

  handleSubmitForm({
    sessionType,
    duration,
    panelType,
    repeatDays,
    repeatDay,
    index,
    courtroomId,
    allDaySplit = false,
    maxDurationForAfternoon,
    maxDurationForMorning,
    sessionStartTime,
    sessionEndTime,
    isOverbookingAllowed,
    courtroomAssignment
  }: AddSessionFormValues): void {
    const courtroom = this.courtCentre().courtrooms.find(
      (courtroom) => courtroom.id === courtroomId
    );

    this.submitForm.emit({
      sessionType,
      duration,
      allDaySplit,
      maxDurationForAfternoon,
      maxDurationForMorning,
      ...(!this.isCrownCourt() && { panelType }),
      repeatDays: repeatDay ? [repeatDay] : repeatDays,
      courtroom,
      businessType: this.businessType(),
      sessionStartTime,
      sessionEndTime,
      ...(isOverbookingAllowed && { isOverbookingAllowed }),
      ...(courtroomAssignment && { courtroomAssignment }),
      ...(index && { index: Number(index) }),
      ...(repeatDay && { repeatDay })
    });
  }
}
