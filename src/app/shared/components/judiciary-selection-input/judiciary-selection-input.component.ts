import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  OnInit,
  output,
  viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  NgModel,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms';
import {
  PdkFormFieldComponent,
  PdkGrid,
  PdkRadio,
  PdkCheckBox,
  PdkMinCountValidatorDirective,
  PdkValidatorDirective,
  ErrorMessageConfig,
  coerceBooleanProperty
} from '@cpp/pdk';
import { JudiciaryTypePayload } from '@cpp/reference-data';
import { JudiciaryAutosuggestControlComponent } from '../judiciary-autosuggest-control/judiciary-autosuggest-control.component';
import {
  ExtendedJudicialMember,
  JudiciarySelectionValue,
  JudiciarySelectionSuggestion,
  MagistrateSlotConfig,
  JudiciarySelectionFormGroup
} from '../../model';
import { MagistratesJudiciarySelectionInputComponent } from './magistrates-judiciary-selection-input/magistrates-judiciary-selection-input.component';
import { filterExists } from '../../utils/core.utils';

@Component({
  selector: 'judiciary-selection-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './judiciary-selection-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JudiciarySelectionInputComponent),
      multi: true
    }
  ],
  imports: [
    FormsModule,
    PdkFormFieldComponent,
    PdkGrid,
    PdkRadio,
    PdkCheckBox,
    JudiciaryAutosuggestControlComponent,
    MagistratesJudiciarySelectionInputComponent,
    PdkMinCountValidatorDirective,
    PdkValidatorDirective,
    ReactiveFormsModule
  ]
})
export class JudiciarySelectionInputComponent implements ControlValueAccessor, OnInit {
  readonly multi = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });
  readonly suggestions = input<JudiciarySelectionSuggestion>();
  readonly magistrateConfig = input<MagistrateSlotConfig[] | undefined>([
    { label: 'Name', required: true }
  ]);
  readonly judiciaryTypes = input<(keyof JudiciarySelectionFormGroup)[]>([
    'Judge',
    'Recorder',
    'Magistrate'
  ]);
  readonly hideSpecialismsAction = input<boolean>(false);
  readonly required = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });
  readonly selectedJudiciaryTypes = input<(keyof JudiciarySelectionValue)[]>([]);
  readonly judiciaryTypesValidatorFactory = input<
    ((formGroup: FormGroup<JudiciarySelectionFormGroup>) => ValidatorFn) | null
  >(null);
  readonly errorMessages = input<ErrorMessageConfig[], ErrorMessageConfig[]>([], {
    transform: (messages: ErrorMessageConfig[]): ErrorMessageConfig[] => [
      { rule: 'required', message: 'Please select Judiciary' },
      { rule: 'minCount', message: 'Please select at least one judiciary' },
      ...messages
    ]
  });

  readonly onAddSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  readonly formGroup: FormGroup<JudiciarySelectionFormGroup> = new FormGroup({});
  readonly formGroupSignal = toSignal(this.formGroup.valueChanges, {
    initialValue: this.formGroup.value as JudiciarySelectionValue
  });
  readonly judiciaryTypesGroup = viewChild<NgModel>('judiciaryTypesGroup');

  protected readonly resolvedValidator = computed<ValidatorFn>(() => {
    const factory = this.judiciaryTypesValidatorFactory();
    return factory ? factory(this.formGroup) : () => null;
  });

  #onChange: (value: JudiciarySelectionValue) => void = () => {};

  constructor() {
    effect(() => {
      const value = this.formGroupSignal();
      const group = this.judiciaryTypesGroup();
      this.#onChange(value);
      group?.control.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.judiciaryTypes().forEach((type) => {
      if (type === 'Magistrate') {
        this.formGroup.addControl(
          'Magistrate',
          new FormControl<ExtendedJudicialMember[] | null>(null)
        );
      } else {
        this.formGroup.addControl(type, new FormControl<ExtendedJudicialMember | null>(null));
      }
    });
  }

  writeValue(value: JudiciarySelectionValue | null): void {
    if (value == null) {
      this.resetFormGroupForTypes(this.judiciaryTypes());
      return;
    }
    this.formGroup.patchValue(value);
  }

  registerOnChange(fn: (value: JudiciarySelectionValue) => void): void {
    this.#onChange = (value: JudiciarySelectionValue) => fn(filterExists(value));
  }

  registerOnTouched(_fn: () => void): void {}

  protected onJudicialSelectionChange(types: (keyof JudiciarySelectionFormGroup)[]): void {
    const removed = this.judiciaryTypes().filter((type) => !types.includes(type));
    this.resetFormGroupForTypes(removed);
  }

  private resetFormGroupForTypes(types: (keyof JudiciarySelectionFormGroup)[]): void {
    this.formGroup.patchValue(
      Object.fromEntries(
        types.map((type): [keyof JudiciarySelectionFormGroup, null] => [type, null])
      )
    );
  }
}
