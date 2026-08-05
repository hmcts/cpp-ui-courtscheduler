import {
  CourtRoom,
  OrganisationUnit,
  RotaBusinessType,
  RotaBusinessTypeCode
} from '@cpp/reference-data';
import { Session } from '../model/session';
import { DayOfWeek } from '../model/days';
import { JurisdictionType } from '../model/jurisdiction';
import { RepeatPattern, FrequencyType } from '../../features/create-schedule/model/repeat-pattern';
import {
  CourtScheduleDraft,
  CourtSchedulePayload,
  ValidateSessionPayload
} from '../../features/create-schedule/model';
import {
  CourtSchedule,
  CourtScheduleSession,
  SearchFormValues,
  SearchSchedulesPayload,
  ViewCourtSchedule
} from '../../features/view-schedule/model/view-schedule.model';
import { CourtCentre } from '../model/court-centre';
import { ValidationError } from '@cpp/pdk';
import { NATIONAL_STANDARD_TIMES } from '@cpp/scheduling';

export const mockCourtRoom: CourtRoom = {
  id: '1',
  courtroomName: 'Courtroom 1',
  courtroomId: 1,
  venueName: 'Venue 1'
};

export const mockMultipleCourtRooms: CourtRoom[] = [
  {
    id: '1',
    courtroomName: 'Courtroom 1',
    courtroomId: 1,
    venueName: 'Venue 1'
  },
  {
    id: '2',
    courtroomName: 'Courtroom 2',
    courtroomId: 2,
    venueName: 'Venue 2'
  },
  {
    id: '3',
    courtroomName: 'Courtroom 3',
    courtroomId: 3,
    venueName: 'Venue 3'
  }
];

export const mockMagistratesCourtCentre: OrganisationUnit = {
  id: '1',
  oucode: '001',
  oucodeL1Code: 'B',
  oucodeL1Name: 'L1 Name',
  oucodeL3Name: 'L3 Name',
  oucodeL3WelshName: 'L3 Welsh Name',
  address1: 'Address 1',
  address2: 'Address 2',
  postcode: 'Postcode',
  defaultStartTime: '10:30',
  defaultDurationHrs: '08:00',
  oucodeL2Code: 'L2',
  oucodeL2Name: 'L2 Name',
  region: 'Region',
  courtrooms: mockMultipleCourtRooms,
  oucodeL3Code: 'B'
};

export const mockCrownCourtCentre: OrganisationUnit = {
  id: '2',
  oucode: '002',
  oucodeL1Code: 'C',
  oucodeL1Name: 'L1 Name',
  oucodeL3Name: 'L3 Name',
  oucodeL3WelshName: 'L3 Welsh Name',
  address1: 'Address 1',
  address2: 'Address 2',
  postcode: 'Postcode',
  defaultStartTime: '09:00',
  defaultDurationHrs: '08:00',
  oucodeL2Code: 'L2',
  oucodeL2Name: 'L2 Name',
  region: 'Region',
  courtrooms: mockMultipleCourtRooms,
  oucodeL3Code: 'C'
};

export const mockCrownCourt: OrganisationUnit = {
  id: 'crown-1',
  oucode: 'CROWN001',
  oucodeL1Code: 'C',
  oucodeL1Name: 'L1 Name',
  oucodeL3Name: 'Crown Court Name',
  oucodeL3WelshName: 'L3 Welsh Name',
  address1: 'Address 1',
  address2: 'Address 2',
  postcode: 'Postcode',
  defaultStartTime: '09:00',
  defaultDurationHrs: '08:00',
  oucodeL2Code: 'L2',
  oucodeL2Name: 'L2 Name',
  region: 'Region',
  courtrooms: mockMultipleCourtRooms,
  oucodeL3Code: 'C'
};

export const mockCourtCentres: CourtCentre[] = [
  {
    id: '1',
    name: 'Liverpool',
    defaultStartTime: '10:00',
    defaultDuration: '6',
    courtCode: undefined,
    courtRooms: []
  }
];

export const mockBusinessType: RotaBusinessType = {
  id: '1',
  typeCode: '001' as RotaBusinessTypeCode,
  typeDescription: 'Business Type 1',
  seqNum: 0,
  slot: false,
  duration: false
};

