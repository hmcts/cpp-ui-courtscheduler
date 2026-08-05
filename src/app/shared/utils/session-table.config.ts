import {
  SessionTableConfig,
  SessionTableAction
} from '../../features/view-schedule/components/sessions-list/session-table/session-table.component';

/**
 * Available actions for editable session tables
 */
export const SESSION_TABLE_ACTIONS: SessionTableAction[] = [
  { label: 'Edit', action: 'edit', dataTestId: 'edit-session' },
  { label: 'Remove', action: 'remove', dataTestId: 'remove-session' }
];

export interface TableConfigOptions {
  isCrownCourt: boolean;
  isDeleteView?: boolean;
  isEditView?: boolean;
}

/**
 * Creates a read-only table config (no selection, no actions)
 * Used for displaying sessions that cannot be edited or removed
 */
export function createReadOnlyTableConfig(options: { isCrownCourt: boolean }): SessionTableConfig {
  return {
    showSelectionColumn: false,
    showActionsColumn: false,
    showCourtroomAssignment: options.isCrownCourt,
    showPanel: !options.isCrownCourt,
    actions: []
  };
}

/**
 * Creates an editable table config with selection and actions
 * Used for the main sessions list where users can select and perform actions
 */
export function createEditableTableConfig(options: TableConfigOptions): SessionTableConfig {
  const isDeleteView = options.isDeleteView ?? false;
  const isEditView = options.isEditView ?? false;

  return {
    showSelectionColumn: !isDeleteView && !isEditView,
    showActionsColumn: !isDeleteView && !isEditView,
    showCourtroomAssignment: options.isCrownCourt,
    showPanel: !options.isCrownCourt,
    actions: !isDeleteView && !isEditView ? SESSION_TABLE_ACTIONS : []
  };
}

/**
 * Creates a config for removable sessions table
 * Used when displaying sessions that can be removed
 */
export function createRemovableSessionsTableConfig(options: {
  isCrownCourt: boolean;
}): SessionTableConfig {
  return {
    showSelectionColumn: false,
    showActionsColumn: false,
    showCourtroomAssignment: options.isCrownCourt,
    showPanel: !options.isCrownCourt,
    actions: []
  };
}
