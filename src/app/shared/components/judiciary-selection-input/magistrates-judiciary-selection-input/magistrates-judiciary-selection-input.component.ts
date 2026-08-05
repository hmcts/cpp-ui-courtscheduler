import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JudiciaryAutosuggestControlComponent } from '../../judiciary-autosuggest-control/judiciary-autosuggest-control.component';
import { JudiciaryTypePayload } from '@cpp/reference-data';
import { ExtendedJudicialMember, MagistrateSlotConfig } from '../../../model';
import { PdkMarginDirective } from '@cpp/pdk';

@Component({
  selector: 'magistrates-judiciary-selection-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let config = slotConfig();
    @let magistrateValues = values();
    @for (slot of config; track $index; let last = $last) {
      <div [pdk-margin-bottom]="last ? '0' : '2'">
        <judiciary-autosuggest-control
          [name]="'magistrate-' + $index"
          [label]="slot.label"
          [judiciaryType]="'Magistrate'"
          [suggestions]="activeQueryIndex() === $index ? suggestions() : []"
          [required]="!!slot.required"
          [ngModel]="magistrateValues[$index] ?? null"
          [hideSpecialismsAction]="hideSpecialismsAction()"
          [ngModelOptions]="{ standalone: true }"
          [errorMessagesInput]="
            !!slot.required ? [{ rule: 'required', message: 'Choose a magistrate.' }] : []
          "
          (ngModelChange)="updateMagistrates($index, $event)"
          (onAddSpecialism)="onAddSpecialism.emit($event)"
          (inputText)="querySuggestions($event, $index)"
          [attr.data-test-id]="'magistrate-slot-' + $index"
        />
      </div>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MagistratesJudiciarySelectionInputComponent),
      multi: true
    }
  ],
  imports: [FormsModule, JudiciaryAutosuggestControlComponent, PdkMarginDirective]
})
export class MagistratesJudiciarySelectionInputComponent implements ControlValueAccessor {
  readonly slotConfig = input<MagistrateSlotConfig[]>([{ label: 'Name', required: true }]);
  readonly suggestions = input<ExtendedJudicialMember[]>([]);
  readonly hideSpecialismsAction = input<boolean>(false);

  readonly onAddSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  readonly values = signal<(ExtendedJudicialMember | null)[]>([]);
  readonly activeQueryIndex = signal<number>(0);

  #onChange: (value: ExtendedJudicialMember | ExtendedJudicialMember[] | null) => void = () => {};

  updateMagistrates(index: number, judiciary: ExtendedJudicialMember | null): void {
    this.values.update((prev = []) => {
      const next = [...prev];
      next[index] = judiciary;
      return next;
    });
    const magistrates = this.values().filter((m): m is ExtendedJudicialMember => m != null);
    this.#onChange(magistrates.length === 0 ? null : magistrates);
  }

  writeValue(value: ExtendedJudicialMember[] | null): void {
    if (value && value.length >= 2) {
      value.sort(
        (m1, m2) => (m2.isBenchChairman === true ? 1 : 0) - (m1.isBenchChairman === true ? 1 : 0)
      );
    }
    this.values.set(value ?? []);
  }

  registerOnChange(
    fn: (value: ExtendedJudicialMember | ExtendedJudicialMember[] | null) => void
  ): void {
    this.#onChange = fn;
  }

  registerOnTouched(_fn: () => void): void {}

  querySuggestions(
    { type, searchText }: { type: JudiciaryTypePayload; searchText: string },
    index: number
  ) {
    this.activeQueryIndex.set(index);
    this.inputText.emit({ type, searchText });
  }
}
