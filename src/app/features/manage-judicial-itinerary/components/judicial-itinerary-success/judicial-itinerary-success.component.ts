import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PdkButton, PdkGrid } from '@cpp/pdk';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { ConfirmationActionBannerComponent } from '../../../../shared/components/confirmation-action-banner/confirmation-action-banner.component';

@Component({
  selector: 'judicial-itinerary-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './judicial-itinerary-success.component.html',
  imports: [PdkButton, PdkGrid, ConfirmationActionBannerComponent]
})
export class JudicialItinerarySuccessComponent implements OnDestroy {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly router = inject(Router);

  ngOnDestroy(): void {
    this.store.clearSuccessMessage();
  }

  handleGoToManageJudiciaryItinerary(): void {
    this.router.navigateByUrl(`/${CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY}`);
  }
}
