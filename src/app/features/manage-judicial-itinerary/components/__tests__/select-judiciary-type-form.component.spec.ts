import { JsonPipe } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, forwardRef, input, output, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SelectJudiciaryTypeFormComponent } from '../select-judiciary-type-form/select-judiciary-type-form.component';
import { ReferenceDataService, JudiciaryTypePayload, Specialism } from '@cpp/reference-data';
import { coerceBooleanProperty } from '@cpp/pdk';
import { ExtendedJudicialMember, JudiciarySelectionValue } from '../../../../shared/model';
import { JudiciarySelectionInputComponent } from '../../../../shared/components/judiciary-selection-input/judiciary-selection-input.component';

type SelectJudiciaryTypeInitialValues = {
  judiciarySelection: JudiciarySelectionValue;
  selectedJudiciaryTypes: (keyof JudiciarySelectionValue)[];
};

@Component({
  selector: 'app-test-host',
  template: `
    <select-judiciary-type-form
      [initialValues]="initialValues"
      (submitForm)="handleSubmitForm($event)"
      (errors)="handleErrors($event)"
      (addSpecialism)="handleAddSpecialism($event)"
    ></select-judiciary-type-form>
  `,
  imports: [SelectJudiciaryTypeFormComponent]
})
class TestHostComponent {
  initialValues: SelectJudiciaryTypeInitialValues | null = null;

  handleSubmitForm(_values: { judiciary: ExtendedJudicialMember | null }): void {}

  handleErrors(_errors: unknown): void {}

  handleAddSpecialism(_event: unknown): void {}
}

type SuggestionsBundle = {
  type: JudiciaryTypePayload | null;
  judicialMembers: ExtendedJudicialMember[];
};

@Component({
  selector: 'judiciary-selection-input',
  template: `
    <div data-test-id="mock-judiciary-selection-input">
      <span class="mock-judiciary-required">{{ required() }}</span>
      <span class="mock-judiciary-selected-types">{{ selectedJudiciaryTypes() | json }}</span>
      <span class="mock-judiciary-suggestions">{{ suggestions() | json }}</span>
      <span class="mock-judiciary-ng-model">{{ ngModelValue() | json }}</span>
    </div>
  `,
  imports: [JsonPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockJudiciarySelectionInputComponent),
      multi: true
    }
  ]
})
class MockJudiciarySelectionInputComponent implements ControlValueAccessor {
  readonly required = input(false, {
    transform: (value: boolean | string) => coerceBooleanProperty(value)
  });
  readonly suggestions = input<SuggestionsBundle | null | undefined>(undefined);
  readonly selectedJudiciaryTypes = input<(keyof JudiciarySelectionValue)[]>([]);
  readonly onAddSpecialism = output<{
    judiciary: ExtendedJudicialMember | null;
    type: JudiciaryTypePayload | null;
  }>();
  readonly inputText = output<{ type: JudiciaryTypePayload; searchText: string }>();

  readonly ngModelValue = signal<JudiciarySelectionValue | null>(null);

  writeValue(value: JudiciarySelectionValue | null): void {
    this.ngModelValue.set(value);
  }

  registerOnChange(): void {}

  registerOnTouched(): void {}
}

