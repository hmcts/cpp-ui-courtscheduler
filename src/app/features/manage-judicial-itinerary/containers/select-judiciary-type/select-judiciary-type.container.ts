import { Component, computed, inject, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PdkBackLink, PdkGrid, PdkMarginDirective } from '@cpp/pdk';
import {
  SelectJudiciaryTypeFormComponent,
  SelectJudiciaryTypeFormPayload
} from '../../components/select-judiciary-type-form/select-judiciary-type-form.component';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { ExtendedJudicialMember } from '../../../../shared/model';

@Component({
  selector: 'select-judiciary-type-container',
  template: `
    <div>
      <a pdk-back-link pdk-margin-top="0" (click)="handleBackLink()" href="javascript:void(0);"
        >Back</a
      >
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <select-judiciary-type-form
          [initialValues]="initialValues()"
          (errors)="store.setFormErrors($event || [])"
          (submitForm)="handleSubmitForm($event)"
          (addSpecialism)="handleAddSpecialism($event)"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [PdkBackLink, PdkGrid, PdkMarginDirective, SelectJudiciaryTypeFormComponent]
})
export class SelectJudiciaryTypeContainer implements OnDestroy {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly router = inject(Router);
  readonly location = inject(Location);

  readonly initialValues = computed(() => {
    return {
      judiciarySelection: this.store.selectedJudiciaryByTypeMap(),
      selectedJudiciaryTypes: this.store.selectedJudiciaryTypes()
    };
  });

  handleSubmitForm({ judiciary }: SelectJudiciaryTypeFormPayload): void {
    this.store.clearSpecialismAddedSuccess();
    this.store.setSelectedJudiciary([judiciary]);
    this.router.navigate([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.ADD_SITTING_DAYS
    ]);
  }

  handleAddSpecialism({ judiciary }: { judiciary: ExtendedJudicialMember | null }): void {
    this.store.clearSpecialismAddedSuccess();
    this.store.setSelectedJudiciary([judiciary]);

    const currentUrl = this.router.url;
    this.router.navigate(
      [CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY, JudicialItineraryRoutes.ADD_SPECIALISMS],
      {
        queryParams: { referrer: currentUrl }
      }
    );
  }

  handleBackLink(): void {
    this.location.back();
    this.store.clearJudiciarySelection();
  }

  ngOnDestroy(): void {
    this.store.clearSpecialismAddedSuccess();
  }
}
