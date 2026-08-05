import { NATIONAL_STANDARD_TIMES } from '@cpp/scheduling';
import { SessionType } from '../model/session';

const toHHmm = (time: string): string => time.slice(0, 5);

export const resolveSessionTimes = (
  sessionType: SessionType,
  defaultStartTime: string,
  sessionStartTime?: string,
  sessionEndTime?: string
): { sessionStartTime: string; sessionEndTime: string } => {
  if (sessionStartTime && sessionEndTime) {
    return { sessionStartTime: toHHmm(sessionStartTime), sessionEndTime: toHHmm(sessionEndTime) };
  }

  const start = toHHmm(defaultStartTime);
  const national = NATIONAL_STANDARD_TIMES[sessionType];

  switch (sessionType) {
    case 'AM':
      return { sessionStartTime: start, sessionEndTime: national.sessionEndTime };
    case 'PM':
      return {
        sessionStartTime: national.sessionStartTime,
        sessionEndTime: national.sessionEndTime
      };
    case 'AD':
      return { sessionStartTime: start, sessionEndTime: national.sessionEndTime };
  }
};
