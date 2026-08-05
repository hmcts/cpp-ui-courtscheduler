import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { loadJudiciaryItineraries } from './guards/load-judiciary-itineraries.guard';
import { getJudicialItineraryGuard } from './guards/get-judicial-itinerary.guard';
import { ManageJudicialItineraryStore } from './store/manage-judicial-itinerary.store';
import { staleSessionGuardFactory } from '../../shared/guards/stale-session.guard';
import { CourtSchedulerRoutes } from '../../app-routes';

export enum JudicialItineraryRoutes {
  SELECT_JUDICIARY_TYPE = 'select-judiciary-type',
  ADD_SITTING_DAYS = 'add-sitting-days',
  ADD_SPECIALISMS = 'add-specialisms',
  EDIT = 'edit',
  REMOVE = 'remove'
}

const hasSearchParams = staleSessionGuardFactory(
  () => {
    const store = inject(ManageJudicialItineraryStore);
    const searchParams = store.searchParams();
    return !!searchParams && !!searchParams.courtCentre;
  },
  `/${CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY}`,
  'Manage judicial itinerary'
);

export const manageJudicialItineraryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/manage-judiciary-itinerary-alert/manage-judiciary-itinerary-alert.container').then(
        (c) => c.ManageJudiciaryItineraryAlertContainer
      ),
    children: [
      {
        path: '',
        canActivate: [loadJudiciaryItineraries],
        loadComponent: () =>
          import('./containers/manage-judicial-itinerary/manage-judicial-itinerary.container').then(
            (c) => c.ManageJudicialItineraryContainer
          ),
        data: {
          title: 'Manage Judicial itinerary | Common Platform'
        }
      },
      {
        path: JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE,
        canActivate: [hasSearchParams],
        loadComponent: () =>
          import('./containers/select-judiciary-type/select-judiciary-type.container').then(
            (c) => c.SelectJudiciaryTypeContainer
          ),
        data: {
          title: 'Select Judiciary type | Common Platform'
        }
      },
      {
        path: JudicialItineraryRoutes.ADD_SITTING_DAYS,
        canActivate: [hasSearchParams],
        loadChildren: () =>
          import('./containers/add-sitting-days/add-sitting-days.routes').then(
            (m) => m.addSittingDaysRoutes
          )
      },
      {
        path: JudicialItineraryRoutes.ADD_SPECIALISMS,
        canActivate: [hasSearchParams],
        loadChildren: () =>
          import('./containers/add-specialisms/add-specialisms.routes').then(
            (m) => m.addSpecialismsRoutes
          )
      },
      {
        path: `${JudicialItineraryRoutes.EDIT}/:id`,
        canActivate: [getJudicialItineraryGuard],
        loadChildren: () =>
          import('./containers/edit-judicial-itinerary/edit-judicial-itinerary.routes').then(
            (m) => m.editJudicialItineraryRoutes
          )
      },
      {
        path: `${JudicialItineraryRoutes.REMOVE}/:id`,
        canActivate: [getJudicialItineraryGuard],
        loadChildren: () =>
          import('./containers/remove-judicial-itinerary/remove-judicial-itinerary.routes').then(
            (m) => m.removeJudicialItineraryRoutes
          )
      }
    ]
  }
];
