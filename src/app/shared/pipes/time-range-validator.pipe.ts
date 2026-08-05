import { Directive, effect, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[timeRangeValidator]',
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
  readonly startTime = input<string | undefined>();

  private control: AbstractControl | null = null;

  constructor() {
    effect(() => {
      this.range();
      this.startTime();

      if (this.control) {
        this.control.updateValueAndValidity();
      }
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.control = control;
    return this.validateTime(control.value);
  }

  private validateTime(value: string | null): ValidationErrors | null {
    if (!value) return null;

    const inputTime = this.parseTime(value);
    const minTime = this.parseTime(this.range().min);
    const maxTime = this.parseTime(this.range().max);
    const isTimeInvalid = inputTime < minTime || inputTime > maxTime;

    if (inputTime === null || minTime === null || maxTime === null) {
      return { timeRange: true };
    }

    const startTime = this.startTime();
    if (startTime) {
      const start = this.parseTime(startTime);
      if (inputTime <= start) {
        return { endTimeAfterStartTime: true };
      }
    }

    return isTimeInvalid ? { timeRange: true } : null;
  }

  private parseTime(time: string): number | null {
    const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10));
    const isNotValidTime = hours < 0 || hours > 23 || minutes < 0 || minutes > 59;

    return isNotValidTime ? null : hours * 60 + minutes;
  }
}
