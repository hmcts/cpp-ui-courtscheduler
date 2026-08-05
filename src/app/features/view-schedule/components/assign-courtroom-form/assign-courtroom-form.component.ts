import { Component, effect, input, output, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  PdkButton,
  PdkForm,
  PdkFormFieldComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkSelectComponent,
  SelectOption,
  ValidationError
} from '@cpp/pdk';
import { CourtRoom } from '../../../../shared/model/court-centre';

interface AssignCourtroomFormValues {
  courtroomId: string;
}

@Component({
  selector: 'assign-courtroom-form',
  template: `
    @if (sessionsToAssignTotal() > 0) {
      <form
        #form="ngForm"
        data-test-id="assignCourtroomForm"
        pdk-form
        novalidate
        (errors)="errors.emit($event)"
        (validSubmit)="handleSubmitForm(form.value)"
      >
        <pdk-form-field
          label="Select a courtroom"
          labelType="small"
          [errorMessages]="[
            {
              rule: 'required',
              message: 'Select a courtroom'
            }
          ]"
        >
          <pdk-select
            ngModel
            name="courtroomId"
            [options]="courtroomOptions"
            placeholder="Select"
            required
            data-test-id="courtroomSelect"
          >
          </pdk-select>
        </pdk-form-field>
        <div class="actions">
          <pdk-form-group>
            <button
              type="submit"
              data-test-id="assign-courtroom-button"
              pdk-button
              pdk-margin-bottom="0"
            >
              Assign courtroom
            </button>
          </pdk-form-group>
        </div>
      </form>
    } @else {
      <div class="actions">
        <button
          data-test-id="cancel-assign-courtroom-button"
          pdk-button
          pdk-margin-bottom="0"
          (click)="handleCancel()"
        >
          Continue
        </button>
      </div>
    }
  `,
  imports: [
    FormsModule,
    PdkButton,
    PdkForm,
    PdkFormFieldComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkSelectComponent
  ],
  styles: [
    `
      .actions {
        display: flex;
        align-items: center;
      }
    `
  ]
})
export class AssignCourtroomFormComponent {
  readonly sessionsToAssignTotal = input<number>(0);
  readonly courtrooms = input<CourtRoom[]>([]);

  readonly submitForm = output<string>();
  readonly cancelForm = output<void>();
  readonly errors = output<ValidationError[] | null>();

  readonly form = viewChild<NgForm>('form');

  courtroomOptions: SelectOption<string>[] = [];

  constructor() {
    effect(() => {
      const courtrooms = this.courtrooms();
      this.courtroomOptions = courtrooms
        .map((courtroom) => ({
          value: courtroom?.id || '',
          label: courtroom?.name || ''
        }))
        .filter((option) => option.value && option.label);
    });
  }

  handleSubmitForm(value: AssignCourtroomFormValues): void {
    this.submitForm.emit(value.courtroomId);
  }

  handleCancel(): void {
    this.cancelForm.emit();
  }
}
