import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JudicialItineraryFormComponent } from '../judicial-itinerary-form/judicial-itinerary-form.component';
import { ItinerarySearchParams } from '../../store/manage-judiciary-itinerary.store.interfaces';
import { OrganisationUnit, OrganisationUnitAutosuggestComponent } from '@cpp/reference-data';
import { Component } from '@angular/core';
import { mockCppFormControlComponent } from '../../../../shared/mocks/mock-cpp-components';

@Component({
  selector: 'app-test-host',
  template: `
    <judicial-itinerary-form
      [initialValues]="initialValues"
      (submitForm)="handleSubmitForm($event)"
      (errors)="handleErrors($event)"
    ></judicial-itinerary-form>
  `,
  imports: [JudicialItineraryFormComponent]
})
class TestHostComponent {
  initialValues: ItinerarySearchParams | null = null;

  handleSubmitForm(_values: ItinerarySearchParams): void {}

  handleErrors(_errors: unknown): void {}
}

describe('JudicialItineraryFormComponent', () => {
  let component: JudicialItineraryFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

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

  beforeEach(async () => {
    TestBed.overrideComponent(JudicialItineraryFormComponent, {
      remove: {
        imports: [OrganisationUnitAutosuggestComponent]
      },
      add: {
        imports: [mockCppFormControlComponent('cpp-organisation-unit-autosuggest')]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    testHost.initialValues = null;
    component = fixture.debugElement.query(
      By.directive(JudicialItineraryFormComponent)
    ).componentInstance;
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

  it('should have submitForm output defined', () => {
    expect.assertions(1);
    expect(component.submitForm).toBeDefined();
  });

  it('should have errors output defined', () => {
    expect.assertions(1);
    expect(component.errors).toBeDefined();
  });

  it('should update when initialValues change', () => {
    expect.assertions(1);

    const initialValues1: ItinerarySearchParams = {
      courtCentre: mockCourtCentre,
      availability: {
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      }
    };

    testHost.initialValues = initialValues1;
    fixture.detectChanges();

    const initialValues2: ItinerarySearchParams = {
      courtCentre: mockCourtCentre,
      availability: {
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      }
    };

    testHost.initialValues = initialValues2;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should return minStartDate when getMinEndDate is called with null startDate', () => {
    expect.assertions(1);

    const result = component.getMinEndDate(null);
    expect(result).toBe(component.minStartDate);
  });

  it('should return formatted date when getMinEndDate is called with startDate', () => {
    expect.assertions(1);

    const startDate = '2026-01-15';
    const result = component.getMinEndDate(startDate);
    expect(result).toBe('2026-01-15');
  });
});
