import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { RemoveJudiciaryItineraryDetailsComponent } from '../remove-judiciary-itinerary-details/remove-judiciary-itinerary-details.component';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { Specialism } from '@cpp/reference-data';
import { JudicialMember, OrganisationUnit, JudiciaryTypePayload } from '@cpp/reference-data';
import { NonSittingDaysDisplayComponent } from '../../../../shared/components/non-sitting-days-display/non-sitting-days-display.component';

@Component({
  selector: 'app-test-host',
  template: `
    <remove-judiciary-itinerary-details
      [itinerary]="itinerary"
      [courtCentre]="courtCentre"
      [selectedJudiciary]="selectedJudiciary"
      [selectedType]="selectedType"
    />
  `,
  imports: [RemoveJudiciaryItineraryDetailsComponent]
})
class TestHostComponent {
  itinerary: Itinerary | null = null;
  courtCentre: OrganisationUnit | null = null;
  selectedJudiciary: JudicialMember | null = null;
  selectedType: JudiciaryTypePayload | null = null;
}

@Component({
  selector: 'non-sitting-days-display',
  template: `<div>Mock Non-Sitting Days</div>`
})
class MockNonSittingDaysDisplayComponent {
  readonly unavailabilities = input<any[] | null | undefined>(null);
}

describe('RemoveJudiciaryItineraryDetailsComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockJudiciary: JudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com'
  } as unknown as JudicialMember;

  const mockCourtCentre: OrganisationUnit = {
    id: 'court-1',
    oucode: 'OU001',
    oucodeL3Name: 'Test Court',
    oucodeL3Code: 'L3-001'
  } as unknown as OrganisationUnit;

  const mockJudiciaryMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
  } as any;

  const mockItinerary: Itinerary = {
    id: 'itinerary-1',
    courtHouseId: 'court-1',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    sessionType: 'AD',
    repeatDays: ['Monday', 'Tuesday'],
    unavailabilities: [],
    judiciaryMember: mockJudiciaryMember
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(RemoveJudiciaryItineraryDetailsComponent, {
      remove: {
        imports: [NonSittingDaysDisplayComponent]
      },
      add: {
        imports: [MockNonSittingDaysDisplayComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    testHost.itinerary = mockItinerary;
    testHost.courtCentre = mockCourtCentre;
    testHost.selectedJudiciary = mockJudiciary;
    testHost.selectedType = 'Judge';
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should display formatted dates', () => {
    expect.assertions(2);

    testHost.itinerary = mockItinerary;
    testHost.courtCentre = mockCourtCentre;
    testHost.selectedJudiciary = mockJudiciary;
    testHost.selectedType = 'Judge';
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList?.textContent).toContain('1 January 2026');
    expect(summaryList?.textContent).toContain('31 January 2026');
  });
});
