import { Component, input, output } from '@angular/core';
import {
  PdkButton,
  PdkButtonComponent,
  PdkForm,
  PdkGrid,
  PdkMarginDirective,
  PdkRadio,
  PdkTypographyDirective,
  SelectOption,
  ValidationError
} from '@cpp/pdk';
import { NgPlural, NgPluralCase } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RemoveSessionsFormValues {
  removeConfirmation: boolean;
}

@Component({
  selector: 'remove-sessions-form',
  template: `
    @if (sessionsToRemoveTotal() > 0) {
      <h2
        pdk-typography="heading-medium"
        pdk-margin-vertical="4"
        [ngPlural]="sessionsToRemoveTotal()"
      >
        Are you sure you want to remove
        <ng-template ngPluralCase="=1"> this session</ng-template>
        <ng-template ngPluralCase="other"> these sessions</ng-template>
        ?
      </h2>
      <form
        #form="ngForm"
        data-test-id="removeSessionsForm"
        pdk-form
        novalidate
        (errors)="errors.emit($event)"
        (validSubmit)="handleSubmitForm(form.value)"
      >
        <pdk-form-field
          label="Select an option"
          labelType="small"
          [errorMessages]="[
            {
              rule: 'required',
              message: 'Enter confirmation'
            }
          ]"
        >
          <pdk-radio-group
            ngModel
            name="removeConfirmation"
            [options]="removeConfirmationOptions"
            required
            data-test-id="removeConfirmation"
          >
          </pdk-radio-group>
        </pdk-form-field>
        <div class="actions">
          <pdk-form-group>
            <button
              type="submit"
              data-test-id="remove-sessions-button"
              pdk-button
              pdk-margin-bottom="0"
            >
              Continue
            </button>
          </pdk-form-group>
        </div>
      </form>
    } @else {
      <div class="actions">
        <button
          data-test-id="cancel-remove-sessions-button"
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
    NgPlural,
    NgPluralCase,
    PdkButton,
    PdkButtonComponent,
    PdkForm,
    PdkGrid,
    PdkMarginDirective,
    PdkRadio,
    PdkTypographyDirective
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
export class RemoveSessionsFormComponent {
  readonly sessionsToRemoveTotal = input<number>(0);

  readonly submitForm = output<boolean>();
  readonly cancelForm = output<void>();
  readonly errors = output<ValidationError[] | null>();

  removeConfirmationOptions: SelectOption<boolean>[] = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  constructor() {}

  handleSubmitForm(value: RemoveSessionsFormValues): void {
    this.submitForm.emit(value.removeConfirmation);
  }

  handleCancel(): void {
    this.cancelForm.emit();
  }
}
