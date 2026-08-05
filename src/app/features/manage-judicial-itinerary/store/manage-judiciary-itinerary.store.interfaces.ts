import { SortOrder, ValidationError } from '@cpp/pdk';
import { OrganisationUnit } from '@cpp/reference-data';
import { Itinerary, ServerSubmissionError } from '../model/judicial-itinerary.interface';

export interface ManageJudicialItineraryState {
  successMessage: string | null;
  formErrors: ValidationError[];
  serverSubmissionError: ServerSubmissionError;
}

export interface ItinerarySearchParams {
  courtCentre: OrganisationUnit | null;
  availability: {
    startDate: string | null;
    endDate: string | null;
  };
}

export type ItinerarySortField = 'type' | 'name' | 'specialism';

export interface PaginatedItineraries {
  itineraries: Itinerary[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export interface ItineraryListState {
  searchParams: ItinerarySearchParams;
  sortField: ItinerarySortField | null;
  sortOrder: SortOrder | null;
  selectedItinerary: Itinerary | null;
  paginatedItineraries: {
    itineraries: Itinerary[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };
}
