import { Routes } from '@angular/router';

export const addSpecialismsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./add-specialisms.container').then((c) => c.AddSpecialismsContainer),
    data: {
      title: 'Add new specialism | Common Platform'
    }
  },
  {
    path: 'specialism-check-answers',
    loadComponent: () =>
      import('../specialisms-check-answers/specialisms-check-answers.container').then(
        (c) => c.SpecialismsCheckAnswersContainer
      ),
    data: {
      title: 'Check your answers | Common Platform'
    }
  }
];
