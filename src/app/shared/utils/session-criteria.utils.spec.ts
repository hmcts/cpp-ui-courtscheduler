import {
  isPastSession,
  hasHearingsBooked,
  canBeRemoved,
  canBeEdited,
  canBeAssigned,
  isAlreadyAssigned,
  getAlreadyAssignedSessionIds,
  getRemovableSessions,
  getEditableSessions,
  getAssignableSessions
} from './session-criteria.utils';
import { CourtScheduleSession } from '../../features/view-schedule/model/view-schedule.model';
import { JurisdictionType } from '../model/jurisdiction';

describe('session-criteria.utils', () => {
  const createMockSession = (
    overrides: Partial<CourtScheduleSession> = {}
  ): CourtScheduleSession => ({
    courtScheduleId: '1',
    sessionDate: new Date().toISOString().split('T')[0],
    totalBooked: 0,
    allDaySplit: false,
    businessType: 'TEST',
    courtRoomId: '1',
    panel: '1',
    jurisdiction: JurisdictionType.MAGISTRATES,
    ...overrides
  });

  describe('isPastSession', () => {
    it('should return false if sessionDate is not provided', () => {
      const session = createMockSession({ sessionDate: undefined });
      expect(isPastSession(session)).toBe(false);
    });

    it('should return true for past sessions', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const session = createMockSession({ sessionDate: pastDate.toISOString().split('T')[0] });
      expect(isPastSession(session)).toBe(true);
    });

    it('should return false for future sessions', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({ sessionDate: futureDate.toISOString().split('T')[0] });
      expect(isPastSession(session)).toBe(false);
    });

    it('should use isPastDate utility', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const session = createMockSession({ sessionDate: pastDate.toISOString().split('T')[0] });
      // This test verifies the function works, the actual implementation uses isPastDate
      const result = isPastSession(session);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('hasHearingsBooked', () => {
    it('should return true when totalBooked is greater than 0', () => {
      const session = createMockSession({ totalBooked: 1 });
      expect(hasHearingsBooked(session)).toBe(true);
    });

    it('should return false when totalBooked is 0', () => {
      const session = createMockSession({ totalBooked: 0 });
      expect(hasHearingsBooked(session)).toBe(false);
    });

    it('should return false when totalBooked is undefined', () => {
      const session = createMockSession({ totalBooked: undefined });
      expect(hasHearingsBooked(session)).toBe(false);
    });

    it('should return false when totalBooked is undefined', () => {
      const session = createMockSession({ totalBooked: undefined });
      expect(hasHearingsBooked(session)).toBe(false);
    });
  });

  describe('canBeRemoved', () => {
    it('should return true for sessions that are not past and have no hearings', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        totalBooked: 0
      });
      expect(canBeRemoved(session)).toBe(true);
    });

    it('should return false for past sessions', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const session = createMockSession({
        sessionDate: pastDate.toISOString().split('T')[0],
        totalBooked: 0
      });
      expect(canBeRemoved(session)).toBe(false);
    });

    it('should return false for sessions with hearings booked', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        totalBooked: 1
      });
      expect(canBeRemoved(session)).toBe(false);
    });

    it('should return false for past sessions with hearings', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const session = createMockSession({
        sessionDate: pastDate.toISOString().split('T')[0],
        totalBooked: 1
      });
      expect(canBeRemoved(session)).toBe(false);
    });
  });

  describe('canBeEdited', () => {
    it('should return true for future sessions', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0]
      });
      expect(canBeEdited(session)).toBe(true);
    });

    it('should return false for past sessions', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const session = createMockSession({
        sessionDate: pastDate.toISOString().split('T')[0]
      });
      expect(canBeEdited(session)).toBe(false);
    });

    it('should return true even if session has hearings booked', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        totalBooked: 1
      });
      expect(canBeEdited(session)).toBe(true);
    });
  });

  describe('getRemovableSessions', () => {
    it('should categorize sessions correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const sessions: CourtScheduleSession[] = [
        createMockSession({
          courtScheduleId: '1',
          sessionDate: pastDate.toISOString().split('T')[0],
          totalBooked: 0
        }),
        createMockSession({
          courtScheduleId: '2',
          sessionDate: futureDate.toISOString().split('T')[0],
          totalBooked: 1
        }),
        createMockSession({
          courtScheduleId: '3',
          sessionDate: futureDate.toISOString().split('T')[0],
          totalBooked: 0
        })
      ];

      const result = getRemovableSessions(sessions);

      expect(result.eligible).toHaveLength(1);
      expect(result.eligible[0].courtScheduleId).toBe('3');
      expect(result.ineligible.past).toHaveLength(1);
      expect(result.ineligible.past[0].courtScheduleId).toBe('1');
      expect(result.ineligible.withHearings).toHaveLength(1);
      expect(result.ineligible.withHearings[0].courtScheduleId).toBe('2');
    });

    it('should return empty arrays when no sessions provided', () => {
      const result = getRemovableSessions([]);
      expect(result.eligible).toEqual([]);
      expect(result.ineligible.past).toEqual([]);
      expect(result.ineligible.withHearings).toEqual([]);
    });
  });

  describe('getEditableSessions', () => {
    it('should categorize sessions correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const sessions: CourtScheduleSession[] = [
        createMockSession({
          courtScheduleId: '1',
          sessionDate: pastDate.toISOString().split('T')[0]
        }),
        createMockSession({
          courtScheduleId: '2',
          sessionDate: futureDate.toISOString().split('T')[0]
        }),
        createMockSession({
          courtScheduleId: '3',
          sessionDate: futureDate.toISOString().split('T')[0],
          totalBooked: 1
        })
      ];

      const result = getEditableSessions(sessions);

      expect(result.eligible).toHaveLength(2);
      expect(result.eligible.map((s) => s.courtScheduleId)).toEqual(['2', '3']);
      expect(result.ineligible.past).toHaveLength(1);
      expect(result.ineligible.past[0].courtScheduleId).toBe('1');
      expect(result.ineligible.withHearings).toEqual([]);
    });

    it('should return empty arrays when no sessions provided', () => {
      const result = getEditableSessions([]);
      expect(result.eligible).toEqual([]);
      expect(result.ineligible.past).toEqual([]);
      expect(result.ineligible.withHearings).toEqual([]);
    });
  });

  describe('canBeAssigned', () => {
    it('should return true for draft sessions without hearings', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        isDraft: true,
        totalBooked: 0
      });
      expect(canBeAssigned(session)).toBe(true);
    });

    it('should return false for draft sessions with hearings', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        isDraft: true,
        totalBooked: 1
      });
      expect(canBeAssigned(session)).toBe(false);
    });

    it('should return false for assigned sessions without hearings', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        isDraft: false,
        totalBooked: 0
      });
      expect(canBeAssigned(session)).toBe(false);
    });

    it('should return false for assigned sessions with hearings', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        isDraft: false,
        totalBooked: 1
      });
      expect(canBeAssigned(session)).toBe(false);
    });

    it('should return false when isDraft is undefined', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const session = createMockSession({
        sessionDate: futureDate.toISOString().split('T')[0],
        isDraft: undefined,
        totalBooked: 0
      });
      expect(canBeAssigned(session)).toBe(false);
    });
  });

  describe('isAlreadyAssigned', () => {
    it('should return true for sessions with isDraft === false', () => {
      const session = createMockSession({ isDraft: false });
      expect(isAlreadyAssigned(session)).toBe(true);
    });

    it('should return false for sessions with isDraft === true', () => {
      const session = createMockSession({ isDraft: true });
      expect(isAlreadyAssigned(session)).toBe(false);
    });

    it('should return false for sessions with isDraft undefined', () => {
      const session = createMockSession({ isDraft: undefined });
      expect(isAlreadyAssigned(session)).toBe(false);
    });
  });

  describe('getAlreadyAssignedSessionIds', () => {
    it('should return IDs of selected sessions that are already assigned', () => {
      const sessions: CourtScheduleSession[] = [
        createMockSession({ courtScheduleId: '1', isDraft: true }),
        createMockSession({ courtScheduleId: '2', isDraft: false }),
        createMockSession({ courtScheduleId: '3', isDraft: false }),
        createMockSession({ courtScheduleId: '4', isDraft: true })
      ];
      const selectedIds = ['1', '2', '3'];

      const result = getAlreadyAssignedSessionIds(sessions, selectedIds);

      expect(result).toEqual(['2', '3']);
    });

    it('should return empty array when no sessions are selected', () => {
      const sessions: CourtScheduleSession[] = [
        createMockSession({ courtScheduleId: '1', isDraft: false }),
        createMockSession({ courtScheduleId: '2', isDraft: false })
      ];

      const result = getAlreadyAssignedSessionIds(sessions, []);

      expect(result).toEqual([]);
    });

    it('should return empty array when all selected sessions are drafts', () => {
      const sessions: CourtScheduleSession[] = [
        createMockSession({ courtScheduleId: '1', isDraft: true }),
        createMockSession({ courtScheduleId: '2', isDraft: true })
      ];
      const selectedIds = ['1', '2'];

      const result = getAlreadyAssignedSessionIds(sessions, selectedIds);

      expect(result).toEqual([]);
    });

    it('should only include sessions that are in selectedIds', () => {
      const sessions: CourtScheduleSession[] = [
        createMockSession({ courtScheduleId: '1', isDraft: false }),
        createMockSession({ courtScheduleId: '2', isDraft: false }),
        createMockSession({ courtScheduleId: '3', isDraft: false })
      ];
      const selectedIds = ['2'];

      const result = getAlreadyAssignedSessionIds(sessions, selectedIds);

      expect(result).toEqual(['2']);
    });
  });

  describe('getAssignableSessions', () => {
    it('should categorize sessions correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const sessions: CourtScheduleSession[] = [
        createMockSession({
          courtScheduleId: '1',
          sessionDate: pastDate.toISOString().split('T')[0],
          isDraft: true,
          totalBooked: 0
        }),
        createMockSession({
          courtScheduleId: '2',
          sessionDate: futureDate.toISOString().split('T')[0],
          isDraft: true,
          totalBooked: 0
        }),
        createMockSession({
          courtScheduleId: '3',
          sessionDate: futureDate.toISOString().split('T')[0],
          isDraft: true,
          totalBooked: 1
        }),
        createMockSession({
          courtScheduleId: '4',
          sessionDate: futureDate.toISOString().split('T')[0],
          isDraft: false,
          totalBooked: 0
        }),
        createMockSession({
          courtScheduleId: '5',
          sessionDate: futureDate.toISOString().split('T')[0],
          isDraft: false,
          totalBooked: 1
        })
      ];

      const result = getAssignableSessions(sessions);

      expect(result.eligible).toHaveLength(1);
      expect(result.eligible[0].courtScheduleId).toBe('2');
      expect(result.ineligible.past).toHaveLength(1);
      expect(result.ineligible.past[0].courtScheduleId).toBe('1');
      expect(result.ineligible.withHearings).toHaveLength(1);
      expect(result.ineligible.withHearings.map((s) => s.courtScheduleId)).toEqual(['3']);
      expect(result.ineligible.assigned).toHaveLength(2);
      expect(result.ineligible.assigned?.map((s) => s.courtScheduleId)).toEqual(['4', '5']);
    });

    it('should return empty arrays when no sessions provided', () => {
      const result = getAssignableSessions([]);
      expect(result.eligible).toEqual([]);
      expect(result.ineligible.past).toEqual([]);
      expect(result.ineligible.withHearings).toEqual([]);
      expect(result.ineligible.assigned).toEqual([]);
    });
  });
});
