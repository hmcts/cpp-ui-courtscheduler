import { Directive, effect, forwardRef, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { DateRange } from '../components/date-range/date-range.component';
import { formatDate } from '../utils/date-utils';

interface DateRangeItem {
  startDate: string;
  endDate: string;
}

@Directive({
  selector: '[inDateRange]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InDateRangeValidator),
      multi: true
    }
  ]
})
export class InDateRangeValidator implements Validator {
  readonly dateRange = input.required<DateRange>({ alias: 'inDateRange' });
  #onValidatorChange: () => void = () => {};

  constructor() {
    effect(() => {
      if (this.dateRange()) {
        this.#onValidatorChange();
      }
    });
  }

  validate(
    control: AbstractControl<DateRangeItem> | AbstractControl<DateRangeItem[]>
  ): ValidationErrors | null {
    const { startDate: rangeStart, endDate: rangeEnd } = this.dateRange();
    const value = Array.isArray(control.value) ? control.value : [control.value];
    if (!value || value.length === 0) {
      return null;
    }

    if (!formatDate(new Date(rangeStart)) || !formatDate(new Date(rangeEnd))) {
      return {
        notInRange: {
          startDate: rangeStart,
          endDate: rangeEnd
        }
      };
    }

    for (const item of value) {
      const { startDate: itemStart, endDate: itemEnd } = item;
      if (
        new Date(itemStart) < new Date(rangeStart) ||
        new Date(itemStart) > new Date(rangeEnd) ||
        new Date(itemEnd) < new Date(rangeStart) ||
        new Date(itemEnd) > new Date(rangeEnd)
      ) {
        return {
          notInRange: {
            startDate: formatDate(new Date(rangeStart), 'dd MMMM yyyy'),
            endDate: formatDate(new Date(rangeEnd), 'dd MMMM yyyy')
          }
        };
      }
    }

    return null;
  }
  registerOnValidatorChange(fn: () => void): void {
    this.#onValidatorChange = fn;
  }
}
