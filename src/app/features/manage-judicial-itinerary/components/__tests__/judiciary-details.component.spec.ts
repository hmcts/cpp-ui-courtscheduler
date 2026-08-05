import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { JudiciaryDetailsComponent } from '../judiciary-details/judiciary-details.component';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';

@Component({
  selector: 'app-test-host',
  template: `
    <judiciary-details
      [selectedType]="selectedType"
      [selectedJudiciary]="selectedJudiciary"
      [existingSpecialisms]="existingSpecialisms"
      [hideSpecialismsAction]="hideSpecialismsAction"
    ></judiciary-details>
  `,
  imports: [JudiciaryDetailsComponent]
})
class TestHostComponent {
  selectedType: string | null = null;
  selectedJudiciary: JudiciaryWithSpecialisms | null = null;
  existingSpecialisms: Specialism[] = [];
  hideSpecialismsAction = false;
}

describe('JudiciaryDetailsComponent', () => {
  let component: JudiciaryDetailsComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockJudiciary: JudiciaryWithSpecialisms = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com'
  } as unknown as JudiciaryWithSpecialisms;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(JudiciaryDetailsComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [Specialism.MURDER];
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should display "Not selected" when selectedType is null', () => {
    expect.assertions(1);

    testHost.selectedType = null;
    testHost.selectedJudiciary = mockJudiciary;
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList.textContent).toContain('Not selected');
  });

  it('should display "Not added" when existingSpecialisms is empty', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [];
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList.textContent).toContain('Not added');
  });

  it('should display multiple specialisms as tags', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [
      Specialism.MURDER,
      Specialism.ATTEMPTEDMURDER,
      Specialism.SEXUALOFFENCE
    ];
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    const tags = fixture.nativeElement.querySelectorAll('pdk-tag');
    expect(tags.length).toBe(3);
  });

  it('should display judiciary name using judicialMemberName pipe', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [];
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList.textContent).toMatch(/smith/i);
  });

  it('should display "Selected Judiciary and specialism" heading when hideSpecialismsAction is false', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading.textContent.trim()).toBe('Selected Judiciary and specialism');
  });

  it('should display "Selected Judiciary and specialism" heading when hideSpecialismsAction is true', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.hideSpecialismsAction = true;
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading.textContent.trim()).toBe('Selected Judiciary and specialism');
  });

  it('should not show Add new specialism link when hideSpecialismsAction is true', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [Specialism.MURDER];
    testHost.hideSpecialismsAction = true;
    fixture.detectChanges();

    const addLink = fixture.nativeElement.querySelector('[data-test-id="add-new-specialism-link"]');
    expect(addLink).toBeFalsy();
  });

  it('should display specialisms section when hideSpecialismsAction is false', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [Specialism.MURDER];
    testHost.hideSpecialismsAction = false;
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList.textContent).toContain('Current specialism');
  });

  it('should render correctly with hideSpecialismsAction true', () => {
    expect.assertions(1);

    testHost.selectedType = 'Judge';
    testHost.selectedJudiciary = mockJudiciary;
    testHost.existingSpecialisms = [Specialism.MURDER];
    testHost.hideSpecialismsAction = true;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
