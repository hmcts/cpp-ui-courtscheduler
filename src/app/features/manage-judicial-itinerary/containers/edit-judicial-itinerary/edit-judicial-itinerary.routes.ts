import { Routes } from '@angular/router';

export enum EditJudicialItineraryRoutes {
  SUCCESS = 'success'
}

export const editJudicialItineraryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./edit-judicial-itinerary.container').then((c) => c.EditJudicialItineraryContainer),
    data: {
      title: 'Edit Judiciary details | Common Platform'
    }
  },
  {
    path: EditJudicialItineraryRoutes.SUCCESS,
    loadComponent: () =>
      import('../../components/judicial-itinerary-success/judicial-itinerary-success.component').then(
        (c) => c.JudicialItinerarySuccessComponent
      ),
    data: {
      title: 'Success | Common Platform'
    }
  }
];
