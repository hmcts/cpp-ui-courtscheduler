import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, input, output, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { provideRouter, Routes } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AddSittingDaysContainer } from '../add-sitting-days/add-sitting-days.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { AddSittingDaysFormComponent } from '../../components/add-sitting-days-form/add-sitting-days-form.component';
import { DraftItinerary } from '../../model/judicial-itinerary.interface';
import { SelectedCourtAndJudiciaryDetailsComponent } from '../../components/selected-court-and-judiciary-details/selected-court-and-judiciary-details.component';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { AddSittingDaysRoutes } from '../add-sitting-days/add-sitting-days.routes';
import { DayOfWeek } from '../../../../shared/model/days';
import { SessionType } from '../../../../shared/model/session';
import { OrganisationUnit } from '@cpp/reference-data';
import { ValidationError } from '@cpp/pdk';
import { Specialism } from '../../model/specialism.enum';

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
        path: JudicialItineraryRoutes.ADD_SITTING_DAYS,
        component: MockRouteComponent,
        children: [
          {
            path: AddSittingDaysRoutes.CHECK_ANSWERS,
            component: MockRouteComponent
          }
        ]
      }
    ]
  }
];

@Component({
  selector: 'add-sitting-days-form',
  template: `<div>Mock Add Sitting Days Form - Initial Values: {{ initialValues() | json }}</div>`,
  imports: [JsonPipe]
})
class MockAddSittingDaysFormComponent {
  readonly initialValues = input<DraftItinerary | null>(null);
  readonly serverSubmissionErrorMessage = input<string | null>(null);
  readonly submitForm = output<DraftItinerary>();
  readonly errors = output<ValidationError[] | null>();
  readonly clearForm = output<void>();
}

