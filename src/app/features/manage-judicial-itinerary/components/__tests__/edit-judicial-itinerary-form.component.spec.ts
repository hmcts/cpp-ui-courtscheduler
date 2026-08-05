import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, input, signal, inject, Injector } from '@angular/core';
import { FormsModule, NgControl, NgForm, FormControl } from '@angular/forms';
import { EditJudicialItineraryFormComponent } from '../edit-judicial-itinerary-form/edit-judicial-itinerary-form.component';
import { DraftItinerary } from '../../model/judicial-itinerary.interface';
import { DayOfWeek, SessionType } from '../../../../shared/model';
import { ValidationError, FormFieldControl } from '@cpp/pdk';
import { UnavailabilityReason } from '../../model/unavailability.interface';
import { formatDate } from '../../../../shared/utils/date-utils';
import {
  DateRangeComponent,
  DateRange
} from '../../../../shared/components/date-range/date-range.component';
import { DaysOfWeekSelectorComponent } from '../../../../shared/components/days-of-week-selector/days-of-week-selector.component';
import { SpecialismsSelectorComponent } from '../../../../shared/components/specialisms-selector/specialisms-selector.component';
import { UnavailabilitiesControlComponent } from '../unavailabilities-control/unavailabilities-control.component';

@Component({
  selector: 'app-test-host',
  template: `
    <edit-judicial-itinerary-form
      [initialValues]="initialValues"
      (submitForm)="handleSubmit($event)"
      (errors)="handleErrors($event)"
    ></edit-judicial-itinerary-form>
  `,
  imports: [EditJudicialItineraryFormComponent, FormsModule]
})
class TestHostComponent {
  initialValues: DraftItinerary | null = null;
  submittedValues?: DraftItinerary;
  errors?: ValidationError[] | null;

  handleSubmit(values: DraftItinerary): void {
    this.submittedValues = values;
  }

  handleErrors(errors: ValidationError[] | null): void {
    this.errors = errors;
  }
}

@Component({
  selector: 'date-range',
  template: `<div>Mock Date Range</div>`,
  providers: [
    {
      provide: FormFieldControl,
      useExisting: MockDateRangeComponent,
      multi: false
    }
  ]
})
class MockDateRangeComponent implements FormFieldControl {
  injector = inject(Injector);
  get ngControl() {
    return this.injector.get(NgControl);
  }
  id: string = '';
  ariaDescribedBy: string = '';
  controlType = 'date-range';
  multi = false;
  readonly minStartDate = input<string | null>(null);
  readonly maxStartDate = input<string | null>(null);
  readonly maxEndDate = input<string | null>(null);
  readonly serverError = input<Record<string, any> | null>(null);
  readonly getMinEndDate = input<((startDate: string) => string | null) | null>(null);
  readonly getMaxEndDate = input<((startDate: string) => string | null) | null>(null);
  readonly onStartDateChange = input<((startDate: string, endDateControl?: any) => void) | null>(
    null
  );
  readonly onEndDateChange = input<((endDate: string, startDateControl?: any) => void) | null>(
    null
  );
  readonly disableWeekend = input<boolean>(false);
  readonly requiredStartDate = input<boolean>(false);
  readonly requiredEndDate = input<boolean>(false);
  readonly startDateErrorMessages = input<any[]>([]);
  readonly endDateErrorMessages = input<any[]>([]);
  readonly value = signal<any>({ startDate: null, endDate: null });
}

@Component({
  selector: 'specialisms-selector',
  template: `<div>Mock Specialisms Selector</div>`,
  providers: [
    {
      provide: FormFieldControl,
      useExisting: MockSpecialismsSelectorComponent,
      multi: false
    }
  ]
})
class MockSpecialismsSelectorComponent implements FormFieldControl {
  injector = inject(Injector);
  get ngControl() {
    return this.injector.get(NgControl);
  }
  id: string = '';
  ariaDescribedBy: string = '';
  controlType = 'specialisms-selector';
  multi = false;
}

@Component({
  selector: 'days-of-week-selector',
  template: `<div>Mock Days Of Week Selector</div>`,
  providers: [
    {
      provide: FormFieldControl,
      useExisting: MockDaysOfWeekSelectorComponent,
      multi: false
    }
  ]
})
class MockDaysOfWeekSelectorComponent implements FormFieldControl {
  injector = inject(Injector);
  get ngControl() {
    return this.injector.get(NgControl);
  }
  id: string = '';
  ariaDescribedBy: string = '';
  controlType = 'days-of-week-selector';
  multi = false;
}

