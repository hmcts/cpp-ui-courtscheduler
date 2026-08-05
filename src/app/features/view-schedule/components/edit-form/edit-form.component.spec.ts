import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSessionComponent } from './edit-form.component';
import { mockBusinessType, mockCourtCentres, mockCourtScheduleResponse } from '../../../../shared';
import { By } from '@angular/platform-browser';
import { CourtScheduleSession, EditSessionFormValues } from '../../model/view-schedule.model';
import { SessionsListComponent } from '../sessions-list/sessions-list.component';
import { Component, input } from '@angular/core';
import * as TimeRangeUtils from '../../../../shared/utils/time-range.utils';
import { CourtroomAssignmentType } from '../../../../../app/shared/model/courtroom-assignment';
import { provideMockStore } from '@ngrx/store/testing';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { VALIDATION } from '../../../../shared/utils/session-form.config';

describe('EditSessionComponent', () => {
  let component: EditSessionComponent;
  let fixture: ComponentFixture<EditSessionComponent>;

  const sessionToEdit = mockCourtScheduleResponse.courtSchedules[0].sessions[0];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSessionComponent],
      providers: [provideMockStore()]
    })
      .overrideComponent(EditSessionComponent, {
        remove: { imports: [SessionsListComponent] },
        add: { imports: [MockSessionsListComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditSessionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('courtCentres', mockCourtCentres);
    fixture.componentRef.setInput('sessionToEdit', sessionToEdit);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should return courtroom options matching the session courtHouseId', () => {
    expect(component.courtroomOptions()).toEqual(
      mockCourtCentres[0].courtRooms.map((cr) => ({ value: cr.id, label: cr.name }))
    );
  });

  it('should return empty courtroom options when no matching court centre', () => {
    fixture.componentRef.setInput('courtCentres', []);
    fixture.detectChanges();
    expect(component.courtroomOptions()).toEqual([]);
  });

  it('should compute isPastDate from sessionToEdit', () => {
    expect(component.isPastDate()).toBe(false);
  });

  it('should compute hasHearingsBooked as false when totalBooked is 0', () => {
    expect(component.hasHearingsBooked()).toBe(false);
  });

  it('should compute hasHearingsBooked as true when totalBooked > 0', () => {
    fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, totalBooked: 2 });
    fixture.detectChanges();
    expect(component.hasHearingsBooked()).toBe(true);
  });

  it('should initialise selectedCourtSession from formValues courtSession', () => {
    expect(component.selectedCourtSession()).toBe(sessionToEdit.courtSession);
  });

  it('should update selectedCourtSession via set', () => {
    component.selectedCourtSession.set('PM');
    expect(component.selectedCourtSession()).toBe('PM');
  });

  it('should reset selectedCourtSession when sessionToEdit changes', () => {
    component.selectedCourtSession.set('PM');
    fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, courtSession: 'AD' });
    fixture.detectChanges();
    expect(component.selectedCourtSession()).toBe('AD');
  });

  it('should initialise startTimeErrorMessages and endTimeErrorMessages from TimeRangeUtils', () => {
    const { start, end } = TimeRangeUtils.getTimeRangeErrorMessages();
    expect(component.startTimeErrorMessages).toEqual(start);
    expect(component.endTimeErrorMessages).toEqual(end);
  });

  it('should show AM and PM when allDaySplit is false and no hearings booked', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...sessionToEdit,
      courtSession: 'AD',
      allDaySplit: false,
      totalBooked: 0
    });
    fixture.detectChanges();
    expect(component.showAM()).toBe(true);
    expect(component.showPM()).toBe(true);
    expect(component.showAD()).toBe(true);
  });

  it('should show only AD when hearings are booked and courtSession is AD', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...sessionToEdit,
      courtSession: 'AD',
      allDaySplit: false,
      totalBooked: 1
    });
    fixture.detectChanges();
    expect(component.showAM()).toBe(false);
    expect(component.showPM()).toBe(false);
    expect(component.showAD()).toBe(true);
  });

  it('should show only AD when allDaySplit is true and no hearings booked', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...sessionToEdit,
      courtSession: 'AD',
      allDaySplit: true,
      totalBooked: 0
    });
    fixture.detectChanges();
    expect(component.showAM()).toBe(false);
    expect(component.showPM()).toBe(false);
    expect(component.showAD()).toBe(true);
  });

  describe('durationErrorMessages', () => {
    it('should include required message for duration when slotBased is false', () => {
      expect(component.durationErrorMessages()).toContainEqual({
        rule: 'required',
        message: VALIDATION.duration
      });
    });

    it('should include required message for slots when slotBased is true', () => {
      fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, slotBased: true });
      fixture.detectChanges();
      expect(component.durationErrorMessages()).toContainEqual({
        rule: 'required',
        message: VALIDATION.slot
      });
    });

    it('should include min message referencing totalBooked', () => {
      const totalBooked = 5;
      fixture.componentRef.setInput('sessionToEdit', {
        ...sessionToEdit,
        totalBooked,
        slotBased: true
      });
      fixture.detectChanges();
      expect(component.durationErrorMessages()).toContainEqual({
        rule: 'min',
        message: `Maximum slots cannot be less than total already booked of ${totalBooked} slot(s)`
      });
    });
  });

  describe('morningDurationErrorMessages', () => {
    it('should include required message for morning duration', () => {
      expect(component.morningDurationErrorMessages()).toContainEqual({
        rule: 'required',
        message: VALIDATION.morningDuration
      });
    });

    it('should include min message referencing totalBookedForMorning', () => {
      const totalBookedForMorning = 3;
      fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, totalBookedForMorning });
      fixture.detectChanges();
      expect(component.morningDurationErrorMessages()).toContainEqual({
        rule: 'min',
        message: `Maximum duration for AM cannot be less than total already booked of ${totalBookedForMorning} mins`
      });
    });
  });

  describe('afternoonDurationErrorMessages', () => {
    it('should include required message for afternoon duration', () => {
      expect(component.afternoonDurationErrorMessages()).toContainEqual({
        rule: 'required',
        message: VALIDATION.afternoonDuration
      });
    });

    it('should include min message referencing totalBookedForAfternoon', () => {
      const totalBookedForAfternoon = 4;
      fixture.componentRef.setInput('sessionToEdit', {
        ...sessionToEdit,
        totalBookedForAfternoon
      });
      fixture.detectChanges();
      expect(component.afternoonDurationErrorMessages()).toContainEqual({
        rule: 'min',
        message: `Maximum duration for PM cannot be less than total already booked of ${totalBookedForAfternoon} mins`
      });
    });
  });

  it('should emit submitForm with provided values and isDraft undefined for non-crown', () => {
    spyOn(component.submitForm, 'emit');
    const formValues: EditSessionFormValues = {
      courtSession: sessionToEdit.courtSession,
      businessType: sessionToEdit.businessType,
      panel: sessionToEdit.panel,
      courtRoomId: sessionToEdit.courtRoomId,
      maxSlots: sessionToEdit.maxSlots,
      isOverbookingAllowed: sessionToEdit.isOverbookingAllowed,
      sessionStartTime: sessionToEdit.sessionStartTime,
      sessionEndTime: sessionToEdit.sessionEndTime
    };

    component.handleSubmitForm(formValues);

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      courtRoomId: sessionToEdit.courtRoomId,
      courtRoomName: undefined,
      businessType: sessionToEdit.businessType,
      courtSession: sessionToEdit.courtSession,
      panel: sessionToEdit.panel,
      sessionStartTime: sessionToEdit.sessionStartTime,
      sessionEndTime: sessionToEdit.sessionEndTime,
      isOverbookingAllowed: !!sessionToEdit.isOverbookingAllowed,
      maxSlots: sessionToEdit.maxSlots,
      maxDuration: undefined,
      maxDurationForMorning: undefined,
      maxDurationForAfternoon: undefined,
      isDraft: undefined,
      courtroomAssignment: undefined
    });
  });

  it('should use formValues() defaults when handleSubmitForm is called with empty object', () => {
    spyOn(component.submitForm, 'emit');

    component.handleSubmitForm({} as EditSessionFormValues);

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      courtRoomId: sessionToEdit.courtRoomId,
      courtRoomName: undefined,
      businessType: sessionToEdit.businessType,
      courtSession: sessionToEdit.courtSession,
      panel: sessionToEdit.panel,
      sessionStartTime: undefined,
      sessionEndTime: undefined,
      isOverbookingAllowed: false,
      maxSlots: undefined,
      maxDuration: undefined,
      maxDurationForMorning: undefined,
      maxDurationForAfternoon: undefined,
      isDraft: undefined,
      courtroomAssignment: undefined
    });
  });

  it('should set isDraft to true when courtroomAssignment is DRAFT and jurisdiction is CROWN', () => {
    spyOn(component.submitForm, 'emit');
    fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
    fixture.detectChanges();

    component.handleSubmitForm({
      courtroomAssignment: CourtroomAssignmentType.DRAFT
    } as EditSessionFormValues);

    expect((component.submitForm.emit as jasmine.Spy).calls.mostRecent().args[0].isDraft).toBe(
      true
    );
  });

  it('should emit errors when form is invalid', () => {
    spyOn(component.errors, 'emit');
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();
    fixture.detectChanges();
    expect(component.errors.emit).toHaveBeenCalled();
  });

  it('should hide panel when hasHearingsBooked is true', () => {
    fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, totalBooked: 5 });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[name="panel"]'))).toBeNull();
  });

  describe('getMatchingSlotTypeFilter', () => {
    it('should return true for duration-based business type when session is duration-based', () => {
      fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, slotBased: false });
      fixture.detectChanges();
      expect(component.getMatchingSlotTypeFilter()(mockBusinessType)).toBe(true);
    });

    it('should return false for duration-based business type when session is slot-based', () => {
      fixture.componentRef.setInput('sessionToEdit', { ...sessionToEdit, slotBased: true });
      fixture.detectChanges();
      expect(component.getMatchingSlotTypeFilter()(mockBusinessType)).toBe(false);
    });
  });
});

@Component({
  selector: 'sessions-list',
  template: `
    sessions: {{ sessions() }} removableSessions: {{ removableSessions() }} ineligibleWithHearings:
    {{ ineligibleWithHearings() }} ineligiblePastSessions:
    {{ ineligiblePastSessions() }} isDeleteView: {{ isDeleteView() }} isEditView: {{ isEditView() }}
  `
})
class MockSessionsListComponent {
  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly removableSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleWithHearings = input<CourtScheduleSession[]>([]);
  readonly ineligiblePastSessions = input<CourtScheduleSession[]>([]);
  readonly isDeleteView = input<boolean>(false);
  readonly isEditView = input<boolean>(false);
  readonly jurisdiction = input<JurisdictionType | null>(null);
}
