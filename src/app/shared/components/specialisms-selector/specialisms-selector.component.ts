import { Component, computed, effect, forwardRef, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {
  coerceBooleanProperty,
  PdkCheckBox,
  PdkFormFieldComponent,
  PdkMinCountValidatorDirective
} from '@cpp/pdk';

import { SpecialismFormatPipe } from '../../../features/manage-judicial-itinerary/pipes/specialism-format.pipe';
import { Specialism } from '@cpp/reference-data';

@Component({
  selector: 'specialisms-selector',
  templateUrl: './specialisms-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpecialismsSelectorComponent),
      multi: true
    }
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PdkFormFieldComponent,
    PdkCheckBox,
    PdkMinCountValidatorDirective,
    SpecialismFormatPipe
  ]
})
export class SpecialismsSelectorComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly labelType = input<'small' | 'none'>('small');
  readonly required = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });
  readonly minCount = input<number | undefined>(undefined);
  readonly filterOptionsBy = input<(specialism: Specialism) => boolean>(
    (specialism: Specialism) => true
  );

  readonly formControl = new FormControl<Specialism[]>([]);
  readonly formControlChanges = toSignal(this.formControl.valueChanges);

  readonly allSpecialisms = Object.values(Specialism);

  readonly availableSpecialisms = computed(() => {
    const filterFn = this.filterOptionsBy();
    return this.allSpecialisms.filter(filterFn);
  });

  readonly errorMessages = computed(() => {
    const messages: Array<{ rule: string; message: string }> = [];

    if (this.required()) {
      messages.push({
        rule: 'required',
        message: 'Select at least one specialism'
      });
    }

    if (this.minCount() !== undefined) {
      messages.push({
        rule: 'minCount',
        message: 'Select at least one specialism to add.'
      });
    }

    return messages;
  });

  #onChanges = (_: Specialism[] | null) => {};

  constructor() {
    effect(() => {
      const selected = this.formControlChanges();
      this.#onChanges(selected ?? null);
    });
  }

  writeValue(value: Specialism[] | null): void {
    this.formControl.setValue(value || []);
  }

  registerOnChange(fn: (value: Specialism[] | null) => void): void {
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
