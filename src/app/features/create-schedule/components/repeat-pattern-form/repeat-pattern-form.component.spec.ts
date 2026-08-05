import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepeatPatternFormComponent } from './repeat-pattern-form.component';
import { PdkTabComponent, ValidationError } from '@cpp/pdk';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { mockRepeatPattern } from '../../../../shared';
import { FrequencyType, RepeatPattern } from '../../model/repeat-pattern';

describe('RepeatPatternFormComponent', () => {
  let component: RepeatPatternFormComponent;
  let fixture: ComponentFixture<RepeatPatternFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatPatternFormComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RepeatPatternFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialValues', {
      ...mockRepeatPattern,
      frequency: FrequencyType.ONCE
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should return 0 for ONCE frequency', () => {
    fixture.componentRef.setInput('initialValues', {
      ...mockRepeatPattern,
      frequency: FrequencyType.ONCE
    });
    fixture.detectChanges();

    expect(component.tabOptionIndex()).toBe(0);
  });

  it('should return 1 for EVERY_WEEK frequency', () => {
    fixture.componentRef.setInput('initialValues', {
      ...mockRepeatPattern,
      frequency: FrequencyType.EVERY_WEEK
    });
    fixture.detectChanges();

    expect(component.tabOptionIndex()).toBe(1);
  });

  it('should return 1 for EVERY_MONTH frequency', () => {
    fixture.componentRef.setInput('initialValues', {
      ...mockRepeatPattern,
      frequency: FrequencyType.EVERY_MONTH
    });
    fixture.detectChanges();

    expect(component.tabOptionIndex()).toBe(1);
  });

  it('should return 0 when no initialValues frequency', () => {
    fixture.componentRef.setInput('initialValues', null);
    fixture.detectChanges();

    expect(component.tabOptionIndex()).toBe(0);
  });

  it('should return currentTabIndex when not 0', () => {
    component.currentTabIndex.set(1);
    fixture.detectChanges();

    expect(component.tabOptionIndex()).toBe(1);
  });

  it('should return initialValues for Once tab when frequency is ONCE', () => {
    const oncePattern = {
      ...mockRepeatPattern,
      frequency: FrequencyType.ONCE
    };
    fixture.componentRef.setInput('initialValues', oncePattern);
    fixture.detectChanges();

    expect(component.initialValuesForOnce()).toEqual(oncePattern);
    expect(component.initialValuesForMoreThanOnce()).toBeNull();
  });

  it('should return initialValues for MoreThanOnce tab when frequency is EVERY_WEEK', () => {
    const weeklyPattern = {
      ...mockRepeatPattern,
      frequency: FrequencyType.EVERY_WEEK
    };
    fixture.componentRef.setInput('initialValues', weeklyPattern);
    fixture.detectChanges();

    expect(component.initialValuesForOnce()).toBeNull();
    expect(component.initialValuesForMoreThanOnce()).toEqual(weeklyPattern);
  });

  it('should return initialValues for MoreThanOnce tab when frequency is EVERY_MONTH', () => {
    const monthlyPattern = {
      ...mockRepeatPattern,
      frequency: FrequencyType.EVERY_MONTH
    };
    fixture.componentRef.setInput('initialValues', monthlyPattern);
    fixture.detectChanges();

    expect(component.initialValuesForOnce()).toBeNull();
    expect(component.initialValuesForMoreThanOnce()).toEqual(monthlyPattern);
  });

  it('should return null when initialValues has no frequency', () => {
    const invalidPattern = {
      startDate: '2023-01-02',
      endDate: '2023-01-08',
      repeatFor: 1
    };
    fixture.componentRef.setInput('initialValues', invalidPattern as RepeatPattern);
    fixture.detectChanges();

    expect(component.initialValuesForOnce()).toBeNull();
    expect(component.initialValuesForMoreThanOnce()).toBeNull();
  });

  it('should return null when initialValues is null', () => {
    fixture.componentRef.setInput('initialValues', null);
    fixture.detectChanges();

    expect(component.initialValuesForOnce()).toBeNull();
    expect(component.initialValuesForMoreThanOnce()).toBeNull();
  });

  it('should update currentTabIndex and reset forms on tab change', () => {
    spyOn(component, 'resetForms');
    spyOn(component.errors, 'emit');

    const tabEvent = { index: 1 } as PdkTabComponent;
    component.handleTabChange(tabEvent);

    expect(component.currentTabIndex()).toBe(1);
    expect(component.errors.emit).toHaveBeenCalledWith([]);
    expect(component.resetForms).toHaveBeenCalled();
  });

  it('should emit submitForm when handleFormSubmit is called', () => {
    spyOn(component.submitForm, 'emit');
    const repeatPattern = {
      ...mockRepeatPattern,
      frequency: FrequencyType.ONCE
    };

    component.handleFormSubmit(repeatPattern);

    expect(component.submitForm.emit).toHaveBeenCalledWith(repeatPattern);
  });

  it('should emit errors when handleErrors is called', () => {
    spyOn(component.errors, 'emit');
    const errors: ValidationError[] = [{ id: 'field', message: 'Field is required' }];

    component.handleErrors(errors);

    expect(component.errors.emit).toHaveBeenCalledWith(errors);
  });

  it('should emit null when handleErrors is called with null', () => {
    spyOn(component.errors, 'emit');

    component.handleErrors(null);

    expect(component.errors.emit).toHaveBeenCalledWith(null);
  });

  it('should call resetForm on both child forms', () => {
    fixture.detectChanges();
    const onceForm = component.onceForm();
    const moreThanOnceForm = component.moreThanOnceForm();

    if (onceForm) {
      spyOn(onceForm, 'resetForm');
    }
    if (moreThanOnceForm) {
      spyOn(moreThanOnceForm, 'resetForm');
    }

    component.resetForms();

    if (onceForm) {
      expect(onceForm.resetForm).toHaveBeenCalled();
    }
    if (moreThanOnceForm) {
      expect(moreThanOnceForm.resetForm).toHaveBeenCalled();
    }
  });

  it('should handle resetForms when child forms are not available', () => {
    expect(() => component.resetForms()).not.toThrow();
  });
});
