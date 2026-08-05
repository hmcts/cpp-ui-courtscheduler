import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PdkGrid, PdkMarginDirective, PdkPanelComponent } from '@cpp/pdk';

@Component({
  selector: 'confirmation-action-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pdk-grid container>
      <pdk-grid two-thirds>
        <pdk-panel type="confirmation" [title]="title()!" pdk-margin-bottom="4">
          {{ message() }}
        </pdk-panel>
        <div pdk-margin-top="4">
          <ng-content select="button" />
          <ng-content select="button-group" />
          <ng-content select="a" />
        </div>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [PdkGrid, PdkMarginDirective, PdkPanelComponent]
})
export class ConfirmationActionBannerComponent {
  readonly title = input<string | undefined>(undefined);
  readonly message = input.required<string>();
}
