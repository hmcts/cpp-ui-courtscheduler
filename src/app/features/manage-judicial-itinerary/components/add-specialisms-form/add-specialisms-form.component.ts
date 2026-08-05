import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkDividerComponent,
  PdkForm,
  PdkFormGroupComponent,
  PdkGrid,
  PdkMarginDirective,
  ValidationError
} from '@cpp/pdk';
import { Specialism } from '../../model/specialism.enum';
import { SpecialismsSelectorComponent } from '../../../../shared/components/specialisms-selector/specialisms-selector.component';

export interface AddSpecialismsFormValues {
  selectedSpecialisms: Specialism[];
}

@Component({
  selector: 'add-specialisms-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      #form="ngForm"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="submitForm.emit(form.value)"
    >
      <pdk-grid container pdk-margin-top="6">
        <pdk-grid two-thirds>
          <specialisms-selector
            name="selectedSpecialisms"
            [ngModel]="initialValues()?.selectedSpecialisms || []"
            label="Select specialism"
            [minCount]="1"
            [filterOptionsBy]="filterOptionsBy"
          ></specialisms-selector>
        </pdk-grid>

        <pdk-grid full>
          <pdk-divider></pdk-divider>
        </pdk-grid>

        <pdk-grid two-thirds>
          <pdk-form-group pdk-margin-top="4">
            <button type="submit" pdk-button data-test-id="continue-button">Continue</button>
          </pdk-form-group>
        </pdk-grid>
      </pdk-grid>
    </form>
  `,
  imports: [
    FormsModule,
    PdkButton,
    PdkDividerComponent,
    PdkForm,
    PdkFormGroupComponent,
    PdkGrid,
    PdkMarginDirective,
    SpecialismsSelectorComponent
  ]
})
export class AddSpecialismsFormComponent {
  readonly existingSpecialisms = input.required<Specialism[]>();
  readonly initialValues = input<AddSpecialismsFormValues | null>(null);
  readonly submitForm = output<AddSpecialismsFormValues>();
  readonly errors = output<ValidationError[] | null>();

  readonly filterOptionsBy = (specialism: Specialism): boolean => {
    const existing = this.existingSpecialisms();
    return !existing.includes(specialism);
  };
}
