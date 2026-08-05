import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { AddSittingDaysFormComponent } from '../add-sitting-days-form/add-sitting-days-form.component';
import { DraftItinerary } from '../../model/judicial-itinerary.interface';
import { DayOfWeek, SessionType } from '../../../../shared/model';
import { ValidationError } from '@cpp/pdk';

@Component({
  selector: 'app-test-host',
  template: `
    <add-sitting-days-form
      [initialValues]="initialValues"
      (submitForm)="handleSubmit($event)"
      (errors)="handleErrors($event)"
      (clearForm)="handleClear()"
    ></add-sitting-days-form>
  `,
  imports: [AddSittingDaysFormComponent]
})
class TestHostComponent {
  initialValues: DraftItinerary | null = null;
  submittedValues?: DraftItinerary;
  errors?: ValidationError[] | null;
  clearCalled = false;

  handleSubmit(values: DraftItinerary): void {
    this.submittedValues = values;
  }

  handleErrors(errors: ValidationError[] | null): void {
    this.errors = errors;
  }

  handleClear(): void {
    this.clearCalled = true;
  }
}

describe('AddSittingDaysFormComponent', () => {
  let component: AddSittingDaysFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockDraftItinerary: DraftItinerary = {
    availability: {
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    },
    sittingDays: [DayOfWeek.Monday, DayOfWeek.Tuesday],
    session: 'AD' as SessionType
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(AddSittingDaysFormComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should initialize linked signals from initialValues', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    expect(component.sessionSignal()).toBe('AD');
  });

  it('should ensure minDate is defined always', () => {
    expect.assertions(2);

    const minDate = component.minStartDate;
    expect(minDate).toBeTruthy();
    expect(typeof minDate).toBe('string');
  });

  it('should have default session value of AD when initialValues is null', () => {
    expect.assertions(1);

    testHost.initialValues = null;
    fixture.detectChanges();

    expect(component.sessionSignal()).toBe('AD');
  });

  it('should have submitForm output defined', () => {
    expect.assertions(1);

    expect(component.submitForm).toBeDefined();
  });

  it('should have errors output defined', () => {
    expect.assertions(1);

    expect(component.errors).toBeDefined();
  });

  it('should emit clearForm when clear link is clicked', () => {
    expect.assertions(1);

    fixture.detectChanges();

    const clearLink = fixture.debugElement.query(By.css('[data-test-id="clear-link"]'));
    const linkElement = clearLink.nativeElement as HTMLElement;

    linkElement.click();
    fixture.detectChanges();

    expect(testHost.clearCalled).toBe(true);
  });
});
