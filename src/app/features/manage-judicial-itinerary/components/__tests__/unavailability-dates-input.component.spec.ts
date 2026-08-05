import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, signal, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UnavailabilityDatesInputComponent } from '../unavailability-dates-input/unavailability-dates-input.component';
import { Unavailability, UnavailabilityReason } from '../../model/unavailability.interface';
import {
  DateRange,
  DateRangeComponent
} from '../../../../shared/components/date-range/date-range.component';
import { ValidationError } from '@cpp/pdk';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-test-host',
  template: `
    <unavailability-dates-input
      [minStartDate]="minStartDate"
      [maxEndDate]="maxEndDate"
      [reason]="reason"
      [ngModel]="unavailabilities"
      (errors)="handleErrors($event)"
    ></unavailability-dates-input>
  `,
  imports: [UnavailabilityDatesInputComponent, FormsModule]
})
class TestHostComponent {
  minStartDate: string | null = '2026-01-01';
  maxEndDate: string | null = '2026-01-31';
  reason: UnavailabilityReason = UnavailabilityReason.ANNUAL_LEAVE;
  unavailabilities: Unavailability[] = [];
  handleErrors(errors: ValidationError[] | null) {}
}

@Component({
  selector: 'date-range',
  template: `<div>Mock Date Range</div>`,
  imports: [JsonPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockDateRangeComponent),
      multi: true
    }
  ]
})
class MockDateRangeComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly minStartDate = input<string | null>(null);
  readonly maxStartDate = input<string | null>(null);
  readonly maxEndDate = input<string | null>(null);
  readonly getMinEndDate = input<((startDate: string) => string | null) | null>(null);
  readonly startDateErrorMessages = input<any[]>([]);
  readonly endDateErrorMessages = input<any[]>([]);
  readonly value = signal<any>({ startDate: null, endDate: null });
  readonly disableWeekend = input<boolean>(false);
  readonly requiredStartDate = input<boolean>(false);

  writeValue(value: any): void {}
  registerOnChange(fn: (value: any) => void): void {}
  registerOnTouched(fn: () => void): void {}
}

