import { Component, computed, effect, forwardRef, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { coerceBooleanProperty, PdkCheckBox, PdkFormFieldComponent } from '@cpp/pdk';
import { DayOfWeek } from '../../model/days';

const ALL_WEEKDAYS: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday
];

@Component({
  selector: 'days-of-week-selector',
  templateUrl: './days-of-week-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DaysOfWeekSelectorComponent),
      multi: true
    }
  ],
  imports: [ReactiveFormsModule, FormsModule, PdkFormFieldComponent, PdkCheckBox]
})
export class DaysOfWeekSelectorComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly labelType = input<'small' | 'none'>('small');
  readonly required = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });
  readonly formControl = new FormControl<DayOfWeek[]>([]);
  readonly formControlChanges = toSignal(this.formControl.valueChanges);

  readonly weekdayOptions = [
    { label: 'Monday', value: DayOfWeek.Monday },
    { label: 'Tuesday', value: DayOfWeek.Tuesday },
    { label: 'Wednesday', value: DayOfWeek.Wednesday },
    { label: 'Thursday', value: DayOfWeek.Thursday },
    { label: 'Friday', value: DayOfWeek.Friday }
  ];

  readonly isAllSelected = computed(() => {
    const selected = this.formControlChanges() ?? [];
    return (
      selected.length === ALL_WEEKDAYS.length && ALL_WEEKDAYS.every((day) => selected.includes(day))
    );
  });

  #onChanges = (_: DayOfWeek[] | null) => {};

  constructor() {
    effect(() => {
      const selected = this.formControlChanges();
      this.#onChanges(selected ?? []);
    });
  }

  handleSelectAllChange(isChecked: boolean): void {
    if (isChecked) {
      this.formControl.setValue(ALL_WEEKDAYS);
    } else {
      this.formControl.setValue([]);
    }
  }

  writeValue(value: DayOfWeek[] | null): void {
    this.formControl.setValue(value || []);
  }

  registerOnChange(fn: (value: DayOfWeek[] | null) => void): void {
    this.#onChanges = fn;
  }

  registerOnTouched(_fn: () => void): void {}

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }
}
