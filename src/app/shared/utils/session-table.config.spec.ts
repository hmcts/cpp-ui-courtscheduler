import {
  createReadOnlyTableConfig,
  createEditableTableConfig,
  createRemovableSessionsTableConfig,
  SESSION_TABLE_ACTIONS
} from './session-table.config';
import { SessionTableConfig } from '../../features/view-schedule/components/sessions-list/session-table/session-table.component';

describe('session-table.config', () => {
  describe('createReadOnlyTableConfig', () => {
    it('should create read-only config for Crown Court', () => {
      const config = createReadOnlyTableConfig({ isCrownCourt: true });
      const expected: SessionTableConfig = {
        showSelectionColumn: false,
        showActionsColumn: false,
        showCourtroomAssignment: true,
        showPanel: false,
        actions: []
      };
      expect(config).toEqual(expected);
    });

    it('should create read-only config for Magistrates Court', () => {
      const config = createReadOnlyTableConfig({ isCrownCourt: false });
      const expected: SessionTableConfig = {
        showSelectionColumn: false,
        showActionsColumn: false,
        showCourtroomAssignment: false,
        showPanel: true,
        actions: []
      };
      expect(config).toEqual(expected);
    });
  });

  describe('createEditableTableConfig', () => {
    it('should create editable config with selection and actions when not in delete or edit view', () => {
      const config = createEditableTableConfig({
        isCrownCourt: false,
        isDeleteView: false,
        isEditView: false
      });
      const expected: SessionTableConfig = {
        showSelectionColumn: true,
        showActionsColumn: true,
        showCourtroomAssignment: false,
        showPanel: true,
        actions: SESSION_TABLE_ACTIONS
      };
      expect(config).toEqual(expected);
    });

    it('should hide selection and actions when in delete view', () => {
      const config = createEditableTableConfig({
        isCrownCourt: false,
        isDeleteView: true
      });
      const expected: SessionTableConfig = {
        showSelectionColumn: false,
        showActionsColumn: false,
        showCourtroomAssignment: false,
        showPanel: true,
        actions: []
      };
      expect(config).toEqual(expected);
    });

    it('should hide selection and actions when in edit view', () => {
      const config = createEditableTableConfig({
        isCrownCourt: false,
        isEditView: true
      });
      const expected: SessionTableConfig = {
        showSelectionColumn: false,
        showActionsColumn: false,
        showCourtroomAssignment: false,
        showPanel: true,
        actions: []
      };
      expect(config).toEqual(expected);
    });

    it('should show courtroom assignment for Crown Court', () => {
      const config = createEditableTableConfig({
        isCrownCourt: true,
        isDeleteView: false,
        isEditView: false
      });
      expect(config.showCourtroomAssignment).toBe(true);
      expect(config.showPanel).toBe(false);
    });

    it('should show panel for Magistrates Court', () => {
      const config = createEditableTableConfig({
        isCrownCourt: false,
        isDeleteView: false,
        isEditView: false
      });
      expect(config.showCourtroomAssignment).toBe(false);
      expect(config.showPanel).toBe(true);
    });

    it('should use default values for optional parameters', () => {
      const config = createEditableTableConfig({ isCrownCourt: false });
      expect(config.showSelectionColumn).toBe(true);
      expect(config.showActionsColumn).toBe(true);
      expect(config.actions).toEqual(SESSION_TABLE_ACTIONS);
    });
  });

  describe('createRemovableSessionsTableConfig', () => {
    it('should create config for Crown Court', () => {
      const config = createRemovableSessionsTableConfig({ isCrownCourt: true });
      const expected: SessionTableConfig = {
        showSelectionColumn: false,
        showActionsColumn: false,
        showCourtroomAssignment: true,
        showPanel: false,
        actions: []
      };
      expect(config).toEqual(expected);
    });

    it('should create config for Magistrates Court', () => {
      const config = createRemovableSessionsTableConfig({ isCrownCourt: false });
      const expected: SessionTableConfig = {
        showSelectionColumn: false,
        showActionsColumn: false,
        showCourtroomAssignment: false,
        showPanel: true,
        actions: []
      };
      expect(config).toEqual(expected);
    });
  });

  describe('SESSION_TABLE_ACTIONS', () => {
    it('should have correct available actions', () => {
      expect(SESSION_TABLE_ACTIONS).toEqual([
        { label: 'Edit', action: 'edit', dataTestId: 'edit-session' },
        { label: 'Remove', action: 'remove', dataTestId: 'remove-session' }
      ]);
    });
  });
});
