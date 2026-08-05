import { Directive, effect, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[timeRange]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: TimeRangeValidatorDirective,
      multi: true
    }
  ]
})
export class TimeRangeValidatorDirective implements Validator {
  readonly range = input.required<{
    min: string;
    max: string;
  }>({ alias: 'timeRange' });
  readonly benchMarkTime = input<string | undefined>();

  #onValidatorChange: () => void = () => {};

  constructor() {
    effect(() => {
      this.range();
      this.benchMarkTime();
      this.#onValidatorChange();
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validateTime(control.value);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.#onValidatorChange = fn;
  }

  private validateTime(value: string | null): ValidationErrors | null {
    if (!value) return null;

    const { min, max } = this.range();
    const inputTime = this.parseTime(value);
    const minTime = this.parseTime(min);
    const maxTime = this.parseTime(max);

    if (inputTime === null || minTime === null || maxTime === null) {
      return { timeRange: { min, max } };
    }

    const benchMarkTime = this.benchMarkTime();
    if (benchMarkTime) {
      const benchmark = this.parseTime(benchMarkTime);
      if (benchmark !== null && inputTime <= benchmark) {
        return { endTimeAfterStartTime: true };
      }
    }
    return inputTime < minTime || inputTime > maxTime ? { timeRange: { min, max } } : null;
  }

  private parseTime(time: string): number | null {
    const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10));
    const isNotValidTime = hours < 0 || hours > 23 || minutes < 0 || minutes > 59;
    return isNotValidTime ? null : hours * 60 + minutes;
  }
}
