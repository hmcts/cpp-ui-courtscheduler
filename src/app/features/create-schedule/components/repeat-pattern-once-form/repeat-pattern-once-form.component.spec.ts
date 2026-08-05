import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepeatPatternOnceFormComponent } from './repeat-pattern-once-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FrequencyType, RepeatPattern } from '../../model/repeat-pattern';
import * as dateUtils from '../../../../shared/utils/date-utils';

describe('RepeatPatternOnceFormComponent', () => {
  let component: RepeatPatternOnceFormComponent;
  let fixture: ComponentFixture<RepeatPatternOnceFormComponent>;

  const mockRepeatPattern: RepeatPattern = {
    startDate: '2023-01-02',
    endDate: '2023-01-08',
    repeatFor: 1,
    frequency: FrequencyType.ONCE
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatPatternOnceFormComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RepeatPatternOnceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  describe('Initialization', () => {
    it('should initialize startDate from initialValues', () => {
      fixture.componentRef.setInput('initialValues', mockRepeatPattern);
      fixture.detectChanges();

      expect(component.startDate()).toEqual(mockRepeatPattern.startDate);
    });

    it('should return null for startDate when initialValues is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      expect(component.startDate()).toBeNull();
    });
  });

  describe('End date calculation', () => {
    it('should calculate endDate as startDate + 6 days', () => {
      fixture.componentRef.setInput('initialValues', mockRepeatPattern);
      fixture.detectChanges();

      const expectedEndDate = dateUtils.addDaysToDate(
        new Date(mockRepeatPattern.startDate),
        dateUtils.DAYS_TO_NEXT_SUNDAY
      );
      expect(component.endDate()).toEqual(expectedEndDate);
    });

    it('should return null for endDate when startDate is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      expect(component.endDate()).toBeNull();
    });
  });

  describe('Date labels', () => {
    it('should generate startDateLabel when startDate exists', () => {
      fixture.componentRef.setInput('initialValues', mockRepeatPattern);
      fixture.detectChanges();

      const expectedLabel = dateUtils.getInsetLabel(new Date(mockRepeatPattern.startDate));
      expect(component.startDateLabel()).toBe(expectedLabel);
    });

    it('should return null for startDateLabel when startDate is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      expect(component.startDateLabel()).toBeNull();
    });
  });

  describe('Date changes', () => {
    it('should update startDate when handleStartDateChange is called', () => {
      const newDate = '2023-02-15';
      component.handleStartDateChange(newDate);

      expect(component.startDate()).toEqual(newDate);
    });

    it('should set startDate to null when handleStartDateChange is called with empty string', () => {
      component.handleStartDateChange('');

      expect(component.startDate()).toBeNull();
    });
  });

  describe('Reset form', () => {
    it('should reset form with initialValues when resetForm is called', () => {
      fixture.componentRef.setInput('initialValues', mockRepeatPattern);
      fixture.detectChanges();

      component.handleStartDateChange('2023-03-01');
      component.resetForm();

      expect(component.startDate()).toEqual(mockRepeatPattern.startDate);
    });

    it('should reset form to null when initialValues is null', () => {
      fixture.componentRef.setInput('initialValues', null);
      fixture.detectChanges();

      component.handleStartDateChange('2023-03-01');
      component.resetForm();

      expect(component.startDate()).toBeNull();
    });
  });

  describe('Form submission', () => {
    it('should emit submitForm with correct values when handleSubmitForm is called', () => {
      spyOn(component.submitForm, 'emit');
      fixture.componentRef.setInput('initialValues', mockRepeatPattern);
      fixture.detectChanges();

      component.handleSubmitForm({
        startDate: new Date(mockRepeatPattern.startDate)
      });

      expect(component.submitForm.emit).toHaveBeenCalledWith(mockRepeatPattern);
    });
  });
});
