import { Component, computed, DestroyRef, effect, forwardRef, inject, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import { formatDate, getInsetLabel, inValidFormat } from '../../utils/date-utils';
import {
  PdkFormFieldComponent,
  PdkDateInputComponent,
  PdkWeekDateValidatorDirective,
  coerceBooleanProperty,
  PdkGrid,
  PdkPaddingDirective,
  PdkMinDateValidatorDirective,
  PdkMaxDateValidatorDirective,
  PdkInsetTextComponent,
  PdkFieldsetLegendDirective,
  PdkFieldsetComponent,
  PdkVisuallyHiddenDirective,
  ErrorMessageConfig,
  PdkMarginDirective
} from '@cpp/pdk';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}
export type DateRangeFormGroup = {
  [K in keyof DateRange]: FormControl<DateRange[K]>;
};
const DEFAULT_START_DATE_ERROR_MESSAGES: ErrorMessageConfig[] = [
  {
    rule: 'required',
    message: 'Enter a start date'
  }
];
const DEFAULT_END_DATE_ERROR_MESSAGES: ErrorMessageConfig[] = [
  {
    rule: 'required',
    message: 'Enter an end date'
  }
];
@Component({
  host: {
    '[style.width.%]': '100',
    '[style.display]': "'block'",
    '[style.box-sizing]': "'border-box'"
  },
  selector: 'date-range',
  templateUrl: './date-range.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangeComponent),
      multi: true
    }
  ],
  imports: [
    PdkGrid,
    PdkFormFieldComponent,
    PdkDateInputComponent,
    PdkWeekDateValidatorDirective,
    ReactiveFormsModule,
    PdkPaddingDirective,
    PdkMinDateValidatorDirective,
    PdkMaxDateValidatorDirective,
    PdkInsetTextComponent,
    PdkFieldsetComponent,
    PdkFieldsetLegendDirective,
    PdkVisuallyHiddenDirective,
    PdkMarginDirective
  ]
})
export class DateRangeComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly serverError = input<ValidationErrors | null>(null);
  readonly minEndDate = input<string>();
  readonly maxEndDate = input<string>();
  readonly getMinEndDate = input<(startDate: string) => string | null>(() => null);
  readonly getMaxEndDate = input<(startDate: string) => string | null>(() => null);
  readonly startDateErrorMessages = input([], {
    transform: (value: ErrorMessageConfig[]) => {
      return [...DEFAULT_START_DATE_ERROR_MESSAGES, ...value];
    }
  });

  readonly endDateErrorMessages = input([], {
    transform: (value: ErrorMessageConfig[]) => {
      return [...DEFAULT_END_DATE_ERROR_MESSAGES, ...value];
    }
  });
  readonly minStartDate = input(undefined, {
    transform: (value: Date | string) => {
      if (typeof value === 'string' || value === null || value === undefined) {
        return value;
      }
      return formatDate(value);
    }
  });
  readonly maxStartDate = input(undefined, {
    transform: (value: Date | string) => {
      if (typeof value === 'string' || value === null || value === undefined) {
        return value;
      }
      return formatDate(value);
    }
  });

  readonly disableWeekend = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });

  readonly requiredStartDate = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });

  readonly requiredEndDate = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });

  readonly onStartDateChange = input<
    (startDate: string, endateControl?: FormControl<string | null>) => void
  >(() => {});

  readonly onEndDateChange = input<
    (endDate: string, startDateControl?: FormControl<string | null>) => void
  >(() => {});

  readonly formGroup = new FormGroup<DateRangeFormGroup>({
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null)
  });

  readonly startDateChanges = toSignal(this.formGroup.controls.startDate.valueChanges);

  readonly endDateChanges = toSignal(this.formGroup.controls.endDate.valueChanges);

  readonly computedMinEndDate = computed(() => {
    const startDate = this.startDateChanges();
    return this.minEndDate() ?? this.getMinEndDate()(startDate);
  });

  readonly computedMaxEndDate = computed(() => {
    const startDate = this.startDateChanges();
    return this.maxEndDate() ?? this.getMaxEndDate()(startDate);
  });

  readonly startDateLabel = computed(() => {
    const date = this.startDateChanges();
    return inValidFormat(date) ? getInsetLabel(new Date(date)) : null;
  });

  readonly endDateLabel = computed(() => {
    const date = this.endDateChanges();
    return inValidFormat(date) ? getInsetLabel(new Date(date)) : null;
  });

  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const startDate = this.startDateChanges();
      this.onStartDateChange()(startDate, this.formGroup.controls.endDate);
    });

    effect(() => {
      const endDate = this.endDateChanges();
      this.onEndDateChange()(endDate, this.formGroup.controls.startDate);
    });
  }

  writeValue(value: DateRange): void {
    this.formGroup.patchValue(value);
  }

  registerOnChange(fn: (_: Partial<DateRange>) => void): void {
    this.formGroup.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {}
}
