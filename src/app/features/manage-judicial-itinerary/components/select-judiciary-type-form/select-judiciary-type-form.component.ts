import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkDividerComponent,
  PdkForm,
  PdkFormGroupComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkRadio,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { JudiciaryTypePayload, ReferenceDataService } from '@cpp/reference-data';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { JudiciarySelectionInputComponent } from '../../../../shared/components/judiciary-selection-input/judiciary-selection-input.component';
import { JudiciarySelectionValue, ExtendedJudicialMember } from '../../../../shared/model';

export interface SelectJudiciaryTypeFormPayload {
  judiciary: ExtendedJudicialMember | null;
}

interface SelectJudiciaryTypeInitialValues {
  judiciarySelection: JudiciarySelectionValue;
  selectedJudiciaryTypes: (keyof JudiciarySelectionValue)[];
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
          <judiciary-selection-input
            required
            name="judiciarySelection"
            [ngModel]="initialValues()?.judiciarySelection ?? null"
            [selectedJudiciaryTypes]="initialValues()?.selectedJudiciaryTypes ?? []"
            [suggestions]="suggestionsResource.value()"
            (onAddSpecialism)="addSpecialism.emit($event)"
            (inputText)="handleInputText($event)"
            data-test-id="judiciary-selection-input"
          />
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
    PdkFormGroupComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkRadio,
    PdkTypographyDirective,
    JudiciarySelectionInputComponent
  ]
})
export class SelectJudiciaryTypeFormComponent {
  readonly referenceDataService = inject(ReferenceDataService);
  readonly initialValues = input<SelectJudiciaryTypeInitialValues>(null);
  readonly submitForm = output<SelectJudiciaryTypeFormPayload>();
  readonly errors = output<ValidationError[] | null>();
  readonly addSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();

  readonly querySignal = signal<{ type: JudiciaryTypePayload | null; searchText: string }>({
    type: null,
    searchText: ''
  });

  readonly suggestionsResource = rxResource({
    request: this.querySignal,
    loader: ({ request: { type, searchText } }) => {
      if (!type || !searchText) {
        return of({ type, judicialMembers: [] });
      }
      return this.referenceDataService
        .fetchJudicialMembers({
          judiciaryGroup: type,
          search: searchText,
          limit: 20,
          withSpecialism: true
        })
        .pipe(
          map((judicialMembers) => ({
            type,
            judicialMembers
          })),
          catchError(() => of({ type, judicialMembers: [] }))
        );
    }
  });

  handleInputText({ type, searchText }: { type: JudiciaryTypePayload; searchText: string }): void {
    this.querySignal.set({
      type,
      searchText
    });
  }

  handleSubmitForm({ judiciarySelection }: { judiciarySelection: JudiciarySelectionValue }): void {
    this.submitForm.emit({
      judiciary:
        judiciarySelection.Magistrate?.[0] ??
        judiciarySelection.Judge ??
        judiciarySelection.Recorder
    });
  }
}
