import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ManageSessionsStore } from './manage-sessions.store';
import { ViewScheduleService } from '../services/view-schedule.service';
import { mockCourtScheduleSession } from '../../../shared';
import { EditSessionFormValues } from '../model/view-schedule.model';
import { provideCppCoreHttpServices } from '@cpp/core';
import { provideMockStore } from '@ngrx/store/testing';
import { JudiciarySessionAssignmentService } from '../../judiciary-session-assignment/services/judiciary-session-assignment.service';
import type { JudiciarySelectionValue } from '../../../shared';
import { ExtendedJudicialMember } from '../../../shared';

describe('ManageSessionsStore', () => {
  let store: InstanceType<typeof ManageSessionsStore>;
  let viewScheduleService: jest.Mocked<Pick<ViewScheduleService, 'updateSession'>>;
  let assignmentService: jest.Mocked<
    Pick<JudiciarySessionAssignmentService, 'assignJudiciaries' | 'removeAllJudiciaries'>
  >;

  const mockFormValues: EditSessionFormValues = {
    courtRoomId: mockCourtScheduleSession.courtRoomId,
    businessType: mockCourtScheduleSession.businessType,
    panel: mockCourtScheduleSession.panel,
    courtSession: mockCourtScheduleSession.courtSession,
    sessionStartTime: '09:00',
    sessionEndTime: '12:30',
    isOverbookingAllowed: false,
    maxDuration: 180,
    isDraft: false
  };

  beforeEach(() => {
    viewScheduleService = { updateSession: jest.fn() };
    assignmentService = { assignJudiciaries: jest.fn(), removeAllJudiciaries: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ManageSessionsStore,
        provideCppCoreHttpServices(),
        provideMockStore(),
        { provide: ViewScheduleService, useValue: viewScheduleService },
        {
          provide: JudiciarySessionAssignmentService,
          useValue: assignmentService
        }
      ]
    });

    store = TestBed.inject(ManageSessionsStore);
  });

  describe('setSelectedSessions', () => {
    it('should update sessions state', () => {
      store.setSelectedSessions([mockCourtScheduleSession]);
      expect(store.sessions()).toEqual([mockCourtScheduleSession]);
    });

    it('should replace existing sessions', () => {
      store.setSelectedSessions([mockCourtScheduleSession]);
      const newSession = { ...mockCourtScheduleSession, courtScheduleId: 'id2' };
      store.setSelectedSessions([newSession]);
      expect(store.sessions()).toEqual([newSession]);
    });
  });

  describe('clearState', () => {
    it('should reset sessions to empty array', () => {
      store.setSelectedSessions([mockCourtScheduleSession]);
      store.clearState();
      expect(store.sessions()).toEqual([]);
    });
  });

  describe('updateSession', () => {
    beforeEach(() => {
      store.setSelectedSessions([mockCourtScheduleSession]);
    });

    it('should call onUpdateSuccess when service succeeds', (done) => {
      viewScheduleService.updateSession.mockReturnValue(of(undefined as any));
      const onUpdateSuccess = jest.fn(() => done());
      const onUpdateError = jest.fn();

      store.updateSession({ formValues: mockFormValues, onUpdateSuccess, onUpdateError });
    });

    it('should call onUpdateError when service returns an HTTP error', (done) => {
      const error = new HttpErrorResponse({ status: 400 });
      viewScheduleService.updateSession.mockReturnValue(throwError(() => error));
      const onUpdateSuccess = jest.fn();
      const onUpdateError = jest.fn(() => done());

      store.updateSession({ formValues: mockFormValues, onUpdateSuccess, onUpdateError });
    });

    it('should pass form values through to the service payload', (done) => {
      viewScheduleService.updateSession.mockReturnValue(of(undefined as any));

      store.updateSession({
        formValues: mockFormValues,
        onUpdateSuccess: () => {
          const payload = (viewScheduleService.updateSession as jest.Mock).mock.calls[0][0];
          expect(payload.isDraft).toBe(false);
          expect(payload.isOverbookingAllowed).toBe(false);
          done();
        },
        onUpdateError: jest.fn()
      });
    });
  });

  describe('assignJudiciary', () => {
    it('should call assignJudiciaries and invoke onAssignSuccess on success', (done) => {
      assignmentService.assignJudiciaries.mockReturnValue(of({}));
      store.setSelectedSessions([mockCourtScheduleSession]);
      const value = { Judge: { id: 'j1' } as ExtendedJudicialMember } as JudiciarySelectionValue;

      store.assignJudiciary({ value, onAssignSuccess: done });

      expect(assignmentService.assignJudiciaries).toHaveBeenCalled();
    });
  });

  describe('removeAllJudiciary', () => {
    it('should call removeAllJudiciaries and invoke onRemoveSuccess on success', (done) => {
      assignmentService.removeAllJudiciaries.mockReturnValue(of({}));
      store.setSelectedSessions([mockCourtScheduleSession]);

      store.removeAllJudiciary({ onRemoveSuccess: done });

      expect(assignmentService.removeAllJudiciaries).toHaveBeenCalled();
    });
  });
});