describe('UnavailabilityDatesInputComponent', () => {
  let component: UnavailabilityDatesInputComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(UnavailabilityDatesInputComponent, {
      remove: {
        imports: [DateRangeComponent]
      },
      add: {
        imports: [MockDateRangeComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(UnavailabilityDatesInputComponent)
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

  it('should initialize formGroup with unavailability control', () => {
    expect.assertions(1);

    expect(component.formGroup.get('unavailability')).toBeDefined();
  });

  it('should write value and update unavailabilitiesForReason signal', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    component.writeValue(unavailabilities);

    expect(component.unavailabilitiesForReason()).toEqual(unavailabilities);
  });

  it('should write null value and set empty array', () => {
    expect.assertions(1);

    if (component) {
      component.writeValue(null);
      expect(component.unavailabilitiesForReason()).toEqual([]);
    }
  });

  it('should call onChange when handleSubmit is called', () => {
    expect.assertions(1);

    const onChangeSpy = jest.fn();
    component.registerOnChange(onChangeSpy);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);

    expect(onChangeSpy).toHaveBeenCalled();
  });

  it('should add unavailability to list when handleSubmit is called', () => {
    expect.assertions(2);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);

    expect(component.unavailabilitiesForReason().length).toBe(1);
    expect(component.unavailabilitiesForReason()[0].reason).toBe(UnavailabilityReason.ANNUAL_LEAVE);
  });

  it('should use endDate as startDate when endDate is null in handleSubmit', () => {
    expect.assertions(1);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: null
    };

    component.handleSubmit(dateRange);

    expect(component.unavailabilitiesForReason()[0].endDate).toBe('2026-01-05');
  });

  it('should reset formGroup after handleSubmit', () => {
    expect.assertions(1);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);

    const control = component.formGroup.get('unavailability');
    expect(control?.value.startDate).toBeNull();
  });

  it('should remove unavailability when removeUnavailability is called', () => {
    expect.assertions(2);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      },
      {
        startDate: '2026-01-15',
        endDate: '2026-01-20',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    component.writeValue(unavailabilities);
    const toRemove = component.unavailabilitiesForReason()[0];

    component.removeUnavailability(toRemove);

    expect(component.unavailabilitiesForReason().length).toBe(1);
    expect(component.unavailabilitiesForReason()[0].startDate).toBe('2026-01-15');
  });

  it('should call onChange when removeUnavailability is called', () => {
    expect.assertions(1);

    const onChangeSpy = jest.fn();
    component.registerOnChange(onChangeSpy);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    component.writeValue(unavailabilities);
    component.removeUnavailability(unavailabilities[0]);

    expect(onChangeSpy).toHaveBeenCalled();
  });

  it('should compute getMinEndDate correctly', () => {
    expect.assertions(2);

    expect(component.getMinEndDate('2026-01-05')).toBe('2026-01-05');
    expect(component.getMinEndDate(null)).toBe('2026-01-01');
  });

  it('should compute startDateErrorMessages with minDate from minStartDate', () => {
    expect.assertions(1);

    testHost.minStartDate = '2026-01-01';
    fixture.detectChanges();

    const errorMessages = component.startDateErrorMessages();
    expect(errorMessages.some((msg) => msg.rule === 'minDate')).toBe(true);
  });

  it('should compute endDateErrorMessages with maxDate from maxEndDate', () => {
    expect.assertions(1);

    testHost.maxEndDate = '2026-01-31';
    fixture.detectChanges();

    const errorMessages = component.endDateErrorMessages();
    expect(errorMessages.some((msg) => msg.rule === 'maxDate')).toBe(true);
  });

  it('should pass reason to template', () => {
    expect.assertions(1);

    testHost.reason = UnavailabilityReason.SICK_LEAVE;
    fixture.detectChanges();

    expect(component.reason()).toBe(UnavailabilityReason.SICK_LEAVE);
  });

  it('should pass minStartDate and maxEndDate to date-range component', () => {
    expect.assertions(2);

    testHost.minStartDate = '2026-01-01';
    testHost.maxEndDate = '2026-01-31';
    fixture.detectChanges();

    const dateRangeComponent = fixture.debugElement.query(By.directive(MockDateRangeComponent))
      ?.componentInstance as MockDateRangeComponent;

    expect(dateRangeComponent.minStartDate()).toBe('2026-01-01');
    expect(dateRangeComponent.maxEndDate()).toBe('2026-01-31');
  });

  it('should display existing unavailabilities in summary list', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    component.writeValue(unavailabilities);
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList).toBeTruthy();
  });

  it('should not display summary list when unavailabilitiesForReason is empty', () => {
    expect.assertions(1);

    testHost.unavailabilities = [];
    fixture.detectChanges();

    const summaryList = fixture.nativeElement.querySelector('dl[pdk-summary-list]');
    expect(summaryList).toBeNull();
  });

  it('should not add entry when it is exact match of existing', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(existing[0]);
  });

  it('should not add entry when it is completely within existing', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-03',
      endDate: '2026-01-05'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(existing[0]);
  });

  it('should not add entry when it starts at existing start and ends within existing', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-05'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(existing[0]);
  });

  it('should not add entry when it starts within existing and ends at existing end', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(existing[0]);
  });

  it('should replace existing when new entry is superset of existing range', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-03',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0].startDate).toBe('2026-01-01');
  });

  it('should replace existing when new entry is superset of single-day existing', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-05',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0].startDate).toBe('2026-01-01');
  });

  it('should merge when new entry starts before existing and ends within existing', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-03',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-05'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0].endDate).toBe('2026-01-10');
  });

  it('should merge when new entry starts within existing and ends after existing', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-15'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0].startDate).toBe('2026-01-01');
  });

  it('should handle multiple existing entries and merge with first overlapping', () => {
    expect.assertions(3);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      },
      {
        startDate: '2026-01-20',
        endDate: '2026-01-25',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-15'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(2);
    const mergedEntry = result.find((e) => e.startDate === '2026-01-01');
    expect(mergedEntry).toBeDefined();
    expect(mergedEntry?.endDate).toBe('2026-01-15');
  });

  it('should handle new entry that overlaps with multiple existing entries', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      },
      {
        startDate: '2026-01-12',
        endDate: '2026-01-15',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-20'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-20',
      reason: UnavailabilityReason.ANNUAL_LEAVE
    });
  });

  it('should handle new entry that starts exactly at existing start and ends after', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-15'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0].endDate).toBe('2026-01-15');
  });

  it('should handle new entry that starts within existing and ends exactly at existing end', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(existing[0]);
  });

  it('should handle new entry that starts exactly at existing end', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-10',
      endDate: '2026-01-15'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-15',
      reason: UnavailabilityReason.ANNUAL_LEAVE
    });
  });

  it('should handle new entry that ends exactly at existing start', () => {
    expect.assertions(2);

    const existing: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];
    component.writeValue(existing);

    const dateRange: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-05'
    };

    component.handleSubmit(dateRange);
    const result = component.unavailabilitiesForReason();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      reason: UnavailabilityReason.ANNUAL_LEAVE
    });
  });
});
