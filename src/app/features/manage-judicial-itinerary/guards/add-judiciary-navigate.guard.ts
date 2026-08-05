import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  createUrlTreeFromSnapshot,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ManageJudicialItineraryStore } from '../store/manage-judicial-itinerary.store';
import { JudicialItineraryRoutes } from '../manage-judicial-itinerary.routes';

export const adJudiciaryNavigateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean> | UrlTree => {
  const store = inject(ManageJudicialItineraryStore);
  const searchParams = store.searchParams();

  if (!searchParams || !searchParams.courtCentre) {
    return createUrlTreeFromSnapshot(route, ['../', JudicialItineraryRoutes.REFRESH_NAVIGATE]);
  }
  return of(true);
};
