import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, computed, input, output, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { EditJudicialItineraryContainer } from '../edit-judicial-itinerary/edit-judicial-itinerary.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { JudiciaryDetailsComponent } from '../../components/judiciary-details/judiciary-details.component';
import { EditJudicialItineraryFormComponent } from '../../components/edit-judicial-itinerary-form/edit-judicial-itinerary-form.component';
import { DraftItinerary } from '../../model/judicial-itinerary.interface';
import { ValidationError } from '@cpp/pdk';
import { EditJudicialItineraryRoutes } from '../edit-judicial-itinerary/edit-judicial-itinerary.routes';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { JudiciaryTypePayload, JudicialMemberNamePipe } from '@cpp/reference-data';
import { Specialism } from '@cpp/reference-data';
import { ExtendedJudicialMember } from '../../../../shared/model';

@Component({
  selector: 'judiciary-details',
  template: `<div>
    Mock - Type: {{ selectedType() | json }}, Judiciary: {{ selectedJudiciary() | json }},
    HideSpecialisms: {{ hideSpecialismsAction() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockJudiciaryDetailsComponent {
  readonly selectedType = input<string | null>(null);
  readonly selectedJudiciary = input<any>(null);
  readonly existingSpecialisms = input<any[]>([]);
  readonly hideSpecialismsAction = input<boolean>(true);
}

@Component({
  selector: 'edit-judicial-itinerary-form',
  template: `<div>
    Mock - Initial Values: {{ initialValues() | json }}, Error:
    {{ serverSubmissionErrorMessage() | json }}
  </div>`,
  imports: [JsonPipe]
})
class MockEditJudicialItineraryFormComponent {
  readonly initialValues = input<DraftItinerary | null>(null);
  readonly serverSubmissionErrorMessage = input<string | null>(null);
  readonly submitForm = output<DraftItinerary>();
  readonly errors = output<ValidationError[] | null>();
}

class MockManageJudicialItineraryStore {
  readonly selectedJudiciaries = signal<ExtendedJudicialMember[] | null>([
    {
      id: 'judge-1',
      surname: 'Smith',
      forenames: 'John',
      judiciaryType: 'Circuit Judge'
    } as ExtendedJudicialMember
  ]);
  readonly selectedJudiciaryTypes = signal<JudiciaryTypePayload[] | null>(['Judge']);
  readonly firstSelectedJudiciary = computed(() => this.selectedJudiciaries()?.[0] ?? null);
  readonly firstSelectedJudiciaryType = computed(() => this.selectedJudiciaryTypes()?.[0] ?? null);
  readonly selectedItinerary = signal<any>({
    id: 'itinerary-1'
  });
  readonly editItinerary = signal<DraftItinerary | null>({
    availability: {
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    },
    sittingDays: [],
    session: 'AD',
    unavailabilities: []
  });
  readonly serverSubmissionError = signal({
    message: undefined as string | undefined,
    isSourceForm: undefined as boolean | undefined,
    linkText: undefined as string | undefined,
    linkAction: undefined as (() => void) | undefined
  });
  readonly updateItinerary = jest.fn();
  readonly setDraftItinerary = jest.fn();
  readonly clearUpsertItinerary = jest.fn();
  readonly clearServerSubmissionError = jest.fn();
  readonly clearSpecialismAddedSuccess = jest.fn();
  readonly setFormErrors = jest.fn();
  readonly resetUpsertJudiciaryItineraryState = jest.fn();
  readonly setSuccessMessage = jest.fn();
  readonly clearJudiciarySelection = jest.fn();
  readonly setSelectedItinerary = jest.fn();
  readonly resetPaginatedItineraries = jest.fn();
  readonly setServerSubmissionError = jest.fn();
  readonly handleError = jest.fn();
}

describe('EditJudicialItineraryContainer', () => {
  let component: EditJudicialItineraryContainer;
  let fixture: ComponentFixture<EditJudicialItineraryContainer>;
  let store: MockManageJudicialItineraryStore;
  let location: Location;
  let router: Router;

  beforeEach(() => {
    store = new MockManageJudicialItineraryStore();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ManageJudicialItineraryStore,
          useValue: store
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: signal({ id: 'itinerary-1' })
          }
        },
        JudicialMemberNamePipe
      ],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(EditJudicialItineraryContainer, {
      remove: {
        imports: [JudiciaryDetailsComponent, EditJudicialItineraryFormComponent]
      },
      add: {
        imports: [MockJudiciaryDetailsComponent, MockEditJudicialItineraryFormComponent]
      }
    });

    fixture = TestBed.createComponent(EditJudicialItineraryContainer);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
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

  it('should pass editItinerary from store to form component', () => {
    expect.assertions(1);

    const mockDraft: DraftItinerary = {
      availability: {
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      },
      sittingDays: [],
      session: 'AM',
      unavailabilities: []
    };

    store.editItinerary.set(mockDraft);
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      (el) => el.name === 'edit-judicial-itinerary-form'
    )?.componentInstance as MockEditJudicialItineraryFormComponent;

    expect(formComponent.initialValues()).toEqual(mockDraft);
  });

  it('should pass null initialValues to form component when store.editItinerary is null', () => {
    expect.assertions(1);

    store.editItinerary.set(null);
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      (el) => el.name === 'edit-judicial-itinerary-form'
    )?.componentInstance as MockEditJudicialItineraryFormComponent;

    expect(formComponent.initialValues()).toBeNull();
  });

  it('should call store.setDraftItinerary and updateItinerary with callbacks when handleSubmitForm is called', () => {
    expect.assertions(2);

    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-03-01',
        endDate: '2026-03-31'
      },
      sittingDays: [],
      session: 'PM',
      unavailabilities: []
    };

    component.handleSubmitForm(formValues);

    expect(store.setDraftItinerary).toHaveBeenCalledWith(formValues);
    expect(store.updateItinerary).toHaveBeenCalledWith(
      expect.objectContaining({
        onUpdateSuccess: expect.any(Function),
        onError: expect.any(Function)
      })
    );
  });

  it('should execute onUpdateSuccess callback actions on successful update', () => {
    expect.assertions(6);

    const navigateSpy = jest.spyOn(router, 'navigate');
    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-03-01',
        endDate: '2026-03-31'
      },
      sittingDays: [],
      session: 'PM',
      unavailabilities: []
    };

    store.updateItinerary.mockImplementation(({ onUpdateSuccess }) => {
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    });

    component.handleSubmitForm(formValues);

    expect(store.resetUpsertJudiciaryItineraryState).toHaveBeenCalled();
    expect(store.setSuccessMessage).toHaveBeenCalled();
    expect(store.clearJudiciarySelection).toHaveBeenCalled();
    expect(store.setSelectedItinerary).toHaveBeenCalledWith(null);
    expect(store.resetPaginatedItineraries).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.EDIT,
      'itinerary-1',
      EditJudicialItineraryRoutes.SUCCESS
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

    store.updateItinerary.mockImplementation(({ onError }) => {
      if (onError) {
        onError(mockError);
      }
    });

    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-03-01',
        endDate: '2026-03-31'
      },
      sittingDays: [],
      session: 'PM',
      unavailabilities: []
    };

    component.handleSubmitForm(formValues);

    expect(store.setServerSubmissionError).toHaveBeenCalledWith(
      expect.objectContaining({
        validationResult: expect.objectContaining({
          validationError: 'Validation failed'
        })
      }),
      true
    );
    expect(store.handleError).not.toHaveBeenCalled();
  });

  it('should execute onError callback with non-422 error handling', () => {
    expect.assertions(2);

    const mockError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });

    store.updateItinerary.mockImplementation(({ onError }) => {
      if (onError) {
        onError(mockError);
      }
    });

    const formValues: DraftItinerary = {
      availability: {
        startDate: '2026-03-01',
        endDate: '2026-03-31'
      },
      sittingDays: [],
      session: 'PM',
      unavailabilities: []
    };

    component.handleSubmitForm(formValues);

    expect(store.handleError).toHaveBeenCalledWith(mockError);
    expect(store.setServerSubmissionError).not.toHaveBeenCalled();
  });

  it('should call clearUpsertItinerary and location.back when handleBackLink is called', () => {
    expect.assertions(2);

    const backSpy = jest.spyOn(location, 'back');

    component.handleBackLink();

    expect(store.clearUpsertItinerary).toHaveBeenCalled();
    expect(backSpy).toHaveBeenCalled();
  });

  it('should call store.setFormErrors when form emits errors', () => {
    expect.assertions(1);

    const mockErrors: ValidationError[] = [{ id: 'availability', message: 'Invalid date range' }];

    const formComponent = fixture.debugElement.query(
      (el) => el.name === 'edit-judicial-itinerary-form'
    )?.componentInstance as MockEditJudicialItineraryFormComponent;

    formComponent.errors.emit(mockErrors);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith(mockErrors);
  });

  it('should call store.setFormErrors with empty array when form emits null errors', () => {
    expect.assertions(1);

    const formComponent = fixture.debugElement.query(
      (el) => el.name === 'edit-judicial-itinerary-form'
    )?.componentInstance as MockEditJudicialItineraryFormComponent;

    formComponent.errors.emit(null);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith([]);
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

  it('should call clearServerSubmissionError when component is destroyed', () => {
    expect.assertions(1);

    fixture.destroy();

    expect(store.clearServerSubmissionError).toHaveBeenCalled();
  });

  it('should pass hideSpecialismsAction true to judiciary-details component', () => {
    expect.assertions(1);

    store.selectedJudiciaries.set([
      {
        id: 'judge-1',
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        specialisms: Object.values(Specialism) as Specialism[]
      } as ExtendedJudicialMember
    ]);
    store.selectedJudiciaryTypes.set(['Judge']);
    fixture.detectChanges();

    const detailsComponent = fixture.debugElement.query((el) => el.name === 'judiciary-details')
      ?.componentInstance as MockJudiciaryDetailsComponent;

    expect(detailsComponent.hideSpecialismsAction()).toBe(true);
  });

  it('should pass selectedType and selectedJudiciary to judiciary-details component', () => {
    expect.assertions(2);

    const jud = {
      id: 'judge-1',
      surname: 'Smith',
      forenames: '',
      judiciaryType: 'Circuit Judge'
    } as ExtendedJudicialMember;
    store.selectedJudiciaries.set([jud]);
    store.selectedJudiciaryTypes.set(['Judge']);
    fixture.detectChanges();

    const detailsComponent = fixture.debugElement.query((el) => el.name === 'judiciary-details')
      ?.componentInstance as MockJudiciaryDetailsComponent;

    expect(detailsComponent.selectedType()).toBe('Judge');
    expect(detailsComponent.selectedJudiciary()).toEqual(jud);
  });
});
