import { CourtScheduleSession } from '../../features/view-schedule/model/view-schedule.model';
import { isPastDate } from './date-utils';

export function isPastSession(session: CourtScheduleSession): boolean {
  if (!session.sessionDate) {
    return false;
  }
  return isPastDate(session.sessionDate);
}

export function hasHearingsBooked(session: CourtScheduleSession): boolean {
  return !!session.totalBooked && session.totalBooked > 0;
}

/**
 * Checks if a session can be removed
 * A session can be removed if:
 * - It's not in the past
 * - It doesn't have hearings booked
 */
export function canBeRemoved(session: CourtScheduleSession): boolean {
  return !isPastSession(session) && !hasHearingsBooked(session);
}

/**
 * Checks if a session can be edited
 * A session can be edited if:
 * - It's not in the past
 */
export function canBeEdited(session: CourtScheduleSession): boolean {
  return !isPastSession(session);
}

/**
 * Categorizes sessions into removable and non-removable groups
 */
export interface SessionCriteriaResult {
  eligible: CourtScheduleSession[];
  ineligible: {
    past: CourtScheduleSession[];
    withHearings: CourtScheduleSession[];
    assigned?: CourtScheduleSession[];
  };
}

/**
 * Gets sessions that can be removed, categorized by eligibility
 */
export function getRemovableSessions(sessions: CourtScheduleSession[]): SessionCriteriaResult {
  const eligible: CourtScheduleSession[] = [];
  const past: CourtScheduleSession[] = [];
  const withHearings: CourtScheduleSession[] = [];

  sessions.forEach((session) => {
    if (canBeRemoved(session)) {
      eligible.push(session);
    } else if (isPastSession(session)) {
      past.push(session);
    } else {
      withHearings.push(session);
    }
  });

  return {
    eligible,
    ineligible: {
      past,
      withHearings
    }
  };
}

/**
 * Gets sessions that can be edited, categorized by eligibility
 */
export function getEditableSessions(sessions: CourtScheduleSession[]): SessionCriteriaResult {
  const eligible: CourtScheduleSession[] = [];
  const past: CourtScheduleSession[] = [];

  sessions.forEach((session) => {
    if (canBeEdited(session)) {
      eligible.push(session);
    } else {
      past.push(session);
    }
  });

  return {
    eligible,
    ineligible: {
      past,
      withHearings: []
    }
  };
}

/**
 * Checks if a session can be assigned a courtroom
 * A session can be assigned if:
 * - It's a DRAFT session (isDraft === true)
 * - It doesn't have any hearings booked
 * Note: Past sessions are checked separately in getAssignableSessions
 */
export function canBeAssigned(session: CourtScheduleSession): boolean {
  return session.isDraft === true && !hasHearingsBooked(session);
}

/**
 * Checks if a session is already assigned to a courtroom
 * (i.e., not a draft session)
 */
export function isAlreadyAssigned(session: CourtScheduleSession): boolean {
  return session.isDraft === false;
}

/**
 * Filters sessions to find those that are already assigned (not draft)
 */
export function getAlreadyAssignedSessionIds(
  sessions: CourtScheduleSession[],
  selectedIds: string[]
): string[] {
  return sessions
    .filter(
      (session) => selectedIds.includes(session.courtScheduleId) && isAlreadyAssigned(session)
    )
    .map((session) => session.courtScheduleId);
}

/**
 * Gets sessions that can be assigned a courtroom, categorized by eligibility
 * Rules:
 * 1. Past sessions cannot be assigned (regardless of draft status) -> ineligible.past
 * 2. Non-draft sessions (already assigned) cannot be reassigned -> ineligible.assigned
 * 3. Draft sessions with hearings cannot be assigned -> ineligible.withHearings
 * 4. Draft sessions without hearings that are not past can be assigned -> eligible
 */
export function getAssignableSessions(sessions: CourtScheduleSession[]): SessionCriteriaResult {
  const eligible: CourtScheduleSession[] = [];
  const past: CourtScheduleSession[] = [];
  const withHearings: CourtScheduleSession[] = [];
  const assigned: CourtScheduleSession[] = [];

  sessions.forEach((session) => {
    // Rule 1: Past sessions cannot be assigned (regardless of draft status)
    if (isPastSession(session)) {
      past.push(session);
    } else if (session.isDraft === true && !hasHearingsBooked(session)) {
      // Rule 4: Draft sessions without hearings that are not past can be assigned
      eligible.push(session);
    } else if (session.isDraft === false) {
      // Rule 2: Non-draft sessions (already assigned) cannot be reassigned
      assigned.push(session);
    } else {
      // Rule 3: Draft sessions with hearings cannot be assigned
      withHearings.push(session);
    }
  });

  return {
    eligible,
    ineligible: {
      past,
      withHearings,
      assigned
    }
  };
}
