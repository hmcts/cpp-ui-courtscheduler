import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { staleSessionGuardFactory } from '../../shared/guards/stale-session.guard';
import { ManageSessionsStore } from '../view-schedule/store/manage-sessions.store';
import { CourtSchedulerRoutes } from '../../app-routes';

export enum JudiciarySessionAssignmentRoutes {
  ASSIGN = 'assign',
  REASSIGNMENT_CONFIRMATION = 'reassignment-confirmation'
}

const hasSelectedSessions = staleSessionGuardFactory(
  () => {
    const store = inject(ManageSessionsStore);
    return store.sessions().length > 0;
  },
  `/${CourtSchedulerRoutes.VIEW_SCHEDULE}`,
  'View or edit court sessions'
);

export const judiciarySessionAssignmentRoutes: Routes = [
  {
    path: '',
    canActivateChild: [hasSelectedSessions],
    children: [
      { path: '', pathMatch: 'full', redirectTo: JudiciarySessionAssignmentRoutes.ASSIGN },
      {
        path: JudiciarySessionAssignmentRoutes.ASSIGN,
        loadComponent: () =>
          import('./containers/assign-judiciary/assign-judiciary.container').then(
            (m) => m.AssignJudiciaryContainer
          ),
        data: { title: 'Select judiciary to add to sessions | Common Platform' }
      },
      {
        path: JudiciarySessionAssignmentRoutes.REASSIGNMENT_CONFIRMATION,
        loadComponent: () =>
          import('./containers/judiciary-reassignment-confirmation/judiciary-reassignment-confirmation.container').then(
            (m) => m.JudiciaryReassignmentConfirmationContainer
          ),
        data: { title: 'Confirm judiciary reassignment | Common Platform' }
      }
    ]
  }
];
