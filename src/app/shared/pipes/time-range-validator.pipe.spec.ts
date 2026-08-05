import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TimeRangeValidatorDirective } from './time-range-validator.pipe';
import { FormControl } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  template: `<input [timeRangeValidator] [timeRange]="range" [startTime]="startTime" />`,
  imports: [TimeRangeValidatorDirective]
})
class TestHostComponent {
  range = { min: '08:00', max: '17:00' };
  startTime: string | undefined;
}

describe('TimeRangeValidatorDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: TimeRangeValidatorDirective;
  let directiveElement: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    directiveElement = fixture.debugElement.query(By.directive(TimeRangeValidatorDirective));
    directive = directiveElement.injector.get(TimeRangeValidatorDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should return null (valid) when the value is within the range and after the start time', () => {
    fixture.componentInstance.startTime = '09:00';
    fixture.detectChanges();
    const control = new FormControl('10:00');
    expect(directive.validate(control)).toBeNull();
  });

  it('should return a timeRange error when the value is before the minimum', () => {
    const control = new FormControl('07:59');
    expect(directive.validate(control)).toEqual({ timeRange: true });
  });

  it('should return a timeRange error when the value is after the maximum', () => {
    const control = new FormControl('17:01');
    expect(directive.validate(control)).toEqual({ timeRange: true });
  });

  it('should return an endTimeAfterStartTime error when value is not after startTime', () => {
    fixture.componentInstance.startTime = '14:30';
    fixture.detectChanges();
    const control = new FormControl('14:00');
    expect(directive.validate(control)).toEqual({ endTimeAfterStartTime: true });
  });

  it('should return null when value is empty', () => {
    const control = new FormControl(null);
    expect(directive.validate(control)).toBeNull();
  });

  it('should return a timeRange error for malformed times', () => {
    const control = new FormControl('99:99');
    expect(directive.validate(control)).toEqual({ timeRange: true });
  });
});
