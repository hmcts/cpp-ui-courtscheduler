import { CourtSchedule } from '../../../model/view-schedule.model';
import { ViewScheduleState } from '../../view-schedule.state';
import {
  getActiveCourtroomsIndexes,
  getCourtSchedules,
  getSearchValues,
  getErrors,
  getSessionsToAssign
} from '../view-schedule.selectors';
import {
  mockActiveCourtroomIndexes,
  mockCourtScheduleSession,
  mockErrors,
  mockSearchFormValues
} from '../../../../../shared';
import { JurisdictionType } from '../../../../../shared/model/jurisdiction';

describe('ViewSchedule selectors', () => {
  const mockCourtSchedules: CourtSchedule[] = [
    {
      courtRoomId: 'courtroom id 1',
      courtRoomName: 'Courtroom 1',
      sessions: [
        {
          courtScheduleId: 'id1',
          listingProfileId: 'bIAkijRvqQYzYSGk',
          ouCode: 'SJQBDOnjjqrL',
          courtRoomId: 'courtroom id 1',
          courtHouseName: 'courthouse name 1',
          courtRoomName: 'Courtroom 1',
          operationalUnit: 'uEWrahOuMBmfaULmQrBTpyQyMUhRajH',
          businessType: 'Applications',
          panel: 'ADULT',
          courtSession: 'AM',
          active: true,
          slotBased: false,
          sessionDate: 'Dec 27, 2027, 6:06:32 PM',
          maxSlots: 2097164855,
          maxDuration: 1569984805,
          totalBooked: 0,
          createdOn: 'Dec 24, 2027, 6:06:32 PM',
          updatedOn: 'Apr 24, 2017, 7:34:23 AM',
          allDaySplit: false,
          totalBookedForMorning: 0,
          totalBookedForAfternoon: 0,
          jurisdiction: JurisdictionType.MAGISTRATES
        }
      ]
    }
  ];

  const state = {
    viewSchedule: {
      courtSchedules: mockCourtSchedules,
      searchValues: mockSearchFormValues,
      errors: mockErrors,
      activeCourtroomsIndexes: mockActiveCourtroomIndexes,
      sessionsToAssign: [mockCourtScheduleSession]
    }
  } as ViewScheduleState;

  it('should return court schedules', () => {
    const result = getCourtSchedules(state);
    expect(result).toEqual(mockCourtSchedules);
  });
  it('should return search values', () => {
    const result = getSearchValues(state);
    expect(result).toEqual(mockSearchFormValues);
  });
  it('should return active courtrooms indexes', () => {
    const result = getActiveCourtroomsIndexes(state);
    expect(result).toEqual(mockActiveCourtroomIndexes);
  });
  it('should return errors', () => {
    const result = getErrors(state);
    expect(result).toEqual(mockErrors);
  });
  it('should return sessions to assign', () => {
    const result = getSessionsToAssign(state);
    expect(result).toEqual([mockCourtScheduleSession]);
  });
});
