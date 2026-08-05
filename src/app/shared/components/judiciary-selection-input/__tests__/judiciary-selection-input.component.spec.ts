import { JsonPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, forwardRef, input, model, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JudiciarySelectionInputComponent } from '../judiciary-selection-input.component';
import { JudiciaryAutosuggestControlComponent } from '../../judiciary-autosuggest-control/judiciary-autosuggest-control.component';
import { MagistratesJudiciarySelectionInputComponent } from '../magistrates-judiciary-selection-input/magistrates-judiciary-selection-input.component';
import {
  ExtendedJudicialMember,
  JudiciarySelectionFormGroup,
  JudiciarySelectionValue,
  MagistrateSlotConfig
} from '../../../model';
import { JudiciaryTypePayload, Specialism } from '@cpp/reference-data';

@Component({
  selector: 'judiciary-autosuggest-control',
  template: `
    <div data-test-id="mock-judiciary-autosuggest-control">
      <span class="mock-autosuggest-name">{{ name() }}</span>
      <span class="mock-autosuggest-label">{{ label() }}</span>
      <span class="mock-autosuggest-judiciary-type">{{ judiciaryType() | json }}</span>
      <span class="mock-autosuggest-required">{{ required() }}</span>
      <span class="mock-autosuggest-suggestions">{{ suggestions() | json }}</span>
      <span class="mock-autosuggest-aria-described-by">{{ ariaDescribedByInput() }}</span>
      <span class="mock-autosuggest-disabled">{{ disabled() }}</span>
      <span class="mock-autosuggest-error-messages">{{ errorMessagesInput() | json }}</span>
      <span class="mock-autosuggest-hide-specialisms">{{ hideSpecialismsAction() }}</span>
    </div>
  `,
  imports: [JsonPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockJudiciaryAutosuggestControlComponent),
      multi: true
    }
  ]
})
class MockJudiciaryAutosuggestControlComponent implements ControlValueAccessor {
  readonly label = input<string>('Judiciary name');
  readonly name = input.required<string>();
  readonly required = input(false);
  readonly judiciaryType = input.required<JudiciaryTypePayload | null>();
  readonly suggestions = input<ExtendedJudicialMember[]>([]);
  readonly ariaDescribedByInput = input<string>('');
  readonly disabled = model(false);
  readonly errorMessagesInput = input<Array<{ rule: string; message: string }>>([]);
  readonly hideSpecialismsAction = input(false);
  readonly onAddSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

@Component({
  selector: 'magistrates-judiciary-selection-input',
  template: `
    <div data-test-id="mock-magistrates-judiciary-selection-input">
      <span class="mock-magistrates-slot-config">{{ slotConfig() | json }}</span>
      <span class="mock-magistrates-suggestions">{{ suggestions() | json }}</span>
      <span class="mock-magistrates-hide-specialisms">{{ hideSpecialismsAction() }}</span>
    </div>
  `,
  imports: [JsonPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockMagistratesJudiciarySelectionInputComponent),
      multi: true
    }
  ]
})
class MockMagistratesJudiciarySelectionInputComponent implements ControlValueAccessor {
  readonly slotConfig = input<MagistrateSlotConfig[]>([{ label: 'Name', required: true }]);
  readonly suggestions = input<ExtendedJudicialMember[]>([]);
  readonly hideSpecialismsAction = input(false);
  readonly onAddSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

@Component({
  selector: 'app-test-host',
  template: `<judiciary-selection-input
    [judiciaryTypes]="judiciaryTypes"
    [multi]="false"
    [required]="true"
    [selectedJudiciaryTypes]="selectedJudiciaryTypes"
  />`,
  imports: [JudiciarySelectionInputComponent]
})
class TestHostComponent {
  judiciaryTypes: (keyof JudiciarySelectionFormGroup)[] = ['Judge'];
  selectedJudiciaryTypes: (keyof JudiciarySelectionValue)[] = ['Judge'];
}

describe('JudiciarySelectionInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: JudiciarySelectionInputComponent;

  const mockJudge: ExtendedJudicialMember = {
    id: 'j1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'j@example.com',
    specialisms: [Specialism.MURDER]
  } as unknown as ExtendedJudicialMember;

  beforeEach(() => {
    TestBed.overrideComponent(JudiciarySelectionInputComponent, {
      remove: {
        imports: [JudiciaryAutosuggestControlComponent, MagistratesJudiciarySelectionInputComponent]
      },
      add: {
        imports: [
          MockJudiciaryAutosuggestControlComponent,
          MockMagistratesJudiciarySelectionInputComponent
        ]
      }
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(
      By.directive(JudiciarySelectionInputComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);
    expect(fixture).toMatchSnapshot();
  });

  it('should apply writeValue to the form group', () => {
    expect.assertions(1);
    component.writeValue({ Judge: mockJudge });
    expect(component.formGroup.get('Judge')?.value).toEqual(mockJudge);
  });

  it('should clear controls when writeValue is null', () => {
    expect.assertions(1);
    component.writeValue({ Judge: mockJudge });
    component.writeValue(null);
    expect(component.formGroup.get('Judge')?.value).toBeNull();
  });

  it('should accept registerOnTouched', () => {
    expect.assertions(1);
    expect(() => component.registerOnTouched(jest.fn())).not.toThrow();
  });
});
