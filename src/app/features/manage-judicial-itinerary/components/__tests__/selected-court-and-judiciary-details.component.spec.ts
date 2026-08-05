import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { provideRouter, Routes } from '@angular/router';
import { SelectedCourtAndJudiciaryDetailsComponent } from '../selected-court-and-judiciary-details/selected-court-and-judiciary-details.component';
import { OrganisationUnit, JudiciaryTypePayload } from '@cpp/reference-data';
import { Specialism } from '@cpp/reference-data';
import { ExtendedJudicialMember } from '../../../../shared/model';
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
      },
      {
        path: JudicialItineraryRoutes.ADD_SPECIALISMS,
        component: MockRouteComponent
      }
    ]
  }
];

@Component({
  selector: 'app-test-host',
  template: `
    <selected-court-and-judiciary-details
      [courtCentre]="courtCentre"
      [selectedType]="selectedType"
      [selectedJudiciary]="selectedJudiciary"
    ></selected-court-and-judiciary-details>
  `,
  imports: [SelectedCourtAndJudiciaryDetailsComponent]
})
class TestHostComponent {
  courtCentre: OrganisationUnit | null = null;
  selectedType: JudiciaryTypePayload | null = null;
  selectedJudiciary: ExtendedJudicialMember | null = null;
}

describe('SelectedCourtAndJudiciaryDetailsComponent', () => {
  let component: SelectedCourtAndJudiciaryDetailsComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
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

  const mockJudiciary: ExtendedJudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com'
  } as unknown as ExtendedJudicialMember;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(mockRoutes)],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(SelectedCourtAndJudiciaryDetailsComponent)
    ).componentInstance;
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

    testHost.courtCentre = mockCourtCentre;
    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = { ...mockJudiciary, specialisms: [Specialism.MURDER] };
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should navigate to manage-judicial-itinerary when handleCourtChange is called', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleCourtChange();

    expect(navigateSpy).toHaveBeenCalledWith([CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY]);
  });

  it('should navigate to select-judiciary-type when handleJudiciaryTypeChange is called', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleJudiciaryTypeChange();

    expect(navigateSpy).toHaveBeenCalledWith([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE
    ]);
  });

  it('should navigate to add-specialisms with referrer query param when handleAddSpecialism is called', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');
    Object.defineProperty(router, 'url', {
      value: '/current-url',
      writable: true
    });

    component.handleAddSpecialism();

    expect(navigateSpy).toHaveBeenCalledWith(
      [CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY, JudicialItineraryRoutes.ADD_SPECIALISMS],
      { queryParams: { referrer: '/current-url' } }
    );
  });

  it('should show "Add new specialism" link when not all specialisms are selected', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
    };
    fixture.detectChanges();

    const addLink = fixture.nativeElement.querySelector('[data-test-id="add-new-specialism-link"]');
    expect(addLink).toBeTruthy();
  });

  it('should not show "Add new specialism" link when all specialisms are selected', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER,
        Specialism.SEXUALOFFENCE,
        Specialism.TERRORISM
      ]
    };
    fixture.detectChanges();

    const addLink = fixture.nativeElement.querySelector('[data-test-id="add-new-specialism-link"]');
    expect(addLink).toBeNull();
  });

  it('should show "Add new specialism" link when no specialisms are selected', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = { ...mockJudiciary, specialisms: [] };
    fixture.detectChanges();

    const addLink = fixture.nativeElement.querySelector('[data-test-id="add-new-specialism-link"]');
    expect(addLink).toBeTruthy();
  });

  it('should compute allSpecialismsSelected as false when not all specialisms are selected', () => {
    expect.assertions(3);

    testHost.selectedJudiciary = { ...mockJudiciary, specialisms: [Specialism.MURDER] };
    fixture.detectChanges();
    expect(component.allSpecialismsSelected()).toBe(false);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
    };
    fixture.detectChanges();
    expect(component.allSpecialismsSelected()).toBe(false);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER, Specialism.SEXUALOFFENCE]
    };
    fixture.detectChanges();
    expect(component.allSpecialismsSelected()).toBe(false);
  });

  it('should compute allSpecialismsSelected as true when all specialisms are selected', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER,
        Specialism.SEXUALOFFENCE,
        Specialism.TERRORISM
      ]
    };
    fixture.detectChanges();

    expect(component.allSpecialismsSelected()).toBe(true);
  });

  it('should compute allSpecialismsSelected correctly regardless of order', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [
        Specialism.TERRORISM,
        Specialism.SEXUALOFFENCE,
        Specialism.ATTEMPTEDMURDER,
        Specialism.MURDER
      ]
    };
    fixture.detectChanges();

    expect(component.allSpecialismsSelected()).toBe(true);
  });

  it('should compute allSpecialismsSelected correctly when there are duplicates but all specialisms present', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [
        Specialism.MURDER,
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER,
        Specialism.SEXUALOFFENCE,
        Specialism.TERRORISM
      ]
    };
    fixture.detectChanges();

    expect(component.allSpecialismsSelected()).toBe(true);
  });

  it('should compute allSpecialismsSelected as false when there are duplicates but not all specialisms present', () => {
    expect.assertions(1);

    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [Specialism.MURDER, Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
    };
    fixture.detectChanges();

    expect(component.allSpecialismsSelected()).toBe(false);
  });

  it('should render correctly when all specialisms are selected', () => {
    expect.assertions(1);

    testHost.courtCentre = mockCourtCentre;
    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = {
      ...mockJudiciary,
      specialisms: [
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER,
        Specialism.SEXUALOFFENCE,
        Specialism.TERRORISM
      ]
    };
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
