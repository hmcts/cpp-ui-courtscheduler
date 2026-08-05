import { FindAvailabilityVM, Itinerary } from '../model/judicial-itinerary.interface';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { SortOrder } from '@cpp/pdk';
import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { JudicialItineraryService } from '../services/judicial-itinerary.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  ItineraryListState,
  ItinerarySearchParams,
  ItinerarySortField
} from './manage-judiciary-itinerary.store.interfaces';
import { sortItineraries } from './manage-judiciary-itinerary.store.utils';

interface BaseDependencyMethods extends Record<string, Function> {
  handleError?: (error: HttpErrorResponse) => void;
}

const initialState: ItineraryListState = {
  searchParams: {
    courtCentre: null,
    availability: {
      startDate: null,
      endDate: null
    }
  },
  sortField: null,
  sortOrder: null,
  selectedItinerary: null,
  paginatedItineraries: {
    itineraries: null,
    currentPage: 1,
    pageSize: 20,
    totalCount: 0
  }
};
const loadItineraries = (state: ItineraryListState, payload: FindAvailabilityVM) => {
  return {
    paginatedItineraries: {
      ...state.paginatedItineraries,
      itineraries: payload.itineraries,
      totalCount: payload.totalCount,
      currentPage: payload.pageNumber
    }
  };
};

// we use an unused generic parameter because the inputs are static
//see : https://ngrx.io/guide/signals/signal-store/custom-store-features#known-typescript-issues
export function withJudicialItineraryList<_>() {
  return signalStoreFeature(
    {
      methods: type<BaseDependencyMethods>()
    },
    withState<ItineraryListState>(initialState),
    withComputed(({ sortField, sortOrder, paginatedItineraries: { itineraries } }) => ({
      sortedItineraries: computed(() => {
        return sortItineraries(itineraries(), sortField(), sortOrder());
      })
    })),
    withMethods((store, service = inject(JudicialItineraryService)) => {
      const {
        searchParams,
        paginatedItineraries: { currentPage, pageSize }
      } = store;
      return {
        getJudicialItineraries: rxMethod<void>(
          pipe(
            switchMap(() => {
              const { courtCentre, availability } = searchParams();
              const { startDate, endDate } = availability;
              if (!courtCentre || !startDate || !endDate) {
                return of(null).pipe(
                  tap(() =>
                    patchState(store, {
                      paginatedItineraries: {
                        itineraries: [],
                        totalCount: 0,
                        currentPage: currentPage(),
                        pageSize: pageSize()
                      }
                    })
                  )
                );
              }

              return service
                .findAvailability({
                  startDate,
                  endDate,
                  courtCentreId: courtCentre.id,
                  pageNumber: currentPage(),
                  pageSize: pageSize()
                })
                .pipe(
                  tapResponse({
                    next: (response) => {
                      patchState(store, (state) => loadItineraries(state, response));
                    },
                    error: (err: HttpErrorResponse) => {
                      store.handleError(err);
                    }
                  })
                );
            })
          )
        ),
        setSearchParams: (params: ItinerarySearchParams) => {
          patchState(store, {
            searchParams: params
          });
        },
        setCurrentPage: (page: number) => {
          patchState(store, (state) => ({
            paginatedItineraries: {
              ...state.paginatedItineraries,
              currentPage: page
            }
          }));
        },
        setSort: (field: ItinerarySortField, order: SortOrder) => {
          patchState(store, {
            sortField: field,
            sortOrder: order
          });
        },
        resetPaginatedItineraries: () => {
          patchState(store, {
            paginatedItineraries: initialState.paginatedItineraries,
            sortField: null,
            sortOrder: null
          });
        },
        resetItineraryListState: () => {
          patchState(store, initialState);
        },
        setSelectedItinerary: (itinerary: Itinerary | null) => {
          patchState(store, { selectedItinerary: itinerary });
        }
      };
    })
  );
}
