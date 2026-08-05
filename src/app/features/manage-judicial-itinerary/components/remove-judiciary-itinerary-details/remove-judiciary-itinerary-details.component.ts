import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PdkGrid, PdkMarginDirective, PdkSummaryList } from '@cpp/pdk';
import {
  JudicialMember,
  JudicialMemberNamePipe,
  JudiciaryTypePayload,
  OrganisationUnit
} from '@cpp/reference-data';
import { DatePipe } from '@angular/common';
import { SessionFormatPipe } from '../../../../shared/pipes/session-format.pipe';
import { NonSittingDaysDisplayComponent } from '../../../../shared/components/non-sitting-days-display/non-sitting-days-display.component';
import { Itinerary } from '../../model/judicial-itinerary.interface';

@Component({
  selector: 'remove-judiciary-itinerary-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './remove-judiciary-itinerary-details.component.html',
  imports: [
    PdkGrid,
    PdkMarginDirective,
    PdkSummaryList,
    JudicialMemberNamePipe,
    DatePipe,
    SessionFormatPipe,
    NonSittingDaysDisplayComponent
  ]
})
export class RemoveJudiciaryItineraryDetailsComponent {
  readonly itinerary = input<Itinerary | null>(null);
  readonly courtCentre = input<OrganisationUnit | null>(null);
  readonly selectedJudiciary = input<JudicialMember | null>(null);
  readonly selectedType = input<JudiciaryTypePayload | null>(null);
}
