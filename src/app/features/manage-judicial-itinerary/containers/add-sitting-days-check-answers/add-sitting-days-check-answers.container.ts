import { DatePipe, Location } from '@angular/common';
import { Component, computed, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  PdkBackLink,
  PdkButton,
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkSummaryList,
  PdkTypographyDirective
} from '@cpp/pdk';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { SessionFormatPipe } from '../../../../shared/pipes/session-format.pipe';
import { SelectedCourtAndJudiciaryDetailsComponent } from '../../components/selected-court-and-judiciary-details/selected-court-and-judiciary-details.component';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { AddSittingDaysRoutes } from '../add-sitting-days/add-sitting-days.routes';
import { ServerSubmissionErrorDTO } from '../../model/judicial-itinerary.interface';

@Component({
  selector: 'add-sitting-days-check-answers-container',
  templateUrl: './add-sitting-days-check-answers.container.html',
  imports: [
    PdkBackLink,
    PdkButton,
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkSummaryList,
    PdkTypographyDirective,
    SelectedCourtAndJudiciaryDetailsComponent,
    DatePipe,
    SessionFormatPipe
  ]
})
export class AddSittingDaysCheckAnswersContainer implements OnDestroy {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly judicialMemberNamePipe = inject(JudicialMemberNamePipe);
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly judiciaryName = computed(() =>
    this.judicialMemberNamePipe.transform(this.store.selectedJudiciary())
  );
  readonly courtName = computed(
    () => this.store.searchParams.courtCentre()?.oucodeL3Name || 'court'
  );

  ngOnDestroy(): void {
    this.store.clearSpecialismAddedSuccess();
    this.store.clearServerSubmissionError();
  }

  readonly formattedSittingDays = computed(() => {
    const normalisedDays = this.store.normalisedSittingDays();
    return normalisedDays.join(', ');
  });

  handleNavigateToForm(): void {
    this.router.navigate([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.ADD_SITTING_DAYS
    ]);
  }

  handleContinueAndAdd(): void {
    this.store.clearServerSubmissionError();
    this.store.addItinerary({
      onAddSuccess: () => {
        this.store.resetUpsertJudiciaryItineraryState();
        this.store.setSuccessMessage(
          `${this.judiciaryName()}'s availability added to ${this.courtName()}`
        );
        this.store.clearJudiciarySelection();
        this.store.resetPaginatedItineraries();
        this.router.navigate([
          CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
          JudicialItineraryRoutes.ADD_SITTING_DAYS,
          AddSittingDaysRoutes.SUCCESS
        ]);
      },
      onError: (error) => {
        if (error.status === 422) {
          this.store.setServerSubmissionError(
            JSON.parse(error.error) as ServerSubmissionErrorDTO,
            false,
            'Go back to add itinerary form',
            () => {
              this.handleNavigateToForm();
            }
          );
        } else {
          this.store.handleError(error);
        }
      }
    });
  }

  handleBackLink(): void {
    this.location.back();
  }
}
