import { Component, computed, output, viewChild, model } from '@angular/core';
import {
  PdkButton,
  PdkForm,
  PdkLinkDirective,
  PdkMarginDirective,
  ValidationError
} from '@cpp/pdk';
import { OrganisationUnit, OrganisationUnitAutosuggestComponent } from '@cpp/reference-data';
import { FormsModule, NgForm } from '@angular/forms';
import { SelectJurisdictionComponent } from '../../../../shared/components/select-jurisdiction/select-jurisdiction.component';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { getJurisdictionCode } from '../../../../shared/utils/jurisdiction.utils';
import { NgTemplateOutlet } from '@angular/common';
export interface SelectCourtFormValues {
  courtCentre: OrganisationUnit;
}

@Component({
  selector: 'select-court-form',
  template: `
    <form
      #form="ngForm"
      data-test-id="select-court-form"
      pdk-form
      novalidate
      (errors)="errors.emit($event)"
      (validSubmit)="courtCentreChange.emit(form.value.courtCentre)"
    >
      <select-jurisdiction [(jurisdiction)]="jurisdiction">
        @if (jurisdiction() === JurisdictionType.MAGISTRATES) {
          <div magistrates-court>
            <ng-container [ngTemplateOutlet]="courtCentreTemplate" />
          </div>
        }
        @if (jurisdiction() === JurisdictionType.CROWN) {
          <div crown-court>
            <ng-container [ngTemplateOutlet]="courtCentreTemplate" />
          </div>
        }
      </select-jurisdiction>

      <ng-template #courtCentreTemplate>
        <pdk-form-field
          label="Select court"
          labelType="small"
          [errorMessages]="[
            {
              rule: 'required',
              message: 'Select a court from the list'
            }
          ]"
        >
          <cpp-organisation-unit-autosuggest
            [id]="'courtCentre'"
            name="courtCentre"
            [ngModel]="courtCentre()"
            (ngModelChange)="courtCentre.set($event)"
            [jurisdictionCode]="jurisdictionCode()"
            required
            data-role="allocate-court-centre-input"
          ></cpp-organisation-unit-autosuggest>
        </pdk-form-field>
      </ng-template>

      <div class="actions">
        <pdk-form-group>
          <button type="submit" data-test-id="select-court" pdk-button pdk-margin-bottom="0">
            Continue
          </button>
        </pdk-form-group>
        <div pdk-margin-left="4">
          <a data-test-id="clear-court" href="javascript:void(0)" pdk-link (click)="clearForm()"
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
    NgTemplateOutlet,
    PdkButton,
    PdkForm,
    PdkLinkDirective,
    PdkMarginDirective,
    OrganisationUnitAutosuggestComponent,
    SelectJurisdictionComponent
  ]
})
export class SelectCourtFormComponent {
  readonly JurisdictionType = JurisdictionType;
  readonly courtCentre = model<OrganisationUnit>(undefined);
  readonly courtCentreChange = output<OrganisationUnit>();
  readonly jurisdiction = model<JurisdictionType | null>();
  readonly errors = output<ValidationError[] | null>();

  readonly form = viewChild<NgForm>('form');

  readonly jurisdictionCode = computed(() => {
    const type = this.jurisdiction();
    return type ? getJurisdictionCode(type) : null;
  });

  clearForm(): void {
    this.form()?.reset();
    this.jurisdiction.set(null);
    this.errors.emit([]);
  }
}
