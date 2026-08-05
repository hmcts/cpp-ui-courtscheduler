import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CppHttp } from '@cpp/core';
import { of } from 'rxjs';
import { SelectJudiciaryTypeContainer } from '../select-judiciary-type/select-judiciary-type.container';
import { SelectJudiciaryTypeFormComponent } from '../../components/select-judiciary-type-form/select-judiciary-type-form.component';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { ExtractSignalStoreFeatureResult } from '../../../../shared/types/signal-test-types';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { ValidationError } from '@cpp/pdk';

@Component({
  selector: 'app-test-host',
  template: ` <select-judiciary-type-container></select-judiciary-type-container> `,
  imports: [SelectJudiciaryTypeContainer]
})
class TestHostComponent {}

describe('SelectJudiciaryTypeContainer', () => {
  let component: SelectJudiciaryTypeContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let store: ExtractSignalStoreFeatureResult<typeof ManageJudicialItineraryStore>;
  let router: Router;

  const mockJudiciary: JudiciaryWithSpecialisms = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER]
  } as unknown as JudiciaryWithSpecialisms;

  beforeEach(() => {
    const mockCppHttp = {
      query: jest.fn().mockReturnValue(of({})),
      command: jest.fn().mockReturnValue(of({})),
      commandSync: jest.fn().mockReturnValue(of({}))
    };

    TestBed.configureTestingModule({
      providers: [
        ManageJudicialItineraryStore,
        JudicialMemberNamePipe,
        provideRouter([
          {
            path: CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
            component: {} as any,
            children: [
              { path: JudicialItineraryRoutes.ADD_SITTING_DAYS, component: {} as any },
              { path: JudicialItineraryRoutes.ADD_SPECIALISMS, component: {} as any }
            ]
          }
        ]),
        provideMockStore({
          initialState: {}
        }),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CppHttp,
          useValue: mockCppHttp
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(SelectJudiciaryTypeContainer, {
      remove: {
        imports: [SelectJudiciaryTypeFormComponent]
      },
      add: {
        imports: [MockSelectJudiciaryTypeFormComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(
      By.directive(SelectJudiciaryTypeContainer)
    ).componentInstance;
    store = TestBed.inject(ManageJudicialItineraryStore);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);
    store.setSelectedJudiciary(mockJudiciary);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should compute initialFormValues when store has selectedType and selectedJudiciary', () => {
    expect.assertions(1);
    store.setSelectedJudiciary(mockJudiciary);

    const initialValues = component.initialFormValues();
    expect(initialValues).toEqual({
      judiciaryType: 'Judge',
      judiciary: mockJudiciary
    });
  });

  it('should return null for initialFormValues when store has no selectedType', () => {
    expect.assertions(1);
    store.clearJudiciarySelection();

    const initialValues = component.initialFormValues();
    expect(initialValues).toBeNull();
  });

  it('should return null for initialFormValues when store has no selectedJudiciary', () => {
    expect.assertions(1);
    store.setSelectedJudiciary(null);

    const initialValues = component.initialFormValues();
    expect(initialValues).toBeNull();
  });

  it('should handle form submission and navigate to add-sitting-days', () => {
    expect.assertions(2);
    const navigateSpy = jest.spyOn(router, 'navigate');
    const formValues = {
      judiciaryType: 'Judge' as const,
      judiciary: mockJudiciary
    };

    component.handleSubmitForm(formValues);

    expect(store.selectedType()).toBe('Judge');
    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.ADD_SITTING_DAYS
    ]);
  });

  it('should handle addSpecialism event and navigate with query params', () => {
    expect.assertions(3);
    const navigateSpy = jest.spyOn(router, 'navigate');
    Object.defineProperty(router, 'url', {
      value: '/current-url',
      writable: true
    });

    const formValues = {
      judiciaryType: 'Judge' as const,
      judiciary: mockJudiciary
    };

    component.handleAddSpecialism(formValues);

    expect(store.selectedType()).toBe('Judge');
    expect(navigateSpy).toHaveBeenCalledWith(
      [CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY, JudicialItineraryRoutes.ADD_SPECIALISMS],
      { queryParams: { referrer: '/current-url' } }
    );
    expect(store.selectedJudiciary()).toEqual(mockJudiciary);
  });

  it('should call store.setFormErrors when form emits errors', () => {
    expect.assertions(1);
    const mockErrors: ValidationError[] = [{ id: 'field1', message: 'Field is required' }];

    const formComponent = fixture.debugElement.query(
      By.directive(MockSelectJudiciaryTypeFormComponent)
    ).componentInstance;
    formComponent.errors.emit(mockErrors);
    fixture.detectChanges();

    expect(store.formErrors()).toEqual(mockErrors);
  });

  it('should call store.setFormErrors with empty array when form emits null errors', () => {
    expect.assertions(1);

    const formComponent = fixture.debugElement.query(
      By.directive(MockSelectJudiciaryTypeFormComponent)
    ).componentInstance;
    formComponent.errors.emit(null);
    fixture.detectChanges();

    expect(store.formErrors()).toEqual([]);
  });

  it('should navigate back when handleBackLink is called', () => {
    expect.assertions(1);
    const location = TestBed.inject(Location);
    const backSpy = jest.spyOn(location, 'back');

    component.handleBackLink();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should call clearSpecialismAddedSuccess when handleSubmitForm is called', () => {
    expect.assertions(1);
    const formValues = {
      judiciaryType: 'Judge' as const,
      judiciary: mockJudiciary
    };

    store.setDraftSpecialisms([Specialism.MURDER]);
    store.addSpecialisms({});

    component.handleSubmitForm(formValues);

    expect(store.specialismAddedSuccess()).toBe(false);
  });

  it('should call clearSpecialismAddedSuccess when handleAddSpecialism is called', () => {
    expect.assertions(1);
    Object.defineProperty(router, 'url', {
      value: '/current-url',
      writable: true
    });

    store.setDraftSpecialisms([Specialism.MURDER]);
    store.addSpecialisms({});

    component.handleAddSpecialism({ judiciaryType: 'Judge', judiciary: mockJudiciary });

    expect(store.specialismAddedSuccess()).toBe(false);
  });

  it('should call clearSpecialismAddedSuccess when component is destroyed', () => {
    expect.assertions(1);

    fixture.destroy();

    expect(store.specialismAddedSuccess()).toBe(false);
  });
});

@Component({
  selector: 'select-judiciary-type-form',
  template: `
    <div>
      <div>Initial Values: {{ initialValues | json }}</div>
    </div>
  `,
  imports: [JsonPipe]
})
class MockSelectJudiciaryTypeFormComponent {
  @Input() initialValues: any;
  @Output() submitForm = new EventEmitter();
  @Output() errors = new EventEmitter();
  @Output() addSpecialism = new EventEmitter();
}
