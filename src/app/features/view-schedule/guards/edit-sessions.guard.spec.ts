import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { editSessionsGuard } from './edit-sessions.guard';
import { ManageSessionsStore } from '../store/manage-sessions.store';
import { ViewScheduleService } from '../services/view-schedule.service';
import { mockCourtScheduleSession } from '../../../shared';
import { CourtSchedule } from '../model/view-schedule.model';

describe('editSessionsGuard', () => {
  let manageSessionsStore: {
    setSelectedSessions: jest.Mock;
    setSelectedJudiciary: jest.Mock;
    handleError: jest.Mock;
    sessions: jest.Mock;
  };
  let viewScheduleService: { searchCourtSchedulesById: jest.Mock };
  let router: { getCurrentNavigation: jest.Mock };

  const mockCourtSchedule: CourtSchedule = {
    courtRoomId: 'room-1',
    courtRoomName: 'Courtroom 1',
    sessions: [{ ...mockCourtScheduleSession, judiciaries: [] }]
  };

  const buildRoute = (sessionId: string | null = null): ActivatedRouteSnapshot =>
    ({
      firstChild:
        sessionId != null
          ? { paramMap: { get: (key: string) => (key === 'id' ? sessionId : null) } }
          : null
    }) as unknown as ActivatedRouteSnapshot;

  const runGuard = (route: ActivatedRouteSnapshot) =>
    TestBed.runInInjectionContext(() => editSessionsGuard(route, null!));

  beforeEach(() => {
    manageSessionsStore = {
      setSelectedSessions: jest.fn(),
      setSelectedJudiciary: jest.fn(),
      handleError: jest.fn(),
      sessions: jest.fn().mockReturnValue([])
    };
    viewScheduleService = { searchCourtSchedulesById: jest.fn() };
    router = { getCurrentNavigation: jest.fn().mockReturnValue(null) };

    TestBed.configureTestingModule({
      providers: [
        { provide: ManageSessionsStore, useValue: manageSessionsStore },
        { provide: ViewScheduleService, useValue: viewScheduleService },
        { provide: Router, useValue: router }
      ]
    });
  });

  describe('when no sessionId and no router state', () => {
    it('should return true immediately', () => {
      expect(runGuard(buildRoute())).toBe(true);
    });

    it('should not call the view schedule service', () => {
      runGuard(buildRoute());
      expect(viewScheduleService.searchCourtSchedulesById).not.toHaveBeenCalled();
    });
  });

  describe('when sessions are in router navigation state', () => {
    it('should call setSelectedSessions and return true', () => {
      const sessions = [mockCourtScheduleSession];
      router.getCurrentNavigation.mockReturnValue({ extras: { state: { sessions } } });

      const result = runGuard(buildRoute());

      expect(result).toBe(true);
      expect(manageSessionsStore.setSelectedSessions).toHaveBeenCalledWith(sessions);
    });

    it('should not call setSelectedSessions when sessions array is empty', () => {
      router.getCurrentNavigation.mockReturnValue({ extras: { state: { sessions: [] } } });

      runGuard(buildRoute());

      expect(manageSessionsStore.setSelectedSessions).not.toHaveBeenCalled();
    });
  });

  describe('when sessionId is present', () => {
    it('should return an Observable that emits true on success', (done) => {
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(of([mockCourtSchedule]));

      (runGuard(buildRoute('session-123')) as any).subscribe((val: boolean) => {
        expect(val).toBe(true);
        done();
      });
    });

    it('should call searchCourtSchedulesById with the sessionId', (done) => {
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(of([mockCourtSchedule]));

      (runGuard(buildRoute('session-123')) as any).subscribe(() => {
        expect(viewScheduleService.searchCourtSchedulesById).toHaveBeenCalledWith('session-123');
        done();
      });
    });

    it('should call setSelectedSessions with the first session', (done) => {
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(of([mockCourtSchedule]));

      (runGuard(buildRoute('session-123')) as any).subscribe(() => {
        expect(manageSessionsStore.setSelectedSessions).toHaveBeenCalledWith([
          mockCourtSchedule.sessions[0]
        ]);
        done();
      });
    });

    it('should call setSelectedJudiciary with empty array when session has no judiciaries', (done) => {
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(of([mockCourtSchedule]));

      (runGuard(buildRoute('session-123')) as any).subscribe(() => {
        expect(manageSessionsStore.setSelectedJudiciary).toHaveBeenCalledWith([]);
        done();
      });
    });

    it('should call setSelectedJudiciary with session judiciaries when present', (done) => {
      const judiciary = { id: 'j1' } as any;
      const scheduleWithJudiciary: CourtSchedule = {
        ...mockCourtSchedule,
        sessions: [{ ...mockCourtSchedule.sessions[0], judiciaries: [judiciary] }]
      };
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(of([scheduleWithJudiciary]));

      (runGuard(buildRoute('session-123')) as any).subscribe(() => {
        expect(manageSessionsStore.setSelectedJudiciary).toHaveBeenCalledWith([judiciary]);
        done();
      });
    });

    it('should return Observable<false> and call handleError when service throws', (done) => {
      const error = new HttpErrorResponse({ status: 500 });
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(throwError(() => error));

      (runGuard(buildRoute('session-123')) as any).subscribe((val: boolean) => {
        expect(val).toBe(false);
        expect(manageSessionsStore.handleError).toHaveBeenCalledWith(error);
        done();
      });
    });

    it('should not call setSelectedSessions when service throws', (done) => {
      viewScheduleService.searchCourtSchedulesById.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );

      (runGuard(buildRoute('session-123')) as any).subscribe(() => {
        expect(manageSessionsStore.setSelectedSessions).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
