import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import type { ExtendedJudicialMember } from '../../model';
import { PdkListDirective } from '@cpp/pdk';

@Component({
  selector: 'judiciary-name-list',
  template: `
    <ul pdk-list>
      @for (judiciary of judiciaries(); track judiciary.id) {
        <li>{{ judiciary | judicialMemberName }}</li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JudicialMemberNamePipe, PdkListDirective]
})
export class JudiciaryNameListComponent {
  readonly judiciaries = input<ExtendedJudicialMember[]>([]);
}
