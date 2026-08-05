import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ManageJudicialItineraryStore } from '../store/manage-judicial-itinerary.store';

export const loadJudiciaryItineraries: CanActivateFn = (): Observable<boolean> => {
  const store = inject(ManageJudicialItineraryStore);
  const searchParams = store.searchParams();

  if (
    searchParams.courtCentre &&
    searchParams.availability.startDate &&
    searchParams.availability.endDate
  ) {
    store.getJudicialItineraries();
  }

  return of(true);
};
