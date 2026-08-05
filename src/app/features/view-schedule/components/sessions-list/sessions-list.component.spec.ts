import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionsListComponent } from './sessions-list.component';
import {
  SessionTableComponent,
  SessionTableConfig,
  SelectionContext
} from './session-table/session-table.component';
import { SessionActionsComponent } from './session-actions/session-actions.component';
import { IneligibleSessionsComponent } from './ineligible-sessions/ineligible-sessions.component';
import { mockCourtScheduleResponse } from '../../../../shared';
import {
  BulkActionType,
  CourtScheduleSession,
  CourtScheduleSessionSortFieldsKeys
} from '../../model/view-schedule.model';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { SelectOption, SortOrder } from '@cpp/pdk';
import { Component, input, output } from '@angular/core';
import {
  createEditableTableConfig,
  createRemovableSessionsTableConfig
} from '../../../../shared/utils/session-table.config';

@Component({
  selector: 'session-table',
  template: '<div>Mock Session Table</div>'
})
class MockSessionTableComponent {
  sessions = input<CourtScheduleSession[]>([]);
  allSelectedSessionIds = input<string[]>([]);
  ineligibleSessionIds = input<string[]>([]);
  config = input<SessionTableConfig>();
  selectionContext = input<SelectionContext>('remove');
  onSort = output<{ field: CourtScheduleSessionSortFieldsKeys; order: SortOrder }>();
  onAction = output<{ session: CourtScheduleSession; action: string }>();
  onSelectAllChange = output<{ allSelected: boolean; sessionIds: string[] }>();
}

@Component({
  selector: 'session-actions',
  template: '<div>Mock Session Actions</div>'
})
class MockSessionActionsComponent {
  actionOptions = input<SelectOption<string>[]>([]);
  selectedSessionsCount = input<number>(0);
  onSubmit = output<string>();
}

@Component({
  selector: 'ineligible-sessions',
  template: '<div>Mock Ineligible Sessions</div>'
})
class MockIneligibleSessionsComponent {
  ineligiblePastSessions = input<CourtScheduleSession[]>([]);
  ineligibleWithHearings = input<CourtScheduleSession[]>([]);
  ineligibleAssigned = input<CourtScheduleSession[]>([]);
  isEditView = input<boolean>(false);
  isAssignView = input<boolean>(false);
  isCrownCourt = input<boolean>(false);
}

