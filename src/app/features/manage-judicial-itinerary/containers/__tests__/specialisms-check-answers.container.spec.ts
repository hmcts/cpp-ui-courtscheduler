import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter, Routes } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { SpecialismsCheckAnswersContainer } from '../specialisms-check-answers/specialisms-check-answers.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { JudiciaryDetailsComponent } from '../../components/judiciary-details/judiciary-details.component';
import {
  SpecialismAddedConfirmationFormComponent,
  SpecialismAddedConfirmationFormValues
} from '../../components/specialism-added-confirmation-form/specialism-added-confirmation-form.component';
import { Specialism } from '@cpp/reference-data';
import { ValidationError } from '@cpp/pdk';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';

const mockQueryParamsSignal = signal<Record<string, any>>({});
const mockNavigationStartEvent = signal(null);
const mockNavigationEndEvent = signal(null);
const mockNavigationEvent = signal(null);
const mockGetParams = signal({});

jest.mock('../../../../../shared-signals/router-signals', () => ({
  createRouterSignals: jest.fn(() => ({
    navigationStartEvent: mockNavigationStartEvent,
    navigationEndEvent: mockNavigationEndEvent,
    navigationEvent: mockNavigationEvent,
    getParam: jest.fn(),
    getParams: mockGetParams,
    getQueryParam: jest.fn(),
    getQueryParams: mockQueryParamsSignal,
    activatedRoute: {} as any
  }))
}));

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
  selector: 'judiciary-details',
  template: `<div>
    Mock Judiciary Details - Type: {{ selectedType() | json }}, Judiciary:
    {{ selectedJudiciary() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockJudiciaryDetailsComponent {
  readonly selectedType = input.required<any>();
  readonly selectedJudiciary = input.required<any>();
  readonly hideSpecialismsAction = input<boolean>(true);
}

@Component({
  selector: 'specialism-added-confirmation-form',
  template: `<div>
    Mock Specialism Added Confirmation Form - Draft: {{ draftSpecialisms() | json }}, Initial:
    {{ initialValues() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockSpecialismAddedConfirmationFormComponent {
  readonly draftSpecialisms = input.required<Specialism[]>();
  readonly initialValues = input<any>(null);
  readonly submitForm = output<void>();
  readonly errors = output<ValidationError[] | null>();
  readonly onChange = output<void>();
}

@Component({
  selector: 'app-test-host',
  template: `<specialisms-check-answers-container></specialisms-check-answers-container>`,
  imports: [SpecialismsCheckAnswersContainer]
})
class TestHostComponent {}

const mockJudiciary = {
  id: 'judge-1',
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge',
  specialisms: [] as Specialism[]
};

class MockManageJudicialItineraryStore {
  readonly firstSelectedJudiciaryType = signal<string | null>(null);
  readonly firstSelectedJudiciary = signal<any>(null);
  readonly draftSpecialisms = signal<Specialism[]>([]);
  readonly setDraftSpecialisms = jest.fn();
  readonly addSpecialisms = jest.fn();
  readonly setFormErrors = jest.fn();
  readonly formErrors = signal<ValidationError[]>([]);
}

describe('SpecialismsCheckAnswersContainer', () => {
  let component: SpecialismsCheckAnswersContainer;
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

    TestBed.overrideComponent(SpecialismsCheckAnswersContainer, {
      remove: {
        imports: [JudiciaryDetailsComponent, SpecialismAddedConfirmationFormComponent]
      },
      add: {
        imports: [MockJudiciaryDetailsComponent, MockSpecialismAddedConfirmationFormComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(
      By.directive(SpecialismsCheckAnswersContainer)
    ).componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    (component.routerSignals as any).getQueryParams = mockQueryParamsSignal;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockQueryParamsSignal.set({});
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    store.firstSelectedJudiciaryType.set('Judge');
    store.firstSelectedJudiciary.set({
      ...mockJudiciary,
      specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
    });
    store.draftSpecialisms.set([Specialism.MURDER, Specialism.SEXUALOFFENCE]);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should navigate back when handleBackLink is called', () => {
    expect.assertions(1);

    const backSpy = jest.spyOn(location, 'back');

    component.handleBackLink();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should navigate to parent route when handleChange is called', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleChange();

    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should clear draftSpecialisms and navigate back when confirmation is false', () => {
    expect.assertions(2);

    const backSpy = jest.spyOn(location, 'back');
    const formValues: SpecialismAddedConfirmationFormValues = {
      confirmation: false
    };

    component.handleSubmitForm(formValues);

    expect(store.setDraftSpecialisms).toHaveBeenCalledWith([]);
    expect(backSpy).toHaveBeenCalled();
  });

  it('should call store.addSpecialisms when confirmation is true', () => {
    expect.assertions(1);

    const formValues: SpecialismAddedConfirmationFormValues = {
      confirmation: true
    };

    component.handleSubmitForm(formValues);

    expect(store.addSpecialisms).toHaveBeenCalled();
  });

  it('should navigate to referrer when confirmation is false and referrer exists', () => {
    expect.assertions(2);

    const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
    const formValues: SpecialismAddedConfirmationFormValues = {
      confirmation: false
    };

    mockQueryParamsSignal.set({ referrer: '/previous-url' });

    component.handleSubmitForm(formValues);

    expect(store.setDraftSpecialisms).toHaveBeenCalledWith([]);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/previous-url');
  });

  it('should call store.addSpecialisms with referrer when confirmation is true and referrer exists', () => {
    expect.assertions(1);

    const formValues: SpecialismAddedConfirmationFormValues = {
      confirmation: true
    };

    mockQueryParamsSignal.set({ referrer: '/previous-url' });

    component.handleSubmitForm(formValues);

    expect(store.addSpecialisms).toHaveBeenCalledWith({ referrer: '/previous-url' });
  });

  it('should compute referrer from query params', () => {
    expect.assertions(1);

    mockQueryParamsSignal.set({ referrer: '/test-url' });

    const referrer = component.referrer();
    expect(referrer).toBe('/test-url');
  });

  it('should return null for referrer when query params do not contain referrer', () => {
    expect.assertions(1);

    mockQueryParamsSignal.set({});

    const referrer = component.referrer();
    expect(referrer).toBeNull();
  });

  it('should have initialFormValues as null', () => {
    expect.assertions(1);
    expect(component.initialFormValues()).toBeNull();
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
      By.directive(MockSpecialismAddedConfirmationFormComponent)
    ).componentInstance;

    formComponent.errors.emit(mockErrors);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith(mockErrors);
  });

  it('should call store.setFormErrors with empty array when form emits null errors', () => {
    expect.assertions(1);

    const formComponent = fixture.debugElement.query(
      By.directive(MockSpecialismAddedConfirmationFormComponent)
    ).componentInstance;

    formComponent.errors.emit(null);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith([]);
  });
});
