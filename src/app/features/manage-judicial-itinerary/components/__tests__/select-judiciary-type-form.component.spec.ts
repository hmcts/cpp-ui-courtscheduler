import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import {
  SelectJudiciaryTypeFormComponent,
  SelectJudiciaryTypeFormValues
} from '../select-judiciary-type-form/select-judiciary-type-form.component';
import { ReferenceDataService, JudiciaryTypePayload } from '@cpp/reference-data';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';
import { JudiciaryAutosuggestControlComponent } from '../../../../shared/components/judiciary-autosuggest-control/judiciary-autosuggest-control.component';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-test-host',
  template: `
    <select-judiciary-type-form
      [initialValues]="initialValues"
      (submitForm)="handleSubmitForm($event)"
      (errors)="handleErrors($event)"
      (addSpecialism)="handleAddSpecialism()"
    ></select-judiciary-type-form>
  `,
  imports: [SelectJudiciaryTypeFormComponent]
})
class TestHostComponent {
  initialValues?: SelectJudiciaryTypeFormValues | null;

  handleSubmitForm(_values: SelectJudiciaryTypeFormValues): void {}

  handleErrors(_errors: unknown): void {}

  handleAddSpecialism(): void {}
}

describe('SelectJudiciaryTypeFormComponent', () => {
  let component: SelectJudiciaryTypeFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let referenceDataService: jest.Mocked<ReferenceDataService>;

  const mockJudiciary: JudiciaryWithSpecialisms = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER, Specialism.SEXUALOFFENCE]
  } as unknown as JudiciaryWithSpecialisms;

  const mockSuggestions: JudiciaryWithSpecialisms[] = [
    mockJudiciary,
    {
      id: 'judge-2',
      seqId: 2,
      surname: 'Doe',
      forenames: 'Jane',
      judiciaryType: 'District Judge',
      emailAddress: 'jane.doe@example.com',
      specialisms: [Specialism.SEXUALOFFENCE]
    } as unknown as JudiciaryWithSpecialisms
  ];

  beforeEach(() => {
    const mockService = {
      fetchJudicialMembers: jest.fn().mockReturnValue(of(mockSuggestions))
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReferenceDataService,
          useValue: mockService
        },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(SelectJudiciaryTypeFormComponent, {
      remove: {
        imports: [JudiciaryAutosuggestControlComponent]
      },
      add: {
        imports: [MockJudiciaryAutosuggestControlComponent]
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

  it('should initialize with initial values', () => {
    expect.assertions(1);
    const initialValues: SelectJudiciaryTypeFormValues = {
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    };
    testHost.initialValues = initialValues;
    fixture.detectChanges();
    expect(component.initialValues()).toEqual(initialValues);
  });

  it('should get judiciary value for matching type', () => {
    expect.assertions(1);
    const initialValues: SelectJudiciaryTypeFormValues = {
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    };
    testHost.initialValues = initialValues;
    fixture.detectChanges();

    const value = component.getJudiciaryValueForType('Judge');
    expect(value).toEqual(mockJudiciary);
  });

  it('should render correctly with Judge type selected showing autosuggest', async () => {
    expect.assertions(1);
    const initialValues: SelectJudiciaryTypeFormValues = {
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    };
    testHost.initialValues = initialValues;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should return null when type does not match initial values', () => {
    expect.assertions(1);
    const initialValues: SelectJudiciaryTypeFormValues = {
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    };
    testHost.initialValues = initialValues;
    fixture.detectChanges();

    const value = component.getJudiciaryValueForType('Recorder');
    expect(value).toBeNull();
  });

  it('should return null when no initial values', () => {
    expect.assertions(1);
    testHost.initialValues = null;
    fixture.detectChanges();

    const value = component.getJudiciaryValueForType('Judge');
    expect(value).toBeNull();
  });

  it('should update querySignal when handleInputText is called', () => {
    expect.assertions(1);
    component.handleInputText({ type: 'Judge', searchText: 'John' });
    expect(component.querySignal()).toEqual({ type: 'Judge', searchText: 'John' });
  });

  it('should emit submitForm with form values', () => {
    expect.assertions(1);
    const emitSpy = jest.spyOn(component.submitForm, 'emit');
    const formValues = {
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    };

    component.handleSubmitForm(formValues);
    expect(emitSpy).toHaveBeenCalledWith({
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    });
  });

  it('should emit addSpecialism output', () => {
    expect.assertions(2);
    const emitSpy = jest.spyOn(component.addSpecialism, 'emit');
    const event = {
      judiciary: mockJudiciary,
      type: 'Judge' as JudiciaryTypePayload
    };
    component.handleAddSpecialism(event);
    expect(emitSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith({
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    });
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

    const suggestions = component.suggestionsResource.value() ?? [];
    expect(suggestions).toBeDefined();
  }));

  it('should return empty array when querySignal has no type', fakeAsync(() => {
    expect.assertions(1);
    component.handleInputText({ type: null, searchText: 'John' });

    tick(100);
    fixture.detectChanges();

    const suggestions = component.suggestionsResource.value() ?? [];
    expect(suggestions).toEqual([]);
  }));

  it('should return empty array when querySignal has no searchText', fakeAsync(() => {
    expect.assertions(1);
    component.handleInputText({ type: 'Judge', searchText: '' });

    tick(100);
    fixture.detectChanges();

    const suggestions = component.suggestionsResource.value() ?? [];
    expect(suggestions).toEqual([]);
  }));

  it('should filter specialisms to valid enum values', fakeAsync(() => {
    expect.assertions(2);
    const judiciariesWithInvalidSpecialisms: JudiciaryWithSpecialisms[] = [
      {
        ...mockJudiciary,
        specialisms: [Specialism.MURDER, 'INVALID_SPECIALISM' as any, Specialism.SEXUALOFFENCE]
      } as JudiciaryWithSpecialisms
    ];

    referenceDataService.fetchJudicialMembers.mockReturnValue(
      of(judiciariesWithInvalidSpecialisms)
    );

    component.querySignal.set({ type: 'Judge', searchText: 'John' });
    fixture.detectChanges();

    flush();
    fixture.detectChanges();

    const suggestions = component.suggestionsResource.value() ?? [];
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].specialisms).toEqual([Specialism.MURDER, Specialism.SEXUALOFFENCE]);
  }));

  it('should return null when initialValues has judiciaryType but judiciary is null', () => {
    expect.assertions(1);
    const initialValues: SelectJudiciaryTypeFormValues = {
      judiciaryType: 'Judge',
      judiciary: null
    };
    testHost.initialValues = initialValues;
    fixture.detectChanges();

    const value = component.getJudiciaryValueForType('Judge');
    expect(value).toBeNull();
  });

  it('should return null when initialValues has different judiciaryType', () => {
    expect.assertions(1);
    const initialValues: SelectJudiciaryTypeFormValues = {
      judiciaryType: 'Recorder',
      judiciary: mockJudiciary
    };
    testHost.initialValues = initialValues;
    fixture.detectChanges();

    const value = component.getJudiciaryValueForType('Judge');
    expect(value).toBeNull();
  });

  it('should handle multiple querySignal updates', fakeAsync(() => {
    expect.assertions(4);

    component.handleInputText({ type: 'Judge', searchText: 'John' });
    tick(100);
    fixture.detectChanges();

    expect(component.querySignal().type).toBe('Judge');
    expect(component.querySignal().searchText).toBe('John');

    component.handleInputText({ type: 'Recorder', searchText: 'Jane' });
    tick(100);
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

    const suggestions = component.suggestionsResource.value() ?? [];
    expect(suggestions).toEqual([]);
  }));
});

@Component({
  selector: 'judiciary-autosuggest-control',
  template: `<div>{{ name }} - {{ label }} - {{ selectedJudiciary | json }}</div>`,
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
  @Input() name!: string;
  @Input() label!: string;
  @Input() judiciaryType!: string | null;
  @Input() suggestions!: JudiciaryWithSpecialisms[];
  @Input() required!: boolean;
  @Input() errorMessagesInput!: Array<{ rule: string; message: string }>;
  @Output() inputText = new EventEmitter<{ type: string; searchText: string }>();
  @Output() onAddSpecialism = new EventEmitter<void>();

  selectedJudiciary: JudiciaryWithSpecialisms | null = null;

  writeValue(value: JudiciaryWithSpecialisms | null): void {
    this.selectedJudiciary = value;
  }

  registerOnChange(_fn: (value: JudiciaryWithSpecialisms | null) => void): void {}

  registerOnTouched(_fn: () => void): void {}
}
