import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, input, output, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { provideRouter, Routes } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { AddSpecialismsContainer } from '../add-specialisms/add-specialisms.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import {
  AddSpecialismsFormComponent,
  AddSpecialismsFormValues
} from '../../components/add-specialisms-form/add-specialisms-form.component';
import { JudiciaryDetailsComponent } from '../../components/judiciary-details/judiciary-details.component';
import { Specialism } from '../../model/specialism.enum';
import { ValidationError } from '@cpp/pdk';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';

@Component({
  selector: 'app-mock-route',
  template: `<div>Mock Route</div>`
})
class MockRouteComponent {}

const mockRoutes: Routes = [
  {
    path: CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
    component: MockRouteComponent,
    children: [
      {
        path: JudicialItineraryRoutes.ADD_SPECIALISMS,
        component: MockRouteComponent,
        children: [
          {
            path: 'specialism-check-answers',
            component: MockRouteComponent
          }
        ]
      }
    ]
  }
];

@Component({
  selector: 'add-specialisms-form',
  template: `<div>
    Mock Add Specialisms Form - Existing: {{ existingSpecialisms() | json }}, Initial:
    {{ initialValues() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockAddSpecialismsFormComponent {
  readonly existingSpecialisms = input.required<Specialism[]>();
  readonly initialValues = input<AddSpecialismsFormValues | null>(null);
  readonly submitForm = output<AddSpecialismsFormValues>();
  readonly errors = output<ValidationError[] | null>();
}

@Component({
  selector: 'judiciary-details',
  template: `<div>
    Mock Judiciary Details - Type: {{ selectedType() | json }}, Judiciary:
    {{ selectedJudiciary() | json }}, Specialisms: {{ existingSpecialisms() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockJudiciaryDetailsComponent {
  readonly selectedType = input.required<any>();
  readonly selectedJudiciary = input.required<any>();
  readonly existingSpecialisms = input.required<Specialism[]>();
  readonly hideSpecialismsAction = input<boolean>(false);
}

@Component({
  selector: 'app-test-host',
  template: `<add-specialisms-container></add-specialisms-container>`,
  imports: [AddSpecialismsContainer]
})
class TestHostComponent {}

const mockJudiciary = {
  id: 'judge-1',
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge'
};

class MockManageJudicialItineraryStore {
  readonly selectedType = signal<string | null>(null);
  readonly selectedJudiciary = signal<any>(null);
  readonly selectedJudiciarySpecialisms = signal<Specialism[]>([]);
  readonly draftSpecialisms = signal<Specialism[]>([]);
  readonly setDraftSpecialisms = jest.fn();
  readonly setFormErrors = jest.fn();
  readonly formErrors = signal<ValidationError[]>([]);
  readonly resetJudiciarySpecialismsState = jest.fn();
}

describe('AddSpecialismsContainer', () => {
  let component: AddSpecialismsContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let store: MockManageJudicialItineraryStore;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    store = new MockManageJudicialItineraryStore();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ManageJudicialItineraryStore,
          useValue: store
        },
        provideRouter(mockRoutes)
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    TestBed.overrideComponent(AddSpecialismsContainer, {
      remove: {
        imports: [AddSpecialismsFormComponent, JudiciaryDetailsComponent]
      },
      add: {
        imports: [MockAddSpecialismsFormComponent, MockJudiciaryDetailsComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(By.directive(AddSpecialismsContainer)).componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    store.selectedType.set('Circuit Judge');
    store.selectedJudiciary.set(mockJudiciary);
    store.selectedJudiciarySpecialisms.set([Specialism.MURDER, Specialism.ATTEMPTEDMURDER]);
    store.draftSpecialisms.set([Specialism.MURDER]);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should call store.setDraftSpecialisms and navigate when handleSubmitForm is called', () => {
    expect.assertions(2);

    const navigateSpy = jest.spyOn(router, 'navigate');
    const formValues: AddSpecialismsFormValues = {
      selectedSpecialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
    };

    component.handleSubmitForm(formValues);

    expect(store.setDraftSpecialisms).toHaveBeenCalledWith([
      Specialism.MURDER,
      Specialism.ATTEMPTEDMURDER
    ]);
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should navigate back when handleBackLink is called', () => {
    expect.assertions(1);

    const backSpy = jest.spyOn(location, 'back');

    component.handleBackLink();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should compute initialFormValues from store.draftSpecialisms', () => {
    expect.assertions(1);

    store.draftSpecialisms.set([Specialism.MURDER, Specialism.ATTEMPTEDMURDER]);
    fixture.detectChanges();

    const initialValues = component.initialFormValues();
    expect(initialValues).toEqual({
      selectedSpecialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
    });
  });

  it('should compute initialFormValues with empty array when draftSpecialisms is empty', () => {
    expect.assertions(1);

    store.draftSpecialisms.set([]);
    fixture.detectChanges();

    const initialValues = component.initialFormValues();
    expect(initialValues).toEqual({
      selectedSpecialisms: []
    });
  });

  it('should call store.setFormErrors when form emits errors', () => {
    expect.assertions(1);

    const mockErrors: ValidationError[] = [
      {
        id: 'field1',
        message: 'Error message 1'
      }
    ];

    const formComponent = fixture.debugElement.query(
      By.directive(MockAddSpecialismsFormComponent)
    ).componentInstance;

    formComponent.errors.emit(mockErrors);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith(mockErrors);
  });

  it('should call store.setFormErrors with empty array when form emits null errors', () => {
    expect.assertions(1);

    const formComponent = fixture.debugElement.query(
      By.directive(MockAddSpecialismsFormComponent)
    ).componentInstance;

    formComponent.errors.emit(null);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith([]);
  });
});
