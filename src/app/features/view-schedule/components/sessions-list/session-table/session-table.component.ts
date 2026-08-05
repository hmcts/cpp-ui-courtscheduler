import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkCheckboxComponent,
  PdkLinkDirective,
  PdkTable,
  PdkVisuallyHiddenDirective,
  SortOrder
} from '@cpp/pdk';
import { CppUserHasPermissionDirective } from '@cpp/users-groups';
import {
  CourtSchedulerUserPermissions,
  EXPECTED_SCHEDULER_USER_PERMISSIONS
} from '../../../../../app.permissions';
import { FormatTimePipe } from '../../../../../shared/pipes/format-time.pipe';
import {
  canBeAssigned,
  canBeEdited,
  canBeRemoved
} from '../../../../../shared/utils/session-criteria.utils';
import * as sessionUtils from '../../../../../shared/utils/sessions-sort-utils';
import {
  CourtScheduleSession,
  CourtScheduleSessionSortFieldsKeys
} from '../../../model/view-schedule.model';
import { SessionDurationCellComponent } from './cells/session-duration-cell.component';

export interface SessionTableAction {
  label: string;
  action: string;
  dataTestId?: string;
}

export type SelectionContext = 'remove' | 'assign';

export interface SessionTableConfig {
  showSelectionColumn: boolean;
  showActionsColumn: boolean;
  showCourtroomAssignment: boolean;
  showPanel: boolean;
  actions?: SessionTableAction[];
}

export interface SelectAllSessionsEvent {
  allSelected: boolean;
  sessionIds: string[];
}

@Component({
  selector: 'session-table',
  templateUrl: './session-table.component.html',
  styles: [
    `
      .link-container a {
        margin-right: 15px;
      }

      ::ng-deep th.courtroom-assignment-header button {
        text-align: left;
        justify-content: flex-start;
      }

      :host ::ng-deep tr.row-validation-error {
        border-left-width: 6px;
        border-left-style: solid;
        border-left-color: #d32f2f;
        pdk-checkbox {
          padding-left: 10px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    TitleCasePipe,
    CppUserHasPermissionDirective,
    PdkCheckboxComponent,
    PdkLinkDirective,
    PdkTable,
    PdkVisuallyHiddenDirective,
    SessionDurationCellComponent,
    FormatTimePipe
  ]
})
export class SessionTableComponent {
  permissions = inject<CourtSchedulerUserPermissions>(EXPECTED_SCHEDULER_USER_PERMISSIONS);

  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly allSelectedSessionIds = input<string[]>([]);
  readonly config = input<SessionTableConfig>({
    showSelectionColumn: false,
    showActionsColumn: false,
    showCourtroomAssignment: false,
    showPanel: true,
    actions: []
  });
  /**
   * The context for selection eligibility checking.
   * - 'remove': Uses canBeRemoved() - session not past and no hearings
   * - 'assign': Uses canBeAssigned() - session is draft and no hearings
   * Defaults to 'remove' for backward compatibility.
   */
  readonly selectionContext = input<SelectionContext>('remove');
  /** IDs of sessions that are ineligible for the current action (shown with validation error styling) */
  readonly ineligibleSessionIds = input<string[]>([]);

  readonly onAction = output<{ session: CourtScheduleSession; action: string }>();
  readonly onSelectAllChange = output<SelectAllSessionsEvent>();

  readonly currentSortField = linkedSignal({
    source: this.sessions,
    computation: (): CourtScheduleSessionSortFieldsKeys | null => null
  });

  readonly currentSortOrder = linkedSignal({
    source: this.sessions,
    computation: (): SortOrder => 'asc'
  });

  readonly sortedSessions = computed(() => {
    const field = this.currentSortField();
    if (!field) return this.sessions();
    return sessionUtils.sortSessions(
      this.sessions(),
      field,
      this.currentSortOrder()
    ) as CourtScheduleSession[];
  });

  readonly eligibleSessionIds = computed(() => {
    const context = this.selectionContext();
    return this.sessions()
      .filter((s) => (context === 'assign' ? canBeAssigned(s) : canBeRemoved(s)))
      .map((s) => s.courtScheduleId);
  });

  readonly allSessionsSelected = computed(() => {
    const eligibleIds = this.eligibleSessionIds();
    if (eligibleIds.length === 0) return false;
    return eligibleIds.every((id) => this.allSelectedSessionIds().includes(id));
  });

  handleSort(field: CourtScheduleSessionSortFieldsKeys, sortOrder: string) {
    this.currentSortField.set(field);
    this.currentSortOrder.set(sortOrder as SortOrder);
  }

  handleAction(session: CourtScheduleSession, action: string) {
    this.onAction.emit({ session, action });
  }

  isActionVisible(session: CourtScheduleSession, action: string): boolean {
    switch (action) {
      case 'edit':
        return canBeEdited(session);
      case 'remove':
        return canBeRemoved(session);
      default:
        return false;
    }
  }

  handleSelectAll(isChecked: boolean) {
    this.onSelectAllChange.emit({
      allSelected: isChecked,
      sessionIds: this.eligibleSessionIds()
    });
  }

  isSelectionEnabled(session: CourtScheduleSession): boolean {
    const context = this.selectionContext();
    return context === 'assign' ? canBeAssigned(session) : canBeRemoved(session);
  }
  isIneligible(session: CourtScheduleSession): boolean {
    return this.ineligibleSessionIds().includes(session.courtScheduleId);
  }
}
