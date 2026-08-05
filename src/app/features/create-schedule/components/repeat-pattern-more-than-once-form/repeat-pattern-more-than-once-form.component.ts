import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkDatePicker,
  PdkForm,
  PdkGrid,
  PdkInsetTextComponent,
  PdkInput,
  PdkMarginDirective,
  PdkSelectComponent,
  PdkTextInput,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { INTERVAL_OPTIONS } from '../../../../shared/utils/repeat-pattern.config';
import * as dateUtils from '../../../../shared/utils/date-utils';
import { FrequencyType, FrequencyTypeUnion, RepeatPattern } from '../../model/repeat-pattern';

interface MoreThanOnceFormValues {
  startDate: Date;
  endDate: Date;
  repeatFor: number;
  frequency: FrequencyTypeUnion;
}

@Component({
  selector: 'repeat-pattern-more-than-once-form',
  templateUrl: './repeat-pattern-more-than-once-form.component.html',
  styles: [
    `
      .inputs-row {
        display: flex;
      }

      .weeks-input-wrapper ::ng-deep select {
        min-width: fit-content;
      }

      .interval ::ng-deep label {
        position: absolute;
        clip-path: inset(50%);
      }
    `
  ],
  imports: [
    FormsModule,
    PdkButton,
    PdkDatePicker,
    PdkForm,
    PdkGrid,
    PdkInsetTextComponent,
    PdkInput,
    PdkMarginDirective,
    PdkSelectComponent,
    PdkTextInput,
    PdkTypographyDirective
  ]
})
export class RepeatPatternMoreThanOnceFormComponent {
  readonly FrequencyType = FrequencyType;

  readonly initialValues = input<RepeatPattern | null>();

  readonly submitForm = output<RepeatPattern>();
  readonly errors = output<ValidationError[] | null>();

  readonly minStartDate = new Date();

  readonly frequency = linkedSignal({
    source: () => this.initialValues(),
    computation: (initialValues) => this.getFrequency(initialValues?.frequency)
  });

  readonly repeatFor = linkedSignal({
    source: () => this.initialValues(),
    computation: (initialValues) => initialValues?.repeatFor ?? 1
  });

  readonly startDate = linkedSignal({
    source: () => this.initialValues(),
    computation: (initialValues) => dateUtils.parseStringToDate(initialValues?.startDate)
  });

  readonly minEndDate = linkedSignal({
    source: () => {
      const startDate = this.startDate();
      const repeatFor = this.repeatFor();
      const frequency = this.frequency();
      return { startDate, repeatFor, frequency };
    },
    computation: ({ startDate, repeatFor, frequency }) => {
      if (!startDate || !repeatFor) return null;
      return this.calculateEndDate(startDate, repeatFor, frequency);
    }
  });

  readonly endDate = linkedSignal({
    source: () => ({
      startDate: this.startDate(),
      repeatFor: this.repeatFor(),
      frequency: this.frequency(),
      initialValues: this.initialValues()
    }),
    computation: (
      { startDate, repeatFor, frequency, initialValues },
      previous: { value: Date | null }
    ) => {
      if (initialValues?.endDate && !previous)
        return dateUtils.parseStringToDate(initialValues.endDate);
      if (!startDate || !repeatFor) return null;
      return this.calculateEndDate(startDate, repeatFor, frequency);
    }
  });

  readonly startDateLabel = computed(() => {
    const date = this.startDate();
    return date ? dateUtils.getInsetLabel(date) : null;
  });

  readonly endDateLabel = computed(() => {
    const date = this.endDate();
    return date ? dateUtils.getInsetLabel(date) : null;
  });

  readonly startDateHintText = computed(() => {
    return this.frequency() === FrequencyType.EVERY_MONTH
      ? 'Start date must be the 1st of the current or a future month'
      : 'Start date will be from next Monday';
  });

  readonly intervalOptions = INTERVAL_OPTIONS;

  getMaxRepeatFor(): number {
    return this.frequency() === FrequencyType.EVERY_WEEK
      ? dateUtils.ONE_YEAR_IN_WEEKS
      : dateUtils.ONE_YEAR_IN_MONTHS;
  }

  getRepeatForErrorMessages() {
    const maxValue = this.getMaxRepeatFor();
    const unit = this.frequency() === FrequencyType.EVERY_WEEK ? 'weeks' : 'months';
    return [
      {
        rule: 'max',
        message: `Enter a number up to ${maxValue} ${unit}`
      }
    ];
  }

  handleRepeatForChange(repeatFor: number) {
    const maxValue = this.getMaxRepeatFor();
    if (repeatFor && repeatFor <= maxValue) {
      this.repeatFor.set(repeatFor < 1 ? 1 : repeatFor);
    }
  }

  handleIntervalChange(frequency: FrequencyType.EVERY_WEEK | FrequencyType.EVERY_MONTH) {
    this.frequency.set(frequency);
    this.repeatFor.set(1);
    this.startDate.set(null);
    this.endDate.set(null);
  }

  handleEndDateChange(endDate: string) {
    this.endDate.set(dateUtils.parseStringToDate(endDate));
  }

  handleStartDateChange(startDate: string) {
    if (startDate) {
      this.startDate.set(dateUtils.parseStringToDate(startDate));
    } else {
      this.startDate.set(null);
      this.endDate.set(null);
    }
  }

