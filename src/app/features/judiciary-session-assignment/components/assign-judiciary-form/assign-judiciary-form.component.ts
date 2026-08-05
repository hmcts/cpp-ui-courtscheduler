import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkForm,
  PdkFormGroupComponent,
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  ValidationError
} from '@cpp/pdk';
import { JudiciaryTypePayload, ReferenceDataService } from '@cpp/reference-data';
import {
  JudiciarySelectionSuggestion,
  JudiciarySelectionValue,
  MagistrateSlotConfig
} from '../../../../shared';
import {
  judgeRecorderConflictErrorMessages,
  judgeRecorderConflictValidator
} from './assign-judiciary-form.validator';
import { JudiciarySelectionInputComponent } from '../../../../shared/components/judiciary-selection-input/judiciary-selection-input.component';

export interface AssignJudiciaryFormInitialValues {
  judiciarySelection: JudiciarySelectionValue | null;
  selectedJudiciaryTypes: (keyof JudiciarySelectionValue)[];
}

@Component({
  selector: 'assign-judiciary-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      #form="ngForm"
      data-test-id="assign-judiciary-form"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="submitForm.emit(form.value.judiciarySelection)"
    >
      <judiciary-selection-input
        name="judiciarySelection"
        [multi]="true"
        [required]="true"
        [ngModel]="initialValues()?.judiciarySelection ?? null"
        [selectedJudiciaryTypes]="initialValues()?.selectedJudiciaryTypes ?? []"
        [suggestions]="suggestionsResource()"
        [magistrateConfig]="magistrateSlotConfig()"
        [hideSpecialismsAction]="true"
        [judiciaryTypesValidatorFactory]="judiciaryTypesValidatorFactory"
        [errorMessages]="judgeRecorderErrorMessages"
        (inputText)="onQueryJudiciaries.emit($event)"
        data-test-id="judiciary-selection-input"
      />

      <pdk-form-group pdk-margin-top="4">
        <button
          type="submit"
          pdk-button
          data-test-id="save-and-continue-button"
          pdk-margin-bottom="4"
        >
          Save and continue
        </button>
        <div>
          <a pdk-link (click)="cancel.emit()" href="javascript:void(0);">Cancel</a>
        </div>
      </pdk-form-group>
    </form>
  `,
  imports: [
    FormsModule,
    PdkButton,
    PdkForm,
    PdkFormGroupComponent,
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    JudiciarySelectionInputComponent
  ]
})
export class AssignJudiciaryFormComponent {
  readonly referenceDataService = inject(ReferenceDataService);
  readonly initialValues = input<AssignJudiciaryFormInitialValues | null>(null);
  readonly suggestionsResource = input<JudiciarySelectionSuggestion>();
  readonly submitForm = output<JudiciarySelectionValue>();
  readonly cancel = output<void>();
  readonly errors = output<ValidationError[] | null>();
  readonly onQueryJudiciaries = output<{ type: JudiciaryTypePayload | null; searchText: string }>();

  readonly magistrateSlotConfig = input<MagistrateSlotConfig[]>([
    { label: 'Magistrate 1', required: true },
    { label: 'Magistrate 2', required: false }
  ]);

  readonly judgeRecorderErrorMessages = judgeRecorderConflictErrorMessages;
  readonly judiciaryTypesValidatorFactory = judgeRecorderConflictValidator;
}
