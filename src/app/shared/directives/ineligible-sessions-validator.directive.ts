import { Directive, input, effect, signal } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  BulkActionType,
  CourtScheduleSession
} from '../../features/view-schedule/model/view-schedule.model';
import { getAlreadyAssignedSessionIds } from '../utils/session-criteria.utils';

export interface IneligibleSessionsError {
  rule: string;
  ids: string[];
}

@Directive({
  selector: '[ineligibleSessionsValidator]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: IneligibleSessionsValidatorDirective, multi: true }
  ],
  standalone: true
})
export class IneligibleSessionsValidatorDirective implements Validator {
  readonly ineligibleSessionsValidator = input<CourtScheduleSession[]>([]);
  readonly validatorAction = input<string | null>(null);

  /** Exposes the ineligible session IDs after validation */
  readonly ineligibleError = signal<IneligibleSessionsError | null>(null);

  private onValidatorChange: (() => void) | null = null;

  constructor() {
    effect(() => {
      this.validatorAction();
      this.ineligibleSessionsValidator();
      this.onValidatorChange?.();
    });
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.validatorAction() !== BulkActionType.ASSIGN) {
      this.ineligibleError.set(null);
      return null;
    }

    const selectedIds: string[] = control.value || [];
    const allSessions = this.ineligibleSessionsValidator();

    if (!selectedIds.length || !allSessions.length) {
      this.ineligibleError.set(null);
      return null;
    }

    const alreadyAssignedIds = getAlreadyAssignedSessionIds(allSessions, selectedIds);

    if (alreadyAssignedIds.length > 0) {
      this.ineligibleError.set({ rule: 'ineligibleAssigned', ids: alreadyAssignedIds });
      return { ineligibleAssigned: true };
    }

    this.ineligibleError.set(null);
    return null;
  }
}
