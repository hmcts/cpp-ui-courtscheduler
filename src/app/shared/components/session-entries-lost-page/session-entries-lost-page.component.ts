import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PdkLinkDirective, PdkTypographyDirective } from '@cpp/pdk';
import { StaleSessionState } from '../../guards/stale-session.guard';

@Component({
  selector: 'app-session-entries-lost-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdkTypographyDirective, PdkLinkDirective, RouterLink],
  template: `
    <h1 pdk-typography="heading-large">Sorry, there is a problem</h1>
    <div>
      <p pdk-typography="body">
        Your previous entries have not been saved. Go to the
        <a [routerLink]="redirectLink()" pdk-link unvisited>{{ redirectLabel() }}</a>
        page to start again.
      </p>
    </div>
  `
})
export class SessionEntriesLostPageComponent {
  private readonly routerState: StaleSessionState = history.state;

  readonly redirectLink = signal<string>(this.routerState?.redirectLink ?? '/');
  readonly redirectLabel = signal<string>(this.routerState?.redirectLabel ?? 'Home');
}
