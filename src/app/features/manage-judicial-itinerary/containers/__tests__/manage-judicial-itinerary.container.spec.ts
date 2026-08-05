import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, model, output, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { provideRouter, Routes } from '@angular/router';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ManageJudicialItineraryContainer } from '../manage-judicial-itinerary/manage-judicial-itinerary.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { JudicialItineraryFormComponent } from '../../components/judicial-itinerary-form/judicial-itinerary-form.component';
import {
  ItinerarySearchParams,
  ItinerarySortField
} from '../../store/manage-judiciary-itinerary.store.interfaces';
import { JudicialItineraryResultsComponent } from '../../components/judicial-itinerary-results/judicial-itinerary-results.component';
import { OrganisationUnit } from '@cpp/reference-data';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { Specialism } from '@cpp/reference-data';
import { SortOrder, ValidationError } from '@cpp/pdk';
import { JudicialMember } from '@cpp/reference-data';
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
        path: JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE,
        component: MockRouteComponent
      }
    ]
  }
];

@Component({
  selector: 'judicial-itinerary-form',
  template: `<div>{{ initialValues() | json }}</div>`,
  imports: [JsonPipe]
})
class MockJudicialItineraryFormComponent {
  readonly initialValues = input<ItinerarySearchParams>();
  readonly submitForm = output<ItinerarySearchParams>();
  readonly errors = output<ValidationError[] | null>();
}

@Component({
  selector: 'judicial-itinerary-results',
  template: `<div>{{ itineraries() | json }}</div>`,
  imports: [JsonPipe]
})
class MockJudicialItineraryResultsComponent {
  readonly itineraries = input<Itinerary[]>([]);
  readonly totalResults = input<number>(0);
  readonly page = model<number>(1);
  readonly pageSize = input<number>(20);
  readonly sortField = input<ItinerarySortField | null>(null);
  readonly sortOrder = input<SortOrder | null>(null);
  readonly onAddJudiciary = output<void>();
  readonly onEdit = output<{ itinerary: Itinerary }>();
  readonly onRemove = output<Itinerary>();
  readonly onSort = output<{ field: ItinerarySortField; order: SortOrder }>();
  readonly pageChange = output<number>();
}

class MockManageJudicialItineraryStore {
  readonly searchParams = signal<ItinerarySearchParams>({
    courtCentre: null,
    availability: {
      startDate: null,
      endDate: null
    }
  });
  readonly paginatedItineraries = {
    itineraries: signal<Itinerary[]>([]),
    currentPage: signal<number>(1),
    pageSize: signal<number>(20),
    totalCount: signal<number>(0)
  };
  readonly sortField = signal<ItinerarySortField | null>(null);
  readonly sortOrder = signal<SortOrder | null>(null);
  readonly sortedItineraries = signal<Itinerary[]>([]);

  setSearchParams = jest.fn();
  setCurrentPage = jest.fn();
  setSort = jest.fn();
  getJudicialItineraries = jest.fn();
  resetState = jest.fn();
  handleError = jest.fn();
  setSelectedItinerary = jest.fn();
  setSelectedJudiciary = jest.fn();
  setFormErrors = jest.fn();
}

describe('ManageJudicialItineraryContainer', () => {
  let component: ManageJudicialItineraryContainer;
  let fixture: ComponentFixture<ManageJudicialItineraryContainer>;
  let store: MockManageJudicialItineraryStore;
  let router: Router;

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

  const mockJudiciaryMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER]
  } as JudicialMember;

  const mockItinerary: Itinerary = {
    id: 'rule-1',
    courtHouseId: 'court-1',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    sessionType: 'AD',
    repeatDays: ['Monday'],
    unavailabilities: [],
    judiciaryMember: mockJudiciaryMember
  };

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

    TestBed.overrideComponent(ManageJudicialItineraryContainer, {
      remove: {
        imports: [JudicialItineraryFormComponent, JudicialItineraryResultsComponent]
      },
      add: {
        imports: [MockJudicialItineraryFormComponent, MockJudicialItineraryResultsComponent]
      }
    });

    fixture = TestBed.createComponent(ManageJudicialItineraryContainer);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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
    expect.assertions(1);

    store.searchParams.set({
      courtCentre: mockCourtCentre,
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      }
    });
    store.paginatedItineraries.itineraries.set([mockItinerary]);
    store.paginatedItineraries.totalCount.set(1);
    store.paginatedItineraries.currentPage.set(1);
    store.sortField.set('name');
    store.sortOrder.set('asc');
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should call store.resetState, store.setSearchParams and store.getJudicialItineraries when handleSubmitForm is called', () => {
    expect.assertions(3);

    const formValues: ItinerarySearchParams = {
      courtCentre: mockCourtCentre,
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      }
    };

    component.handleSubmitForm(formValues);

    expect(store.resetState).toHaveBeenCalled();
    expect(store.setSearchParams).toHaveBeenCalledWith(formValues);
    expect(store.getJudicialItineraries).toHaveBeenCalled();
  });

  it('should call store.setCurrentPage and store.getJudicialItineraries when handlePageChange is called', () => {
    expect.assertions(2);

    component.handlePageChange(2);

    expect(store.setCurrentPage).toHaveBeenCalledWith(2);
    expect(store.getJudicialItineraries).toHaveBeenCalled();
  });

  it('should call store.setSort when handleSort is called', () => {
    expect.assertions(1);

    const field: ItinerarySortField = 'name';
    const order: SortOrder = 'asc';

    component.handleSort({ field, order });

    expect(store.setSort).toHaveBeenCalledWith(field, order);
  });

  it('should navigate to select-judiciary-type when handleAddJudiciary is called', () => {
    expect.assertions(1);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleAddJudiciary();

    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE
    ]);
  });

  it('should set selectedItinerary, setSelectedJudiciary and navigate when handleEdit is called', () => {
    expect.assertions(3);

    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleEdit({ itinerary: mockItinerary });

    expect(store.setSelectedItinerary).toHaveBeenCalledWith(mockItinerary);
    expect(store.setSelectedJudiciary).toHaveBeenCalledWith([mockJudiciaryMember]);
    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.EDIT,
      mockItinerary.id
    ]);
  });

  it('should set selected itinerary and navigate to remove route when handleRemove is called', () => {
    expect.assertions(2);

    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleRemove(mockItinerary);

    expect(store.setSelectedItinerary).toHaveBeenCalledWith(mockItinerary);
    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.REMOVE,
      mockItinerary.id
    ]);
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
      By.directive(MockJudicialItineraryFormComponent)
    ).componentInstance;

    formComponent.errors.emit(mockErrors);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith(mockErrors);
  });

  it('should call store.setFormErrors with empty array when form emits null errors', () => {
    expect.assertions(1);

    const formComponent = fixture.debugElement.query(
      By.directive(MockJudicialItineraryFormComponent)
    ).componentInstance;

    formComponent.errors.emit(null);
    fixture.detectChanges();

    expect(store.setFormErrors).toHaveBeenCalledWith([]);
  });
});
