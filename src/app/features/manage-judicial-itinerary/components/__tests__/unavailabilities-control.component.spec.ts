import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, forwardRef } from '@angular/core';
import {
  FormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { JsonPipe } from '@angular/common';
import { UnavailabilitiesControlComponent } from '../unavailabilities-control/unavailabilities-control.component';
import { UnavailabilityDatesInputComponent } from '../unavailability-dates-input/unavailability-dates-input.component';
import { Unavailability, UnavailabilityReason } from '../../model/unavailability.interface';
import { DateRange } from '../../../../shared/components/date-range/date-range.component';
import { ValidationError } from '@cpp/pdk';

@Component({
  selector: 'app-test-host',
  template: `
    <unavailabilities-control
      [availabilityDateRange]="availabilityDateRange"
      [ngModel]="unavailabilities"
      (errors)="handleErrors($event)"
    ></unavailabilities-control>
  `,
  imports: [UnavailabilitiesControlComponent, FormsModule]
})
class TestHostComponent {
  availabilityDateRange: DateRange = {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  };
  unavailabilities: Unavailability[] = [];
  handleErrors(errors: ValidationError[] | null) {}
}

@Component({
  selector: 'unavailability-dates-input',
  template: `<div>
    Mock - Reason: {{ reason() | json }}, Min: {{ minStartDate() | json }}, Max:
    {{ maxEndDate() | json }}
  </div>`,
  imports: [JsonPipe, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockUnavailabilityDatesInputComponent),
      multi: true
    }
  ]
})
class MockUnavailabilityDatesInputComponent implements ControlValueAccessor {
  readonly minStartDate = input<string | null>(null);
  readonly maxEndDate = input<string | null>(null);
  readonly reason = input<UnavailabilityReason>();
  readonly errors = input<any>();

  writeValue(value: any): void {}
  registerOnChange(fn: (value: any) => void): void {}
  registerOnTouched(fn: () => void): void {}
}

