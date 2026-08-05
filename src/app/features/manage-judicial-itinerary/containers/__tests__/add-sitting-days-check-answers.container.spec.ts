import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { provideRouter, Routes } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AddSittingDaysCheckAnswersContainer } from '../add-sitting-days-check-answers/add-sitting-days-check-answers.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { SelectedCourtAndJudiciaryDetailsComponent } from '../../components/selected-court-and-judiciary-details/selected-court-and-judiciary-details.component';
import { Specialism } from '../../model/specialism.enum';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { AddSittingDaysRoutes } from '../add-sitting-days/add-sitting-days.routes';
import { SessionType } from '../../../../shared/model/session';
import { DayOfWeek } from '../../../../shared/model/days';
import { OrganisationUnit, JudicialMemberNamePipe } from '@cpp/reference-data';

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
            path: '',
            component: MockRouteComponent
          }
        ]
      }
    ]
  }
];

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
  readonly draftItinerary = {
    availability: {
      startDate: signal<string | null>(null),
      endDate: signal<string | null>(null)
    },
    sittingDays: signal<DayOfWeek[]>([]),
    session: signal<SessionType | null>(null)
  };
  readonly normalisedSittingDays = signal<string[]>([]);
  readonly addItinerary = jest.fn();
  readonly clearServerSubmissionError = jest.fn();
  readonly clearSpecialismAddedSuccess = jest.fn();
  readonly resetUpsertJudiciaryItineraryState = jest.fn();
  readonly setSuccessMessage = jest.fn();
  readonly clearJudiciarySelection = jest.fn();
  readonly resetPaginatedItineraries = jest.fn();
  readonly setServerSubmissionError = jest.fn();
  readonly handleError = jest.fn();
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
  template: `<add-sitting-days-check-answers-container></add-sitting-days-check-answers-container>`,
  imports: [AddSittingDaysCheckAnswersContainer]
})
class TestHostComponent {}

describe('AddSittingDaysCheckAnswersContainer', () => {
  let component: AddSittingDaysCheckAnswersContainer;
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
        provideRouter(mockRoutes),
        JudicialMemberNamePipe
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    TestBed.overrideComponent(AddSittingDaysCheckAnswersContainer, {
      remove: {
        imports: [SelectedCourtAndJudiciaryDetailsComponent]
      },
      add: {
        imports: [MockSelectedCourtAndJudiciaryDetailsComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(
      By.directive(AddSittingDaysCheckAnswersContainer)
    ).componentInstance;
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
    store.draftItinerary.availability.startDate.set('2026-01-01');
    store.draftItinerary.availability.endDate.set('2026-01-31');
    store.draftItinerary.session.set('AD' as SessionType);
    store.draftItinerary.sittingDays.set([DayOfWeek.Monday, DayOfWeek.Wednesday]);
    store.normalisedSittingDays.set(['MONDAY', 'WEDNESDAY']);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should format sitting days correctly', () => {
    expect.assertions(1);

    store.normalisedSittingDays.set(['MONDAY', 'TUESDAY', 'WEDNESDAY']);
    fixture.detectChanges();

    expect(component.formattedSittingDays()).toBe('MONDAY, TUESDAY, WEDNESDAY');
  });

  it('should call store.addItinerary with callbacks when handleContinueAndAdd is called', () => {
    expect.assertions(1);

    component.handleContinueAndAdd();

    expect(store.addItinerary).toHaveBeenCalledWith(
      expect.objectContaining({
        onAddSuccess: expect.any(Function),
        onError: expect.any(Function)
      })
    );
  });

  it('should execute onAddSuccess callback actions on successful add', () => {
    expect.assertions(5);

    const navigateSpy = jest.spyOn(router, 'navigate');
    store.addItinerary.mockImplementation(({ onAddSuccess }) => {
      if (onAddSuccess) {
        onAddSuccess();
      }
    });

    component.handleContinueAndAdd();

    expect(store.resetUpsertJudiciaryItineraryState).toHaveBeenCalled();
    expect(store.setSuccessMessage).toHaveBeenCalled();
    expect(store.clearJudiciarySelection).toHaveBeenCalled();
    expect(store.resetPaginatedItineraries).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.ADD_SITTING_DAYS,
      AddSittingDaysRoutes.SUCCESS
    ]);
  });

  it('should execute onError callback with 422 error handling', () => {
    expect.assertions(2);

    const mockError = new HttpErrorResponse({
      status: 422,
      error: JSON.stringify({
        validationResult: {
          status: 'FAILURE',
          validationError: 'Validation failed'
        }
      })
    });

    store.addItinerary.mockImplementation(({ onError }) => {
      if (onError) {
        onError(mockError);
      }
    });

    component.handleContinueAndAdd();

    expect(store.setServerSubmissionError).toHaveBeenCalledWith(
      expect.objectContaining({
        validationResult: expect.objectContaining({
          validationError: 'Validation failed'
        })
      }),
      false,
      'Go back to add itinerary form',
      expect.any(Function)
    );
    expect(store.handleError).not.toHaveBeenCalled();
  });

  it('should execute onError callback with non-422 error handling', () => {
    expect.assertions(2);

    const mockError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });

    store.addItinerary.mockImplementation(({ onError }) => {
      if (onError) {
        onError(mockError);
      }
    });

    component.handleContinueAndAdd();

    expect(store.handleError).toHaveBeenCalledWith(mockError);
    expect(store.setServerSubmissionError).not.toHaveBeenCalled();
  });

  it('should navigate to add-sitting-days form when handleNavigateToForm is called', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleNavigateToForm();

    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.ADD_SITTING_DAYS
    ]);
  });

  it('should navigate back when handleBackLink is called', () => {
    expect.assertions(1);

    const backSpy = jest.spyOn(location, 'back');

    component.handleBackLink();

    expect(backSpy).toHaveBeenCalled();
  });
});
