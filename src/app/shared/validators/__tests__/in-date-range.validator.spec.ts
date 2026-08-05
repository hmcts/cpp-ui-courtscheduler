import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { InDateRangeValidator } from '../in-date-range.validator';
import { DateRange } from '../../components/date-range/date-range.component';
import { By } from '@angular/platform-browser';

interface DateRangeItem {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-test-host',
  template: `
    <form>
      <input [formControl]="control" [inDateRange]="dateRange" />
    </form>
  `,
  imports: [ReactiveFormsModule, InDateRangeValidator]
})
class TestHostComponent {
  control = new FormControl<DateRangeItem[]>([]);
  dateRange: DateRange = {
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  };
}

describe('InDateRangeValidator', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let validator: InDateRangeValidator;
  let control: FormControl<DateRangeItem[]>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    control = testHost.control;

    const inputElement = fixture.debugElement.query(By.css('input'));
    validator = inputElement.injector.get(InDateRangeValidator);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(validator).toBeTruthy();
  });

  it('should return null when control value is empty array', () => {
    expect.assertions(1);
    control.setValue([]);
    const errors = validator.validate(control);
    expect(errors).toBeNull();
  });

  it('should return null when all items are within date range', () => {
    expect.assertions(1);
    control.setValue([
      { startDate: '2026-01-05', endDate: '2026-01-10' },
      { startDate: '2026-01-15', endDate: '2026-01-20' }
    ]);
    const errors = validator.validate(control);
    expect(errors).toBeNull();
  });

  it('should return notInRange error when item startDate is before range start', () => {
    expect.assertions(1);
    control.setValue([{ startDate: '2025-12-31', endDate: '2026-01-10' }]);
    const errors = validator.validate(control);
    expect(errors?.['notInRange']).toBeDefined();
  });

  it('should return notInRange error when item startDate is after range end', () => {
    expect.assertions(1);
    control.setValue([{ startDate: '2026-02-01', endDate: '2026-02-05' }]);
    const errors = validator.validate(control);
    expect(errors?.['notInRange']).toBeDefined();
  });

  it('should return notInRange error when item endDate is before range start', () => {
    expect.assertions(1);
    control.setValue([{ startDate: '2025-12-25', endDate: '2025-12-31' }]);
    const errors = validator.validate(control);
    expect(errors?.['notInRange']).toBeDefined();
  });

  it('should return notInRange error when item endDate is after range end', () => {
    expect.assertions(1);
    control.setValue([{ startDate: '2026-01-25', endDate: '2026-02-05' }]);
    const errors = validator.validate(control);
    expect(errors?.['notInRange']).toBeDefined();
  });

  it('should return notInRange error when dateRange has invalid dates', () => {
    expect.assertions(1);
    testHost.dateRange = { startDate: '', endDate: '2026-01-31' };
    fixture.detectChanges();
    control.setValue([{ startDate: '2026-01-05', endDate: '2026-01-10' }]);
    const errors = validator.validate(control);
    expect(errors?.['notInRange']).toBeDefined();
  });

  it('should handle single DateRangeItem value (not array)', () => {
    expect.assertions(1);
    const singleControl = new FormControl<DateRangeItem>({
      startDate: '2026-01-05',
      endDate: '2026-01-10'
    });
    const errors = validator.validate(singleControl);
    expect(errors).toBeNull();
  });

  it('should return notInRange error with formatted dates in error object', () => {
    expect.assertions(2);
    control.setValue([{ startDate: '2025-12-31', endDate: '2026-01-10' }]);
    const errors = validator.validate(control);
    expect(errors?.['notInRange']).toBeDefined();
    expect(errors?.['notInRange'].startDate).toBeDefined();
  });

  it('should call onValidatorChange when dateRange changes', () => {
    expect.assertions(1);
    const onValidatorChangeSpy = jest.fn();
    validator.registerOnValidatorChange(onValidatorChangeSpy);
    testHost.dateRange = { startDate: '2026-02-01', endDate: '2026-02-28' };
    fixture.detectChanges();
    expect(onValidatorChangeSpy).toHaveBeenCalled();
  });
});
