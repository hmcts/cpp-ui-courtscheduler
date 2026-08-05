import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkForm,
  PdkFormFieldComponent,
  PdkFormGroupComponent,
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkRadio,
  PdkSummaryList,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { Specialism } from '@cpp/reference-data';
import { SpecialismFormatPipe } from '../../pipes/specialism-format.pipe';

export interface SpecialismAddedConfirmationFormValues {
  confirmation: boolean | null;
}

@Component({
  selector: 'specialism-added-confirmation-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pdk-grid container pdk-margin-top="4">
      <pdk-grid full>
        <h2 pdk-typography="heading-medium">Specialism added</h2>
        <dl pdk-summary-list pdk-margin-top="2">
          <div pdk-summary-list-item>
            <dt pdk-summary-list-key>New specialisms</dt>
            <dd pdk-summary-list-value>
              {{ formattedSpecialisms() }}
            </dd>
            <dd pdk-summary-list-action>
              <a
                href="javascript:void(0);"
                pdk-link
                unvisited
                (click)="onChange.emit()"
                data-test-id="change-specialisms-link"
              >
                Change
              </a>
            </dd>
          </div>
        </dl>
      </pdk-grid>
    </pdk-grid>

    <form
      #form="ngForm"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="submitForm.emit(form.value)"
    >
      <pdk-grid container pdk-margin-top="6">
        <pdk-grid two-thirds>
          <pdk-form-field
            label="Are you sure you want to add these specialisms?"
            labelType="small"
            [errorMessages]="[
              {
                rule: 'required',
                message: 'Please select confirmation option'
              }
            ]"
          >
            <pdk-radio-group
              name="confirmation"
              [ngModel]="initialValues()?.confirmation ?? null"
              required
              data-test-id="confirmation-radio"
            >
              <pdk-radio-button [value]="true">Yes</pdk-radio-button>
              <pdk-radio-button [value]="false">No</pdk-radio-button>
            </pdk-radio-group>
          </pdk-form-field>
        </pdk-grid>

        <pdk-grid two-thirds>
          <pdk-form-group pdk-margin-top="4">
            <button type="submit" pdk-button data-test-id="continue-and-add-specialism-button">
              Confirm and continue
            </button>
          </pdk-form-group>
        </pdk-grid>
      </pdk-grid>
    </form>
  `,
  imports: [
    FormsModule,
    PdkButton,
    PdkForm,
    PdkFormFieldComponent,
    PdkFormGroupComponent,
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkRadio,
    PdkSummaryList,
    PdkTypographyDirective
  ],
  providers: [SpecialismFormatPipe]
})
export class SpecialismAddedConfirmationFormComponent {
  readonly draftSpecialisms = input.required<Specialism[]>();
  readonly initialValues = input<SpecialismAddedConfirmationFormValues | null>(null);
  readonly submitForm = output<SpecialismAddedConfirmationFormValues>();
  readonly errors = output<ValidationError[] | null>();
  readonly onChange = output<void>();

  private readonly specialismFormatPipe = inject(SpecialismFormatPipe);

  readonly formattedSpecialisms = computed(() => {
    const specialisms = this.draftSpecialisms();
    if (specialisms.length === 0) {
      return 'Not added';
    }
    return specialisms.map((s) => this.specialismFormatPipe.transform(s)).join(', ');
  });
}
