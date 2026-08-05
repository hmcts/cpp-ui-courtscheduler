import { Component, computed, inject, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PdkBackLink, PdkGrid, PdkMarginDirective, PdkTypographyDirective } from '@cpp/pdk';
import { AddSittingDaysFormComponent } from '../../components/add-sitting-days-form/add-sitting-days-form.component';
import { DraftItinerary, ServerSubmissionErrorDTO } from '../../model/judicial-itinerary.interface';
import { SelectedCourtAndJudiciaryDetailsComponent } from '../../components/selected-court-and-judiciary-details/selected-court-and-judiciary-details.component';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { AddSittingDaysRoutes } from './add-sitting-days.routes';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';

@Component({
  selector: 'add-sitting-days-container',
  templateUrl: './add-sitting-days.container.html',
  imports: [
    PdkBackLink,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    AddSittingDaysFormComponent,
    SelectedCourtAndJudiciaryDetailsComponent
  ]
})
export class AddSittingDaysContainer implements OnDestroy {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly serverSubmissionErrorMessage = computed<string | null>(() => {
    const error = this.store.serverSubmissionError();
    if (error.isSourceForm) {
      return error.message ?? null;
    }
    return null;
  });

  handleSubmitForm(values: DraftItinerary): void {
    this.store.clearServerSubmissionError();
    this.store.setDraftItinerary(values);
    this.store.validateAddItinerary({
      onValidateDone: (error) => {
        if (error) {
          if (error.status === 422) {
            this.store.setServerSubmissionError(
              JSON.parse(error.error) as ServerSubmissionErrorDTO,
              true
            );
          } else {
            this.store.handleError(error);
          }
        } else {
          this.router.navigate([
            CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
            JudicialItineraryRoutes.ADD_SITTING_DAYS,
            AddSittingDaysRoutes.CHECK_ANSWERS
          ]);
        }
      }
    });
  }

  handleClearForm(): void {
    this.store.resetUpsertJudiciaryItineraryState();
  }

  handleBackLink(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.store.clearSpecialismAddedSuccess();
    this.store.clearServerSubmissionError();
  }
}