export const mockMultipleRotaBusinessTypes: RotaBusinessType[] = [
  {
    id: '1',
    typeCode: '001' as RotaBusinessTypeCode,
    typeDescription: 'Business Type 1',
    seqNum: 0,
    slot: false,
    duration: false
  },
  {
    id: '2',
    typeCode: '002' as RotaBusinessTypeCode,
    typeDescription: 'Business Type 2',
    seqNum: 0,
    slot: false,
    duration: false
  }
];

export const mockMagistratesBusinessTypes: RotaBusinessType[] = [
  {
    id: '1',
    typeCode: '001' as RotaBusinessTypeCode,
    typeDescription: 'Magistrates Business Type 1',
    seqNum: 0,
    slot: false,
    duration: false,
    jurisdiction: JurisdictionType.MAGISTRATES
  }
];

export const mockCrownBusinessTypes: RotaBusinessType[] = [
  {
    id: '2',
    typeCode: '002' as RotaBusinessTypeCode,
    typeDescription: 'Crown Business Type 1',
    seqNum: 0,
    slot: false,
    duration: false,
    jurisdiction: JurisdictionType.CROWN
  }
];

export const mockSession: Session = {
  courtroom: mockCourtRoom,
  sessionType: 'AM',
  businessType: mockBusinessType,
  duration: 60,
  panelType: 'ADULT',
  repeatDays: [DayOfWeek.Monday],
  allDaySplit: false
};

export const mockMultipleSessions: Session[] = [
  {
    id: 'session-1',
    sessionType: 'AM',
    duration: 60,
    panelType: 'ADULT',
    repeatDays: [DayOfWeek.Monday],
    courtroom: { id: '1', courtroomName: 'Courtroom 1' } as CourtRoom,
    businessType: {
      id: '1',
      typeCode: '001' as RotaBusinessTypeCode,
      typeDescription: 'Business Type 1',
      seqNum: 0,
      slot: false,
      duration: false
    },
    allDaySplit: false
  },
  {
    id: 'session-2',
    sessionType: 'PM',
    duration: 90,
    panelType: 'YOUTH',
    repeatDays: [DayOfWeek.Tuesday],
    courtroom: { id: '2', courtroomName: 'Courtroom 2' } as CourtRoom,
    businessType: {
      id: '2',
      typeCode: '002' as RotaBusinessTypeCode,
      typeDescription: 'Business Type 2',
      seqNum: 0,
      slot: false,
      duration: false
    },
    allDaySplit: false
  }
];

export const mockMultipleCourtScheduleSessions: CourtScheduleSession[] = [
  {
    courtRoomName: 'Courtroom 1',
    courtSession: 'AM',
    panel: 'ADULT',
    sessionDate: '2023-09-15',
    businessType: 'APP',
    courtRoomId: 'courtroom-1',
    totalBooked: 1,
    allDaySplit: false,
    totalBookedForMorning: 0,
    totalBookedForAfternoon: 0,
    jurisdiction: JurisdictionType.MAGISTRATES
  },
  {
    courtRoomName: 'Courtroom 2',
    courtSession: 'PM',
    panel: 'YOUTH',
    sessionDate: '2023-09-16',
    businessType: 'APP',
    courtRoomId: 'courtroom-2',
    totalBooked: 0,
    allDaySplit: false,
    totalBookedForMorning: 0,
    totalBookedForAfternoon: 0,
    jurisdiction: JurisdictionType.MAGISTRATES
  }
];

export const mockRepeatPattern: RepeatPattern = {
  startDate: '2023-01-01',
  endDate: '2023-01-07',
  repeatFor: 1,
  frequency: FrequencyType.ONCE
};

export const mockCourtSchedulePayload: CourtSchedulePayload = {
  sessions: [
    {
      courtCentreId: mockMagistratesCourtCentre.id,
      jurisdiction: JurisdictionType.MAGISTRATES,
      courtRoomId: mockSession.courtroom.id,
      sessionType: mockSession.sessionType,
      businessType: mockSession.businessType.typeCode,
      duration: mockSession.duration,
      panel: mockSession.panelType,
      repeatDays: ['Monday'],
      allDaySplit: false,
      isDraft: false,
      sessionStartTime: mockMagistratesCourtCentre.defaultStartTime,
      sessionEndTime: NATIONAL_STANDARD_TIMES[mockSession.sessionType].sessionEndTime
    }
  ],
  repeatPattern: mockRepeatPattern
};

