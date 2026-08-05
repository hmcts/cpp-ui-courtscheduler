import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import {
  PdkButton,
  PdkGrid,
  PdkInsetTextComponent,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkPaginationComponent,
  PdkTable,
  PdkTypographyDirective,
  SortOrder,
  PdkTagComponent
} from '@cpp/pdk';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { ItinerarySortField } from '../../store/manage-judiciary-itinerary.store.interfaces';
import { SpecialismFormatPipe } from '../../pipes/specialism-format.pipe';
import { ItineraryTypePipe } from '../../pipes/itinerary-type.pipe';
import { DateRangeFormatPipe } from '../../pipes/date-range-format.pipe';
import { SessionFormatPipe } from '../../../../shared/pipes/session-format.pipe';
import { NonSittingDaysDisplayComponent } from '../../../../shared/components/non-sitting-days-display/non-sitting-days-display.component';

@Component({
  selector: 'judicial-itinerary-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './judicial-itinerary-results.component.html',
  styles: [
    `
      .summary-container {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }

      .actions-container {
        display: flex;
        gap: 15px;
      }

      .width-25 {
        width: 25%;
      }

      .specialism-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `
  ],
  imports: [
    PdkButton,
    PdkGrid,
    PdkInsetTextComponent,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkPaginationComponent,
    ...PdkTable,
    PdkTypographyDirective,
    JudicialMemberNamePipe,
    SpecialismFormatPipe,
    ItineraryTypePipe,
    DateRangeFormatPipe,
    SessionFormatPipe,
    NonSittingDaysDisplayComponent,
    PdkTagComponent
  ]
})
export class JudicialItineraryResultsComponent {
  readonly itineraries = input<Itinerary[]>();
  readonly totalResults = input<number>(0);
  readonly page = model<number>(1);
  readonly pageSize = input<number>(20);
  readonly sortField = input<ItinerarySortField | null>(null);
  readonly sortOrder = input<SortOrder | null>(null);
  readonly onAddJudiciary = output<void>();
  readonly onEdit = output<{ itinerary: Itinerary }>();
  readonly onRemove = output<Itinerary>();
  readonly onSort = output<{ field: ItinerarySortField; order: SortOrder }>();

  readonly hasPagination = computed(() => this.totalResults() > this.pageSize());

  readonly typeSortDirection = computed(() => {
    if (this.sortField() === 'type') {
      return this.sortOrder() ?? 'none';
    }
    return 'none';
  });
  readonly nameSortDirection = computed(() => {
    if (this.sortField() === 'name') {
      return this.sortOrder() ?? 'none';
    }
    return 'none';
  });
  readonly specialismSortDirection = computed(() => {
    if (this.sortField() === 'specialism') {
      return this.sortOrder() ?? 'none';
    }
    return 'none';
  });

  handleAddJudiciary(): void {
    this.onAddJudiciary.emit();
  }

  handleEdit(itinerary: Itinerary): void {
    this.onEdit.emit({ itinerary });
  }

  handleRemove(itinerary: Itinerary): void {
    this.onRemove.emit(itinerary);
  }

  handleSort(field: ItinerarySortField, order: SortOrder): void {
    this.onSort.emit({ field, order });
  }
}
