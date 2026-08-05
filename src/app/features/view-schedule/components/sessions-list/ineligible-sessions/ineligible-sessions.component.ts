import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { PdkMarginDirective, PdkTypographyDirective } from '@cpp/pdk';
import { CourtScheduleSession } from '../../../model/view-schedule.model';
import {
  SessionTableComponent,
  SessionTableConfig
} from '../session-table/session-table.component';
import { createReadOnlyTableConfig } from '../../../../../shared/utils/session-table.config';

@Component({
  selector: 'ineligible-sessions',
  templateUrl: './ineligible-sessions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkMarginDirective, PdkTypographyDirective, SessionTableComponent]
})
export class IneligibleSessionsComponent {
  readonly ineligiblePastSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleWithHearings = input<CourtScheduleSession[]>([]);
  readonly ineligibleAssigned = input<CourtScheduleSession[]>([]);

  readonly isEditView = input<boolean>(false);
  readonly isAssignView = input<boolean>(false);
  readonly isCrownCourt = input<boolean>(false);

  readonly ineligiblePastSessionsTableConfig = computed<SessionTableConfig>(() =>
    createReadOnlyTableConfig({ isCrownCourt: this.isCrownCourt() })
  );

  readonly ineligibleWithHearingsTableConfig = computed<SessionTableConfig>(() =>
    createReadOnlyTableConfig({ isCrownCourt: this.isCrownCourt() })
  );

  readonly ineligibleAssignedTableConfig = computed<SessionTableConfig>(() =>
    createReadOnlyTableConfig({ isCrownCourt: this.isCrownCourt() })
  );

  readonly ineligiblePastSessionsMessage = computed<string>(() => {
    const action = this.isAssignView() ? 'assigned' : this.isEditView() ? 'edited' : 'removed';
    return `Past sessions can't be ${action}.`;
  });

  readonly ineligibleAssignedMessage = computed<string>(() => {
    const count = this.ineligibleAssigned().length;
    if (count === 1) {
      return 'This session is already assigned to a courtroom and cannot be reassigned.';
    }
    return 'These sessions are already assigned to a courtroom and cannot be reassigned.';
  });

  readonly ineligibleWithHearingsMessage = computed<string>(() => {
    const count = this.ineligibleWithHearings().length;
    const action = this.isAssignView() ? 'assign' : this.isEditView() ? 'edit' : 'remove';

    if (this.isEditView() || count === 1) {
      return `This session has a hearing attached to it. You must move the hearing before you can ${action} this session.`;
    }

    return `These sessions have hearings attached to them. You must move the hearings before you can ${action} these sessions.`;
  });
}
