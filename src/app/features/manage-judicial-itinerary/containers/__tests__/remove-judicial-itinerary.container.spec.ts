import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { RemoveJudicialItineraryContainer } from '../remove-judicial-itinerary/remove-judicial-itinerary.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { RemoveJudiciaryItineraryDetailsComponent } from '../../components/remove-judiciary-itinerary-details/remove-judiciary-itinerary-details.component';
import { RemoveJudiciaryItineraryFormComponent } from '../../components/remove-judiciary-itinerary-form/remove-judiciary-itinerary-form.component';
import { ValidationError } from '@cpp/pdk';
import { signal } from '@angular/core';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';
import {
  JudicialMember,
  OrganisationUnit,
  JudiciaryTypePayload,
  JudicialMemberNamePipe
} from '@cpp/reference-data';

@Component({
  selector: 'remove-judiciary-itinerary-details',
  template: `<div>
    Mock - Itinerary Details:
    {{
      {
        itinerary: itinerary(),
        courtCentre: courtCentre(),
        selectedJudiciary: selectedJudiciary(),
        selectedType: selectedType()
      } | json
    }}
  </div>`,
  imports: [JsonPipe]
})
class MockRemoveJudiciaryItineraryDetailsComponent {
  readonly itinerary = input<Itinerary | null>(null);
  readonly courtCentre = input<OrganisationUnit | null>(null);
  readonly selectedJudiciary = input<JudicialMember | null>(null);
  readonly selectedType = input<JudiciaryTypePayload | null>(null);
}

@Component({
  selector: 'remove-judiciary-itinerary-form',
  template: `<div>Mock Remove Form</div>`
})
class MockRemoveJudiciaryItineraryFormComponent {
  readonly submitForm = output<boolean>();
  readonly errors = output<ValidationError[] | null>();
}

const mockJudiciary: JudicialMember = {
  id: 'judge-1',
  seqId: 1,
  surname: 'Smith',
  forenames: 'John',
  judiciaryType: 'Circuit Judge',
  emailAddress: 'john.smith@example.com',
  specialisms: [Specialism.MURDER]
} as unknown as JudicialMember;

const mockItinerary: Itinerary = {
  id: 'itinerary-1',
  courtHouseId: 'court-1',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  sessionType: 'AD',
  repeatDays: ['Monday', 'Tuesday'],
  unavailabilities: [],
  judiciaryMember: mockJudiciary
};

const mockCourtCentre: OrganisationUnit = {
  id: 'court-1',
  oucode: 'OU001',
  oucodeL3Name: 'Test Court'
} as unknown as OrganisationUnit;

class MockManageJudicialItineraryStore {
  readonly selectedItinerary = signal<Itinerary | null>(mockItinerary);
  readonly paginatedItineraries = {};
  readonly searchParams = signal({ courtCentre: mockCourtCentre });
  readonly selectedJudiciary = signal<JudicialMember | null>(mockJudiciary);
  readonly selectedType = signal<JudiciaryTypePayload | null>('Judge');
  readonly removeItinerary = jest.fn();
  readonly setSuccessMessage = jest.fn();
  readonly resetPaginatedItineraries = jest.fn();
  readonly setServerSubmissionError = jest.fn();
  readonly handleError = jest.fn();
  readonly clearServerSubmissionError = jest.fn();
}

describe('RemoveJudicialItineraryContainer', () => {
  let component: RemoveJudicialItineraryContainer;
  let fixture: ComponentFixture<RemoveJudicialItineraryContainer>;
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
          provide: JudicialMemberNamePipe,
          useValue: { transform: jest.fn().mockImplementation((j: any) => j?.surname ?? '') }
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(RemoveJudicialItineraryContainer, {
      remove: {
        imports: [RemoveJudiciaryItineraryDetailsComponent, RemoveJudiciaryItineraryFormComponent]
      },
      add: {
        imports: [
          MockRemoveJudiciaryItineraryDetailsComponent,
          MockRemoveJudiciaryItineraryFormComponent
        ]
      }
    });

    location = TestBed.inject(Location);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(RemoveJudicialItineraryContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect.assertions(1);
    expect(fixture).toMatchSnapshot();
  });

  it('should call store.removeItinerary when handleSubmitForm is called with true', () => {
    expect.assertions(1);

    component.handleSubmitForm(true);

    expect(store.removeItinerary).toHaveBeenCalled();
  });

  it('should navigate back when remove is not confirmed', () => {
    expect.assertions(2);

    const backSpy = jest.spyOn(location, 'back');

    component.handleSubmitForm(false);

    expect(backSpy).toHaveBeenCalled();
    expect(store.removeItinerary).not.toHaveBeenCalled();
  });

  it('should navigate to manage judicial itinerary on handleNavigateToManageJudicialItinerary', async () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);

    component.handleNavigateToManageJudicialItinerary();

    expect(navigateSpy).toHaveBeenCalledWith(['manage-judicial-itinerary']);
  });

  it('should clear server submission error on destroy', () => {
    expect.assertions(1);

    const clearSpy = jest.spyOn(store, 'clearServerSubmissionError');

    component.ngOnDestroy();

    expect(clearSpy).toHaveBeenCalled();
  });
});
