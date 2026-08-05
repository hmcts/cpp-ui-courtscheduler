import { CourtRoom, RotaBusinessType } from '@cpp/reference-data';
import { PanelTypeUnion } from './panel';
import { DayOfWeek } from './days';
import { CourtroomAssignmentTypeUnion } from './courtroom-assignment';

export interface Session {
  courtroom: CourtRoom;
  courtroomAssignment?: CourtroomAssignmentTypeUnion;
  sessionType: SessionType;
  businessType: RotaBusinessType;
  duration?: number;
  allDaySplit?: boolean;
  maxDurationForMorning?: number;
  maxDurationForAfternoon?: number;
  panelType: PanelTypeUnion;
  repeatDays: DayOfWeek[];
  id?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  isOverbookingAllowed?: boolean;
  index?: number;
  repeatDay?: DayOfWeek;
}

export type SessionType = 'AM' | 'PM' | 'AD';

export type SessionSortFieldsKeys = keyof Pick<
  Session,
  'courtroom' | 'sessionType' | 'panelType' | 'courtroomAssignment'
>;
