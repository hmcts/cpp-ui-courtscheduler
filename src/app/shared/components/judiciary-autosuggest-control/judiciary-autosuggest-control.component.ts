import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  PdkButton,
  PdkFormFieldComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTagComponent,
  PdkTypographyDirective,
  coerceBooleanProperty,
  PdkAutosuggestComponent,
  PdkTextColorDirective
} from '@cpp/pdk';
import { JudiciaryTypePayload, JudicialMemberNamePipe } from '@cpp/reference-data';
import { ExtendedJudicialMember } from '../../model';
import { Subject, debounceTime } from 'rxjs';
import { Specialism } from '@cpp/reference-data';
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
      <pdk-autosuggest
        [name]="name()"
        [ariaDescribedBy]="ariaDescribedByInput()"
        [disabled]="disabled()"
        highlightColor="blue"
        [ngModel]="selectedJudiciary()"
        [ngModelOptions]="{ standalone: true }"
        (ngModelChange)="handleModelChange($event)"
        [highlightFirstSuggestion]="true"
        [mapSuggestionToKey]="getKey"
        [mapSuggestionToLabel]="getSuggestionSubTitle"
        (inputText)="searchSubject.next($event)"
        [suggestions]="suggestions() ?? []"
        [suggestionTemplateRef]="suggestionTemplateRef"
        [required]="required()"
      >
      </pdk-autosuggest>
      <ng-template
        #suggestionTemplateRef
        let-highlighted="highlighted"
        let-matchText="matchText"
        let-suggestion="suggestion"
      >
        <span
          pdk-typography="body-small"
          [pdk-text-colour]="highlighted ? 'white' : 'black'"
          [innerHtml]="getSuggestionLabel(suggestion)"
        ></span>
        <br />
        <span pdk-typography="body-small" [pdk-text-colour]="highlighted ? 'white' : 'dark-grey'">
          {{ getSuggestionSubTitle(suggestion) }}
        </span>
      </ng-template>
    </pdk-form-field>

    @if (judiciary) {
      <pdk-grid container pdk-margin-top="4">
        <pdk-grid full>
          @if (judiciary.specialisms?.length > 0) {
            <h2 pdk-typography="heading-small">Judiciary Specialisms</h2>
            <div pdk-margin-top="2" role="list">
              @for (specialism of judiciary.specialisms; track specialism) {
                <pdk-tag role="listitem" pdk-margin-right="2" pdk-margin-bottom="2">
                  {{ specialism | specialismFormat }}
                </pdk-tag>
              }
            </div>
          }
          @if (canAddMoreSpecialisms() && !hideSpecialismsAction()) {
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
    PdkAutosuggestComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTagComponent,
    PdkTypographyDirective,
    PdkTextColorDirective,
    SpecialismFormatPipe
  ]
})
export class JudiciaryAutosuggestControlComponent implements ControlValueAccessor {
  readonly judicialMemberNamePipe = inject(JudicialMemberNamePipe);

  readonly label = input<string>('Judiciary name');
  readonly name = input.required<string>();
  readonly required = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });
  readonly judiciaryType = input.required<JudiciaryTypePayload | null>();
  readonly suggestions = input<ExtendedJudicialMember[]>([]);
  readonly ariaDescribedByInput = input<string>('');
  readonly disabled = model(false);
  readonly errorMessagesInput = input<Array<{ rule: string; message: string }>>([]);
  readonly hideSpecialismsAction = input<boolean>(false);

  readonly searchSubject = new Subject<string>();
  readonly selectedJudiciary = signal<ExtendedJudicialMember | null>(null);
  readonly onAddSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  readonly getSuggestionLabel = (suggestion: ExtendedJudicialMember): string => {
    const { forenames, surname } = suggestion;
    const label = `${forenames} ${surname}`;
    if (this.#searchText.length > 0) {
      const offset = this.#searchText.length;
      const idx = label.toLowerCase().indexOf(this.#searchText.toLowerCase());

      if (idx !== -1) {
        return (
          `${label.substring(0, idx)}<b>${label.substring(idx, idx + offset)}</b>` +
          `${label.substring(idx + offset)}`
        );
      }
    }
    return label;
  };

  readonly getKey = (suggestion: ExtendedJudicialMember): string => {
    return suggestion.id;
  };

  readonly getSuggestionSubTitle = (suggestion: ExtendedJudicialMember): string => {
    return this.judicialMemberNamePipe.transform(suggestion);
  };

  readonly canAddMoreSpecialisms = computed(() => {
    const judiciary = this.selectedJudiciary();
    const existingSpecialisms = judiciary?.specialisms || [];
    const allSpecialisms = Object.values(Specialism);
    return existingSpecialisms.length < allSpecialisms.length;
  });

  #searchText: string = '';
  #onChange: (value: ExtendedJudicialMember | null) => void = () => {};

  constructor() {
    this.searchSubject.pipe(debounceTime(500), takeUntilDestroyed()).subscribe((searchText) => {
      const type = this.judiciaryType();
      this.#searchText = searchText;
      if (type) {
        this.inputText.emit({ type, searchText });
      }
    });
  }

  handleModelChange(value: ExtendedJudicialMember | null): void {
    this.selectedJudiciary.set(value);
    this.#onChange(value);
  }

  writeValue(value: ExtendedJudicialMember | null): void {
    this.selectedJudiciary.set(value);
  }

  registerOnChange(fn: (value: ExtendedJudicialMember | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {}

  handleAddSpecialism(): void {
    this.onAddSpecialism.emit({
      judiciary: this.selectedJudiciary(),
      type: this.judiciaryType()
    });
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }
}
