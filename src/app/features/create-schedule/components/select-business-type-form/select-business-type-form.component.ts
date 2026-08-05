import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkForm,
  PdkLinkDirective,
  PdkMarginDirective,
  ValidationError
} from '@cpp/pdk';
import {
  OrganisationUnit,
  RotaBusinessType,
  RotaBusinessTypeCode,
  RotaBusinessTypeSelectComponent
} from '@cpp/reference-data';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

interface SelectBusinessTypeFormValues {
  rotaBusinessTypeCode: RotaBusinessTypeCode;
}

@Component({
  selector: 'select-business-type-form',
  template: `
    <form
      #form="ngForm"
      data-test-id="selectBusinessType"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="handleSubmitForm(form.value)"
    >
      <pdk-form-field
        label="Select business type"
        labelType="small"
        [errorMessages]="[
          {
            rule: 'required',
            message: 'Select a business type from the list'
          }
        ]"
      >
        <cpp-rota-business-type-select
          [ngModel]="initialValueOptions()?.value"
          [name]="'rotaBusinessTypeCode'"
          [jurisdiction]="jurisdiction()"
          justified
          required
        />
      </pdk-form-field>

      <div class="actions">
        <pdk-form-group>
          <button
            type="submit"
            data-test-id="select-business-type"
            pdk-button
            pdk-margin-bottom="0"
          >
            Continue
          </button>
        </pdk-form-group>
        <div pdk-margin-left="4">
          <a data-test-id="clear-court" href="javascript:void(0)" pdk-link (click)="form.reset()"
            >Clear</a
          >
        </div>
      </div>
    </form>
  `,
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
    PdkMarginDirective,
    PdkLinkDirective,
    RotaBusinessTypeSelectComponent
  ]
})
export class SelectBusinessTypeFormComponent {
  readonly courtCentre = input<OrganisationUnit>();
  readonly initialValues = input<RotaBusinessType>();
  readonly jurisdiction = input<JurisdictionType>();

  readonly submitForm = output<RotaBusinessTypeCode>();
  readonly errors = output<ValidationError[] | null>();

  readonly initialValueOptions = computed(() => {
    const initialValues = this.initialValues();
    if (initialValues) {
      return {
        value: initialValues.typeCode,
        label: initialValues.typeDescription
      };
    }
    return undefined;
  });

  handleSubmitForm(value: SelectBusinessTypeFormValues): void {
    this.submitForm.emit(value.rotaBusinessTypeCode);
  }
}
