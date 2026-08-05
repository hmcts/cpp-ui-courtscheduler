import { Component, input, output, computed, effect, linkedSignal, viewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import {
  BulkActionType,
  BulkActionPayload,
  CourtScheduleSession
} from '../../model/view-schedule.model';
import { isCrownJurisdiction } from '../../../../shared/utils/jurisdiction.utils';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import {
  SessionTableComponent,
  SessionTableConfig,
  SelectAllSessionsEvent
} from './session-table/session-table.component';
import { IneligibleSessionsComponent } from './ineligible-sessions/ineligible-sessions.component';
import {
  SelectOption,
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkFormFieldComponent,
  PdkCheckBox,
  PdkForm,
  PdkSelectComponent,
  PdkButton,
  ValidationError
} from '@cpp/pdk';
import {
  createEditableTableConfig,
  createRemovableSessionsTableConfig,
  TableConfigOptions
} from '../../../../shared/utils/session-table.config';
import {
  IneligibleSessionsValidatorDirective,
  IneligibleSessionsError
} from '../../../../shared/directives/ineligible-sessions-validator.directive';

@Component({
  selector: 'sessions-list',
  templateUrl: './sessions-list.component.html',
  styles: [
    `
      th,
      td {
        vertical-align: middle;
      }

      ::ng-deep pdk-checkbox {
        label {
          padding: 0 !important;
        }
      }

      .action-wrapper {
        display: flex;
        align-items: flex-end;
      }
    `
  ],
  imports: [
    FormsModule,
    SessionTableComponent,
    IneligibleSessionsComponent,
    PdkTypographyDirective,
    PdkMarginDirective,
    PdkFormFieldComponent,
    PdkCheckBox,
    PdkForm,
    PdkSelectComponent,
    PdkButton,
    IneligibleSessionsValidatorDirective
  ]
})
export class SessionsListComponent {
  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly removableSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleWithHearings = input<CourtScheduleSession[]>([]);
  readonly ineligiblePastSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleAssigned = input<CourtScheduleSession[]>([]);
  readonly isDeleteView = input<boolean>(false);
  readonly isEditView = input<boolean>(false);
  readonly isAssignView = input<boolean>(false);
  readonly jurisdiction = input<JurisdictionType | null>(null);
  readonly submitForm = output<BulkActionPayload>();
  readonly setSessionToEdit = output<CourtScheduleSession>();
  readonly validationErrors = output<ValidationError[]>();
  readonly sessionsModel = viewChild<NgModel>('sessionsModel');
  readonly ineligibleValidator = viewChild(IneligibleSessionsValidatorDirective);
  readonly selectedSessionIds = linkedSignal({
    source: this.sessions,
    computation: (): string[] => []
  });
  readonly selectedSessions = computed(() => {
    const ids = this.selectedSessionIds() ?? [];
    return this.sessions().filter((s) => ids.includes(s.courtScheduleId));
  });

  readonly isCrownCourt = computed(() => isCrownJurisdiction(this.jurisdiction()));

  readonly actionOptions = computed<SelectOption<string>[]>(() => {
    const options: SelectOption<string>[] = [{ value: BulkActionType.REMOVE, label: 'Remove' }];

    if (this.isCrownCourt()) {
      options.push({ value: BulkActionType.ASSIGN, label: 'Assign courtroom' });
      options.push({ value: BulkActionType.ASSIGN_JUDICIARY, label: 'Assign judiciary' });
    }

    return options;
  });

  readonly selectedAction = linkedSignal({
    source: this.sessions,
    computation: (): string | null => null
  });

  readonly ineligibleSessionIds = linkedSignal({
    source: this.sessions,
    computation: (): string[] => []
  });

  constructor() {
    effect(() => {
      this.sessions();
      this.ineligibleValidator()?.ineligibleError.set(null);
    });
  }

  readonly tableConfigOptions = computed<TableConfigOptions>(() => ({
    isCrownCourt: this.isCrownCourt(),
    isDeleteView: this.isDeleteView(),
    isEditView: this.isEditView()
  }));

  readonly tableConfig = computed<SessionTableConfig>(() =>
    createEditableTableConfig(this.tableConfigOptions())
  );

  readonly removableSessionsTableConfig = computed<SessionTableConfig>(() =>
    createRemovableSessionsTableConfig({
      isCrownCourt: this.isCrownCourt()
    })
  );

  onSessionSelectionChange(ids: string[]) {
    const currentIneligible = this.ineligibleSessionIds();
    if (currentIneligible.length > 0) {
      this.ineligibleSessionIds.set(currentIneligible.filter((id) => ids.includes(id)));
    }
    this.selectedSessionIds.set(ids);
  }

  onActionChange(action: string | null) {
    this.ineligibleSessionIds.set([]);
    this.selectedAction.set(action);
  }

  handleSelectAllSessions(event: SelectAllSessionsEvent) {
    this.ineligibleSessionIds.set([]);
    this.selectedSessionIds.set(event.allSelected ? event.sessionIds : []);
  }

  handleTableAction(event: { session: CourtScheduleSession; action: string }) {
    if (event.action === 'edit') {
      this.setSessionToEdit.emit(event.session);
    } else if (event.action === 'remove') {
      // For single row action, set selection and submit directly
      this.selectedSessionIds.set([event.session.courtScheduleId]);
      this.doSubmit(BulkActionType.REMOVE);
    }
  }

  handleFormSubmit(formValue: { sessionsSelection: string[]; selectedAction: string }) {
    this.doSubmit(formValue.selectedAction);
  }

  handleFormErrors(errors: ValidationError[]) {
    const ineligibleError: IneligibleSessionsError | null | undefined =
      this.ineligibleValidator()?.ineligibleError();
    if (ineligibleError?.ids?.length) {
      this.ineligibleSessionIds.set(ineligibleError.ids);
    }
    this.validationErrors.emit(errors);
  }

  private doSubmit(selectedAction: string) {
    if (selectedAction) {
      const sessions = this.selectedSessions();

      // Clear any previous errors
      this.validationErrors.emit([]);

      this.submitForm.emit({
        action: selectedAction as BulkActionPayload['action'],
        sessions
      });
    }
  }
}