@Component({
  selector: 'unavailabilities-control',
  template: `<div>Mock Unavailabilities Control</div>`,
  providers: [
    {
      provide: FormFieldControl,
      useExisting: MockUnavailabilitiesControlComponent,
      multi: false
    }
  ]
})
class MockUnavailabilitiesControlComponent implements FormFieldControl {
  injector = inject(Injector);
  get ngControl() {
    return this.injector.get(NgControl);
  }
  id: string = '';
  ariaDescribedBy: string = '';
  controlType = 'unavailabilities-control';
  multi = true;
  readonly inDateRange = input<any>(null);
  readonly availabilityDateRange = input<DateRange>({} as DateRange);
}

describe('EditJudicialItineraryFormComponent', () => {
  let component: EditJudicialItineraryFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockDraftItinerary: DraftItinerary = {
    availability: {
      startDate: '2026-01-15',
      endDate: '2026-01-31'
    },
    sittingDays: [DayOfWeek.Monday, DayOfWeek.Tuesday],
    session: 'AD' as SessionType,
    unavailabilities: [
      {
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(EditJudicialItineraryFormComponent, {
      remove: {
        imports: [
          DateRangeComponent,
          SpecialismsSelectorComponent,
          DaysOfWeekSelectorComponent,
          UnavailabilitiesControlComponent
        ]
      },
      add: {
        imports: [
          MockDateRangeComponent,
          MockSpecialismsSelectorComponent,
          MockDaysOfWeekSelectorComponent,
          MockUnavailabilitiesControlComponent
        ]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(EditJudicialItineraryFormComponent)
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

  it('should compute minStartDate as current date when initialValues is null', () => {
    expect.assertions(1);

    testHost.initialValues = null;
    fixture.detectChanges();

    const today = formatDate(new Date());
    expect(component.minStartDate()).toBe(today);
  });

  it('should compute minStartDate as current date when current date is earlier than initial startDate', () => {
    expect.assertions(1);

    const futureDate: DraftItinerary = {
      ...mockDraftItinerary,
      availability: {
        startDate: '2027-01-01',
        endDate: '2027-01-31'
      }
    };

    testHost.initialValues = futureDate;
    fixture.detectChanges();

    const today = formatDate(new Date());
    expect(component.minStartDate()).toBe(today);
  });

  it('should compute minStartDate as initial startDate when initial startDate is earlier than current date', () => {
    expect.assertions(1);

    const pastDate: DraftItinerary = {
      ...mockDraftItinerary,
      availability: {
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      }
    };

    testHost.initialValues = pastDate;
    fixture.detectChanges();

    expect(component.minStartDate()).toBe('2025-01-01');
  });

  it('should compute minStartDate as the earliest between current date and initial startDate', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const today = formatDate(new Date());
    const initialStartDate = mockDraftItinerary.availability.startDate;
    const expected = new Date(today) < new Date(initialStartDate!) ? today : initialStartDate;

    expect(component.minStartDate()).toBe(expected);
  });

  it('should have submitForm output defined', () => {
    expect.assertions(1);
    expect(component.submitForm).toBeDefined();
  });

  it('should emit form values when form is submitted', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const formElement = fixture.debugElement.query(By.css('form'));
    const ngForm = formElement.injector.get(NgForm);

    const updatedValues: DraftItinerary = {
      availability: {
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      },
      sittingDays: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
      session: 'PM' as SessionType,
      unavailabilities: [
        {
          startDate: '2026-02-10',
          endDate: '2026-02-12',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ]
    };

    ngForm.form.patchValue({
      availability: updatedValues.availability,
      sittingDays: updatedValues.sittingDays,
      session: updatedValues.session,
      unavailabilities: updatedValues.unavailabilities
    });

    ngForm.form.markAllAsTouched();
    Object.keys(ngForm.form.controls).forEach((key) => {
      const control = ngForm.form.get(key);
      if (control) {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(testHost.submittedValues).toEqual(updatedValues);
  });

  it('should have errors output defined', () => {
    expect.assertions(1);
    expect(component.errors).toBeDefined();
  });

  it('should compute startDateErrorMessages', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const errorMessages = component.startDateErrorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should compute endDateErrorMessages', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const errorMessages = component.endDateErrorMessages;
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should pass minStartDate to date-range component', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const dateRangeComponent = fixture.debugElement.query(By.directive(MockDateRangeComponent))
      ?.componentInstance as MockDateRangeComponent;

    expect(dateRangeComponent.minStartDate()).toBe(component.minStartDate());
  });

  it('should pass startDateErrorMessages and endDateErrorMessages to date-range component', () => {
    expect.assertions(2);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const dateRangeComponent = fixture.debugElement.query(By.directive(MockDateRangeComponent))
      ?.componentInstance as MockDateRangeComponent;

    expect(dateRangeComponent.startDateErrorMessages()).toBeDefined();
    expect(dateRangeComponent.endDateErrorMessages()).toBeDefined();
  });

  it('should pass dateRange to unavailabilities-control with inDateRange directive', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const unavailabilitiesControl = fixture.debugElement.query(
      By.directive(MockUnavailabilitiesControlComponent)
    )?.componentInstance as MockUnavailabilitiesControlComponent;

    expect(unavailabilitiesControl.inDateRange()).toBeDefined();
  });

  it('should pass initialValues to child components', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    expect(component.initialValues()).toEqual(mockDraftItinerary);
  });

  it('should return minStartDate when getMinEndDate is called with null startDate', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const result = component.getMinEndDate(null as any);
    expect(result).toBe(component.minStartDate());
  });

  it('should return formatted date when getMinEndDate is called with startDate', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const startDate = '2026-01-15';
    const result = component.getMinEndDate(startDate);
    expect(result).toBe('2026-01-15');
  });

  it('should return null when getMaxEndDate is called with null startDate', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const result = component.getMaxEndDate(null as any);
    expect(result).toBeNull();
  });

  it('should return formatted date 3 years from startDate when getMaxEndDate is called with startDate', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    const startDate = '2026-01-15';
    const result = component.getMaxEndDate(startDate);
    expect(result).toBe('2029-01-15');
  });

  it('should not reset endDate when onStartDateChange is called with valid endDate', () => {
    expect.assertions(1);

    const endDateControl = new FormControl<string | null>('2026-01-20');
    const startDate = '2026-01-15';

    component.onStartDateChange(startDate, endDateControl);

    expect(endDateControl.value).toBe('2026-01-20');
  });

  it('should reset endDate when onStartDateChange is called with endDate greater than maxDate', () => {
    expect.assertions(1);

    const endDateControl = new FormControl<string | null>('2030-01-20');
    const startDate = '2026-01-15';

    component.onStartDateChange(startDate, endDateControl);

    expect(endDateControl.value).toBeNull();
  });

  it('should reset endDate when onStartDateChange is called with endDate less than startDate', () => {
    expect.assertions(1);

    const endDateControl = new FormControl<string | null>('2026-01-10');
    const startDate = '2026-01-15';

    component.onStartDateChange(startDate, endDateControl);

    expect(endDateControl.value).toBeNull();
  });

  it('should not reset endDate when onStartDateChange is called without endDate', () => {
    expect.assertions(1);

    const endDateControl = new FormControl<string | null>(null);
    const startDate = '2026-01-15';

    component.onStartDateChange(startDate, endDateControl);

    expect(endDateControl.value).toBeNull();
  });

  it('should not reset endDate when onStartDateChange is called without startDate', () => {
    expect.assertions(1);

    const endDateControl = new FormControl<string | null>('2026-01-20');

    component.onStartDateChange(null as any, endDateControl);

    expect(endDateControl.value).toBe('2026-01-20');
  });

  it('should have sessionSignal linked to initialValues session', () => {
    expect.assertions(1);

    testHost.initialValues = mockDraftItinerary;
    fixture.detectChanges();

    expect(component.sessionSignal()).toBe('AD');
  });

  it('should have sessionSignal default to AD when initialValues session is null', () => {
    expect.assertions(1);

    testHost.initialValues = {
      ...mockDraftItinerary,
      session: null as any
    };
    fixture.detectChanges();

    expect(component.sessionSignal()).toBe('AD');
  });
});
