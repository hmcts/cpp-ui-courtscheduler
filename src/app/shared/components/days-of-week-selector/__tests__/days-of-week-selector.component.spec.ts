import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DaysOfWeekSelectorComponent } from '../days-of-week-selector.component';
import { DayOfWeek } from '../../../model/days';

@Component({
  selector: 'app-test-host',
  template: `
    <days-of-week-selector
      [label]="label"
      [labelType]="labelType"
      [required]="required"
    ></days-of-week-selector>
  `,
  imports: [DaysOfWeekSelectorComponent]
})
class TestHostComponent {
  label = 'Select days';
  labelType: 'small' | 'none' = 'small';
  required: boolean | string = false;
}

describe('DaysOfWeekSelectorComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let component: DaysOfWeekSelectorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(DaysOfWeekSelectorComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should transform string "true" to boolean true for required input', () => {
    expect.assertions(1);
    testHost.required = 'true';
    fixture.detectChanges();
    expect(component.required()).toBe(true);
  });

  it('should transform string "false" to boolean false for required input', () => {
    expect.assertions(1);
    testHost.required = 'false';
    fixture.detectChanges();
    expect(component.required()).toBe(false);
  });

  it('should return true for isAllSelected when all weekdays are selected', () => {
    expect.assertions(1);
    component.formControl.setValue([
      DayOfWeek.Monday,
      DayOfWeek.Tuesday,
      DayOfWeek.Wednesday,
      DayOfWeek.Thursday,
      DayOfWeek.Friday
    ]);
    fixture.detectChanges();
    expect(component.isAllSelected()).toBe(true);
  });

  it('should return false for isAllSelected when not all weekdays are selected', () => {
    expect.assertions(1);
    component.formControl.setValue([DayOfWeek.Monday, DayOfWeek.Tuesday]);
    fixture.detectChanges();
    expect(component.isAllSelected()).toBe(false);
  });

  it('should return false for isAllSelected when no days are selected', () => {
    expect.assertions(1);
    component.formControl.setValue([]);
    fixture.detectChanges();
    expect(component.isAllSelected()).toBe(false);
  });

  it('should select all weekdays when handleSelectAllChange is called with true', () => {
    expect.assertions(1);
    component.handleSelectAllChange(true);
    expect(component.formControl.value).toEqual([
      DayOfWeek.Monday,
      DayOfWeek.Tuesday,
      DayOfWeek.Wednesday,
      DayOfWeek.Thursday,
      DayOfWeek.Friday
    ]);
  });

  it('should clear selection when handleSelectAllChange is called with false', () => {
    expect.assertions(1);
    component.formControl.setValue([DayOfWeek.Monday, DayOfWeek.Tuesday]);
    component.handleSelectAllChange(false);
    expect(component.formControl.value).toEqual([]);
  });

  it('should disable form control when setDisabledState is called with true', () => {
    expect.assertions(1);
    component.setDisabledState(true);
    expect(component.formControl.disabled).toBe(true);
  });

  it('should enable form control when setDisabledState is called with false', () => {
    expect.assertions(1);
    component.formControl.disable();
    component.setDisabledState(false);
    expect(component.formControl.enabled).toBe(true);
  });

  it('should render correctly', () => {
    testHost.label = 'Test Label';
    testHost.required = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