@Component({
  selector: 'selected-court-and-judiciary-details',
  template: `<div>
    Mock Selected Court Details - Court: {{ courtCentre() | json }}, Type:
    {{ selectedType() | json }}, Judiciary: {{ selectedJudiciary() | json }}, Specialisms:
    {{ existingSpecialisms() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockSelectedCourtAndJudiciaryDetailsComponent {
  readonly courtCentre = input<OrganisationUnit | null>(null);
  readonly selectedType = input<string | null>(null);
  readonly selectedJudiciary = input<any>(null);
  readonly existingSpecialisms = input<Specialism[]>([]);
}

@Component({
  selector: 'app-test-host',
  template: `<add-sitting-days-container></add-sitting-days-container>`,
  imports: [AddSittingDaysContainer]
})
class TestHostComponent {}

const mockCourtCentre: OrganisationUnit = {
  id: 'court-1',
  oucode: 'OU001',
  oucodeL3Code: 'L3-001',
  oucodeL3Name: 'Test Court',
  oucodeL2Code: 'L2-001',
  oucodeL2Name: 'Test Region',
  oucodeL1Code: 'L1-001',
  oucodeL1Name: 'Test Area',
  region: 'Test Region',
  emailAddress: 'test@example.com'
} as unknown as OrganisationUnit;

const mockJudiciary = {
  id: 'judge-1',
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge'
};

class MockManageJudicialItineraryStore {
  readonly searchParams = {
    courtCentre: signal<OrganisationUnit | null>(null),
    startDate: signal<string | null>(null),
    endDate: signal<string | null>(null)
  };
  readonly selectedType = signal<string | null>(null);
  readonly selectedJudiciary = signal<any>(null);
  readonly selectedJudiciarySpecialisms = signal<Specialism[]>([]);
  readonly draftItinerary = signal({
    availability: {
      startDate: null as string | null,
      endDate: null as string | null
    },
    sittingDays: [] as DayOfWeek[],
    session: null as SessionType | null
  });
  readonly serverSubmissionError = signal({
    message: undefined as string | undefined,
    isSourceForm: undefined as boolean | undefined,
    linkText: undefined as string | undefined,
    linkAction: undefined as (() => void) | undefined
  });
  readonly setDraftItinerary = jest.fn();
  readonly resetUpsertJudiciaryItineraryState = jest.fn();
  readonly clearServerSubmissionError = jest.fn();
  readonly setServerSubmissionError = jest.fn();
  readonly handleError = jest.fn();
  readonly validateAddItinerary = jest.fn();
  readonly clearSpecialismAddedSuccess = jest.fn();
}

describe('AddSittingDaysContainer', () => {
  let component: AddSittingDaysContainer;
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

    TestBed.overrideComponent(AddSittingDaysContainer, {
      remove: {
        imports: [AddSittingDaysFormComponent, SelectedCourtAndJudiciaryDetailsComponent]
      },
      add: {
        imports: [MockAddSittingDaysFormComponent, MockSelectedCourtAndJudiciaryDetailsComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(By.directive(AddSittingDaysContainer)).componentInstance;
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
    store.searchParams.courtCentre.set(mockCourtCentre);
    store.selectedType.set('Circuit Judge');
    store.selectedJudiciary.set(mockJudiciary);
    store.selectedJudiciarySpecialisms.set([Specialism.MURDER, Specialism.ATTEMPTEDMURDER]);
    store.draftItinerary.set({
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      },
      sittingDays: [DayOfWeek.Monday, DayOfWeek.Wednesday],
      session: 'AD' as SessionType
    });
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should call clearServerSubmissionError, setDraftItinerary and validateAddItinerary when handleSubmitForm is called', () => {
    expect.assertions(3);

    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      },
      sittingDays: [DayOfWeek.Monday],
      session: 'AD' as SessionType
    };

    component.handleSubmitForm(formValues);

    expect(store.clearServerSubmissionError).toHaveBeenCalled();
    expect(store.setDraftItinerary).toHaveBeenCalledWith(formValues);
    expect(store.validateAddItinerary).toHaveBeenCalledWith(
      expect.objectContaining({
        onValidateDone: expect.any(Function)
      })
    );
  });

  it('should navigate when validateAddItinerary callback is called with no error', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');
    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      },
      sittingDays: [DayOfWeek.Monday],
      session: 'AD' as SessionType
    };

    store.validateAddItinerary.mockImplementation(({ onValidateDone }) => {
      onValidateDone(undefined);
    });

    component.handleSubmitForm(formValues);

    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.ADD_SITTING_DAYS,
      AddSittingDaysRoutes.CHECK_ANSWERS
    ]);
  });

  it('should set serverSubmissionError when validateAddItinerary callback is called with 422 error', () => {
    expect.assertions(1);

    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      },
      sittingDays: [DayOfWeek.Monday],
      session: 'AD' as SessionType
    };

    const mockError = new HttpErrorResponse({
      status: 422,
      error: JSON.stringify({
        validationResult: {
          status: 'FAILURE',
          validationError: 'Validation error'
        }
      })
    });

    store.validateAddItinerary.mockImplementation(({ onValidateDone }) => {
      onValidateDone(mockError);
    });

    component.handleSubmitForm(formValues);

    expect(store.setServerSubmissionError).toHaveBeenCalledWith(
      expect.objectContaining({
        validationResult: expect.objectContaining({
          validationError: 'Validation error'
        })
      }),
      true
    );
  });

  it('should call handleError when validateAddItinerary callback is called with non-422 error', () => {
    expect.assertions(1);

    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      },
      sittingDays: [DayOfWeek.Monday],
      session: 'AD' as SessionType
    };

    const mockError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });

    store.validateAddItinerary.mockImplementation(({ onValidateDone }) => {
      onValidateDone(mockError);
    });

    component.handleSubmitForm(formValues);

    expect(store.handleError).toHaveBeenCalledWith(mockError);
  });

  it('should return null for serverSubmissionErrorMessage when isSourceForm is false', () => {
    expect.assertions(1);

    store.serverSubmissionError.set({
      message: 'Error message',
      isSourceForm: false,
      linkText: undefined,
      linkAction: undefined
    });
    fixture.detectChanges();

    expect(component.serverSubmissionErrorMessage()).toBeNull();
  });

  it('should return message for serverSubmissionErrorMessage when isSourceForm is true', () => {
    expect.assertions(1);

    store.serverSubmissionError.set({
      message: 'Error message',
      isSourceForm: true,
      linkText: undefined,
      linkAction: undefined
    });
    fixture.detectChanges();

    expect(component.serverSubmissionErrorMessage()).toBe('Error message');
  });

  it('should return null for serverSubmissionErrorMessage when message is undefined', () => {
    expect.assertions(1);

    store.serverSubmissionError.set({
      message: undefined,
      isSourceForm: true,
      linkText: undefined,
      linkAction: undefined
    });
    fixture.detectChanges();

    expect(component.serverSubmissionErrorMessage()).toBeNull();
  });

  it('should call store.resetUpsertJudiciaryItineraryState when handleClearForm is called', () => {
    expect.assertions(1);

    component.handleClearForm();

    expect(store.resetUpsertJudiciaryItineraryState).toHaveBeenCalled();
  });

  it('should navigate back when handleBackLink is called', () => {
    expect.assertions(1);

    const backSpy = jest.spyOn(location, 'back');

    component.handleBackLink();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should call clearSpecialismAddedSuccess and clearServerSubmissionError when component is destroyed', () => {
    expect.assertions(2);

    fixture.destroy();

    expect(store.clearSpecialismAddedSuccess).toHaveBeenCalled();
    expect(store.clearServerSubmissionError).toHaveBeenCalled();
  });
});
