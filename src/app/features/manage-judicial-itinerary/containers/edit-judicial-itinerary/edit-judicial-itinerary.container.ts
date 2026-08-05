import { Component, computed, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PdkBackLink, PdkGrid, PdkMarginDirective, PdkTypographyDirective } from '@cpp/pdk';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { DraftItinerary, ServerSubmissionErrorDTO } from '../../model/judicial-itinerary.interface';
import { JudiciaryDetailsComponent } from '../../components/judiciary-details/judiciary-details.component';
import { EditJudicialItineraryFormComponent } from '../../components/edit-judicial-itinerary-form/edit-judicial-itinerary-form.component';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { EditJudicialItineraryRoutes } from './edit-judicial-itinerary.routes';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { Specialism } from '@cpp/reference-data';

@Component({
  selector: 'edit-judicial-itinerary-container',
  templateUrl: './edit-judicial-itinerary.container.html',
  imports: [
    PdkBackLink,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    JudiciaryDetailsComponent,
    EditJudicialItineraryFormComponent
  ]
})
export class EditJudicialItineraryContainer implements OnDestroy {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly judicialMemberNamePipe = inject(JudicialMemberNamePipe);
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly route = inject(ActivatedRoute);
  readonly serverSubmissionErrorMessage = computed<string | null>(() => {
    const error = this.store.serverSubmissionError();
    if (error.isSourceForm) {
      return error.message ?? null;
    }
    return null;
  });
  readonly judiciaryName = computed(() =>
    this.judicialMemberNamePipe.transform(this.store.firstSelectedJudiciary())
  );

  readonly allSpecialismsSelected = computed(() => {
    const selectedJudiciary = this.store.firstSelectedJudiciary();
    const allSpecialisms = Object.values(Specialism);
    const existing = selectedJudiciary?.specialisms ?? [];
    return allSpecialisms.every((specialism) => existing.includes(specialism));
  });

  handleSubmitForm(values: DraftItinerary): void {
    const itinerary = this.store.selectedItinerary();
    this.store.setDraftItinerary(values);
    this.store.updateItinerary({
      onUpdateSuccess: () => {
        this.store.resetUpsertJudiciaryItineraryState();
        this.store.setSuccessMessage(
          `${this.judiciaryName()}'s availability details have been updated`
        );
        this.store.clearJudiciarySelection();
        this.store.setSelectedItinerary(null);
        this.store.resetPaginatedItineraries();
        this.router.navigate([
          CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
          JudicialItineraryRoutes.EDIT,
          itinerary.id,
          EditJudicialItineraryRoutes.SUCCESS
        ]);
      },
      onError: (error) => {
        if (error.status === 422) {
          this.store.setServerSubmissionError(
            JSON.parse(error.error) as ServerSubmissionErrorDTO,
            true
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

  ngOnDestroy(): void {
    this.store.clearServerSubmissionError();
    this.store.clearSpecialismAddedSuccess();
  }
}
