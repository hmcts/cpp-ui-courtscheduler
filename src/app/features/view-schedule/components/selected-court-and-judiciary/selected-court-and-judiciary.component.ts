import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkSummaryList,
  PdkTypographyDirective
} from '@cpp/pdk';
import { JudicialMember, JudicialMemberNamePipe } from '@cpp/reference-data';

@Component({
  selector: 'selected-court-and-judiciary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selected-court-and-judiciary.component.html',
  imports: [
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkSummaryList,
    PdkTypographyDirective,
    JudicialMemberNamePipe
  ]
})
export class SelectedCourtAndJudiciaryComponent {
  readonly courtName = input<string>('');
  readonly assignedJudiciary = input<JudicialMember[]>([]);

  readonly assignJudiciary = output<void>();
  readonly removeAllJudiciary = output<void>();

  readonly hasAssignedJudiciary = computed(() => this.assignedJudiciary().length > 0);
}
