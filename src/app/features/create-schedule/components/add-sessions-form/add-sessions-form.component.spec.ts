import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ValidationError } from '@cpp/pdk';
import { CUSTOM_SESSION_TIME_LIMITS } from '@cpp/scheduling';
import {
  mockBusinessType,
  mockCrownCourtCentre,
  mockMagistratesCourtCentre,
  mockSession
} from '../../../../shared';
import { CourtroomAssignmentType } from '../../../../shared/model/courtroom-assignment';
import { DayOfWeek } from '../../../../shared/model/days';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import {
  COURTROOM_ASSIGNMENT_OPTIONS,
  VALIDATION
} from '../../../../shared/utils/session-form.config';
import * as TimeRangeUtils from '../../../../shared/utils/time-range.utils';
import { AddSessionsFormComponent } from './add-sessions-form.component';

describe('AddSessionsFormComponent', () => {
  let component: AddSessionsFormComponent;
  let fixture: ComponentFixture<AddSessionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSessionsFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddSessionsFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('courtCentre', mockMagistratesCourtCentre);
    fixture.componentRef.setInput('businessType', mockBusinessType);
    fixture.componentRef.setInput('jurisdiction', null);
    fixture.componentRef.setInput('repeatPattern', null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should initialize with default values when no initialValues are provided', () => {
    expect(component.formModel.customTimes).toBeFalsy();
    expect(component.formModel.isOverbookingAllowed).toBeUndefined();
    expect(component.formModel.sessionStartTime).toBeUndefined();
    expect(component.formModel.sessionEndTime).toBeUndefined();

    const { start, end } = TimeRangeUtils.getTimeRangeErrorMessages();
    expect(component.startTimeErrorMessages).toEqual(start);
    expect(component.endTimeErrorMessages).toEqual(end);
  });

  it('should initialize with provided values when initialValues are set', () => {
    const sessionWithCustomTimes = {
      ...mockSession,
      sessionStartTime: '09:00',
      sessionEndTime: '12:30',
      isOverbookingAllowed: true
    };

    fixture.componentRef.setInput('initialValues', sessionWithCustomTimes);
    fixture.detectChanges();

    expect(component.formModel.customTimes).toBeTruthy();
    expect(component.formModel.sessionStartTime).toBe('09:00');
    expect(component.formModel.sessionEndTime).toBe('12:30');
    expect(component.formModel.isOverbookingAllowed).toBeTruthy();

    const { start, end } = TimeRangeUtils.getTimeRangeErrorMessages();
    expect(component.startTimeErrorMessages).toEqual(start);
    expect(component.endTimeErrorMessages).toEqual(end);
  });

  it('should emit submitForm with correct value on form submit', () => {
    spyOn(component.submitForm, 'emit');
    component.handleSubmitForm({
      sessionType: mockSession.sessionType,
      businessType: mockSession.businessType,
      duration: mockSession.duration,
      panelType: mockSession.panelType,
      repeatDays: mockSession.repeatDays,
      courtroomId: mockSession.courtroom.id
    });

    fixture.detectChanges();
    expect(component.submitForm.emit).toHaveBeenCalledWith(mockSession);
  });

  it('should emit errors if the form is invalid', () => {
    spyOn(component.errors, 'emit');
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();
    fixture.detectChanges();
    expect(component.errors.emit).toHaveBeenCalled();
  });

  it('should initialize courtroom options', () => {
    expect(component.courtroomOptions).toEqual([
      { value: '1', label: 'Courtroom 1' },
      { value: '2', label: 'Courtroom 2' },
      { value: '3', label: 'Courtroom 3' }
    ]);
  });

  it('should handle the "All day" split scenario by calling handleSubmitForm directly', () => {
    spyOn(component.submitForm, 'emit');

    component.handleSubmitForm({
      businessType: mockSession.businessType,
      sessionType: 'AD',
      panelType: mockSession.panelType,
      repeatDays: mockSession.repeatDays,
      courtroomId: mockSession.courtroom.id,
      allDaySplit: true,
      maxDurationForMorning: 150,
      maxDurationForAfternoon: 180
    });

    fixture.detectChanges();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      sessionType: 'AD',
      panelType: 'ADULT',
      repeatDays: [DayOfWeek.Monday],
      allDaySplit: true,
      maxDurationForMorning: 150,
      maxDurationForAfternoon: 180,
      courtroom: mockMagistratesCourtCentre.courtrooms.find((c) => c.id === '1'),
      businessType: mockBusinessType
    });
  });

  it('should clear custom times when checkbox is unchecked', () => {
    component.formModel.sessionStartTime = '09:00';
    component.formModel.sessionEndTime = '13:00';
    component.formModel.customTimes = true;

    component.handleCustomTimesChange(false);

    expect(component.formModel.customTimes).toBe(false);
    expect(component.formModel.sessionStartTime).toBeUndefined();
    expect(component.formModel.sessionEndTime).toBeUndefined();
  });

  it('should set customTimes when checkbox is checked', () => {
    component.formModel.customTimes = false;

    component.handleCustomTimesChange(true);

    expect(component.formModel.customTimes).toBe(true);
  });

  it('should submit form with custom times when provided', () => {
    spyOn(component.submitForm, 'emit');

    component.handleSubmitForm({
      sessionType: mockSession.sessionType,
      businessType: mockSession.businessType,
      duration: mockSession.duration,
      panelType: mockSession.panelType,
      repeatDays: mockSession.repeatDays,
      courtroomId: mockSession.courtroom.id,
      sessionStartTime: '09:00',
      sessionEndTime: '12:30'
    });

    fixture.detectChanges();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      ...mockSession,
      sessionStartTime: '09:00',
      sessionEndTime: '12:30'
    });
  });

  it('should submit form with isOverbookingAllowed when checked', () => {
    spyOn(component.submitForm, 'emit');

    component.handleSubmitForm({
      sessionType: mockSession.sessionType,
      businessType: mockSession.businessType,
      duration: mockSession.duration,
      panelType: mockSession.panelType,
      repeatDays: mockSession.repeatDays,
      courtroomId: mockSession.courtroom.id,
      isOverbookingAllowed: true
    });

    fixture.detectChanges();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      ...mockSession,
      isOverbookingAllowed: true
    });
  });

  it('should get time range through TimeRangeUtils', () => {
    spyOn(TimeRangeUtils, 'getTimeRange').and.callThrough();
    component.formModel.sessionType = 'PM';
    fixture.detectChanges();

    const result = component.timeRange;

    expect(TimeRangeUtils.getTimeRange).toHaveBeenCalledWith(
      component.formModel.sessionType,
      CUSTOM_SESSION_TIME_LIMITS
    );
    expect(result).toEqual(CUSTOM_SESSION_TIME_LIMITS.PM);
  });

  it('should filter out time validation errors when custom times are disabled', () => {
    spyOn(component.errors, 'emit');
    component.formModel.customTimes = false;
    component.formModel.sessionType = 'AM';

    const mockErrors = [
      { message: VALIDATION.startTime },
      { message: VALIDATION.endTime },
      { message: VALIDATION.endTimeAfterStartTime },
      { message: 'Start time must be between 09:00 to 13:00' },
      { message: 'End time must be between 09:00 to 13:00' },
      { message: VALIDATION.courtroom }
    ] as ValidationError[];

    component.handleFormErrors(mockErrors);

    expect(component.errors.emit).toHaveBeenCalledWith([
      { message: 'Start time must be between 09:00 to 13:00' },
      { message: 'End time must be between 09:00 to 13:00' },
      { message: VALIDATION.courtroom }
    ] as ValidationError[]);
  });

  it('should include time validation errors when custom times are enabled', () => {
    spyOn(component.errors, 'emit');
    component.formModel.customTimes = true;
    component.formModel.sessionType = 'AM';

    const mockErrors = [
      { message: VALIDATION.startTime },
      { message: VALIDATION.endTime },
      { message: VALIDATION.endTimeAfterStartTime },
      { message: 'Start time must be between 09:00 to 13:00' },
      { message: 'End time must be between 09:00 to 13:00' }
    ] as ValidationError[];

    component.handleFormErrors(mockErrors);

    expect(component.errors.emit).toHaveBeenCalledWith(mockErrors);
  });

  it('should include all days including Saturday in repeatedDaysOptions when jurisdiction is MAGISTRATES', () => {
    const options = component.repeatedDaysOptions();
    expect(options.some((opt) => opt.value === DayOfWeek.Saturday)).toBe(true);
    expect(options.length).toBe(6); // Monday to Saturday
  });

  describe('Courtroom Assignment', () => {
    it('should not include courtroomAssignment in formModel', () => {
      expect(component.formModel.courtroomAssignment).toBeUndefined();
    });

    it('should not include courtroomAssignment in emitted session when not provided', () => {
      spyOn(component.submitForm, 'emit');

      component.handleSubmitForm({
        sessionType: mockSession.sessionType,
        businessType: mockSession.businessType,
        duration: mockSession.duration,
        panelType: mockSession.panelType,
        repeatDays: mockSession.repeatDays,
        courtroomId: mockSession.courtroom.id
      });

      fixture.detectChanges();

      expect(component.submitForm.emit).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('Crown Court related functionality', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('courtCentre', mockCrownCourtCentre);
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
      fixture.detectChanges();
    });

    it('should filter out Saturday from repeatedDaysOptions when jurisdiction is CROWN', () => {
      const options = component.repeatedDaysOptions();
      expect(options.some((opt) => opt.value === DayOfWeek.Saturday)).toBe(false);
      expect(options.length).toBe(5); // Monday to Friday
    });

    it('should have courtroomAssignmentOptions available when jurisdiction is CROWN', () => {
      expect(component.courtroomAssignmentOptions).toEqual(COURTROOM_ASSIGNMENT_OPTIONS);
    });

    it('should render with courtroom assignment field when jurisdiction is CROWN', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should filter Saturday from repeatDays when initializing with Crown Court', () => {
      const sessionWithSaturday = {
        ...mockSession,
        repeatDays: [DayOfWeek.Monday, DayOfWeek.Saturday]
      };

      fixture.componentRef.setInput('initialValues', sessionWithSaturday);
      fixture.detectChanges();

      expect(component.formModel.repeatDays).not.toContain(DayOfWeek.Saturday);
      expect(component.formModel.repeatDays).toContain(DayOfWeek.Monday);
    });

    it('should submit form with courtroomAssignment when ASSIGNED is provided', () => {
      spyOn(component.submitForm, 'emit');

      const { courtroom, panelType, ...sessionWithoutPanelType } = mockSession;

      component.handleSubmitForm({
        ...mockSession,
        courtroomId: courtroom.id,
        courtroomAssignment: CourtroomAssignmentType.ASSIGNED
      });

      fixture.detectChanges();

      expect(component.submitForm.emit).toHaveBeenCalledWith({
        ...sessionWithoutPanelType,
        courtroom,
        courtroomAssignment: CourtroomAssignmentType.ASSIGNED
      });
    });

    it('should submit form with courtroomAssignment when DRAFT is provided', () => {
      spyOn(component.submitForm, 'emit');

      const { courtroom, panelType, ...sessionWithoutPanelType } = mockSession;

      component.handleSubmitForm({
        ...mockSession,
        courtroomId: courtroom.id,
        courtroomAssignment: CourtroomAssignmentType.DRAFT
      });

      fixture.detectChanges();

      expect(component.submitForm.emit).toHaveBeenCalledWith({
        ...sessionWithoutPanelType,
        courtroom,
        courtroomAssignment: CourtroomAssignmentType.DRAFT
      });
    });

    it('should not include panelType in emitted session for Crown jurisdiction', () => {
      spyOn(component.submitForm, 'emit');

      const { courtroom, panelType, ...sessionWithoutPanelType } = mockSession;

      component.handleSubmitForm({
        ...mockSession,
        courtroomId: courtroom.id
      });

      fixture.detectChanges();

      expect(component.submitForm.emit).toHaveBeenCalledWith({
        ...sessionWithoutPanelType,
        courtroom
      });
    });
  });
});