describe('UnavailabilitiesControlComponent', () => {
  let component: UnavailabilitiesControlComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockDateRange: DateRange = {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    TestBed.overrideComponent(UnavailabilitiesControlComponent, {
      remove: {
        imports: [UnavailabilityDatesInputComponent]
      },
      add: {
        imports: [MockUnavailabilityDatesInputComponent]
      }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(UnavailabilitiesControlComponent)
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

  it('should initialize formGroup with all unavailability reasons', () => {
    expect.assertions(4);

    const formGroup = component.formGroup;
    expect(formGroup.get('annualLeave')).toBeDefined();
    expect(formGroup.get('officialBusiness')).toBeDefined();
    expect(formGroup.get('sickLeave')).toBeDefined();
    expect(formGroup.get('training')).toBeDefined();
  });

  it('should initialize formGroup controls with empty arrays', () => {
    expect.assertions(4);

    const formGroup = component.formGroup;
    expect(formGroup.get('annualLeave')?.value).toEqual([]);
    expect(formGroup.get('officialBusiness')?.value).toEqual([]);
    expect(formGroup.get('sickLeave')?.value).toEqual([]);
    expect(formGroup.get('training')?.value).toEqual([]);
  });

  it('should write empty array value and reset all form controls', () => {
    expect.assertions(4);

    component.writeValue([]);

    expect(component.formGroup.get('annualLeave')?.value).toEqual([]);
    expect(component.formGroup.get('officialBusiness')?.value).toEqual([]);
    expect(component.formGroup.get('sickLeave')?.value).toEqual([]);
    expect(component.formGroup.get('training')?.value).toEqual([]);
  });

  it('should write value and group unavailabilities by reason', () => {
    expect.assertions(4);

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
      },
      {
        startDate: '2026-01-25',
        endDate: '2026-01-26',
        reason: UnavailabilityReason.SICK_LEAVE
      }
    ];

    component.writeValue(unavailabilities);

    expect(component.formGroup.get('annualLeave')?.value).toHaveLength(2);
    expect(component.formGroup.get('officialBusiness')?.value).toEqual([]);
    expect(component.formGroup.get('sickLeave')?.value).toHaveLength(1);
    expect(component.formGroup.get('training')?.value).toEqual([]);
  });

  it('should update value signal when formGroup changes', () => {
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

    expect(component.value().length).toBe(1);
  });

  it('should call onChange when formGroup values change', () => {
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
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalled();
  });

  it('should have all unavailability reasons in reasonEntries', () => {
    expect.assertions(1);

    expect(component.reasonEntries).toEqual(Object.values(UnavailabilityReason));
  });

  it('should display total days count', () => {
    expect.assertions(1);

    const unavailabilities: Unavailability[] = [
      {
        startDate: '2026-01-05',
        endDate: '2026-01-10',
        reason: UnavailabilityReason.ANNUAL_LEAVE
      }
    ];

    testHost.unavailabilities = unavailabilities;
    fixture.detectChanges();

    const totalDaysElement = fixture.nativeElement.querySelector(
      'span[pdk-typography="body-small"]'
    );
    expect(totalDaysElement).toBeTruthy();
  });

  it('should render details for each unavailability reason', () => {
    expect.assertions(1);

    fixture.detectChanges();

    const detailsElements = fixture.nativeElement.querySelectorAll('details[pdk-details]');
    expect(detailsElements.length).toBe(4);
  });

  it('should pass availabilityDateRange to unavailability-dates-input', () => {
    expect.assertions(3);

    testHost.availabilityDateRange = mockDateRange;
    fixture.detectChanges();

    const dateInputComponents = fixture.debugElement.queryAll(
      By.directive(MockUnavailabilityDatesInputComponent)
    );

    expect(dateInputComponents.length).toBeGreaterThan(0);
    const dateInputComponent = dateInputComponents[0]
      ?.componentInstance as MockUnavailabilityDatesInputComponent;

    expect(dateInputComponent.minStartDate()).toBe('2026-01-01');
    expect(dateInputComponent.maxEndDate()).toBe('2026-01-31');
  });

  it('should handle null unavailabilities value', () => {
    expect.assertions(4);

    component.writeValue(null as any);

    expect(component.formGroup.get('annualLeave')?.value).toEqual([]);
    expect(component.formGroup.get('officialBusiness')?.value).toEqual([]);
    expect(component.formGroup.get('sickLeave')?.value).toEqual([]);
    expect(component.formGroup.get('training')?.value).toEqual([]);
  });

  it('should implement FormFieldControl interface', () => {
    expect.assertions(2);

    expect(component.controlType).toBe('unavailabilities-control');
    expect(component.multi).toBe(true);
  });

  it('should have default error messages', () => {
    expect.assertions(1);

    expect(component.errorMessages.length).toBeGreaterThan(0);
  });

  it('should return error message without dates when startDate is missing', () => {
    expect.assertions(1);

    const errorMessageFn = component.errorMessages[0].message as (error: DateRange) => string;
    const error: DateRange = {
      startDate: null as any,
      endDate: '2026-01-31'
    };

    const message = errorMessageFn(error);
    expect(message).toBe('Non-sitting days must be within the sitting days start and end dates');
  });

  it('should return error message without dates when endDate is missing', () => {
    expect.assertions(1);

    const errorMessageFn = component.errorMessages[0].message as (error: DateRange) => string;
    const error: DateRange = {
      startDate: '2026-01-01',
      endDate: null
    };

    const message = errorMessageFn(error);
    expect(message).toBe('Non-sitting days must be within the sitting days start and end dates');
  });

  it('should return error message without dates when startDate equals endDate', () => {
    expect.assertions(1);

    const errorMessageFn = component.errorMessages[0].message as (error: DateRange) => string;
    const error: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-01'
    };

    const message = errorMessageFn(error);
    expect(message).toBe('Non-sitting days must be within the sitting days start and end dates');
  });

  it('should return error message with dates when both dates exist and are different', () => {
    expect.assertions(1);

    const errorMessageFn = component.errorMessages[0].message as (error: DateRange) => string;
    const error: DateRange = {
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    };

    const message = errorMessageFn(error);
    expect(message).toBe(
      'Non-sitting days must be within the sitting days start and end dates: 2026-01-01 to 2026-01-31'
    );
  });

  it('should get ngControl from injector', () => {
    expect.assertions(1);

    const ngControl = component.ngControl;
    expect(ngControl).toBeDefined();
  });

  it('should return null when validate is called with empty array', () => {
    expect.assertions(1);

    const control = {
      value: []
    } as AbstractControl<Unavailability[]>;
    const result = component.validate(control);
    expect(result).toBeNull();
  });

  it('should return null when validate is called with null value', () => {
    expect.assertions(1);

    const control = {
      value: null
    } as AbstractControl<Unavailability[]>;
    const result = component.validate(control);
    expect(result).toBeNull();
  });

  it('should return null when validate is called with no overlaps', () => {
    expect.assertions(1);

    const control = {
      value: [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-10',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ]
    } as AbstractControl<Unavailability[]>;
    const result = component.validate(control);
    expect(result).toBeNull();
  });

  it('should return error when validate is called with overlaps', () => {
    expect.assertions(1);

    const control = {
      value: [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ]
    } as AbstractControl<Unavailability[]>;
    const result = component.validate(control);
    expect(result).not.toBeNull();
  });

  it('should set controlRef when validate returns error and reasonSummaries exist with matching reason', () => {
    expect.assertions(1);

    fixture.detectChanges();
    const control = {
      value: [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-10',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        },
        {
          startDate: '2026-01-05',
          endDate: '2026-01-15',
          reason: UnavailabilityReason.SICK_LEAVE
        }
      ]
    } as AbstractControl<Unavailability[]>;
    component.validate(control);
    fixture.detectChanges();
    expect(component.controlRef()).toEqual(
      expect.objectContaining({
        nativeElement: expect.any(HTMLElement)
      })
    );
  });

  it('should set controlRef when validate returns null', () => {
    expect.assertions(1);

    fixture.detectChanges();
    const control = {
      value: [
        {
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          reason: UnavailabilityReason.ANNUAL_LEAVE
        }
      ]
    } as AbstractControl<Unavailability[]>;
    component.validate(control);
    fixture.detectChanges();
    expect(component.controlRef()).toEqual(
      expect.objectContaining({
        nativeElement: expect.any(HTMLElement)
      })
    );
  });
});
