import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TimeRangeValidatorDirective } from './time-range-validator.directive';
import { FormControl } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  template: `<input [timeRange]="range" [benchMarkTime]="benchMarkTime" />`,
  imports: [TimeRangeValidatorDirective]
})
class TestHostComponent {
  range = { min: '08:00', max: '17:00' };
  benchMarkTime: string | undefined;
}

describe('TimeRangeValidatorDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: TimeRangeValidatorDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.directive(TimeRangeValidatorDirective));
    directive = el.injector.get(TimeRangeValidatorDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should return null when value is empty', () => {
    expect(directive.validate(new FormControl(null))).toBeNull();
  });

  it('should return null when value is within range and after benchMarkTime', () => {
    fixture.componentInstance.benchMarkTime = '09:00';
    fixture.detectChanges();
    expect(directive.validate(new FormControl('10:00'))).toBeNull();
  });

  it('should return null when value is exactly at minimum', () => {
    expect(directive.validate(new FormControl('08:00'))).toBeNull();
  });

  it('should return null when value is exactly at maximum', () => {
    expect(directive.validate(new FormControl('17:00'))).toBeNull();
  });

  it('should return timeRange error with min/max when value is before minimum', () => {
    expect(directive.validate(new FormControl('07:59'))).toEqual({
      timeRange: { min: '08:00', max: '17:00' }
    });
  });

  it('should return timeRange error with min/max when value is after maximum', () => {
    expect(directive.validate(new FormControl('17:01'))).toEqual({
      timeRange: { min: '08:00', max: '17:00' }
    });
  });

  it('should return timeRange error with min/max for malformed time input', () => {
    expect(directive.validate(new FormControl('99:99'))).toEqual({
      timeRange: { min: '08:00', max: '17:00' }
    });
  });

  it('should return endTimeAfterStartTime error when value is before benchMarkTime', () => {
    fixture.componentInstance.benchMarkTime = '14:30';
    fixture.detectChanges();
    expect(directive.validate(new FormControl('14:00'))).toEqual({
      endTimeAfterStartTime: true
    });
  });

  it('should return endTimeAfterStartTime error when value equals benchMarkTime', () => {
    fixture.componentInstance.benchMarkTime = '14:30';
    fixture.detectChanges();
    expect(directive.validate(new FormControl('14:30'))).toEqual({
      endTimeAfterStartTime: true
    });
  });

  it('should reflect updated min/max when range input changes', () => {
    fixture.componentInstance.range = { min: '09:00', max: '18:00' };
    fixture.detectChanges();
    expect(directive.validate(new FormControl('08:30'))).toEqual({
      timeRange: { min: '09:00', max: '18:00' }
    });
  });

  it('should call registered onValidatorChange callback when range changes', () => {
    const onChangeSpy = jest.fn();
    directive.registerOnValidatorChange(onChangeSpy);

    fixture.componentInstance.range = { min: '09:00', max: '18:00' };
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalled();
  });

  it('should call registered onValidatorChange callback when benchMarkTime changes', () => {
    const onChangeSpy = jest.fn();
    directive.registerOnValidatorChange(onChangeSpy);

    fixture.componentInstance.benchMarkTime = '10:00';
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalled();
  });
});
