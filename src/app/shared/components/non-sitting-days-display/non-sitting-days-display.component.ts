import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { PdkDetailsSummary, PdkMarginDirective, PdkVisuallyHiddenDirective } from '@cpp/pdk';
import { Unavailability } from '../../../features/manage-judicial-itinerary/model/unavailability.interface';
import { DateRangeFormatPipe } from '../../../features/manage-judicial-itinerary/pipes/date-range-format.pipe';
import { GroupUnavailabilitiesByReasonPipe } from '../../../features/manage-judicial-itinerary/pipes/group-unavailabilities-by-reason.pipe';
import { UnavailabilityReasonFormatPipe } from '../../../features/manage-judicial-itinerary/pipes/unavailability-reason-format.pipe';

@Component({
  selector: 'non-sitting-days-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!unavailabilities() || unavailabilities().length === 0) {
      Not added
    } @else {
      <div class="non-sitting-days-container">
        @for (
          reasonEntry of unavailabilities() | groupUnavailabilitiesByReason | keyvalue;
          track reasonEntry.key
        ) {
          <details pdk-details>
            <summary>
              {{ reasonEntry.key | unavailabilityReasonFormat }} ({{
                reasonEntry.value.length
              }})<span pdk-visually-hidden>{{
                reasonEntry.value.length !== 1 ? 'unavailabilities' : 'unavailability'
              }}</span>
            </summary>
            <pdk-details-text>
              <div role="list">
                @for (
                  unavailability of reasonEntry.value;
                  track unavailability.startDate + unavailability.endDate
                ) {
                  <div role="listitem" pdk-margin-bottom="2">
                    {{ unavailability | dateRangeFormat: ' - ' }}
                  </div>
                }
              </div>
            </pdk-details-text>
          </details>
        }
      </div>
    }
  `,
  styles: [
    `
      .non-sitting-days-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `
  ],
  imports: [
    KeyValuePipe,
    PdkDetailsSummary,
    PdkMarginDirective,
    PdkVisuallyHiddenDirective,
    DateRangeFormatPipe,
    GroupUnavailabilitiesByReasonPipe,
    UnavailabilityReasonFormatPipe
  ]
})
export class NonSittingDaysDisplayComponent {
  readonly unavailabilities = input<Unavailability[] | null | undefined>(null);
}
