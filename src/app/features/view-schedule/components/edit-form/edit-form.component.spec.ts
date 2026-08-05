import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSessionComponent } from './edit-form.component';
import { mockBusinessType, mockCourtCentres, mockCourtScheduleResponse } from '../../../../shared';
import { By } from '@angular/platform-browser';
import { CourtScheduleSession } from '../../model/view-schedule.model';
import { isPastSession } from '../../../../shared/utils/session-criteria.utils';
import { SessionsListComponent } from '../sessions-list/sessions-list.component';
import { Component, input } from '@angular/core';
import * as TimeRangeUtils from '../../../../shared/utils/time-range.utils';
import { SessionType } from '../../../../shared/model/session';
import { CourtroomAssignmentType } from '../../../../shared/model/courtroom-assignment';
import { provideMockStore } from '@ngrx/store/testing';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('EditSessionComponent', () => {
  let component: EditSessionComponent;
  let fixture: ComponentFixture<EditSessionComponent>;

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
    fixture.componentRef.setInput(
      'sessionToEdit',
      mockCourtScheduleResponse.courtSchedules[0].sessions[0]
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should initialize courtroom options on ngOnInit', () => {
    component.ngOnInit();
    expect(component.courtroomOptions).toEqual(
      mockCourtCentres[0].courtRooms.map((courtroom) => ({
        value: courtroom.id,
        label: courtroom.name
      }))
    );
  });

  it('should emit submitForm with correct value on form submit', () => {
    const sessionToEdit = mockCourtScheduleResponse.courtSchedules[0].sessions[0];
    spyOn(component.submitForm, 'emit');
    component.handleSubmitForm({
      courtSession: sessionToEdit.courtSession,
      businessType: sessionToEdit.businessType,
      panel: sessionToEdit.panel,
      courtRoomId: sessionToEdit.courtRoomId,
      maxSlots: sessionToEdit.maxSlots,
      isOverbookingAllowed: sessionToEdit.isOverbookingAllowed,
      sessionStartTime: sessionToEdit.sessionStartTime,
      sessionEndTime: sessionToEdit.sessionEndTime
    } as CourtScheduleSession);

    fixture.detectChanges();
    expect(component.submitForm.emit).toHaveBeenCalledWith({
      courtScheduleId: sessionToEdit.courtScheduleId,
      courtRoomId: sessionToEdit.courtRoomId,
      businessType: sessionToEdit.businessType,
      courtSession: sessionToEdit.courtSession,
      panel: sessionToEdit.panel,
      allDaySplit: false,
      isOverbookingAllowed: sessionToEdit.isOverbookingAllowed,
      sessionStartTime: sessionToEdit.sessionStartTime,
      sessionEndTime: sessionToEdit.sessionEndTime,
      ...(sessionToEdit.maxSlots
        ? { maxSlots: sessionToEdit.maxSlots }
        : { maxDuration: sessionToEdit.maxDuration }),
      courtroomAssignment: sessionToEdit.courtroomAssignment ?? CourtroomAssignmentType.ASSIGNED
    } as CourtScheduleSession);
  });

  it('should emit errors if the form is invalid', () => {
    spyOn(component.errors, 'emit');
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();
    fixture.detectChanges();
    expect(component.errors.emit).toHaveBeenCalled();
  });

  it('should set isPastDate correctly on ngOnInit', () => {
    component.ngOnInit();
    expect(component.isPastDate).toEqual(isPastSession(component.sessionToEdit()));
  });

  it('should handle submitForm correctly with default values', () => {
    const sessionToEdit = mockCourtScheduleResponse.courtSchedules[0].sessions[0];
    spyOn(component.submitForm, 'emit');

    component.handleSubmitForm({} as CourtScheduleSession);
    fixture.detectChanges();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      courtScheduleId: sessionToEdit.courtScheduleId,
      courtRoomId: sessionToEdit.courtRoomId,
      businessType: sessionToEdit.businessType,
      courtSession: sessionToEdit.courtSession,
      panel: sessionToEdit.panel,
      isOverbookingAllowed: sessionToEdit.isOverbookingAllowed,
      sessionStartTime: sessionToEdit.sessionStartTime,
      sessionEndTime: sessionToEdit.sessionEndTime,
      allDaySplit: false,
      maxDuration: undefined,
      courtroomAssignment: sessionToEdit.courtroomAssignment ?? CourtroomAssignmentType.ASSIGNED
    } as unknown as CourtScheduleSession);
  });

  it('should update formValues.courtSession when onCourtSessionChange is called', () => {
    component.onCourtSessionChange('PM');
    expect(component.formValues.courtSession).toBe('PM');
  });

  it('should display AM/PM/AD options when AD allDaySplit is false and there are no hearings associated (totalBooked is 0)', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...component.sessionToEdit(),
      courtSession: 'AD',
      allDaySplit: false,
      totalBooked: 0
    });
    component.ngOnInit();
    expect(component.showAM).toBe(true);
    expect(component.showPM).toBe(true);
    expect(component.showAD).toBe(true);
  });

  it('should display only AD option when AD and there are hearings associated (totalBooked is positive int', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...component.sessionToEdit(),
      courtSession: 'AD',
      allDaySplit: false,
      totalBooked: 1
    });
    component.ngOnInit();
    expect(component.showAM).toBe(false);
    expect(component.showPM).toBe(false);
    expect(component.showAD).toBe(true);
  });

  it('should display only AD option when AD allDaySplit is true and there are no hearings associated (totalBooked is 0)', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...component.sessionToEdit(),
      courtSession: 'AD',
      allDaySplit: true,
      totalBooked: 0
    });
    component.ngOnInit();
    expect(component.showAM).toBe(false);
    expect(component.showPM).toBe(false);
    expect(component.showAD).toBe(true);
  });

  it('should hide panel if hasHearingsBooked is true', () => {
    fixture.componentRef.setInput('sessionToEdit', {
      ...component.sessionToEdit(),
      totalBooked: 5
    });
    component.ngOnInit();
    fixture.detectChanges();

    const panelFormField = fixture.debugElement.query(By.css('[name="panel"]'));
    expect(panelFormField).toBeNull();
  });

  it('should initialize error messages through TimeRangeUtils', () => {
    const { start, end } = TimeRangeUtils.getTimeRangeErrorMessages(
      component.sessionToEdit()?.courtSession as SessionType,
      component.timeRange.start
    );
    expect(component.startTimeErrorMessages).toEqual(start);
    expect(component.endTimeErrorMessages).toEqual(end);
  });

  it('should update error messages through TimeRangeUtils', () => {
    spyOn(TimeRangeUtils, 'updateErrorMessages');
    component.handleCustomTimesErrorMessages();

    expect(TimeRangeUtils.updateErrorMessages).toHaveBeenCalledWith(
      component.startTimeErrorMessages,
      component.endTimeErrorMessages,
      component.sessionToEdit()?.courtSession as SessionType,
      component.timeRange.start
    );
  });

  describe('Duration error messages', () => {
    it('should add min validation message for duration when there are booked sessions', () => {
      const totalBooked = 5;
      fixture.componentRef.setInput('sessionToEdit', {
        ...component.sessionToEdit(),
        totalBooked,
        slotBased: true
      });
      component.ngOnInit();
      expect(component.durationErrorMessages).toContainEqual({
        rule: 'min',
        message: `Maximum slots cannot be less than total already booked of ${totalBooked} slot(s)`
      });
    });

    it('should add min validation message for morning duration when there are booked sessions', () => {
      const totalBookedForMorning = 3;
      fixture.componentRef.setInput('sessionToEdit', {
        ...component.sessionToEdit(),
        totalBookedForMorning
      });
      component.ngOnInit();
      expect(component.morningDurationErrorMessages).toContainEqual({
        rule: 'min',
        message: `Maximum duration for AM cannot be less than total already booked of ${totalBookedForMorning} mins`
      });
    });

    it('should add min validation message for afternoon duration when there are booked sessions', () => {
      const totalBookedForAfternoon = 4;
      fixture.componentRef.setInput('sessionToEdit', {
        ...component.sessionToEdit(),
        totalBookedForAfternoon
      });
      component.ngOnInit();
      expect(component.afternoonDurationErrorMessages).toContainEqual({
        rule: 'min',
        message: `Maximum duration for PM cannot be less than total already booked of ${totalBookedForAfternoon} mins`
      });
    });
  });

  describe('getMatchingSlotTypeFilter', () => {
    it('should return true for duration-based business types when session is duration-based', () => {
      fixture.componentRef.setInput('sessionToEdit', {
        ...component.sessionToEdit(),
        slotBased: false
      });
      component.ngOnInit();

      const filter = component.getMatchingSlotTypeFilter();
      expect(filter(mockBusinessType)).toBe(true);
    });

    it('should return false for duration-based business types when session is slot-based', () => {
      fixture.componentRef.setInput('sessionToEdit', {
        ...component.sessionToEdit(),
        slotBased: true
      });
      component.ngOnInit();

      const filter = component.getMatchingSlotTypeFilter();
      expect(filter(mockBusinessType)).toBe(false);
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
