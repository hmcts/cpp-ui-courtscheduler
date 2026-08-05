import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PdkLinkDirective, PdkTypographyDirective } from '@cpp/pdk';

@Component({
  selector: 'manage-judicial-itinerary-refresh-navigate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 pdk-typography="heading-large">Sorry, there is a problem</h1>
    <div>
      <p pdk-typography="body">
        Your previous entries have not been saved. Go to the
        <a [routerLink]="['/manage-judicial-itinerary']" pdk-link unvisited
          >Manage judicial itinerary</a
        >
        page to start again.
      </p>
    </div>
  `,
  standalone: true,
  imports: [PdkTypographyDirective, PdkLinkDirective, RouterLink]
})
export class RefreshNavigatePageComponent {}
