import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PdkButton,
  PdkDividerComponent,
  PdkForm,
  PdkFormFieldComponent,
  PdkFormGroupComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkRadio,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { JudiciaryAutosuggestControlComponent } from '../../../../shared/components/judiciary-autosuggest-control/judiciary-autosuggest-control.component';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { JudiciaryTypePayload, ReferenceDataService } from '@cpp/reference-data';
import { Specialism } from '../../model/specialism.enum';

export interface SelectJudiciaryTypeFormValues {
  judiciaryType: JudiciaryTypePayload | null;
  judiciary: JudiciaryWithSpecialisms | null;
}

@Component({
  selector: 'select-judiciary-type-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      #form="ngForm"
      data-test-id="select-judiciary-type-form"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="handleSubmitForm(form.value)"
    >
      <h1 pdk-typography="heading-large">Select Judiciary type</h1>

      <pdk-grid container>
        <pdk-grid two-thirds>
          <pdk-form-field
            label="Select judiciary type and name"
            labelType="small"
            [errorMessages]="[
              {
                rule: 'required',
                message: 'Select a judiciary type.'
              }
            ]"
          >
            <pdk-radio-group
              name="judiciaryType"
              [ngModel]="initialValues()?.judiciaryType || null"
              #selectedType="ngModel"
              required
              data-test-id="judiciary-type-radio"
            >
              <pdk-radio-button value="Judge">Judge</pdk-radio-button>
              @if (selectedType.value === 'Judge') {
                <pdk-radio-conditional>
                  <judiciary-autosuggest-control
                    name="judiciary"
                    label="Name"
                    [judiciaryType]="'Judge'"
                    [suggestions]="suggestionsResource.value() ?? []"
                    [required]="true"
                    [ngModel]="getJudiciaryValueForType('Judge')"
                    #selectedJudiciary="ngModel"
                    [errorMessagesInput]="[
                      {
                        rule: 'required',
                        message: 'Choose a name from the list.'
                      }
                    ]"
                    (onAddSpecialism)="handleAddSpecialism($event)"
                    (inputText)="handleInputText($event)"
                    data-test-id="judiciary-name-input"
                  />
                </pdk-radio-conditional>
              }

              <pdk-radio-button value="Recorder">Recorder</pdk-radio-button>
              @if (selectedType.value === 'Recorder') {
                <pdk-radio-conditional>
                  <judiciary-autosuggest-control
                    name="judiciary"
                    label="Name"
                    [judiciaryType]="'Recorder'"
                    [suggestions]="suggestionsResource.value() ?? []"
                    [required]="true"
                    [ngModel]="getJudiciaryValueForType('Recorder')"
                    #selectedJudiciary="ngModel"
                    [errorMessagesInput]="[
                      {
                        rule: 'required',
                        message: 'Choose a name from the list.'
                      }
                    ]"
                    (onAddSpecialism)="handleAddSpecialism($event)"
                    (inputText)="handleInputText($event)"
                    data-test-id="judiciary-name-input"
                  />
                </pdk-radio-conditional>
              }

              <pdk-radio-button value="Magistrate">Magistrate</pdk-radio-button>
              @if (selectedType.value === 'Magistrate') {
                <pdk-radio-conditional>
                  <judiciary-autosuggest-control
                    name="judiciary"
                    label="Name"
                    [judiciaryType]="'Magistrate'"
                    [suggestions]="suggestionsResource.value() ?? []"
                    [required]="true"
                    [ngModel]="getJudiciaryValueForType('Magistrate')"
                    #selectedJudiciary="ngModel"
                    [errorMessagesInput]="[
                      {
                        rule: 'required',
                        message: 'Choose a name from the list.'
                      }
                    ]"
                    (onAddSpecialism)="handleAddSpecialism($event)"
                    (inputText)="handleInputText($event)"
                    data-test-id="judiciary-name-input"
                  />
                </pdk-radio-conditional>
              }
            </pdk-radio-group>
          </pdk-form-field>
        </pdk-grid>

        <pdk-grid full>
          <pdk-divider></pdk-divider>
        </pdk-grid>

        <pdk-grid one-third>
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
    PdkFormFieldComponent,
    PdkFormGroupComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkRadio,
    PdkTypographyDirective,
    JudiciaryAutosuggestControlComponent
  ]
})
export class SelectJudiciaryTypeFormComponent {
  readonly referenceDataService = inject(ReferenceDataService);

  readonly initialValues = input<SelectJudiciaryTypeFormValues | null>(null);
  readonly submitForm = output<SelectJudiciaryTypeFormValues>();
  readonly errors = output<ValidationError[] | null>();
  readonly addSpecialism = output<SelectJudiciaryTypeFormValues>();

  readonly querySignal = signal<{ type: JudiciaryTypePayload | null; searchText: string }>({
    type: null,
    searchText: ''
  });

  readonly suggestionsResource = rxResource({
    request: this.querySignal,
    loader: ({ request }) => {
      if (!request.type || !request.searchText) {
        return of([]);
      }
      return this.referenceDataService
        .fetchJudicialMembers({
          judiciaryGroup: request.type,
          search: request.searchText,
          limit: 20,
          withSpecialism: true
        })
        .pipe(
          map((judiciaries) => {
            return judiciaries.map((judiciary) => {
              const judiciaryWithSpecialisms = judiciary as JudiciaryWithSpecialisms;
              if (judiciaryWithSpecialisms.specialisms) {
                judiciaryWithSpecialisms.specialisms = judiciaryWithSpecialisms.specialisms.filter(
                  (s) => Object.values(Specialism).includes(s as Specialism)
                ) as Specialism[];
              }
              return judiciaryWithSpecialisms;
            });
          }),
          catchError(() => of([]))
        );
    }
  });

  handleInputText(event: { type: JudiciaryTypePayload; searchText: string }): void {
    this.querySignal.set({
      type: event.type,
      searchText: event.searchText
    });
  }

  getJudiciaryValueForType(selectedType: JudiciaryTypePayload): JudiciaryWithSpecialisms | null {
    const initial = this.initialValues();
    if (initial?.judiciaryType === selectedType && initial?.judiciary) {
      return initial.judiciary;
    }
    if (initial?.judiciaryType && initial.judiciaryType !== selectedType) {
      return null;
    }
    return null;
  }

  handleSubmitForm(values: any): void {
    this.submitForm.emit({
      judiciaryType: values.judiciaryType,
      judiciary: values.judiciary
    });
  }

  handleAddSpecialism(event: {
    judiciary: JudiciaryWithSpecialisms | null;
    type: JudiciaryTypePayload | null;
  }): void {
    this.addSpecialism.emit({
      judiciaryType: event.type,
      judiciary: event.judiciary
    });
  }
}
