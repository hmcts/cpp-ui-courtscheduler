import { Component, computed, inject, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PdkBackLink, PdkGrid, PdkMarginDirective, PdkTypographyDirective } from '@cpp/pdk';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { RemoveJudiciaryItineraryDetailsComponent } from '../../components/remove-judiciary-itinerary-details/remove-judiciary-itinerary-details.component';
import { RemoveJudiciaryItineraryFormComponent } from '../../components/remove-judiciary-itinerary-form/remove-judiciary-itinerary-form.component';
import { ServerSubmissionErrorDTO } from '../../model/judicial-itinerary.interface';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { RemoveJudicialItineraryRoutes } from './remove-judicial-itinerary.routes';
import { JudicialMemberNamePipe } from '@cpp/reference-data';

@Component({
  selector: 'remove-judicial-itinerary-container',
  templateUrl: './remove-judicial-itinerary.container.html',
  imports: [
    PdkBackLink,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    RemoveJudiciaryItineraryDetailsComponent,
    RemoveJudiciaryItineraryFormComponent
  ]
})
export class RemoveJudicialItineraryContainer implements OnDestroy {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly judicialMemberNamePipe = inject(JudicialMemberNamePipe);
  readonly judiciaryName = computed(() =>
    this.judicialMemberNamePipe.transform(this.store.firstSelectedJudiciary())
  );
  readonly courtName = computed(
    () => this.store.searchParams.courtCentre()?.oucodeL3Name || 'court'
  );

  handleSubmitForm(removeConfirmation: boolean): void {
    if (!removeConfirmation) {
      this.location.back();
      return;
    }

    const itinerary = this.store.selectedItinerary();
    this.store.removeItinerary({
      onRemoveSuccess: () => {
        this.store.setSuccessMessage(
          `${this.judiciaryName()}'s availability details have been removed from ${this.courtName()}`
        );
        this.store.clearJudiciarySelection();
        this.store.resetPaginatedItineraries();
        this.router.navigate([
          CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
          JudicialItineraryRoutes.REMOVE,
          itinerary?.id,
          RemoveJudicialItineraryRoutes.SUCCESS
        ]);
      },
      onError: (error) => {
        if (error.status === 422) {
          this.store.setServerSubmissionError(
            JSON.parse(error.error) as ServerSubmissionErrorDTO,
            false,
            'Go back to manage judicial itinerary',
            () => {
              this.handleNavigateToManageJudicialItinerary();
            }
          );
        } else {
          this.store.handleError(error);
        }
      }
    });
  }

  handleBackLink(): void {
    this.store.clearUpsertItinerary();
    this.location.back();
  }

  handleNavigateToManageJudicialItinerary(): void {
    this.router.navigate([CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY]);
  }

  ngOnDestroy(): void {
    this.store.clearServerSubmissionError();
  }
}
