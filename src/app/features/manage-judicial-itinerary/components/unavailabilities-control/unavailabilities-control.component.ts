import {
  Component,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChildren
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {
  ErrorMessageConfig,
  FormFieldControl,
  PdkDetailsSummary,
  PdkVisuallyHiddenDirective,
  ValidationError,
  PdkPaddingDirective,
  PdkMarginDirective,
  PdkDetailsSummaryComponent
} from '@cpp/pdk';
import { DateRange } from '../../../../shared/components/date-range/date-range.component';
import {
  CamelisedReasons,
  Unavailability,
  UnavailabilityReason
} from '../../model/unavailability.interface';
import { UnavailabilityReasonFormatPipe } from '../../pipes/unavailability-reason-format.pipe';
import { CamelisedReasonPipe } from '../../pipes/camelised-reason.pipe';
import { UnavailabilityDatesInputComponent } from '../unavailability-dates-input/unavailability-dates-input.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { UnavailabilityDaysCountPipe } from '../../pipes/unavailability-days-count.pipe';
import { OverlappingDatesError, validateUnavailabilityOverlaps } from './unavailabilities.utils';

type UnavailabilityFormGroup = Record<CamelisedReasons, FormControl<Unavailability[] | null>>;
type UnavailabilityFormGroupValues = Record<CamelisedReasons, Unavailability[] | null>;

const DEFAULT_ERROR_MESSAGES: ErrorMessageConfig[] = [
  {
    rule: 'notInRange',
    message: (error: DateRange) => {
      const { startDate, endDate } = error;
      if (!startDate || !endDate || startDate === endDate) {
        return `Non-sitting days must be within the sitting days start and end dates`;
      }
      return `Non-sitting days must be within the sitting days start and end dates: ${startDate} to ${endDate}`;
    }
  },
  {
    rule: 'overlappingDates',
    message: (error: OverlappingDatesError) => {
      const { firstReason, secondReason } = error;
      return `Non-sitting days cannot overlap. ${firstReason} and ${secondReason} periods overlap each other`;
    }
  }
];
@Component({
  selector: 'unavailabilities-control',
  templateUrl: './unavailabilities-control.component.html',
  providers: [
    CamelisedReasonPipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnavailabilitiesControlComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: UnavailabilitiesControlComponent,
      multi: true
    },
    {
      provide: FormFieldControl,
      useExisting: UnavailabilitiesControlComponent
    }
  ],
  imports: [
    ReactiveFormsModule,
    PdkDetailsSummary,
    PdkVisuallyHiddenDirective,
    UnavailabilityReasonFormatPipe,
    CamelisedReasonPipe,
    UnavailabilityDatesInputComponent,
    UnavailabilityDaysCountPipe,
    PdkPaddingDirective,
    PdkMarginDirective
  ]
})
export class UnavailabilitiesControlComponent
  implements ControlValueAccessor, FormFieldControl, Validator
{
  id: string;
  ariaDescribedBy: string;
  readonly errorMessages: ErrorMessageConfig[] = DEFAULT_ERROR_MESSAGES;
  readonly controlType = 'unavailabilities-control';
  readonly multi = true;
  readonly reasonEntries = Object.values(UnavailabilityReason);
  readonly availabilityDateRange = input<DateRange>({} as DateRange);
  readonly value = signal<Unavailability[]>([]);
  readonly errors = output<ValidationError[] | null>();
  readonly injector = inject(Injector);
  readonly camelisedReasonPipe = inject(CamelisedReasonPipe);
  readonly reasonSummaries = viewChildren<PdkDetailsSummaryComponent, ElementRef<HTMLElement>>(
    'reasonSummary',
    { read: ElementRef }
  );
  readonly controlRef = signal<ElementRef<HTMLElement> | null>(null);
  get ngControl() {
    return this.injector.get(NgControl);
  }
  readonly formGroup = new FormGroup<UnavailabilityFormGroup>(
    this.reasonEntries.reduce((acc, reason) => {
      const camelisedReason = this.camelisedReasonPipe.transform(reason);
      return {
        ...acc,
        [camelisedReason]: new FormControl<Unavailability[] | null>([])
      };
    }, {} as UnavailabilityFormGroup)
  );

  readonly formGroupChanges = toSignal(this.formGroup.valueChanges);
  #onChange: (value: Unavailability[] | null) => void = () => {};
  constructor() {
    effect(() => {
      const formGroupValues = this.formGroupChanges();
      const value = Object.values(formGroupValues || {}).flat();
      this.#onChange(value);
      this.value.set(value ?? []);
    });
  }
  validate(control: AbstractControl<Unavailability[]>): ValidationErrors | null {
    if (!control.value || control.value.length === 0) {
      return null;
    }

    const result = validateUnavailabilityOverlaps(control.value);

    if (result !== null) {
      this.#setControlRef(result.overlappingDates.firstReason);
    } else {
      this.#setControlRef();
    }
    return result;
  }
  registerOnChange(fn: (value: Unavailability[] | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {}

  writeValue(unavailabilities: Unavailability[] = []): void {
    this.value.set(unavailabilities ?? []);
    if (!unavailabilities || unavailabilities.length === 0) {
      this.formGroup.patchValue({
        annualLeave: [],
        officialBusiness: [],
        sickLeave: [],
        training: []
      });
      return;
    }
    this.#patchFormGroup(unavailabilities);
  }

  #patchFormGroup(value: Unavailability[]): void {
    this.formGroup.patchValue(
      value.reduce((unavailabilities, unavailability) => {
        const camelisedReason = this.camelisedReasonPipe.transform(unavailability.reason);
        return {
          ...unavailabilities,
          [camelisedReason]: [...(unavailabilities[camelisedReason] || []), unavailability]
        };
      }, {} as UnavailabilityFormGroupValues)
    );
  }

  #setControlRef(reason?: string): void {
    const reasonSummaries = this.reasonSummaries();
    if (reason && reasonSummaries?.length > 0) {
      const firstErrorControlRef = reasonSummaries.find(({ nativeElement }) =>
        nativeElement.textContent.includes(reason)
      );
      this.controlRef.set(firstErrorControlRef ?? reasonSummaries.at(0));
    } else {
      this.controlRef.set(reasonSummaries?.at(0));
    }
  }
}