export const mockValidateSessionPayload: ValidateSessionPayload = {
  sessions: [
    {
      courtCentreId: mockMagistratesCourtCentre.id,
      jurisdiction: JurisdictionType.MAGISTRATES,
      courtRoomId: mockSession.courtroom.id,
      sessionType: mockSession.sessionType,
      businessType: mockSession.businessType.typeCode,
      duration: mockSession.duration,
      panel: mockSession.panelType,
      repeatDays: ['Monday'],
      allDaySplit: false,
      isDraft: false,
      sessionStartTime: mockMagistratesCourtCentre.defaultStartTime,
      sessionEndTime: NATIONAL_STANDARD_TIMES[mockSession.sessionType].sessionEndTime
    }
  ],
  sessionToBeAdded: {
    courtCentreId: mockMagistratesCourtCentre.id,
    jurisdiction: JurisdictionType.MAGISTRATES,
    courtRoomId: mockSession.courtroom.id,
    sessionType: mockSession.sessionType,
    businessType: mockSession.businessType.typeCode,
    duration: mockSession.duration,
    panel: mockSession.panelType,
    repeatDays: ['Monday'],
    allDaySplit: false,
    isDraft: false,
    sessionStartTime: mockMagistratesCourtCentre.defaultStartTime,
    sessionEndTime: NATIONAL_STANDARD_TIMES[mockSession.sessionType].sessionEndTime
  },
  repeatPattern: mockRepeatPattern
};

export const mockUpdateSessionPayload = {
  courtScheduleId: 'id',
  courtRoomId: '1',
  businessType: 'Applications',
  courtSession: 'AM',
  sessionStartTime: '09:00',
  sessionEndTime: '12:30',
  isOverbookingAllowed: false,
  maxDuration: 1569984805,
  panel: 'ADULT',
  jurisdiction: JurisdictionType.MAGISTRATES
};

export const mockCourtScheduleDraft: CourtScheduleDraft = {
  selectedCourtCentre: mockMagistratesCourtCentre,
  selectedBusinessType: mockBusinessType,
  repeatPattern: mockRepeatPattern,
  sessions: mockMultipleSessions,
  isPersisted: false,
  errors: null
};

export const mockCourtScheduleSession: CourtScheduleSession = {
  courtScheduleId: 'id1',
  courtRoomId: '91631743-7bcd-3566-b5d3-646d783314a1',
  courtHouseName: 'courthouse name 1',
  courtHouseId: '1',
  courtRoomName: 'Courtroom 1',
  businessType: 'Applications',
  panel: 'ADULT',
  courtSession: 'AM',
  active: true,
  slotBased: false,
  sessionDate: 'Dec 27, 2027, 6:06:32 PM',
  maxSlots: 2097164855,
  maxDuration: 1569984805,
  totalBooked: 0,
  allDaySplit: false,
  totalBookedForMorning: 0,
  totalBookedForAfternoon: 0,
  jurisdiction: JurisdictionType.MAGISTRATES
};

export const mockCourtSchedule: CourtSchedule = {
  courtRoomId: '91631743-7bcd-3566-b5d3-646d783314a1',
  courtRoomName: 'Courtroom 1',
  sessions: [mockCourtScheduleSession]
};

