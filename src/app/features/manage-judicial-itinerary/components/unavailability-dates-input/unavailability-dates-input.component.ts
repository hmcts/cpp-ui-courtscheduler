import { Component, computed, forwardRef, input, output, signal, viewChild } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { Unavailability, UnavailabilityReason } from '../../model/unavailability.interface';
import {
  DateRange,
  DateRangeComponent
} from '../../../../shared/components/date-range/date-range.component';
import {
  PdkButton,
  PdkForm,
  PdkGrid,
  PdkMarginDirective,
  ValidationError,
  PdkBadge,
  PdkTextColorDirective,
  PdkLinkDirective,
  PdkPaddingDirective,
  PdkSummaryList,
  PdkVisuallyHiddenDirective
} from '@cpp/pdk';
import { UnavailabilityReasonFormatPipe } from '../../pipes/unavailability-reason-format.pipe';
import { DateRangeFormatPipe } from '../../pipes/date-range-format.pipe';
import { formatDate, normalizeDate } from '../../../../shared/utils/date-utils';
import { LowerCasePipe } from '@angular/common';
import { addUnavailabilityEntry } from '../unavailabilities-control/unavailabilities.utils';

@Component({
  selector: 'unavailability-dates-input',
  templateUrl: './unavailability-dates-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnavailabilityDatesInputComponent),
      multi: true
    }
  ],
  imports: [
    ReactiveFormsModule,
    PdkForm,
    DateRangeComponent,
    PdkButton,
    PdkGrid,
    UnavailabilityReasonFormatPipe,
    DateRangeFormatPipe,
    PdkMarginDirective,
    LowerCasePipe,
    PdkBadge,
    PdkTextColorDirective,
    PdkLinkDirective,
    PdkPaddingDirective,
    PdkSummaryList,
    PdkVisuallyHiddenDirective
  ]
})
export class UnavailabilityDatesInputComponent implements ControlValueAccessor {
  readonly minStartDate = input<string>(null);
  readonly maxEndDate = input<string>(null);
  readonly reason = input<UnavailabilityReason>();
  readonly errors = output<ValidationError[] | null>();
  readonly unavailabilitiesForReason = signal<Unavailability[]>([]);
  readonly formGroup = new FormGroup<{ unavailability: FormControl<DateRange> }>({
    unavailability: new FormControl<DateRange>({} as DateRange)
  });
  readonly formDirective = viewChild.required<FormGroupDirective>(FormGroupDirective);
  readonly startDateErrorMessages = computed(() => [
    {
      rule: 'minDate',
      message: `Start date must be on or after ${formatDate(new Date(this.minStartDate()), 'dd MMMM yyyy')}`
    },
    {
      rule: 'weekDate',
      message: 'Start date must be a weekday (Monday to Friday)'
    },
    {
      rule: 'maxDate',
      message: `Start date must be on or before ${formatDate(new Date(this.maxEndDate()), 'dd MMMM yyyy')}`
    }
  ]);
  readonly endDateErrorMessages = computed(() => [
    {
      rule: 'minDate',
      message: `End date must be on or after provided start date`
    },
    {
      rule: 'weekDate',
      message: 'End date must be a weekday (Monday to Friday)'
    },
    {
      rule: 'maxDate',
      message: `End date must be on or before ${formatDate(new Date(this.maxEndDate()), 'dd MMMM yyyy')}`
    }
  ]);
  #onChange: (value: Unavailability[] | null) => void = () => {};

  getMinEndDate = (startDate: string | null): string | null => {
    if (!startDate) {
      return this.minStartDate();
    }
    const minDate = normalizeDate(new Date(startDate));
    return formatDate(minDate);
  };

  writeValue(unavailabilities: Unavailability[] | null): void {
    this.unavailabilitiesForReason.set(unavailabilities ?? []);
  }

  registerOnChange(fn: (value: Unavailability[] | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {}

  handleSubmit(value: DateRange): void {
    const newEntry: Unavailability = {
      startDate: value.startDate!,
      endDate: value.endDate ?? value.startDate!,
      reason: this.reason()!
    };

    this.unavailabilitiesForReason.update((unavailabilities) =>
      addUnavailabilityEntry(newEntry, unavailabilities)
    );

    this.#onChange(this.unavailabilitiesForReason());
    this.formGroup.reset(
      { unavailability: { startDate: null, endDate: null } },
      { emitEvent: false }
    );
  }

  removeUnavailability(unavailability: Unavailability): void {
    this.unavailabilitiesForReason.update((unavailabilities) =>
      unavailabilities.filter((u) => u !== unavailability)
    );
    this.#onChange(this.unavailabilitiesForReason());
  }
}
