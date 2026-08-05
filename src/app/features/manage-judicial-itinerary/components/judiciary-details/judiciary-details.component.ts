import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkSummaryList,
  PdkTagComponent,
  PdkTypographyDirective
} from '@cpp/pdk';
import { JudicialMemberNamePipe, JudiciaryTypePayload } from '@cpp/reference-data';
import { SpecialismFormatPipe } from '../../pipes/specialism-format.pipe';
import { ExtendedJudicialMember } from '../../../../shared/model';
import { Router } from '@angular/router';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';

@Component({
  selector: 'judiciary-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let existingSpecialismsList = existingSpecialisms();

    <pdk-grid container pdk-margin-top="4">
      <pdk-grid full>
        <h2 pdk-typography="heading-medium">Selected Judiciary and specialism</h2>
        <dl pdk-summary-list pdk-margin-top="2">
          <div pdk-summary-list-item>
            <dt pdk-summary-list-key>Judiciary type</dt>
            <dd pdk-summary-list-value>{{ selectedType() || 'Not selected' }}</dd>
          </div>

          <div pdk-summary-list-item>
            <dt pdk-summary-list-key>Name</dt>
            <dd pdk-summary-list-value>{{ selectedJudiciary() | judicialMemberName }}</dd>
          </div>

          <div pdk-summary-list-item>
            <dt pdk-summary-list-key>Current specialism</dt>
            <dd pdk-summary-list-value>
              @if (existingSpecialismsList.length > 0) {
                @for (specialism of existingSpecialismsList; track specialism) {
                  <pdk-tag pdk-margin-right="2" pdk-margin-bottom="2">
                    {{ specialism | specialismFormat }}
                  </pdk-tag>
                }
              } @else {
                <span>Not added</span>
              }
            </dd>
            @if (!hideSpecialismsAction()) {
              <dd pdk-summary-list-action>
                <a
                  href="javascript:void(0);"
                  pdk-link
                  unvisited
                  (click)="handleAddSpecialism()"
                  data-test-id="add-new-specialism-link"
                >
                  Add new specialism
                </a>
              </dd>
            }
          </div>
        </dl>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkGrid,
    PdkMarginDirective,
    PdkSummaryList,
    PdkLinkDirective,
    PdkTagComponent,
    PdkTypographyDirective,
    JudicialMemberNamePipe,
    SpecialismFormatPipe
  ]
})
export class JudiciaryDetailsComponent {
  readonly router = inject(Router);
  readonly selectedType = input.required<JudiciaryTypePayload | null>();
  readonly selectedJudiciary = input.required<ExtendedJudicialMember | null>();
  readonly hideSpecialismsAction = input<boolean>(true);
  existingSpecialisms = computed(() => {
    const selectedJudiciary = this.selectedJudiciary();
    return selectedJudiciary?.specialisms ?? [];
  });

  handleAddSpecialism(): void {
    const currentUrl = this.router.url;
    this.router.navigate(
      [CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY, JudicialItineraryRoutes.ADD_SPECIALISMS],
      {
        queryParams: { referrer: currentUrl }
      }
    );
  }
}
