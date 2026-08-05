import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SessionDetailsComponent } from './session-details.component';
import { Session, SessionSortFieldsKeys, SessionType } from '../../../../shared/model/session';
import { DayOfWeek } from '../../../../shared/model/days';
import { mockMagistratesCourtCentre, mockMultipleSessions } from '../../../../shared';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import * as sessionUtils from '../../../../shared/utils/sessions-sort-utils';
import { NATIONAL_STANDARD_TIMES } from '@cpp/scheduling';
import { FormatTimePipe } from '../../../../shared/pipes/format-time.pipe';
import { DaysNamePipe } from '../../../../shared/pipes/days-name.pipe';
import { CourtroomAssignmentType } from '../../../../shared/model/courtroom-assignment';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('SessionDetailsComponent', () => {
  let component: SessionDetailsComponent;
  let fixture: ComponentFixture<SessionDetailsComponent>;

  const mockSessions: Session[] = mockMultipleSessions;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDetailsComponent],
      providers: [FormatTimePipe, DaysNamePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sessions', mockSessions);
    fixture.componentRef.setInput('jurisdiction', null);
    fixture.componentRef.setInput('defaultStartTime', mockMagistratesCourtCentre.defaultStartTime);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should sort sessions correctly using sessionUtils', () => {
    const sortField: SessionSortFieldsKeys = 'courtroom';
    const sortOrder: 'asc' | 'desc' = 'asc';

    spyOn(sessionUtils, 'sortSessions').and.callThrough();

    component.sort(sortField, sortOrder);

    expect(component.currentSortField()).toBe(sortField);
    expect(component.currentSortOrder()).toBe(sortOrder);

    const sortedSessions = component.sortedSessions();

    expect(sessionUtils.sortSessions).toHaveBeenCalledWith(
      component.sessions(),
      sortField,
      sortOrder
    );
    expect(sortedSessions).toEqual(
      sessionUtils.sortSessions(mockSessions, sortField, sortOrder) as Session[]
    );
  });

  it('should emit sessionToRemove event with correct session', () => {
    spyOn(component.sessionToRemove, 'emit');
    const sessionToRemove = mockSessions[0];

    component.removeSession(sessionToRemove);

    expect(component.sessionToRemove.emit).toHaveBeenCalledWith([sessionToRemove]);
  });

  it('should emit sessionToCopy event with correct session', () => {
    spyOn(component.sessionToCopy, 'emit');
    const sessionToCopy = mockSessions[1];

    component.copySession(sessionToCopy);

    expect(component.sessionToCopy.emit).toHaveBeenCalledWith(sessionToCopy);
  });

  it('should navigate to the correct route when Change link is clicked', () => {
    spyOn(component.onNavigate, 'emit');
    fixture.componentRef.setInput('isSummary', true);
    fixture.detectChanges();

    const changeLink = fixture.debugElement.query(
      By.css('a[data-test-id="changeSessionDetails"]')
    ).nativeElement;
    changeLink.click();

    expect(component.onNavigate.emit).toHaveBeenCalledWith(CreateScheduleRoutes.SESSIONS_FORM);
  });

  describe('Session Duration Display', () => {
    it('should display duration when session.duration is 0', () => {
      fixture.componentRef.setInput('sessions', [
        { ...mockSessions[0], duration: 0, allDaySplit: false }
      ]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should display AM/PM durations when session.duration is null', () => {
      fixture.componentRef.setInput('sessions', [
        { ...mockSessions[0], duration: null, allDaySplit: false }
      ]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should display AM/PM durations when session.allDaySplit is true', () => {
      fixture.componentRef.setInput('sessions', [
        { ...mockSessions[0], duration: 120, allDaySplit: true }
      ]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });
  });

  describe('Session Time Range Display', () => {
    it('should display custom time range when session has custom start and end times', () => {
      const sessionWithCustomTimes = {
        ...mockSessions[0],
        sessionStartTime: '09:15',
        sessionEndTime: '13:45'
      };
      fixture.componentRef.setInput('sessions', [sessionWithCustomTimes]);
      fixture.detectChanges();

      const timeRange = component.getSessionTimeRange(sessionWithCustomTimes);
      expect(timeRange.sessionStartTime).toBe('09:15');
      expect(timeRange.sessionEndTime).toBe('13:45');
    });

    it('should use ref data defaultStartTime when session has no custom times', () => {
      const sessionWithoutCustomTimes = {
        ...mockSessions[0],
        sessionType: 'AM' as SessionType,
        sessionStartTime: null,
        sessionEndTime: null
      } as Session;
      fixture.componentRef.setInput('sessions', [sessionWithoutCustomTimes]);
      fixture.componentRef.setInput(
        'defaultStartTime',
        mockMagistratesCourtCentre.defaultStartTime
      );
      fixture.detectChanges();

      const timeRange = component.getSessionTimeRange(sessionWithoutCustomTimes);
      expect(timeRange.sessionStartTime).toBe(mockMagistratesCourtCentre.defaultStartTime);
      expect(timeRange.sessionEndTime).toBe(NATIONAL_STANDARD_TIMES.AM.sessionEndTime);
    });
  });

  describe('Session Type Display', () => {
    it('should display "All day" for AD session type', () => {
      const allDaySession = {
        ...mockSessions[0],
        sessionType: 'AD' as SessionType
      };
      fixture.componentRef.setInput('sessions', [allDaySession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should display session type as-is for non-AD types', () => {
      const amSession = {
        ...mockSessions[0],
        sessionType: 'AM' as SessionType
      };
      fixture.componentRef.setInput('sessions', [amSession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });
  });

  describe('Overbooking Display', () => {
    it('should display "Yes" when isOverbookingAllowed is true', () => {
      const overbookingSession = {
        ...mockSessions[0],
        isOverbookingAllowed: true
      };
      fixture.componentRef.setInput('sessions', [overbookingSession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should display "No" when isOverbookingAllowed is false', () => {
      const noOverbookingSession = {
        ...mockSessions[0],
        isOverbookingAllowed: false
      };
      fixture.componentRef.setInput('sessions', [noOverbookingSession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should display "No" when isOverbookingAllowed is undefined', () => {
      const undefinedOverbookingSession = {
        ...mockSessions[0],
        isOverbookingAllowed: undefined
      } as Session;
      fixture.componentRef.setInput('sessions', [undefinedOverbookingSession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });
  });

  describe('Actions Display', () => {
    it('should display action links when actionsEnabled is true', () => {
      fixture.componentRef.setInput('actionsEnabled', true);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should not display action links when actionsEnabled is false', () => {
      fixture.componentRef.setInput('actionsEnabled', false);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should trigger copySession when copy link is clicked', () => {
      spyOn(component, 'copySession');
      fixture.componentRef.setInput('actionsEnabled', true);
      fixture.detectChanges();

      const copyLink = fixture.debugElement.query(
        By.css('a[data-test-id="copy-session"]')
      ).nativeElement;
      copyLink.click();

      expect(component.copySession).toHaveBeenCalled();
    });

    it('should trigger removeSession when remove link is clicked', () => {
      spyOn(component, 'removeSession');
      fixture.componentRef.setInput('actionsEnabled', true);
      fixture.detectChanges();

      const removeLink = fixture.debugElement.query(
        By.css('a[data-test-id="remove-session"]')
      ).nativeElement;
      removeLink.click();

      expect(component.removeSession).toHaveBeenCalled();
    });
  });

  describe('Label Display', () => {
    it('should display "Slots" when isSlot is true', () => {
      fixture.componentRef.setInput('isSlot', true);
      const sessionWithDuration = {
        ...mockSessions[0],
        duration: 5,
        allDaySplit: false
      };
      fixture.componentRef.setInput('sessions', [sessionWithDuration]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should display "Duration" when isSlot is false', () => {
      fixture.componentRef.setInput('isSlot', false);
      const sessionWithDuration = {
        ...mockSessions[0],
        duration: 120,
        allDaySplit: false
      };
      fixture.componentRef.setInput('sessions', [sessionWithDuration]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });
  });

  describe('Crown Court related functionality', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
      fixture.detectChanges();
    });

    it('should render with courtroom assignment column when jurisdiction is CROWN', () => {
      const sessionWithAssignment = {
        ...mockSessions[0],
        courtroomAssignment: CourtroomAssignmentType.ASSIGNED
      };
      fixture.componentRef.setInput('sessions', [sessionWithAssignment]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should sort by courtroomAssignment when jurisdiction is CROWN', () => {
      const sessionsWithAssignments: Session[] = [
        {
          ...mockSessions[1],
          courtroomAssignment: CourtroomAssignmentType.ASSIGNED
        },
        {
          ...mockSessions[0],
          courtroomAssignment: CourtroomAssignmentType.DRAFT
        }
      ];
      fixture.componentRef.setInput('sessions', sessionsWithAssignments);
      fixture.detectChanges();

      spyOn(sessionUtils, 'sortSessions').and.callThrough();

      component.sort('courtroomAssignment', 'asc');

      expect(component.currentSortField()).toBe('courtroomAssignment');
      expect(component.currentSortOrder()).toBe('asc');

      const sortedSessions = component.sortedSessions();

      expect(sessionUtils.sortSessions).toHaveBeenCalledWith(
        component.sessions(),
        'courtroomAssignment',
        'asc'
      );
      expect(sortedSessions).toEqual(
        sessionUtils.sortSessions(
          sessionsWithAssignments,
          'courtroomAssignment',
          'asc'
        ) as Session[]
      );
    });
  });

  describe('Monthly Frequency display', () => {
    it('should return true for isMonthlyFrequency when session has index and repeatDay', () => {
      const monthlySession: Session = {
        ...mockSessions[0],
        index: 1,
        repeatDay: DayOfWeek.Monday
      };

      expect(component.isMonthlyFrequency(monthlySession)).toBe(true);
    });

    it('should return false for isMonthlyFrequency when session has no index', () => {
      const weeklySession: Session = {
        ...mockSessions[0],
        repeatDay: DayOfWeek.Monday
      };

      expect(component.isMonthlyFrequency(weeklySession)).toBe(false);
    });

    it('should return false for isMonthlyFrequency when session has no repeatDay', () => {
      const weeklySession: Session = {
        ...mockSessions[0],
        index: 1
      };

      expect(component.isMonthlyFrequency(weeklySession)).toBe(false);
    });

    it('should return formatted label for getMonthlyFrequencyLabel', () => {
      const monthlySession: Session = {
        ...mockSessions[0],
        index: 1,
        repeatDay: DayOfWeek.Monday
      };

      expect(component.getMonthlyFrequencyLabel(monthlySession)).toBe('1st Monday');
    });

    it('should return formatted label for different index values', () => {
      const testCases = [
        { index: 1, repeatDay: DayOfWeek.Tuesday, expected: '1st Tuesday' },
        { index: 2, repeatDay: DayOfWeek.Wednesday, expected: '2nd Wednesday' },
        { index: 3, repeatDay: DayOfWeek.Thursday, expected: '3rd Thursday' },
        { index: 4, repeatDay: DayOfWeek.Friday, expected: '4th Friday' }
      ];

      testCases.forEach(({ index, repeatDay, expected }) => {
        const session: Session = {
          ...mockSessions[0],
          index,
          repeatDay
        };
        expect(component.getMonthlyFrequencyLabel(session)).toBe(expected);
      });
    });

    it('should return empty string for getMonthlyFrequencyLabel when index is missing', () => {
      const session: Session = {
        ...mockSessions[0],
        repeatDay: DayOfWeek.Monday
      };

      expect(component.getMonthlyFrequencyLabel(session)).toBe('');
    });

    it('should return empty string for getMonthlyFrequencyLabel when repeatDay is missing', () => {
      const session: Session = {
        ...mockSessions[0],
        index: 1
      };

      expect(component.getMonthlyFrequencyLabel(session)).toBe('');
    });
  });

  describe('Daily display for repeat days', () => {
    it('should return true for isAllDaysSelected when all Magistrates days are selected', () => {
      const allDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: [
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday
        ]
      };

      expect(component.isAllDaysSelected(allDaysSession)).toBe(true);
    });

    it('should return true for isAllDaysSelected when all Crown days are selected', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
      fixture.detectChanges();

      const allDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: [
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday
        ]
      };

      expect(component.isAllDaysSelected(allDaysSession)).toBe(true);
    });

    it('should return false for isAllDaysSelected when not all days are selected', () => {
      const partialDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday]
      };

      expect(component.isAllDaysSelected(partialDaysSession)).toBe(false);
    });

    it('should return false for isAllDaysSelected when repeatDays is empty', () => {
      const emptyDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: []
      };

      expect(component.isAllDaysSelected(emptyDaysSession)).toBe(false);
    });

    it('should return false for isAllDaysSelected when repeatDays is null', () => {
      const nullDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: null as any
      };

      expect(component.isAllDaysSelected(nullDaysSession)).toBe(false);
    });

    it('should return false for isAllDaysSelected when repeatDays includes Saturday for Crown', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);
      fixture.detectChanges();

      const sessionWithSaturday: Session = {
        ...mockSessions[0],
        repeatDays: [
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday
        ]
      };

      expect(component.isAllDaysSelected(sessionWithSaturday)).toBe(false);
    });

    it('should render with Daily label when all days are selected for Magistrates', () => {
      const allDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: [
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday
        ]
      };
      fixture.componentRef.setInput('sessions', [allDaysSession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should render with Daily label when all days are selected for Crown', () => {
      fixture.componentRef.setInput('jurisdiction', JurisdictionType.CROWN);

      const allDaysSession: Session = {
        ...mockSessions[0],
        repeatDays: [
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday
        ]
      };
      fixture.componentRef.setInput('sessions', [allDaysSession]);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });
  });
});
