import { Component, input, linkedSignal, output, computed } from '@angular/core';
import {
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkTable,
  PdkTypographyDirective,
  SortOrder
} from '@cpp/pdk';
import { Session, SessionSortFieldsKeys } from '../../../../shared/model/session';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { TitleCasePipe } from '@angular/common';
import { DaysNamePipe } from '../../../../shared/pipes/days-name.pipe';
import * as sessionUtils from '../../../../shared/utils/sessions-sort-utils';
import { FormatTimePipe } from '../../../../shared/pipes/format-time.pipe';
import { TimeDurationPipe } from '../../../../shared/pipes/time-duration.pipe';
import { isCrownJurisdiction } from '../../../../shared/utils/jurisdiction.utils';
import { resolveSessionTimes } from '../../../../shared/utils/session-times.utils';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { DayOfWeek } from '../../../../shared/model/days';
import { INDEX_OCURRENCE_OPTIONS, REPEAT_DAYS } from '../../../../shared/utils/session-form.config';

@Component({
  selector: 'session-details',
  templateUrl: './session-details.component.html',
  styles: [
    `
      .link-container a {
        margin-right: 15px;
      }
    `
  ],
  imports: [
    TitleCasePipe,
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkTable,
    PdkTypographyDirective,
    DaysNamePipe,
    FormatTimePipe,
    TimeDurationPipe
  ]
})
export class SessionDetailsComponent {
  readonly sessions = input<Session[]>([]);
  readonly isSlot = input<boolean>();
  readonly isSummary = input<boolean>(false);
  readonly actionsEnabled = input<boolean>(false);
  readonly jurisdiction = input<JurisdictionType | null>(null);
  readonly defaultStartTime = input<string>('');

  readonly currentSortField = linkedSignal({
    source: this.sessions,
    computation: (): SessionSortFieldsKeys | null => null
  });

  readonly currentSortOrder = linkedSignal({
    source: this.sessions,
    computation: (): SortOrder => 'asc'
  });

  readonly sortedSessions = computed(() => {
    const field = this.currentSortField();
    if (!field) return this.sessions();
    return sessionUtils.sortSessions(this.sessions(), field, this.currentSortOrder()) as Session[];
  });

  readonly isCrownCourt = computed(() => isCrownJurisdiction(this.jurisdiction()));

  readonly onNavigate = output<CreateScheduleRoutes>();
  readonly sessionToCopy = output<Session>();
  readonly sessionToRemove = output<Session[]>();

  routes = CreateScheduleRoutes;

  getSessionTimeRange = ({
    sessionStartTime,
    sessionEndTime,
    sessionType
  }: Session): { sessionStartTime: string; sessionEndTime: string } =>
    resolveSessionTimes(sessionType, this.defaultStartTime(), sessionStartTime, sessionEndTime);

  sort(sortField: SessionSortFieldsKeys, sortOrder: string) {
    this.currentSortField.set(sortField);
    this.currentSortOrder.set(sortOrder as SortOrder);
  }

  removeSession(session: Session) {
    this.sessionToRemove.emit([session]);
  }

  copySession(session: Session) {
    this.sessionToCopy.emit(session);
  }

  isMonthlyFrequency(session: Session): boolean {
    return !!(session.index && session.repeatDay);
  }

  getMonthlyFrequencyLabel(session: Session): string {
    if (!session.index || !session.repeatDay) {
      return '';
    }

    const indexLabel = INDEX_OCURRENCE_OPTIONS.find((opt) => opt.value === session.index)?.label;
    const dayKey = (Object.keys(DayOfWeek) as (keyof typeof DayOfWeek)[]).find(
      (key) => DayOfWeek[key] === session.repeatDay
    );

    if (!indexLabel || !dayKey) {
      return '';
    }

    return `${indexLabel} ${dayKey}`;
  }

  isAllDaysSelected(session: Session): boolean {
    if (!session.repeatDays || session.repeatDays.length === 0) {
      return false;
    }

    const availableDays = this.isCrownCourt()
      ? REPEAT_DAYS.filter((day) => day.value !== DayOfWeek.Saturday)
      : REPEAT_DAYS;

    const availableDayValues = availableDays.map((day) => day.value);
    return (
      availableDayValues.length === session.repeatDays.length &&
      availableDayValues.every((day) => session.repeatDays.includes(day))
    );
  }
}
