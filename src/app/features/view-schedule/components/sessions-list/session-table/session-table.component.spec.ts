import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionTableComponent } from './session-table.component';
import { SessionDurationCellComponent } from './cells/session-duration-cell.component';
import { mockCourtScheduleResponse } from '../../../../../shared';
import {
  CourtScheduleSession,
  CourtScheduleSessionSortFieldsKeys
} from '../../../model/view-schedule.model';
import * as sessionUtils from '../../../../../shared/utils/sessions-sort-utils';
import * as sessionCriteriaUtils from '../../../../../shared/utils/session-criteria.utils';
import { Component, input } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

@Component({
  selector: 'session-duration-cell',
  template: '<div>Mock Duration</div>'
})
class MockSessionDurationCellComponent {
  session = input.required<CourtScheduleSession>();
}

describe('SessionTableComponent', () => {
  let component: SessionTableComponent;
  let fixture: ComponentFixture<SessionTableComponent>;
  const mockSessions = mockCourtScheduleResponse.courtSchedules[0].sessions;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionTableComponent],
      providers: [provideMockStore()]
    })
      .overrideComponent(SessionTableComponent, {
        remove: {
          imports: [SessionDurationCellComponent]
        },
        add: {
          imports: [MockSessionDurationCellComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SessionTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sessions', mockSessions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sortedSessions with sessions input when no sort is applied', () => {
    expect(component.sortedSessions().length).toBe(mockSessions.length);
    expect(component.currentSortField()).toBeNull();
    expect(component.sortedSessions()).toEqual(mockSessions);
  });

  it('should handle sort correctly by setting sort state', () => {
    const sortedResult = [...mockSessions].reverse();
    spyOn(sessionUtils, 'sortSessions').and.returnValue(sortedResult);

    const sessionsBeforeSort = component.sessions();

    component.handleSort('sessionDate' as CourtScheduleSessionSortFieldsKeys, 'asc');

    expect(component.currentSortField()).toBe('sessionDate');
    expect(component.currentSortOrder()).toBe('asc');

    const sorted = component.sortedSessions();

    expect(sessionUtils.sortSessions).toHaveBeenCalledWith(
      sessionsBeforeSort,
      'sessionDate',
      'asc'
    );
    expect(sorted).toEqual(sortedResult);
  });

  it('should reset sort state when sessions input changes', () => {
    component.handleSort('sessionDate' as CourtScheduleSessionSortFieldsKeys, 'desc');
    expect(component.currentSortField()).toBe('sessionDate');
    expect(component.currentSortOrder()).toBe('desc');

    const newSessions = [...mockSessions, mockSessions[0]];
    fixture.componentRef.setInput('sessions', newSessions);
    fixture.detectChanges();

    expect(component.currentSortField()).toBeNull();
    expect(component.currentSortOrder()).toBe('asc');
    expect(component.sortedSessions()).toEqual(newSessions);
  });

  it('should return unsorted sessions when currentSortField is null', () => {
    expect(component.currentSortField()).toBeNull();
    expect(component.sortedSessions()).toEqual(mockSessions);
  });

  it('should emit action when handleAction is called', () => {
    spyOn(component.onAction, 'emit');
    const session = mockSessions[0];

    component.handleAction(session, 'edit');

    expect(component.onAction.emit).toHaveBeenCalledWith({
      session,
      action: 'edit'
    });
  });

  it('should compute allSessionsSelected when all eligible sessions are selected', () => {
    spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(true);
    const selectedIds = mockSessions.map((s) => s.courtScheduleId);
    fixture.componentRef.setInput('allSelectedSessionIds', selectedIds);
    fixture.detectChanges();

    expect(component.allSessionsSelected()).toBe(true);
  });

  it('should compute allSessionsSelected as false when no sessions are selected', () => {
    spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(true);
    fixture.componentRef.setInput('allSelectedSessionIds', []);
    fixture.detectChanges();

    expect(component.allSessionsSelected()).toBe(false);
  });

  it('should emit select all change with eligible session ids', () => {
    spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(true);
    spyOn(component.onSelectAllChange, 'emit');
    fixture.detectChanges();

    component.handleSelectAll(true);

    expect(component.onSelectAllChange.emit).toHaveBeenCalledWith({
      allSelected: true,
      sessionIds: component.eligibleSessionIds()
    });
  });

  describe('Session Eligibility', () => {
    it('should return true for isSelectionEnabled when session can be removed', () => {
      spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(true);
      const session = mockSessions[0];

      expect(component.isSelectionEnabled(session)).toBe(true);
      expect(sessionCriteriaUtils.canBeRemoved).toHaveBeenCalledWith(session);
    });

    it('should return false for isSelectionEnabled when session cannot be removed', () => {
      spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(false);
      const session = mockSessions[0];

      expect(component.isSelectionEnabled(session)).toBe(false);
      expect(sessionCriteriaUtils.canBeRemoved).toHaveBeenCalledWith(session);
    });

    it('should return true for isActionVisible with edit action when session can be edited', () => {
      spyOn(sessionCriteriaUtils, 'canBeEdited').and.returnValue(true);
      const session = mockSessions[0];

      expect(component.isActionVisible(session, 'edit')).toBe(true);
      expect(sessionCriteriaUtils.canBeEdited).toHaveBeenCalledWith(session);
    });

    it('should return false for isActionVisible with edit action when session cannot be edited', () => {
      spyOn(sessionCriteriaUtils, 'canBeEdited').and.returnValue(false);
      const session = mockSessions[0];

      expect(component.isActionVisible(session, 'edit')).toBe(false);
      expect(sessionCriteriaUtils.canBeEdited).toHaveBeenCalledWith(session);
    });

    it('should return true for isActionVisible with remove action when session can be removed', () => {
      spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(true);
      const session = mockSessions[0];

      expect(component.isActionVisible(session, 'remove')).toBe(true);
      expect(sessionCriteriaUtils.canBeRemoved).toHaveBeenCalledWith(session);
    });

    it('should return false for isActionVisible with remove action when session cannot be removed', () => {
      spyOn(sessionCriteriaUtils, 'canBeRemoved').and.returnValue(false);
      const session = mockSessions[0];

      expect(component.isActionVisible(session, 'remove')).toBe(false);
      expect(sessionCriteriaUtils.canBeRemoved).toHaveBeenCalledWith(session);
    });

    it('should return false for isActionVisible with unknown action', () => {
      const session = mockSessions[0];

      expect(component.isActionVisible(session, 'unknown')).toBe(false);
    });
  });
});