  resetForm(): void {
    const initialValues = this.initialValues();

    this.frequency.set(this.getFrequency(initialValues?.frequency));
    this.repeatFor.set(initialValues?.repeatFor ?? 1);
    this.startDate.set(dateUtils.parseStringToDate(initialValues?.startDate));
    this.endDate.set(dateUtils.parseStringToDate(initialValues?.endDate));
  }

  private calculateEndDate(
    startDate: Date,
    repeatFor: number,
    frequency: FrequencyTypeUnion
  ): Date {
    if (frequency === FrequencyType.EVERY_WEEK) {
      return this.calculateWeeklyEndDate(startDate, repeatFor);
    } else {
      return this.calculateMonthlyEndDate(startDate, repeatFor);
    }
  }

  private calculateWeeklyEndDate(startDate: Date, repeatFor: number): Date {
    // -1 is added as business requirement is select the ending week's Sunday
    const weeksCount = repeatFor - (repeatFor === 1 ? 1 : 0);
    const daysToAdd = dateUtils.DAYS_PER_WEEK * weeksCount + dateUtils.DAYS_TO_NEXT_SUNDAY;
    return dateUtils.addDaysToDate(startDate, daysToAdd);
  }

  private calculateMonthlyEndDate(startDate: Date, repeatFor: number): Date {
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const monthsToAdd = repeatFor - (repeatFor === 1 ? 1 : 0);
    const endMonth = month + monthsToAdd;
    const endYear = year + Math.floor(endMonth / 12);
    const adjustedEndMonth = endMonth % 12;
    return new Date(endYear, adjustedEndMonth + 1, 0);
  }

  handleSubmitForm(formValues: MoreThanOnceFormValues) {
    this.submitForm.emit({
      startDate: dateUtils.parseDateToString(formValues.startDate),
      endDate: dateUtils.parseDateToString(formValues.endDate ?? this.endDate()!),
      repeatFor: formValues.repeatFor ?? this.repeatFor(),
      frequency: formValues.frequency
    });
  }

  getStartDateDisabledFunction = (): ((date: Date) => boolean) => {
    return this.frequency() === FrequencyType.EVERY_MONTH
      ? dateUtils.isDateNotFirstOfMonth
      : dateUtils.isDateNotMonday;
  };

  isDateDisabled = (date: Date): boolean => {
    return this.frequency() === FrequencyType.EVERY_MONTH
      ? this.isMonthlyDateDisabled(date)
      : this.isWeeklyDateDisabled(date);
  };

  private isMonthlyDateDisabled(date: Date): boolean {
    const startDate = this.startDate();
    const repeatFor = this.repeatFor();

    if (!startDate || !repeatFor) {
      return true;
    }

    const normalizedDate = dateUtils.normalizeDate(date);
    const normalizedStartDate = dateUtils.normalizeDate(startDate);
    const startYear = normalizedStartDate.getFullYear();
    const startMonth = normalizedStartDate.getMonth();

    const dateYear = normalizedDate.getFullYear();
    const dateMonth = normalizedDate.getMonth();

    // When repeatFor === 1, minMonth should be the same as startMonth (not next month)
    const monthsToAdd = repeatFor - (repeatFor === 1 ? 1 : 0);
    const minMonth = startMonth + monthsToAdd;
    const minYear = startYear + Math.floor(minMonth / 12);
    const adjustedMinMonth = minMonth % 12;
    const minDate = new Date(minYear, adjustedMinMonth, 1);
    const dateMonthStart = new Date(dateYear, dateMonth, 1);

    if (dateMonthStart < minDate) {
      return true;
    }

    // For "Every N months" pattern, only allow months that are multiples of N from start
    // Example: "Every 2 months" from Jan (month 0): valid are months 2, 4, 6... (Mar, May, Jul...)
    // For "Every 1 month": allow all months from start month onwards
    const totalMonthsFromStart = (dateYear - startYear) * 12 + (dateMonth - startMonth);

    if (repeatFor === 1) {
      if (totalMonthsFromStart < 0) {
        return true;
      }
    } else {
      if (totalMonthsFromStart < repeatFor || totalMonthsFromStart % repeatFor !== 0) {
        return true;
      }
    }

    const lastDayOfMonth = new Date(dateYear, dateMonth + 1, 0);
    const normalizedLastDay = dateUtils.normalizeDate(lastDayOfMonth);

    return normalizedDate.getTime() !== normalizedLastDay.getTime();
  }

  private isWeeklyDateDisabled(date: Date): boolean {
    const startDate = this.startDate();
    const repeatFor = this.repeatFor();

    if (!startDate) {
      return true;
    }

    const sundays = dateUtils.getSundaysAfterStartDate(
      dateUtils.parseDateToString(startDate),
      repeatFor
    );

    const normalizedDate = dateUtils.normalizeDate(date);

    const isDateEnabled = sundays.some((sunday) => normalizedDate.getTime() === sunday.getTime());
    return !isDateEnabled;
  }

  private getFrequency(frequency?: FrequencyTypeUnion): FrequencyTypeUnion {
    return frequency === FrequencyType.EVERY_WEEK || frequency === FrequencyType.EVERY_MONTH
      ? frequency
      : FrequencyType.EVERY_WEEK;
  }
}
