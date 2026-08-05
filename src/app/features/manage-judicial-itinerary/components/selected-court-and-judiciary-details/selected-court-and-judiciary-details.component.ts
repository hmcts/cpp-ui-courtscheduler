import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkSummaryList,
  PdkTagComponent,
  PdkTypographyDirective
} from '@cpp/pdk';
import {
  JudicialMemberNamePipe,
  JudiciaryTypePayload,
  OrganisationUnit
} from '@cpp/reference-data';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudicialItineraryRoutes } from '../../manage-judicial-itinerary.routes';
import { Specialism } from '@cpp/reference-data';
import { SpecialismFormatPipe } from '../../pipes/specialism-format.pipe';
import { ExtendedJudicialMember } from '../../../../shared/model';

@Component({
  selector: 'selected-court-and-judiciary-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selected-court-and-judiciary-details.component.html',
  imports: [
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkSummaryList,
    PdkTagComponent,
    PdkTypographyDirective,
    JudicialMemberNamePipe,
    SpecialismFormatPipe
  ]
})
export class SelectedCourtAndJudiciaryDetailsComponent {
  readonly router = inject(Router);
  readonly courtCentre = input<OrganisationUnit | null>(null);
  readonly selectedType = input<JudiciaryTypePayload | null>(null);
  readonly selectedJudiciary = input<ExtendedJudicialMember | null>(null);

  existingSpecialisms = computed(() => {
    const selectedJudiciary = this.selectedJudiciary();
    return selectedJudiciary?.specialisms ?? [];
  });

  readonly allSpecialismsSelected = computed(() => {
    const allSpecialisms = Object.values(Specialism);
    const existing = this.existingSpecialisms();
    return allSpecialisms.every((specialism) => existing.includes(specialism));
  });

  handleCourtChange(): void {
    this.router.navigate([CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY]);
  }

  handleJudiciaryTypeChange(): void {
    this.router.navigate([
      CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
      JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE
    ]);
  }

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
