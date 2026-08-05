import { SortOrder } from '@cpp/pdk';
import { Session, SessionSortFieldsKeys } from '../model/session';
import {
  CourtScheduleSession,
  CourtScheduleSessionSortFieldsKeys
} from '../../features/view-schedule/model/view-schedule.model';

type SortField = SessionSortFieldsKeys | CourtScheduleSessionSortFieldsKeys;

export const sortSessions = <S extends Session | CourtScheduleSession>(
  sessions: S[],
  field: SortField,
  order: SortOrder
): S[] => {
  return [...sessions].sort((sessionA, sessionB) => {
    let comparison = 0;

    switch (field) {
      case 'courtroom':
      case 'courtRoomName':
        comparison = compareCourtRooms(getCourtRoomName(sessionA), getCourtRoomName(sessionB));
        break;

      case 'sessionType':
      case 'courtSession':
        comparison = compareValues(getSessionType(sessionA), getSessionType(sessionB));
        break;

      case 'panelType':
      case 'panel':
        comparison = compareValues(getPanelType(sessionA), getPanelType(sessionB));
        break;

      case 'courtroomAssignment':
        comparison = compareValues(
          getCourtroomAssignment(sessionA),
          getCourtroomAssignment(sessionB)
        );
        break;

      case 'sessionDate':
        comparison = compareValues(getSessionDate(sessionA), getSessionDate(sessionB));
        break;

      case 'isDraft':
        // false (Assigned) = 0, true (Draft) = 1
        // This means Assigned comes before Draft in ascending order
        const isDraftA = getIsDraft(sessionA) ?? false;
        const isDraftB = getIsDraft(sessionB) ?? false;
        comparison = Number(isDraftA) - Number(isDraftB);
        break;

      default:
        throw new Error(`Unsupported sort field`);
    }

    return order === 'asc' ? comparison : -comparison;
  });
};

const compareCourtRooms = (
  courtroomA: string | undefined,
  courtroomB: string | undefined
): number => {
  return (courtroomA || '').localeCompare(courtroomB || '');
};

const compareValues = (valueA: string | undefined, valueB: string | undefined): number => {
  return (valueA || '').localeCompare(valueB || '');
};

const getCourtRoomName = (session: Session | CourtScheduleSession): string | undefined => {
  if ('courtroom' in session) {
    return session.courtroom?.courtroomName;
  }
  if ('courtRoomName' in session) {
    return session.courtRoomName;
  }
  return undefined;
};

const getSessionType = (session: Session | CourtScheduleSession): string | undefined => {
  if ('sessionType' in session) {
    return session.sessionType;
  }
  if ('courtSession' in session) {
    return session.courtSession;
  }
  return undefined;
};

const getPanelType = (session: Session | CourtScheduleSession): string | undefined => {
  if ('panelType' in session) {
    return session.panelType;
  }
  if ('panel' in session) {
    return session.panel;
  }
  return undefined;
};

const getCourtroomAssignment = (session: Session | CourtScheduleSession): string | undefined => {
  if ('courtroomAssignment' in session) {
    return session.courtroomAssignment;
  }
  return undefined;
};

const getSessionDate = (session: Session | CourtScheduleSession): string | undefined => {
  if ('sessionDate' in session) {
    return session.sessionDate;
  }
  return undefined;
};

const getIsDraft = (session: Session | CourtScheduleSession): boolean | undefined => {
  if ('isDraft' in session) {
    return session.isDraft;
  }
  return undefined;
};
