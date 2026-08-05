import { Component, input } from '@angular/core';
import { OrganisationUnit } from '@cpp/reference-data';

import { PdkMarginDirective, PdkSummaryList } from '@cpp/pdk';

@Component({
  selector: 'journey-summary',
  template: `
    <div pdk-margin-bottom="8">
      <h3 pdk-typography="heading-medium" pdk-margin-bottom="0">{{ headingText() }}</h3>
      <dl pdk-summary-list>
        @if (courtCentre()?.oucodeL3Name) {
          <div pdk-summary-list-item>
            <dt pdk-summary-list-key>Court</dt>
            <dd pdk-summary-list-value>{{ courtCentre().oucodeL3Name }}</dd>
          </div>
        }
        @if (businessTypeLabel()) {
          <div pdk-summary-list-item>
            <dt pdk-summary-list-key>Business Type</dt>
            <dd pdk-summary-list-value>{{ businessTypeLabel() }}</dd>
          </div>
        }
      </dl>
    </div>
  `,
  imports: [PdkMarginDirective, PdkSummaryList]
})
export class JourneySummaryComponent {
  readonly courtCentre = input<OrganisationUnit>();
  readonly businessTypeLabel = input<string>();
  readonly headingText = input<string>('Court and business type details');
}
