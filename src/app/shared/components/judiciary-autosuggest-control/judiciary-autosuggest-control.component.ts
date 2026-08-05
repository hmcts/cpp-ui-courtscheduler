import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  PdkButton,
  PdkFormFieldComponent,
  PdkAutosuggestLiteComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTagComponent,
  PdkTypographyDirective
} from '@cpp/pdk';
import { JudicialMember, JudiciaryTypePayload, JudicialMemberNamePipe } from '@cpp/reference-data';
import { JudiciaryWithSpecialisms } from '../../../features/manage-judicial-itinerary/model/judicial-itinerary.interface';
import { Subject, debounceTime } from 'rxjs';
import { Specialism } from '../../../features/manage-judicial-itinerary/model/specialism.enum';
import { SpecialismFormatPipe } from '../../../features/manage-judicial-itinerary/pipes/specialism-format.pipe';

@Component({
  selector: 'judiciary-autosuggest-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let judiciary = selectedJudiciary();

    <pdk-form-field
      [label]="label()"
      labelType="small"
      hintText="Search by name"
      [errorMessages]="errorMessagesInput()"
    >
      <pdk-autosuggest-lite
        [name]="name()"
        [suggestions]="suggestions() ?? []"
        [mapSuggestionToTitle]="getSuggestionLabel"
        [mapSuggestionToSubtitle]="getSuggestionSubTitle"
        [mapSuggestionToKey]="getSuggestionKey"
        [ariaDescribedBy]="ariaDescribedByInput()"
        [highlightMatchedText]="true"
        [ngModel]="selectedJudiciary()"
        [ngModelOptions]="{ standalone: true }"
        [required]="required()"
        (inputText)="searchSubject.next($event)"
        (ngModelChange)="handleModelChange($event)"
      ></pdk-autosuggest-lite>
    </pdk-form-field>

    @if (judiciary) {
      <pdk-grid container pdk-margin-top="4">
        <pdk-grid full>
          @if (judiciary.specialisms?.length > 0) {
            <h2 pdk-typography="heading-medium">Judiciary Specialisms</h2>
            <div pdk-margin-top="2" role="list">
              @for (specialism of judiciary.specialisms; track specialism) {
                <pdk-tag role="listitem" pdk-margin-right="2" pdk-margin-bottom="2">
                  {{ specialism | specialismFormat }}
                </pdk-tag>
              }
            </div>
          }
          @if (hasAvailableSpecialisms()) {
            <button
              pdk-button="secondary"
              type="button"
              pdk-margin-top="2"
              (click)="handleAddSpecialism()"
              data-test-id="add-specialism"
            >
              Add new specialism
            </button>
          }
        </pdk-grid>
      </pdk-grid>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JudiciaryAutosuggestControlComponent),
      multi: true
    }
  ],
  imports: [
    FormsModule,
    PdkButton,
    PdkFormFieldComponent,
    PdkAutosuggestLiteComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTagComponent,
    PdkTypographyDirective,
    SpecialismFormatPipe
  ]
})
export class JudiciaryAutosuggestControlComponent implements ControlValueAccessor {
  readonly judicialMemberNamePipe = inject(JudicialMemberNamePipe);

  readonly label = input<string>('Judiciary name');
  readonly name = input.required<string>();
  readonly required = input<boolean>(false);
  readonly judiciaryType = input.required<JudiciaryTypePayload | null>();
  readonly suggestions = input<JudiciaryWithSpecialisms[]>([]);
  readonly ariaDescribedByInput = input<string>('');
  readonly errorMessagesInput = input<Array<{ rule: string; message: string }>>([]);

  readonly searchSubject = new Subject<string>();
  readonly selectedJudiciary = signal<JudiciaryWithSpecialisms | null>(null);
  readonly onAddSpecialism = output<{
    judiciary: JudiciaryWithSpecialisms | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  readonly getSuggestionLabel = (judiciary: JudicialMember): string => {
    return this.judicialMemberNamePipe.transform(judiciary);
  };
  readonly getSuggestionKey = (suggestion: JudiciaryWithSpecialisms): string => {
    return suggestion.id;
  };
  readonly getSuggestionSubTitle = (suggestion: JudiciaryWithSpecialisms): string => {
    const { forenames, surname } = suggestion;
    return `${forenames} ${surname}`;
  };

  readonly hasAvailableSpecialisms = computed(() => {
    const judiciary = this.selectedJudiciary();
    const existingSpecialisms = judiciary?.specialisms || [];
    const allSpecialisms = Object.values(Specialism);
    return existingSpecialisms.length < allSpecialisms.length;
  });

  constructor() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((searchText) => {
      const type = this.judiciaryType();
      if (type) {
        this.inputText.emit({ type, searchText });
      }
    });
  }

  #onChange: (value: JudiciaryWithSpecialisms | null) => void = () => {};

  handleModelChange(value: JudiciaryWithSpecialisms | null): void {
    this.selectedJudiciary.set(value);
    this.#onChange(value);
  }

  writeValue(value: JudiciaryWithSpecialisms | null): void {
    this.selectedJudiciary.set(value);
  }

  registerOnChange(fn: (value: JudiciaryWithSpecialisms | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {}

  handleAddSpecialism(): void {
    this.onAddSpecialism.emit({
      judiciary: this.selectedJudiciary(),
      type: this.judiciaryType()
    });
  }
}
