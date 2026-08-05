import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { ManageJudicialItineraryStore } from '../store/manage-judicial-itinerary.store';
import { JudicialItineraryService } from '../services/judicial-itinerary.service';
import { HttpErrorResponse } from '@angular/common/http';

export const getJudicialItineraryGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const store = inject(ManageJudicialItineraryStore);
  const service = inject(JudicialItineraryService);

  const id = route.params['id'];

  if (!id) {
    return of(false);
  }

  const selectedItinerary = store.selectedItinerary();

  if (selectedItinerary && selectedItinerary.id === id) {
    return of(true);
  }

  return service.findAvailabilityById(id).pipe(
    take(1),
    map(({ itinerary }) => {
      store.setSelectedItinerary(itinerary);
      store.setSelectedJudiciary(itinerary?.judiciaryMember ? [itinerary.judiciaryMember] : null);

      return true;
    }),
    catchError((error: HttpErrorResponse) => {
      store.handleError(error);

      return of(false);
    })
  );
};