describe('SelectJudiciaryTypeFormComponent', () => {
  let component: SelectJudiciaryTypeFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let referenceDataService: jest.Mocked<ReferenceDataService>;

  const mockJudiciary: ExtendedJudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER, Specialism.SEXUALOFFENCE]
  } as unknown as ExtendedJudicialMember;

  const mockSuggestions: ExtendedJudicialMember[] = [
    mockJudiciary,
    {
      id: 'judge-2',
      seqId: 2,
      surname: 'Doe',
      forenames: 'Jane',
      judiciaryType: 'District Judge',
      emailAddress: 'jane.doe@example.com',
      specialisms: [Specialism.SEXUALOFFENCE]
    } as unknown as ExtendedJudicialMember
  ];

  const defaultInitial: SelectJudiciaryTypeInitialValues = {
    judiciarySelection: { Judge: mockJudiciary },
    selectedJudiciaryTypes: ['Judge']
  };

  beforeEach(() => {
    const mockService = {
      fetchJudicialMembers: jest.fn().mockReturnValue(of(mockSuggestions))
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReferenceDataService,
          useValue: mockService
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(SelectJudiciaryTypeFormComponent, {
      remove: {
        imports: [JudiciarySelectionInputComponent]
      },
      add: {
        imports: [MockJudiciarySelectionInputComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(SelectJudiciaryTypeFormComponent)
    ).componentInstance;
    referenceDataService = TestBed.inject(
      ReferenceDataService
    ) as jest.Mocked<ReferenceDataService>;
    testHost.initialValues = defaultInitial;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', async () => {
    expect.assertions(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should initialize with initial values', () => {
    expect.assertions(1);
    expect(component.initialValues()).toEqual(defaultInitial);
  });

  it('should render correctly with Judge type selected', fakeAsync(() => {
    expect.assertions(1);
    component.handleInputText({ type: 'Judge', searchText: 'John' });
    fixture.detectChanges();
    flush();
    tick();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  }));

  it('should update querySignal when handleInputText is called', () => {
    expect.assertions(1);
    component.handleInputText({ type: 'Judge', searchText: 'John' });
    expect(component.querySignal()).toEqual({ type: 'Judge', searchText: 'John' });
  });

  it('should emit submitForm with judiciary from selection', () => {
    expect.assertions(1);
    const emitSpy = jest.spyOn(component.submitForm, 'emit');
    const judiciarySelection: JudiciarySelectionValue = { Judge: mockJudiciary };
    component.handleSubmitForm({ judiciarySelection });
    expect(emitSpy).toHaveBeenCalledWith({ judiciary: mockJudiciary });
  });

  it('should forward onAddSpecialism from judiciary-selection-input', () => {
    expect.assertions(1);
    const emitSpy = jest.spyOn(component.addSpecialism, 'emit');
    const mockInput = fixture.debugElement.query(
      By.directive(MockJudiciarySelectionInputComponent)
    ).componentInstance;
    const event = {
      judiciary: mockJudiciary,
      type: 'Judge' as JudiciaryTypePayload
    };
    mockInput.onAddSpecialism.emit(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should fetch suggestions via rxResource when querySignal is set', fakeAsync(() => {
    expect.assertions(2);
    component.querySignal.set({ type: 'Judge', searchText: 'John' });
    fixture.detectChanges();

    flush();
    fixture.detectChanges();

    expect(referenceDataService.fetchJudicialMembers).toHaveBeenCalledWith({
      judiciaryGroup: 'Judge',
      search: 'John',
      limit: 20,
      withSpecialism: true
    });

    expect(component.suggestionsResource.value()).toEqual({
      type: 'Judge',
      judicialMembers: mockSuggestions
    });
  }));

  it('should return empty judicialMembers when querySignal has no type', fakeAsync(() => {
    expect.assertions(1);
    component.querySignal.set({ type: null, searchText: 'John' });
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    expect(component.suggestionsResource.value()?.judicialMembers).toEqual([]);
  }));

  it('should return empty judicialMembers when querySignal has no searchText', fakeAsync(() => {
    expect.assertions(1);
    component.querySignal.set({ type: 'Judge', searchText: '' });
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    expect(component.suggestionsResource.value()?.judicialMembers).toEqual([]);
  }));

  it('should handle multiple querySignal updates', fakeAsync(() => {
    expect.assertions(4);

    component.handleInputText({ type: 'Judge', searchText: 'John' });
    flush();
    fixture.detectChanges();

    expect(component.querySignal().type).toBe('Judge');
    expect(component.querySignal().searchText).toBe('John');

    component.handleInputText({ type: 'Recorder', searchText: 'Jane' });
    flush();
    fixture.detectChanges();

    expect(component.querySignal().type).toBe('Recorder');
    expect(component.querySignal().searchText).toBe('Jane');
  }));

  it('should have errors output defined', () => {
    expect.assertions(1);
    expect(component.errors).toBeDefined();
  });

  it('should handle rxResource error gracefully', fakeAsync(() => {
    expect.assertions(1);

    referenceDataService.fetchJudicialMembers.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    component.querySignal.set({ type: 'Judge', searchText: 'John' });
    fixture.detectChanges();

    flush();
    fixture.detectChanges();

    expect(component.suggestionsResource.value()?.judicialMembers).toEqual([]);
  }));
});
