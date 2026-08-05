import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DateRangeComponent } from '../date-range.component';

@Component({
  selector: 'app-test-host',
  template: `
    <date-range
      [label]="label"
      [minStartDate]="minStartDate"
      [maxStartDate]="maxStartDate"
      [minEndDate]="minEndDate"
      [maxEndDate]="maxEndDate"
      [getMinEndDate]="getMinEndDate"
      [getMaxEndDate]="getMaxEndDate"
    ></date-range>
  `,
  imports: [DateRangeComponent]
})
class TestHostComponent {
  label: string | undefined;
  minStartDate: Date | string | undefined;
  maxStartDate: Date | string | undefined;
  minEndDate: string | undefined;
  maxEndDate: string | undefined;
  getMinEndDate: ((startDate: string) => string | null) | undefined;
  getMaxEndDate: ((startDate: string) => string | null) | undefined;
}

describe('DateRangeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let component: DateRangeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    testHost.getMinEndDate = () => null;
    testHost.getMaxEndDate = () => null;
    component = fixture.debugElement.query(By.directive(DateRangeComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should transform Date object to string for minStartDate', () => {
    expect.assertions(1);
    const date = new Date('2026-01-15');
    testHost.minStartDate = date;
    fixture.detectChanges();
    expect(component.minStartDate()).toBe('2026-01-15');
  });

  it('should keep string value for minStartDate when string is provided', () => {
    expect.assertions(1);
    testHost.minStartDate = '2026-01-15';
    fixture.detectChanges();
    expect(component.minStartDate()).toBe('2026-01-15');
  });

  it('should keep null value for minStartDate when null is provided', () => {
    expect.assertions(1);
    testHost.minStartDate = null;
    fixture.detectChanges();
    expect(component.minStartDate()).toBeNull();
  });

  it('should keep undefined value for minStartDate when undefined is provided', () => {
    expect.assertions(1);
    testHost.minStartDate = undefined;
    fixture.detectChanges();
    expect(component.minStartDate()).toBeUndefined();
  });

  it('should transform Date object to string for maxStartDate', () => {
    expect.assertions(1);
    const date = new Date('2026-12-31');
    testHost.maxStartDate = date;
    fixture.detectChanges();
    expect(component.maxStartDate()).toBe('2026-12-31');
  });

  it('should keep string value for maxStartDate when string is provided', () => {
    expect.assertions(1);
    testHost.maxStartDate = '2026-12-31';
    fixture.detectChanges();
    expect(component.maxStartDate()).toBe('2026-12-31');
  });

  it('should keep null value for maxStartDate when null is provided', () => {
    expect.assertions(1);
    testHost.maxStartDate = null;
    fixture.detectChanges();
    expect(component.maxStartDate()).toBeNull();
  });

  it('should keep undefined value for maxStartDate when undefined is provided', () => {
    expect.assertions(1);
    testHost.maxStartDate = undefined;
    fixture.detectChanges();
    expect(component.maxStartDate()).toBeUndefined();
  });

  it('should render correctly', () => {
    testHost.label = 'Test Date Range';
    testHost.minStartDate = new Date('2026-01-01');
    testHost.maxStartDate = new Date('2026-12-31');
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should use minEndDate when provided in computedMinEndDate', () => {
    expect.assertions(1);

    testHost.minEndDate = '2026-01-20';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMinEndDate()).toBe('2026-01-20');
  });

  it('should use getMinEndDate when minEndDate is not provided in computedMinEndDate', () => {
    expect.assertions(1);

    testHost.getMinEndDate = (startDate: string) => startDate;
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMinEndDate()).toBe('2026-01-15');
  });

  it('should use getMinEndDate when minEndDate is null in computedMinEndDate', () => {
    expect.assertions(1);

    testHost.minEndDate = null;
    testHost.getMinEndDate = (startDate: string) => '2026-01-20';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMinEndDate()).toBe('2026-01-20');
  });

  it('should use getMinEndDate when minEndDate is undefined in computedMinEndDate', () => {
    expect.assertions(1);

    testHost.minEndDate = undefined;
    testHost.getMinEndDate = (startDate: string) => '2026-01-20';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMinEndDate()).toBe('2026-01-20');
  });

  it('should use maxEndDate when provided in computedMaxEndDate', () => {
    expect.assertions(1);

    testHost.maxEndDate = '2026-02-20';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMaxEndDate()).toBe('2026-02-20');
  });

  it('should use getMaxEndDate when maxEndDate is not provided in computedMaxEndDate', () => {
    expect.assertions(1);

    testHost.getMaxEndDate = (startDate: string) => '2026-02-15';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMaxEndDate()).toBe('2026-02-15');
  });

  it('should use getMaxEndDate when maxEndDate is null in computedMaxEndDate', () => {
    expect.assertions(1);

    testHost.maxEndDate = null;
    testHost.getMaxEndDate = (startDate: string) => '2026-02-20';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMaxEndDate()).toBe('2026-02-20');
  });

  it('should use getMaxEndDate when maxEndDate is undefined in computedMaxEndDate', () => {
    expect.assertions(1);

    testHost.maxEndDate = undefined;
    testHost.getMaxEndDate = (startDate: string) => '2026-02-20';
    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.computedMaxEndDate()).toBe('2026-02-20');
  });

  it('should return label when startDate is in valid format in startDateLabel', () => {
    expect.assertions(1);

    component.formGroup.controls.startDate.setValue('2026-01-15');
    fixture.detectChanges();

    expect(component.startDateLabel()).toBeTruthy();
  });

  it('should return null when startDate is not in valid format in startDateLabel', () => {
    expect.assertions(1);

    component.formGroup.controls.startDate.setValue('invalid-date');
    fixture.detectChanges();

    expect(component.startDateLabel()).toBeNull();
  });

  it('should return null when startDate is null in startDateLabel', () => {
    expect.assertions(1);

    component.formGroup.controls.startDate.setValue(null);
    fixture.detectChanges();

    expect(component.startDateLabel()).toBeNull();
  });

  it('should return label when endDate is in valid format in endDateLabel', () => {
    expect.assertions(1);

    component.formGroup.controls.endDate.setValue('2026-01-31');
    fixture.detectChanges();

    expect(component.endDateLabel()).toBeTruthy();
  });

  it('should return null when endDate is not in valid format in endDateLabel', () => {
    expect.assertions(1);

    component.formGroup.controls.endDate.setValue('invalid-date');
    fixture.detectChanges();

    expect(component.endDateLabel()).toBeNull();
  });

  it('should return null when endDate is null in endDateLabel', () => {
    expect.assertions(1);

    component.formGroup.controls.endDate.setValue(null);
    fixture.detectChanges();

    expect(component.endDateLabel()).toBeNull();
  });
});
