import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { PdkButton, PdkMarginDirective } from '@cpp/pdk';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleState } from '../../state/create-schedule.state';
import {
  getSelectedBusinessType,
  getSelectedCourtCentre
} from '../../state/selectors/create-schedule.selectors';
import { ConfirmationActionBannerComponent } from '../../../../shared/components/confirmation-action-banner/confirmation-action-banner.component';

@Component({
  selector: 'confirmation-action-container',
  template: `
    <confirmation-action-banner title="Sessions added successfully" [message]="successMessage()">
      <div pdk-margin-top="6" ngProjectAs="button-group">
        <button
          type="button"
          pdk-button
          (click)="handleCreateNewSessions()"
          data-test-id="create-new-sessions-button"
        >
          Create new sessions
        </button>
      </div>
      <div></div>
    </confirmation-action-banner>
  `,
  imports: [PdkButton, PdkMarginDirective, ConfirmationActionBannerComponent],
  styles: [
    `
      button {
        display: flex;
        flex-direction: column;
        align-items: start;
      }
    `
  ]
})
export class ConfirmationActionContainer {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject<Store<CreateScheduleState>>(Store);

  readonly businessType = this.store.selectSignal(getSelectedBusinessType);
  readonly selectedCourtCentre = this.store.selectSignal(getSelectedCourtCentre);

  readonly successMessage = computed(
    () =>
      `Sessions added to ${this.selectedCourtCentre()?.oucodeL3Name ?? ''} for ${this.businessType()?.typeDescription ?? ''}`
  );

  handleCreateNewSessions(): void {
    this.router.navigate([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: this.route.parent
    });
  }
}
