import { Routes } from '@angular/router';

export enum RemoveJudicialItineraryRoutes {
  SUCCESS = 'success'
}

export const removeJudicialItineraryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./remove-judicial-itinerary.container').then(
        (c) => c.RemoveJudicialItineraryContainer
      ),
    data: {
      title: 'Remove Judiciary | Common Platform'
    }
  },
  {
    path: RemoveJudicialItineraryRoutes.SUCCESS,
    loadComponent: () =>
      import('../../components/judicial-itinerary-success/judicial-itinerary-success.component').then(
        (c) => c.JudicialItinerarySuccessComponent
      ),
    data: {
      title: 'Success | Common Platform'
    }
  }
];
