import { sortSessions } from './sessions-sort-utils';
import { mockMultipleSessions, mockMultipleCourtScheduleSessions } from '../mocks/mocks';
import { Session, SessionSortFieldsKeys } from '../model/session';
import { CourtScheduleSession } from '../../features/view-schedule/model/view-schedule.model';
import { CourtroomAssignmentType } from '../model/courtroom-assignment';

describe('sortSessions', () => {
  it('should sort sessions by courtroom in ascending order', () => {
    const sortedSessions = sortSessions(mockMultipleSessions, 'courtroom', 'asc') as Session[];
    expect(sortedSessions[0].courtroom.courtroomName).toBe('Courtroom 1');
    expect(sortedSessions[1].courtroom.courtroomName).toBe('Courtroom 2');
  });

  it('should sort sessions by courtroom in descending order', () => {
    const sortedSessions = sortSessions(mockMultipleSessions, 'courtroom', 'desc') as Session[];
    expect(sortedSessions[0].courtroom.courtroomName).toBe('Courtroom 2');
    expect(sortedSessions[1].courtroom.courtroomName).toBe('Courtroom 1');
  });

  it('should sort sessions by sessionType in ascending order', () => {
    const sortedSessions = sortSessions(mockMultipleSessions, 'sessionType', 'asc') as Session[];
    expect(sortedSessions[0].sessionType).toBe('AM');
    expect(sortedSessions[1].sessionType).toBe('PM');
  });

  it('should sort sessions by sessionType in descending order', () => {
    const sortedSessions = sortSessions(mockMultipleSessions, 'sessionType', 'desc') as Session[];
    expect(sortedSessions[0].sessionType).toBe('PM');
    expect(sortedSessions[1].sessionType).toBe('AM');
  });

  it('should sort sessions by panelType in ascending order', () => {
    const sortedSessions = sortSessions(mockMultipleSessions, 'panelType', 'asc') as Session[];
    expect(sortedSessions[0].panelType).toBe('ADULT');
    expect(sortedSessions[1].panelType).toBe('YOUTH');
  });

  it('should sort sessions by panelType in descending order', () => {
    const sortedSessions = sortSessions(mockMultipleSessions, 'panelType', 'desc') as Session[];
    expect(sortedSessions[0].panelType).toBe('YOUTH');
    expect(sortedSessions[1].panelType).toBe('ADULT');
  });

  it('should sort court schedule sessions by courtRoomName in ascending order', () => {
    const sortedCourtScheduleSessions = sortSessions(
      mockMultipleCourtScheduleSessions,
      'courtRoomName',
      'asc'
    ) as CourtScheduleSession[];
    expect(sortedCourtScheduleSessions[0].courtRoomName).toBe('Courtroom 1');
    expect(sortedCourtScheduleSessions[1].courtRoomName).toBe('Courtroom 2');
  });

  it('should sort court schedule sessions by courtRoomName in descending order', () => {
    const sortedCourtScheduleSessions = sortSessions(
      mockMultipleCourtScheduleSessions,
      'courtRoomName',
      'desc'
    ) as CourtScheduleSession[];
    expect(sortedCourtScheduleSessions[0].courtRoomName).toBe('Courtroom 2');
    expect(sortedCourtScheduleSessions[1].courtRoomName).toBe('Courtroom 1');
  });

  it('should sort court schedule sessions by courtSession in ascending order', () => {
    const sortedCourtScheduleSessions = sortSessions(
      mockMultipleCourtScheduleSessions,
      'courtSession',
      'asc'
    ) as CourtScheduleSession[];
    expect(sortedCourtScheduleSessions[0].courtSession).toBe('AM');
    expect(sortedCourtScheduleSessions[1].courtSession).toBe('PM');
  });

  it('should sort court schedule sessions by courtSession in descending order', () => {
    const sortedCourtScheduleSessions = sortSessions(
      mockMultipleCourtScheduleSessions,
      'courtSession',
      'desc'
    ) as CourtScheduleSession[];
    expect(sortedCourtScheduleSessions[0].courtSession).toBe('PM');
    expect(sortedCourtScheduleSessions[1].courtSession).toBe('AM');
  });

  it('should sort court schedule sessions by panel in ascending order', () => {
    const sortedCourtScheduleSessions = sortSessions(
      mockMultipleCourtScheduleSessions,
      'panel',
      'asc'
    ) as CourtScheduleSession[];
    expect(sortedCourtScheduleSessions[0].panel).toBe('ADULT');
    expect(sortedCourtScheduleSessions[1].panel).toBe('YOUTH');
  });

  it('should sort court schedule sessions by panel in descending order', () => {
    const sortedCourtScheduleSessions = sortSessions(
      mockMultipleCourtScheduleSessions,
      'panel',
      'desc'
    ) as CourtScheduleSession[];
    expect(sortedCourtScheduleSessions[0].panel).toBe('YOUTH');
    expect(sortedCourtScheduleSessions[1].panel).toBe('ADULT');
  });

  it('should throw an error for unknown sort field', () => {
    expect(() => {
      sortSessions(mockMultipleSessions, 'unknownField' as SessionSortFieldsKeys, 'asc');
    }).toThrowError('Unsupported sort field');
  });

  it('should throw an error for unknown sort field in court schedule sessions', () => {
    expect(() => {
      sortSessions(
        mockMultipleCourtScheduleSessions,
        'unknownField' as SessionSortFieldsKeys,
        'asc'
      );
    }).toThrowError('Unsupported sort field');
  });

  it('should sort sessions by courtroomAssignment in ascending order', () => {
    const sessionsWithAssignments: Session[] = [
      {
        ...mockMultipleSessions[0],
        courtroomAssignment: CourtroomAssignmentType.DRAFT
      },
      {
        ...mockMultipleSessions[1],
        courtroomAssignment: CourtroomAssignmentType.ASSIGNED
      }
    ];

    const sortedSessions = sortSessions(
      sessionsWithAssignments,
      'courtroomAssignment',
      'asc'
    ) as Session[];

    expect(sortedSessions[0].courtroomAssignment).toBe(CourtroomAssignmentType.ASSIGNED);
    expect(sortedSessions[1].courtroomAssignment).toBe(CourtroomAssignmentType.DRAFT);
  });

  it('should sort sessions by courtroomAssignment in descending order', () => {
    const sessionsWithAssignments: Session[] = [
      {
        ...mockMultipleSessions[0],
        courtroomAssignment: CourtroomAssignmentType.ASSIGNED
      },
      {
        ...mockMultipleSessions[1],
        courtroomAssignment: CourtroomAssignmentType.DRAFT
      }
    ];

    const sortedSessions = sortSessions(
      sessionsWithAssignments,
      'courtroomAssignment',
      'desc'
    ) as Session[];

    expect(sortedSessions[0].courtroomAssignment).toBe(CourtroomAssignmentType.DRAFT);
    expect(sortedSessions[1].courtroomAssignment).toBe(CourtroomAssignmentType.ASSIGNED);
  });
});
