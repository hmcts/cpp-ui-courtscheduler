import { Routes } from '@angular/router';
import {
  ERROR_PAGES_ROUTES,
  ERROR_ROUTE_PATHS,
  SYSTEM_ANNOUNCEMENT_ROUTES
} from '@cpp/application';
import {
  UserDetailsGuard,
  UserGroupsGuard,
  UserPermissionsExistGuard,
  UserPermissionsGuard,
  UserRolesGuard,
  UserServiceExistsGuard,
  UserServicesGuard
} from '@cpp/users-groups';
import {
  createScheduleAccessFeatureHelper,
  createSchedulePermissionExistsHelper,
  viewScheduleAccessFeatureHelper,
  viewSchedulePermissionExistsHelper
} from './app.permissions';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ViewScheduleService } from './features/view-schedule/services/view-schedule.service';
import { VIEW_SCHEDULE_FEATURE_KEY } from './features/view-schedule/state/view-schedule.state';
import { viewScheduleFeatureReducer } from './features/view-schedule/state/reducers/view-schedule.reducer';
import { ViewScheduleEffects } from './features/view-schedule/state/effects/view-schedule.effect';
import { createScheduleNavGuard } from './features/create-schedule/guards/create-schedule-nav.guard';
import { CREATE_SCHEDULE_FEATURE_KEY } from './features/create-schedule/state/create-schedule.state';
import { createScheduleFeatureReducer } from './features/create-schedule/state/reducers/create-schedule.reducer';
import { CreateScheduleEffects } from './features/create-schedule/state/effects/create-schedule.effects';
import { CreateScheduleService } from './features/create-schedule/services/create-schedule.service';
import { RouterEffects } from './core/effects';
import { ManageJudicialItineraryStore } from './features/manage-judicial-itinerary/store/manage-judicial-itinerary.store';
import { OrganisationUnitsGuard } from '@cpp/reference-data';

export enum CourtSchedulerRoutes {
  CREATE_SCHEDULE = 'create',
  VIEW_SCHEDULE = 'view',
  MANAGE_JUDICIAL_ITINERARY = 'manage-judicial-itinerary'
}

export const appRoutes: Routes = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [
      UserDetailsGuard,
      UserGroupsGuard,
      UserRolesGuard,
      UserServicesGuard,
      UserPermissionsGuard
    ],
    providers: [provideEffects([RouterEffects])],
    data: {
      userServicesErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
      serviceUnavailableRedirectTo: `/${ERROR_ROUTE_PATHS.serviceUnavailable}`
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CourtSchedulerRoutes.VIEW_SCHEDULE
      },
      {
        path: CourtSchedulerRoutes.CREATE_SCHEDULE,
        canActivate: [UserServiceExistsGuard, UserPermissionsExistGuard, createScheduleNavGuard],
        runGuardsAndResolvers: 'always',
        loadChildren: () =>
          import('./features/create-schedule/create-schedule.routes').then(
            (r) => r.createScheduleRoutes
          ),
        data: {
          userServiceExistsPredicate: createScheduleAccessFeatureHelper(),
          userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
          userPermissionsExistsPredicate: createSchedulePermissionExistsHelper,
          userPermissionsExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
        },
        providers: [
          provideState(CREATE_SCHEDULE_FEATURE_KEY, createScheduleFeatureReducer),
          provideEffects([CreateScheduleEffects]),
          CreateScheduleService
        ]
      },
      {
        path: CourtSchedulerRoutes.VIEW_SCHEDULE,
        canActivate: [UserPermissionsExistGuard, UserServiceExistsGuard],
        runGuardsAndResolvers: 'always',
        loadChildren: () =>
          import('./features/view-schedule/view-schedule.routes').then((r) => r.viewScheduleRoutes),
        data: {
          userServiceExistsPredicate: viewScheduleAccessFeatureHelper(),
          userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
          userPermissionsExistsPredicate: viewSchedulePermissionExistsHelper,
          userPermissionsExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
        },
        providers: [
          provideState(VIEW_SCHEDULE_FEATURE_KEY, viewScheduleFeatureReducer),
          provideEffects([ViewScheduleEffects]),
          ViewScheduleService
        ]
      },
      {
        path: CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
        canActivate: [OrganisationUnitsGuard],
        runGuardsAndResolvers: 'always',
        loadChildren: () =>
          import('./features/manage-judicial-itinerary/manage-judicial-itinerary.routes').then(
            (r) => r.manageJudicialItineraryRoutes
          ),
        providers: [ManageJudicialItineraryStore],
        data: {
          userServiceExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
          userPermissionsExistsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`
        }
      }
    ]
  },
  ...SYSTEM_ANNOUNCEMENT_ROUTES,
  ...ERROR_PAGES_ROUTES
];
