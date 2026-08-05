import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PdkGrid, SortOrder, PdkTypographyDirective } from '@cpp/pdk';
import { JudicialItineraryFormComponent } from '../../components/judicial-itinerary-form/judicial-itinerary-form.component';
import { JudicialItineraryResultsComponent } from '../../components/judicial-itinerary-results/judicial-itinerary-results.component';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import {
  ItinerarySortField,
  ItinerarySearchParams
} from '../../store/manage-judiciary-itinerary.store.interfaces';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';

@Component({
  selector: 'manage-judicial-itinerary-container',
  template: `
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-large">Manage Judicial itinerary</h1>
      </pdk-grid>
      <pdk-grid two-thirds>
        <judicial-itinerary-form
          [initialValues]="store.searchParams()"
          (errors)="store.setFormErrors($event || [])"
          (submitForm)="handleSubmitForm($event)"
        />
      </pdk-grid>
      <pdk-grid full>
        <judicial-itinerary-results
          [itineraries]="store.sortedItineraries()"
          [totalResults]="store.paginatedItineraries.totalCount()"
          [page]="store.paginatedItineraries.currentPage()"
          [pageSize]="store.paginatedItineraries.pageSize()"
          [sortField]="store.sortField()"
          [sortOrder]="store.sortOrder()"
          (pageChange)="handlePageChange($event)"
          (onSort)="handleSort($event)"
          (onAddJudiciary)="handleAddJudiciary()"
          (onEdit)="handleEdit($event)"
          (onRemove)="handleRemove($event)"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkGrid,
    PdkTypographyDirective,
    JudicialItineraryFormComponent,
    JudicialItineraryResultsComponent
  ]
})
export class ManageJudicialItineraryContainer {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly router = inject(Router);

  handleSubmitForm(values: ItinerarySearchParams): void {
    this.store.resetState();
    this.store.setSearchParams(values);
    this.store.getJudicialItineraries();
  }

  handlePageChange = (page: number): void => {
    this.store.setCurrentPage(page);
    this.store.getJudicialItineraries();
  };

  handleSort = ({ field, order }: { field: ItinerarySortField; order: SortOrder }): void => {
    this.store.setSort(field, order);
  };

  handleAddJudiciary = (): void => {
    this.router.navigate([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE
    ]);
  };

  handleEdit = ({ itinerary }: { itinerary: Itinerary }): void => {
    this.store.setSelectedItinerary(itinerary);
    this.store.setSelectedJudiciary(itinerary.judiciaryMember);
    this.router.navigate([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.EDIT,
      itinerary.id
    ]);
  };

  handleRemove = (itinerary: Itinerary): void => {
    this.store.setSelectedItinerary(itinerary);
    this.store.setSelectedJudiciary(itinerary.judiciaryMember);
    this.router.navigate([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.REMOVE,
      itinerary.id
    ]);
  };
}
