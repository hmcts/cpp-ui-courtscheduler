import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  PdkButton,
  PdkForm,
  PdkFormFieldComponent,
  PdkFormGroupComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkRadioGroupComponent,
  SelectOption,
  ValidationError
} from '@cpp/pdk';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'remove-judiciary-itinerary-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './remove-judiciary-itinerary-form.component.html',
  styles: [
    `
      .actions {
        display: flex;
        align-items: center;
      }
    `
  ],
  imports: [
    FormsModule,
    PdkButton,
    PdkForm,
    PdkFormFieldComponent,
    PdkFormGroupComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkRadioGroupComponent
  ]
})
export class RemoveJudiciaryItineraryFormComponent {
  readonly submitForm = output<boolean>();
  readonly errors = output<ValidationError[] | null>();

  readonly removeConfirmationOptions: SelectOption<boolean>[] = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  handleSubmitForm(formValue: { removeConfirmation: boolean }): void {
    this.submitForm.emit(formValue.removeConfirmation);
  }
}
