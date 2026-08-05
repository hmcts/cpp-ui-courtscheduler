import { Routes } from '@angular/router';
import { OrganisationUnitsGuard, RotaBusinessTypesGuard } from '@cpp/reference-data';
import { confirmationActionDeactivateGuard } from './guards/confirmation-action-deactivate.guard';

export enum CreateScheduleRoutes {
  SELECT_COURT = 'select-court',
  SELECT_BUSINESS_TYPE = 'select-business-type',
  SESSIONS_FORM = 'sessions',
  COPY_SESSIONS = 'copy-sessions',
  REPEAT_PATTERN = 'repeat-pattern',
  SUMMARY = 'summary',
  SUCCESS = 'success',
  REMOVE_SESSIONS = 'remove-sessions'
}

export const createScheduleRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: CreateScheduleRoutes.SELECT_COURT
  },
  {
    path: CreateScheduleRoutes.SELECT_COURT,
    loadComponent: () =>
      import('./containers/select-court/select-court.container').then(
        (c) => c.SelectCourtContainer
      ),
    canActivate: [OrganisationUnitsGuard],
    data: {
      title: 'Select court | Common Platform'
    }
  },
  {
    path: CreateScheduleRoutes.SELECT_BUSINESS_TYPE,
    loadComponent: () =>
      import('./containers/select-business-type/select-business-type.container').then(
        (c) => c.SelectBusinessTypeContainer
      ),
    data: {
      title: 'Select business type | Common Platform'
    },
    canActivate: [RotaBusinessTypesGuard]
  },
  {
    path: CreateScheduleRoutes.SESSIONS_FORM,
    loadComponent: () =>
      import('./containers/sessions-form/sessions-form.container').then(
        (c) => c.SessionsFormContainer
      ),
    data: {
      title: 'Add sessions | Common Platform'
    }
  },
  {
    path: CreateScheduleRoutes.COPY_SESSIONS,
    loadComponent: () =>
      import('./containers/copy-sessions/copy-sessions.container').then(
        (c) => c.CopySessionsContainer
      ),
    data: {
      title: 'Copy sessions | Common Platform'
    }
  },
  {
    path: CreateScheduleRoutes.REPEAT_PATTERN,
    loadComponent: () =>
      import('./containers/repeat-pattern/repeat-pattern.container').then(
        (c) => c.RepeatPatternContainer
      ),
    data: {
      title: 'Repeat sessions | Common Platform'
    }
  },
  {
    path: CreateScheduleRoutes.SUMMARY,
    loadComponent: () =>
      import('./containers/summary/summary.container').then((c) => c.SummaryContainer),
    data: {
      title: 'Summary sessions | Common Platform'
    }
  },
  {
    path: CreateScheduleRoutes.SUCCESS,
    loadComponent: () =>
      import('./containers/confirmation-action/confirmation-action.container').then(
        (c) => c.ConfirmationActionContainer
      ),
    canDeactivate: [confirmationActionDeactivateGuard],
    data: {
      title: 'Sessions created | Common Platform'
    }
  },
  {
    path: CreateScheduleRoutes.REMOVE_SESSIONS,
    loadComponent: () =>
      import('../../shared/containers/remove-sessions/remove-sessions.container').then(
        (c) => c.RemoveSessionsContainer
      ),
    data: {
      title: 'Remove sessions | Common Platform',
      isCreateJourney: true
    }
  }
];
