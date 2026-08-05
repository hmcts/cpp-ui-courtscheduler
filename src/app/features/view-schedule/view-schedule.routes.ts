import { Routes } from '@angular/router';
import { OrganisationUnitsGuard, RotaBusinessTypesGuard } from '@cpp/reference-data';
import { removeSessionsNavGuard } from './guards/remove-sessions-nav.guard';
import { assignCourtroomNavGuard } from './guards/assign-courtroom-nav.guard';
import { editSessionsGuard } from './guards/edit-sessions.guard';
import { ManageSessionsStore } from './store/manage-sessions.store';
import { CourtSchedulerRoutes } from '../../app-routes';

export enum ViewScheduleRoutes {
  VIEW = 'view',
  EDIT = 'edit',
  REMOVE_SESSIONS = 'remove-sessions',
  ASSIGN_COURTROOM = 'assign-courtroom'
}

export const viewScheduleRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/search/search.container').then((c) => c.SearchContainer),
    canActivate: [OrganisationUnitsGuard, RotaBusinessTypesGuard],
    data: {
      title: 'Search schedule | Common Platform'
    }
  },
  {
    path: ViewScheduleRoutes.EDIT,
    loadComponent: () =>
      import('./containers/edit-sessions-shell/edit-sessions-shell.component').then(
        (c) => c.EditSessionsShellComponent
      ),
    canActivate: [OrganisationUnitsGuard, RotaBusinessTypesGuard, editSessionsGuard],
    providers: [ManageSessionsStore],
    runGuardsAndResolvers: 'always',
    data: {
      title: 'Edit Schedule | Common Platform'
    },
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./containers/edit-session/edit-session.container').then(
            (c) => c.EditSessionContainer
          ),
        data: {
          title: 'Edit Schedule | Common Platform'
        }
      },
      {
        path: CourtSchedulerRoutes.JUDICIARY_SESSION_ASSIGNMENT,
        loadChildren: () =>
          import('../judiciary-session-assignment/judiciary-session-assignment.routes').then(
            (r) => r.judiciarySessionAssignmentRoutes
          )
      }
    ]
  },
  {
    path: ViewScheduleRoutes.REMOVE_SESSIONS,
    loadComponent: () =>
      import('../../shared/containers/remove-sessions/remove-sessions.container').then(
        (c) => c.RemoveSessionsContainer
      ),
    data: {
      title: 'Remove sessions | Common Platform',
      isViewJourney: true
    },
    canActivate: [removeSessionsNavGuard]
  },
  {
    path: ViewScheduleRoutes.ASSIGN_COURTROOM,
    loadComponent: () =>
      import('./containers/assign-courtroom/assign-courtroom.container').then(
        (c) => c.AssignCourtroomContainer
      ),
    data: {
      title: 'Assign courtroom | Common Platform',
      isViewJourney: true
    },
    canActivate: [assignCourtroomNavGuard]
  }
];
