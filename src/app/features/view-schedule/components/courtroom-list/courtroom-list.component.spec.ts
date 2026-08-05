import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourtroomListComponent } from './courtroom-list.component';
import { Component, input } from '@angular/core';
import { mockActiveCourtroomIndexes, mockCourtScheduleResponse } from '../../../../shared';
import {
  BulkActionType,
  BulkActionPayload,
  CourtSchedule,
  CourtScheduleSession
} from '../../model/view-schedule.model';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { SessionsListComponent } from '../sessions-list/sessions-list.component';

describe('CourtroomListComponent', () => {
  let component: CourtroomListComponent;
  let fixture: ComponentFixture<CourtroomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtroomListComponent]
    })
      .overrideComponent(CourtroomListComponent, {
        remove: { imports: [SessionsListComponent] },
        add: { imports: [MockSessionsListComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CourtroomListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('courtSchedules', mockCourtScheduleResponse.courtSchedules);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should emit setSessionToEdit event with the correct session', () => {
    spyOn(component.setSessionToEdit, 'emit');

    const session = mockCourtScheduleResponse.courtSchedules[0].sessions[0];
    component.handleEdit(session);

    expect(component.setSessionToEdit.emit).toHaveBeenCalledWith(session);
  });

  it('should emit submitForm event with the correct bulk action payload for remove', () => {
    spyOn(component.submitForm, 'emit');

    const sessions = mockCourtScheduleResponse.courtSchedules[0].sessions;
    const payload: BulkActionPayload = { action: BulkActionType.REMOVE, sessions };
    component.handleBulkAction(payload);

    expect(component.submitForm.emit).toHaveBeenCalledWith(payload);
  });

  it('should emit submitForm event with the correct bulk action payload for assign', () => {
    spyOn(component.submitForm, 'emit');

    const sessions = mockCourtScheduleResponse.courtSchedules[0].sessions;
    const payload: BulkActionPayload = { action: BulkActionType.ASSIGN, sessions };
    component.handleBulkAction(payload);

    expect(component.submitForm.emit).toHaveBeenCalledWith(payload);
  });

  it('should call openAccordions in ngOnChanges when courtSchedules changes', () => {
    spyOn(component, 'openAccordions');

    const changes = {
      courtSchedules: {
        currentValue: mockCourtScheduleResponse.courtSchedules,
        previousValue: [] as CourtSchedule[],
        firstChange: false,
        isFirstChange: () => false
      }
    };

    component.ngOnChanges(changes);

    expect(component.openAccordions).toHaveBeenCalled();
  });

  it('should emit the correct value when handleOpenChange is called', () => {
    spyOn(component.setActiveCourtroomsIndexes, 'emit');

    component.handleOpenChange(mockActiveCourtroomIndexes);

    fixture.detectChanges();

    expect(component.setActiveCourtroomsIndexes.emit).toHaveBeenCalledWith(
      mockActiveCourtroomIndexes
    );
  });

  it('should open accordions when active indexes have changed', () => {
    fixture.detectChanges();
    const accordion = component.accordion();

    if (accordion) {
      spyOn(accordion, 'markItemsForCheck');

      fixture.componentRef.setInput('activeCourtroomsIndexes', mockActiveCourtroomIndexes);
      component.openAccordionsIndexes = [1, 2];

      component.openAccordions();

      fixture.detectChanges();

      expect(accordion.markItemsForCheck).toHaveBeenCalled();
    }
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
