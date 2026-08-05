import { Routes } from '@angular/router';

export enum AddSittingDaysRoutes {
  CHECK_ANSWERS = 'check-your-answers',
  SUCCESS = 'success'
}

export const addSittingDaysRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./add-sitting-days.container').then((c) => c.AddSittingDaysContainer),
    data: {
      title: 'Add sitting days and availability | Common Platform'
    }
  },
  {
    path: AddSittingDaysRoutes.CHECK_ANSWERS,
    loadComponent: () =>
      import('../add-sitting-days-check-answers/add-sitting-days-check-answers.container').then(
        (c) => c.AddSittingDaysCheckAnswersContainer
      ),
    data: {
      title: 'Check your answers | Common Platform'
    }
  },
  {
    path: AddSittingDaysRoutes.SUCCESS,
    loadComponent: () =>
      import('../../components/judicial-itinerary-success/judicial-itinerary-success.component').then(
        (c) => c.JudicialItinerarySuccessComponent
      ),
    data: {
      title: 'Success | Common Platform'
    }
  }
];