export const mockCourtScheduleResponse: ViewCourtSchedule = {
  courtSchedules: [
    {
      courtRoomId: '91631743-7bcd-3566-b5d3-646d783314a1',
      courtRoomName: 'Courtroom 1',
      sessions: [
        {
          courtScheduleId: 'id1',
          courtRoomId: '91631743-7bcd-3566-b5d3-646d783314a1',
          courtHouseName: 'courthouse name 1',
          courtHouseId: '1',
          courtRoomName: 'Courtroom 1',
          businessType: 'Applications',
          panel: 'ADULT',
          courtSession: 'AM',
          active: true,
          slotBased: false,
          sessionDate: 'Dec 27, 2027, 6:06:32 PM',
          isOverbookingAllowed: false,
          maxSlots: 2097164855,
          maxDuration: 1569984805,
          createdOn: 'Dec 24, 2027, 6:06:32 PM',
          updatedOn: 'Apr 24, 2017, 7:34:23 AM',
          totalBooked: 0,
          allDaySplit: false,
          totalBookedForMorning: 0,
          totalBookedForAfternoon: 0,
          jurisdiction: JurisdictionType.MAGISTRATES
        },
        {
          courtScheduleId: 'id2',
          courtRoomId: '91631743-7bcd-3566-b5d3-646d783314a1',
          courtHouseName: 'courthouse name 2',
          courtHouseId: 'courthouse id 2',
          courtRoomName: 'Courtroom 1',
          businessType: 'Applications',
          panel: 'ADULT',
          courtSession: 'AM',
          active: true,
          slotBased: false,
          sessionDate: 'Dec 27, 2027, 6:06:32 PM',
          isOverbookingAllowed: false,
          maxSlots: 2097164855,
          maxDuration: 1569984805,
          createdOn: 'Dec 29, 2027, 6:06:32 PM',
          updatedOn: 'Apr 24, 2017, 7:34:23 AM',
          totalBooked: 1,
          allDaySplit: false,
          totalBookedForMorning: 0,
          totalBookedForAfternoon: 0,
          jurisdiction: JurisdictionType.MAGISTRATES
        }
      ]
    },
    {
      courtRoomId: 'courtroom id 2',
      courtRoomName: 'Courtroom 2',
      sessions: [
        {
          courtScheduleId: 'id3',
          listingProfileId: 'bIAkijRvqQYzYSGk',
          ouCode: 'SJQBDOnjjqrL',
          courtHouseId: 'bOhSiTykkDcApEKLyotT',
          courtHouseName: 'UelLISQnAtoiogGlveIhHdrc',
          courtRoomName: 'Courtroom 2',
          operationalUnit: 'uEWrahOuMBmfaULmQrBTpyQyMUhRajH',
          businessType: 'DVLA',
          panel: 'YOUTH',
          courtSession: 'AD',
          active: true,
          slotBased: true,
          sessionDate: 'Dec 28, 2027, 6:06:32 PM',
          maxSlots: 2097164855,
          maxDuration: 1569984805,
          createdOn: 'Dec 27, 2027, 6:06:32 PM',
          updatedOn: 'Apr 24, 2017, 7:34:23 AM',
          courtRoomId: 'courtroom id 2',
          totalBooked: 0,
          allDaySplit: false,
          totalBookedForMorning: 0,
          totalBookedForAfternoon: 0,
          jurisdiction: JurisdictionType.MAGISTRATES
        },
        {
          courtScheduleId: 'id4',
          listingProfileId: 'bIAkijRvqQYzYSGk',
          ouCode: 'SJQBDOnjjqrL',
          courtHouseId: 'bOhSiTykkDcApEKLyotT',
          courtHouseName: 'UelLISQnAtoiogGlveIhHdrc',
          courtRoomName: 'Courtroom 2',
          operationalUnit: 'uEWrahOuMBmfaULmQrBTpyQyMUhRajH',
          businessType: 'Application',
          panel: 'ADULT',
          courtSession: 'PM',
          active: true,
          slotBased: false,
          sessionDate: 'Dec 23, 2027, 6:06:32 PM',
          maxSlots: 2097164855,
          maxDuration: 1569984805,
          createdOn: 'Dec 29, 2027, 6:06:32 PM',
          updatedOn: 'Apr 24, 2017, 7:34:23 AM',
          courtRoomId: 'courtroom id 2',
          totalBooked: 0,
          allDaySplit: false,
          totalBookedForMorning: 0,
          totalBookedForAfternoon: 0,
          jurisdiction: JurisdictionType.MAGISTRATES
        }
      ]
    }
  ]
};

export const mockSearchFormValues: SearchFormValues = {
  startDate: '2023-01-01',
  endDate: '2023-01-07',
  courtCentre: {
    id: 'courtCentreId',
    oucodeL3Code: '',
    oucodeL3Name: ''
  },
  businessType: 'businessType',
  courtroomId: 'courtroomId',
  minEndDate: undefined
};

export const mockSearchSchedulesPayload: SearchSchedulesPayload = {
  sessionStartDate: '2023-01-01',
  sessionEndDate: '2023-01-07',
  courtCentreId: 'courtCentreId',
  businessType: 'businessType',
  courtRoomId: 'courtRoomId'
};

export const mockErrors: ValidationError[] = [{ id: 'error', message: 'error' }];

export const mockActiveCourtroomIndexes: number[] = [1];

export const mockBanner = {
  message: 'Session added successfully',
  bannerType: 'success'
};