describe('SessionsListComponent', () => {
  let component: SessionsListComponent;
  let fixture: ComponentFixture<SessionsListComponent>;
  const mockSessions = mockCourtScheduleResponse.courtSchedules[0].sessions;
  const mockRemovableSessions = [...mockSessions];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsListComponent]
    })
      .overrideComponent(SessionsListComponent, {
        remove: {
          imports: [SessionTableComponent, SessionActionsComponent, IneligibleSessionsComponent]
        },
        add: {
          imports: [
            MockSessionTableComponent,
            MockSessionActionsComponent,
            MockIneligibleSessionsComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SessionsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sessions', mockSessions);
    fixture.componentRef.setInput('removableSessions', mockRemovableSessions);
    fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sessions from sessions input', () => {
    expect(component.sessions().length).toBe(mockSessions.length);
  });

  it('should initialize removableSessions from removableSessions input', () => {
    expect(component.removableSessions().length).toBe(mockRemovableSessions.length);
  });

  it('should handle session selection', () => {
    const session = mockSessions[0];
    component.onSessionSelectionChange([session.courtScheduleId]);
    expect(component.selectedSessions()).toContain(session);

    component.onSessionSelectionChange([]);
    expect(component.selectedSessions()).not.toContain(session);
  });

  it('should handle select all sessions', () => {
    const sessionIds = mockSessions.map((s) => s.courtScheduleId);
    component.handleSelectAllSessions({ allSelected: true, sessionIds });
    expect(component.selectedSessions().length).toBe(mockSessions.length);

    component.handleSelectAllSessions({ allSelected: false, sessionIds });
    expect(component.selectedSessions().length).toBe(0);
  });

  it('should emit setSessionToEdit when handling edit action', () => {
    spyOn(component.setSessionToEdit, 'emit');
    const session = mockSessions[0];

    component.handleTableAction({ session, action: 'edit' });

    expect(component.setSessionToEdit.emit).toHaveBeenCalledWith(session);
  });

  it('should handle remove action by selecting session and emitting submitForm', () => {
    spyOn(component.submitForm, 'emit');
    const session = mockSessions[0];

    component.handleTableAction({ session, action: 'remove' });

    expect(component.selectedSessions()).toEqual([session]);
    expect(component.submitForm.emit).toHaveBeenCalledWith({
      action: BulkActionType.REMOVE,
      sessions: [session]
    });
  });

  it('should emit submitForm when handleFormSubmit is called with valid action', () => {
    spyOn(component.submitForm, 'emit');
    const sessionIds = mockSessions.map((s) => s.courtScheduleId);
    component.handleSelectAllSessions({ allSelected: true, sessionIds });

    component.handleFormSubmit({
      sessionsSelection: sessionIds,
      selectedAction: BulkActionType.REMOVE
    });

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      action: BulkActionType.REMOVE,
      sessions: component.selectedSessions()
    });
  });

  it('should not emit submitForm when handleFormSubmit is called with empty action', () => {
    spyOn(component.submitForm, 'emit');

    component.handleFormSubmit({ sessionsSelection: [], selectedAction: '' });

    expect(component.submitForm.emit).not.toHaveBeenCalled();
  });

  it('should have correct action options for Crown court', () => {
    fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
    fixture.detectChanges();
    expect(component.actionOptions()).toEqual([
      { value: BulkActionType.REMOVE, label: 'Remove' },
      { value: BulkActionType.ASSIGN, label: 'Assign courtroom' },
      { value: BulkActionType.ASSIGN_JUDICIARY, label: 'Assign judiciary' }
    ]);
  });

  it('should have only Remove option for Magistrates court', () => {
    fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
    fixture.detectChanges();
    expect(component.actionOptions()).toEqual([{ value: BulkActionType.REMOVE, label: 'Remove' }]);
  });

  describe('Table Config', () => {
    it('should show selection and actions columns when not in delete or edit view', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
      fixture.componentRef.setInput('isDeleteView', false);
      fixture.componentRef.setInput('isEditView', false);
      fixture.detectChanges();

      expect(component.tableConfig()).toEqual(
        createEditableTableConfig({
          isCrownCourt: false,
          isDeleteView: false,
          isEditView: false
        })
      );
    });

    it('should hide selection and actions columns when in delete view', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
      fixture.componentRef.setInput('isDeleteView', true);
      fixture.detectChanges();

      expect(component.tableConfig()).toEqual(
        createEditableTableConfig({
          isCrownCourt: false,
          isDeleteView: true
        })
      );
    });

    it('should hide selection and actions columns when in edit view', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
      fixture.componentRef.setInput('isEditView', true);
      fixture.detectChanges();

      expect(component.tableConfig()).toEqual(
        createEditableTableConfig({
          isCrownCourt: false,
          isEditView: true
        })
      );
    });
  });

  describe('Jurisdiction-based conditional rendering', () => {
    it('should correctly compute isCrownCourt for CROWN', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
      fixture.detectChanges();

      expect(component.jurisdiction()).toBe(JurisdictionType.CROWN);
      expect(component.isCrownCourt()).toBe(true);
    });

    it('should correctly compute isCrownCourt for MAGISTRATES', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
      fixture.detectChanges();

      expect(component.jurisdiction()).toBe(JurisdictionType.MAGISTRATES);
      expect(component.isCrownCourt()).toBe(false);
    });

    it('should handle null jurisdiction', () => {
      fixture.componentRef.setInput('jurisdiction', null);
      fixture.detectChanges();

      expect(component.jurisdiction()).toBeNull();
      expect(component.isCrownCourt()).toBe(false);
    });

    it('should show courtroom assignment for CROWN jurisdiction', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
      fixture.componentRef.setInput('isDeleteView', false);
      fixture.componentRef.setInput('isEditView', false);
      fixture.detectChanges();

      expect(component.tableConfig()).toEqual(
        createEditableTableConfig({
          isCrownCourt: true,
          isDeleteView: false,
          isEditView: false
        })
      );
    });

    it('should show panel for MAGISTRATES jurisdiction', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
      fixture.componentRef.setInput('isDeleteView', false);
      fixture.componentRef.setInput('isEditView', false);
      fixture.detectChanges();

      expect(component.tableConfig()).toEqual(
        createEditableTableConfig({
          isCrownCourt: false,
          isDeleteView: false,
          isEditView: false
        })
      );
    });
  });

  describe('Removable Sessions Table Config', () => {
    it('should have correct config for removable sessions table', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
      fixture.detectChanges();
      expect(component.removableSessionsTableConfig()).toEqual(
        createRemovableSessionsTableConfig({ isCrownCourt: false })
      );
    });
  });

  describe('Session Selection', () => {
    it('should track selected sessions via selectedSessionIds', () => {
      const sessionIds = [mockSessions[0].courtScheduleId];
      component.onSessionSelectionChange(sessionIds);
      fixture.detectChanges();

      expect(component.selectedSessions().length).toBe(1);
      expect(component.selectedSessions()[0]).toBe(mockSessions[0]);
    });

    it('should select all sessions when handleSelectAllSessions is called with allSelected true', () => {
      const sessionIds = mockSessions.map((s) => s.courtScheduleId);
      component.handleSelectAllSessions({ allSelected: true, sessionIds });
      fixture.detectChanges();

      expect(component.selectedSessions().length).toBe(mockSessions.length);
    });

    it('should deselect all sessions when handleSelectAllSessions is called with allSelected false', () => {
      const sessionIds = mockSessions.map((s) => s.courtScheduleId);
      component.handleSelectAllSessions({ allSelected: true, sessionIds });
      fixture.detectChanges();
      expect(component.selectedSessions().length).toBe(mockSessions.length);

      component.handleSelectAllSessions({ allSelected: false, sessionIds });
      fixture.detectChanges();
      expect(component.selectedSessions().length).toBe(0);
    });

    it('should clear selected sessions when sessions input changes', () => {
      const sessionIds = mockSessions.map((s) => s.courtScheduleId);
      component.handleSelectAllSessions({ allSelected: true, sessionIds });
      fixture.detectChanges();
      expect(component.selectedSessions().length).toBeGreaterThan(0);

      const newSessions = [...mockSessions];
      fixture.componentRef.setInput('sessions', newSessions);
      fixture.detectChanges();

      expect(component.selectedSessions().length).toBe(0);
    });
  });
});
