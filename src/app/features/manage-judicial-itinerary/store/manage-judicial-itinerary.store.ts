import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { ValidationError } from '@cpp/pdk';
import {
  withErrorHandlerAdapter,
  withJudiciarySelection,
  withStoreRouter
} from '../../../shared/signal-store';
import { withJudiciarySpecialisms } from './with-judiciary-specialisms.feature';
import { withJudicialItineraryList } from './with-judiciary-itinerary-list.feature';
import { withUpsertJudiciaryItinerary } from './with-upsert-judiciary-itinerary.feature';
import {
  ServerSubmissionError,
  ServerSubmissionErrorDTO
} from '../model/judicial-itinerary.interface';

export interface ManageJudicialItineraryState {
  successMessage: string | null;
  formErrors: ValidationError[];
  serverSubmissionError: ServerSubmissionError;
}

const initialState: ManageJudicialItineraryState = {
  successMessage: null,
  formErrors: [],
  serverSubmissionError: {
    message: undefined,
    isSourceForm: undefined,
    linkText: undefined,
    linkAction: undefined
  }
};

export const ManageJudicialItineraryStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    clearSuccessMessage: () => {
      patchState(store, { successMessage: null });
    },
    setSuccessMessage: (message: string) => {
      patchState(store, { successMessage: message });
    },
    setFormErrors: (errors: ValidationError[]) => {
      patchState(store, { formErrors: errors });
    },
    clearFormErrors: () => {
      patchState(store, { formErrors: [] });
    },
    clearServerSubmissionError: () => {
      patchState(store, {
        serverSubmissionError: {
          message: undefined,
          isSourceForm: undefined,
          linkText: undefined,
          linkAction: undefined
        }
      });
    },
    setServerSubmissionError: (
      error: ServerSubmissionErrorDTO,
      isSourceForm = true,
      linkText?: string,
      linkAction?: () => void
    ) => {
      patchState(store, {
        serverSubmissionError: {
          message: error.validationResult.validationError,
          isSourceForm,
          linkText,
          linkAction
        }
      });
    }
  })),
  withErrorHandlerAdapter(),
  withStoreRouter(),
  withJudicialItineraryList(),
  withJudiciarySelection(),
  withJudiciarySpecialisms(),
  withUpsertJudiciaryItinerary(),
  withMethods((store) => ({
    resetState: () => {
      store.clearSuccessMessage();
      store.clearFormErrors();
      store.resetItineraryListState();
      store.clearJudiciarySelection();
      store.resetUpsertJudiciaryItineraryState();
      store.resetJudiciarySpecialismsState();
    }
  }))
);
