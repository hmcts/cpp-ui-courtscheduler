import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleState } from '../../state/create-schedule.state';
import {
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getSessions
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleActions } from '../../state/actions';
import {
  PdkButton,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  PdkBackLink
} from '@cpp/pdk';
import { JourneySummaryComponent } from '../../components/journey-summary/journey-summary.component';
import { SessionDetailsComponent } from '../../components/session-details/session-details.component';
import { RepeatPatternSummaryComponent } from '../../components/repeat-pattern-summary/repeat-pattern-summary.component';

@Component({
  selector: 'summary-container',
  template: `
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">Summary for {{ businessType()?.typeDescription }}</h1>

        <journey-summary
          [courtCentre]="courtCentre()"
          [businessTypeLabel]="businessType()?.typeDescription"
        />

        <session-details
          [sessions]="sessions()"
          [isSlot]="businessType()?.slot"
          [isSummary]="true"
          [jurisdiction]="jurisdiction"
          [defaultStartTime]="courtCentre().defaultStartTime"
          (onNavigate)="handleNavigation($event)"
        />

        <repeat-pattern-summary [repeatPattern]="repeatPattern()"></repeat-pattern-summary>

        <div data-test-id="summary-actions">
          <button pdk-button type="submit" (click)="handleContinue()">
            Confirm and create sessions
          </button>
        </div>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkBackLink,
    PdkButton,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    JourneySummaryComponent,
    RepeatPatternSummaryComponent,
    SessionDetailsComponent
  ]
})
export class SummaryContainer {
  private store = inject<Store<CreateScheduleState>>(Store);
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly courtCentre = this.store.selectSignal(getSelectedCourtCentre);
  readonly businessType = this.store.selectSignal(getSelectedBusinessType);
  readonly repeatPattern = this.store.selectSignal(getRepeatPattern);
  readonly sessions = this.store.selectSignal(getSessions);

  jurisdiction: JurisdictionType | null = null;

  handleBackLink() {
    this.location.back();
  }

  handleNavigation(route: CreateScheduleRoutes) {
    this.router.navigate([route], { relativeTo: this.route.parent });
  }

  handleContinue() {
    this.store.dispatch(CreateScheduleActions.createCourtSchedule());

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
