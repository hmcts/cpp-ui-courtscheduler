import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepeatPatternMoreThanOnceFormComponent } from './repeat-pattern-more-than-once-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FrequencyType, FrequencyTypeUnion, RepeatPattern } from '../../model/repeat-pattern';
import * as dateUtils from '../../../../shared/utils/date-utils';

describe('RepeatPatternMoreThanOnceFormComponent', () => {
  let component: RepeatPatternMoreThanOnceFormComponent;
  let fixture: ComponentFixture<RepeatPatternMoreThanOnceFormComponent>;

  const mockWeeklyPattern: RepeatPattern = {
    startDate: '2023-01-02',
    endDate: '2023-01-08',
    repeatFor: 2,
    frequency: FrequencyType.EVERY_WEEK
  };

  const mockMonthlyPattern: RepeatPattern = {
    startDate: '2023-01-01',
    endDate: '2023-01-31',
    repeatFor: 1,
    frequency: FrequencyType.EVERY_MONTH
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatPatternMoreThanOnceFormComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RepeatPatternMoreThanOnceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  describe('Initialization', () => {
    it('should initialize with default values when initialValues is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      expect(component.frequency()).toBe(FrequencyType.EVERY_WEEK);
      expect(component.repeatFor()).toBe(1);
      expect(component.startDate()).toBeNull();
    });

    it('should initialize frequency from initialValues for EVERY_WEEK', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      expect(component.frequency()).toBe(FrequencyType.EVERY_WEEK);
    });

    it('should initialize frequency from initialValues for EVERY_MONTH', () => {
      fixture.componentRef.setInput('initialValues', mockMonthlyPattern);
      fixture.detectChanges();

      expect(component.frequency()).toBe(FrequencyType.EVERY_MONTH);
    });

    it('should default to EVERY_WEEK for invalid frequency', () => {
      const invalidPattern = {
        ...mockWeeklyPattern,
        frequency: 'INVALID' as FrequencyTypeUnion
      };
      fixture.componentRef.setInput('initialValues', invalidPattern as RepeatPattern);
      fixture.detectChanges();

      expect(component.frequency()).toBe(FrequencyType.EVERY_WEEK);
    });

    it('should initialize repeatFor from initialValues', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      expect(component.repeatFor()).toBe(2);
    });

    it('should default repeatFor to 1 when not provided', () => {
      const patternWithoutRepeatFor = {
        startDate: '2023-01-02',
        endDate: '2023-01-08',
        frequency: FrequencyType.EVERY_WEEK
      };
      fixture.componentRef.setInput('initialValues', patternWithoutRepeatFor as RepeatPattern);
      fixture.detectChanges();

      expect(component.repeatFor()).toBe(1);
    });

    it('should initialize startDate from initialValues', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      expect(component.startDate()).toEqual(mockWeeklyPattern.startDate);
    });
  });

  describe('End date calculation', () => {
    it('should calculate endDate for weekly pattern', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      const expectedEndDate = dateUtils.addDaysToDate(
        new Date(mockWeeklyPattern.startDate),
        dateUtils.DAYS_PER_WEEK * 2 + dateUtils.DAYS_TO_NEXT_SUNDAY
      );
      expect(component.endDate()).toEqual(expectedEndDate);
      expect(component.minEndDate()).toEqual(expectedEndDate);
    });

    it('should calculate endDate for monthly pattern', () => {
      fixture.componentRef.setInput('initialValues', mockMonthlyPattern);
      fixture.detectChanges();

      const expectedEndDate = new Date(2023, 1, 0);
      expect(component.endDate()!.getTime()).toEqual(expectedEndDate.getTime());
    });

    it('should return null for endDate when startDate is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      expect(component.endDate()).toBeNull();
    });
  });

  describe('Date labels', () => {
    it('should generate startDateLabel when startDate exists', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      const expectedLabel = dateUtils.getInsetLabel(new Date(mockWeeklyPattern.startDate));
      expect(component.startDateLabel()).toBe(expectedLabel);
    });

    it('should generate endDateLabel when endDate exists', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      const endDate = component.endDate();
      expect(endDate).not.toBeNull();
      expect(component.endDateLabel()).toBe(dateUtils.getInsetLabel(endDate!));
    });

    it('should return null for startDateLabel when startDate is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      expect(component.startDateLabel()).toBeNull();
    });
  });

  describe('Repeat for', () => {
    it('should return correct maxRepeatFor for weekly', () => {
      component.frequency.set(FrequencyType.EVERY_WEEK);
      expect(component.getMaxRepeatFor()).toBe(dateUtils.ONE_YEAR_IN_WEEKS);
    });

    it('should return correct maxRepeatFor for monthly', () => {
      component.frequency.set(FrequencyType.EVERY_MONTH);
      expect(component.getMaxRepeatFor()).toBe(dateUtils.ONE_YEAR_IN_MONTHS);
    });

    it('should return correct error messages for weekly', () => {
      component.frequency.set(FrequencyType.EVERY_WEEK);
      const messages = component.getRepeatForErrorMessages();
      expect(messages).toEqual([
        {
          rule: 'max',
          message: `Enter a number up to ${dateUtils.ONE_YEAR_IN_WEEKS} weeks`
        }
      ]);
    });

    it('should return correct error messages for monthly', () => {
      component.frequency.set(FrequencyType.EVERY_MONTH);
      const messages = component.getRepeatForErrorMessages();
      expect(messages).toEqual([
        {
          rule: 'max',
          message: `Enter a number up to ${dateUtils.ONE_YEAR_IN_MONTHS} months`
        }
      ]);
    });

    it('should update repeatFor when handleRepeatForChange is called with valid value', () => {
      component.handleRepeatForChange(5);
      expect(component.repeatFor()).toBe(5);
    });

    it('should not update repeatFor when value exceeds max', () => {
      component.frequency.set(FrequencyType.EVERY_WEEK);
      const initialValue = component.repeatFor();
      component.handleRepeatForChange(dateUtils.ONE_YEAR_IN_WEEKS + 1);

      expect(component.repeatFor()).toBe(initialValue);
    });

    it('should set repeatFor to 1 when value is less than 1', () => {
      component.handleRepeatForChange(0);
      expect(component.repeatFor()).toBe(1);
    });
  });

  describe('Interval change', () => {
    it('should reset form when interval changes', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      component.handleIntervalChange(FrequencyType.EVERY_MONTH);

      expect(component.frequency()).toBe(FrequencyType.EVERY_MONTH);
      expect(component.repeatFor()).toBe(1);
      expect(component.startDate()).toBeNull();
      expect(component.endDate()).toBeNull();
    });
  });

  describe('Date changes', () => {
    it('should update startDate when handleStartDateChange is called', () => {
      const newDate = '2023-02-15';
      component.handleStartDateChange(newDate);

      expect(component.startDate()).toEqual(newDate);
    });

    it('should clear both dates when handleStartDateChange is called with empty string', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      component.handleStartDateChange('');

      expect(component.startDate()).toBeNull();
      expect(component.endDate()).toBeNull();
    });

    it('should update endDate when handleEndDateChange is called', () => {
      const newDate = '2023-02-20';
      component.handleEndDateChange(newDate);

      expect(component.endDate()).toEqual(new Date(newDate));
    });

    it('should set endDate to null when handleEndDateChange is called with empty string', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      component.handleEndDateChange('');

      expect(component.endDate()).toBeNull();
    });
  });

  describe('Reset form', () => {
    it('should reset to defaults when initialValues is null', () => {
      component.handleStartDateChange('2023-03-01');
      component.repeatFor.set(5);

      component.resetForm();

      expect(component.frequency()).toBe(FrequencyType.EVERY_WEEK);
      expect(component.repeatFor()).toBe(1);
      expect(component.startDate()).toBeNull();
      expect(component.endDate()).toBeNull();
    });

    it('should reset to initialValues when provided', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      component.handleStartDateChange('2023-03-01');
      component.repeatFor.set(5);
      component.resetForm();

      expect(component.frequency()).toBe(FrequencyType.EVERY_WEEK);
      expect(component.repeatFor()).toBe(2);
      expect(component.startDate()).toEqual(mockWeeklyPattern.startDate);
      expect(component.endDate()).toEqual(new Date(mockWeeklyPattern.endDate));
    });
  });

  describe('Submit form', () => {
    it('should emit submitForm with correct values', () => {
      spyOn(component.submitForm, 'emit');
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      component.handleSubmitForm({
        startDate: new Date(mockWeeklyPattern.startDate),
        endDate: new Date(mockWeeklyPattern.endDate),
        repeatFor: mockWeeklyPattern.repeatFor,
        frequency: mockWeeklyPattern.frequency
      });

      expect(component.submitForm.emit).toHaveBeenCalledWith(mockWeeklyPattern);
    });
  });

  describe('Date disabled functions', () => {
    it('should disable dates correctly for weekly pattern', () => {
      fixture.componentRef.setInput('initialValues', mockWeeklyPattern);
      fixture.detectChanges();

      const invalidDate = new Date('2023-01-03');
      expect(component.isDateDisabled(invalidDate)).toBe(true);
    });

    it('should disable dates correctly for monthly pattern', () => {
      fixture.componentRef.setInput('initialValues', mockMonthlyPattern);
      fixture.detectChanges();

      const invalidDate = new Date('2023-01-15');
      expect(component.isDateDisabled(invalidDate)).toBe(true);
    });
  });
});
