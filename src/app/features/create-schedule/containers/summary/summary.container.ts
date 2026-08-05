import { Component, ElementRef, OnDestroy, inject, viewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { select, Store } from '@ngrx/store';
import { AsyncPipe, Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { RepeatPattern } from '../../model/repeat-pattern';
import { Session } from '../../../../shared/model/session';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleState } from '../../state/create-schedule.state';
import {
  getIsPersisted,
  getJurisdiction,
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getSessions
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleActions } from '../../state/actions';
import {
  PdkAlertComponent,
  PdkLinkDirective,
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
    @if (!isPersisted) {
      <div pdk-margin-bottom="4">
        <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
      </div>
    }
    <pdk-grid container>
      <pdk-grid full>
        @if (isPersisted) {
          <div pdk-margin-bottom="4">
            <pdk-alert icon="true" type="success">
              Sessions for {{ (businessType$ | async)?.typeDescription }} have been added
            </pdk-alert>
          </div>
        }
        <h1 pdk-typography="heading-xlarge">
          {{ isPersisted ? 'Sessions' : 'Summary' }} for
          {{ (businessType$ | async)?.typeDescription }}
        </h1>

        <journey-summary
          [courtCentre]="courtCentre$ | async"
          [businessTypeLabel]="(businessType$ | async)?.typeDescription"
        />

        <session-details
          [sessions]="sessions"
          [isSlot]="(businessType$ | async)?.slot"
          [isSummary]="!isPersisted"
          [jurisdiction]="jurisdiction"
          [defaultStartTime]="(courtCentre$ | async)?.defaultStartTime"
          (onNavigate)="handleNavigation($event)"
        />

        <repeat-pattern-summary [repeatPattern]="repeatPattern$ | async" />

        <div data-test-id="summary-actions">
          @if (!isPersisted) {
            <button pdk-button type="submit" (click)="handleContinue()">
              Confirm and create sessions
            </button>
          }

          @if (isPersisted) {
            <div pdk-margin-bottom="4">
              <a
                href="javascript:void(0);"
                pdk-link
                unvisited
                (click)="handleNewSessionsNavigation()"
                data-test-id="create-new-sessions-link"
                >Create new sessions</a
              >
            </div>
          }
        </div>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    AsyncPipe,
    PdkAlertComponent,
    PdkBackLink,
    PdkLinkDirective,
    PdkButton,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    JourneySummaryComponent,
    RepeatPatternSummaryComponent,
    SessionDetailsComponent
  ]
})
export class SummaryContainer implements OnDestroy {
  private store = inject<Store<CreateScheduleState>>(Store);
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly banner = viewChild<ElementRef<HTMLDivElement>>('banner');

  courtCentre$: Observable<OrganisationUnit>;
  businessType$: Observable<RotaBusinessType>;
  repeatPattern$: Observable<RepeatPattern>;

  sessions: Session[];
  jurisdiction: JurisdictionType | null = null;
  isPersisted: boolean = false;
  routes = CreateScheduleRoutes;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.courtCentre$ = this.store.pipe(select(getSelectedCourtCentre));
    this.businessType$ = this.store.pipe(select(getSelectedBusinessType));
    this.repeatPattern$ = this.store.pipe(select(getRepeatPattern));

    this.store
      .select(getJurisdiction)
      .pipe(takeUntil(this.destroy$))
      .subscribe((jurisdiction) => {
        this.jurisdiction = jurisdiction;
      });

    // TODO: Create a generic wrapper for HTML and deal with subscriptions using async pipe instead of destroy$.

    this.store
      .select(getSessions)
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessions) => {
        this.sessions = sessions;
      });

    this.store
      .select(getIsPersisted)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isPersisted) => {
        this.isPersisted = isPersisted;
      });

    // After sessions are persisted, prevent back navigation and redirect to next success route.
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (
        this.isPersisted &&
        event instanceof NavigationStart &&
        event.navigationTrigger === 'popstate'
      ) {
        this.router.navigate([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
          relativeTo: this.route.parent
        });
      }
    });
  }

  handleBackLink() {
    this.location.back();
  }

  handleNavigation(route: CreateScheduleRoutes) {
    this.router.navigate([route], { relativeTo: this.route.parent });
  }

  handleNewSessionsNavigation() {
    // Business requirement to redirect to SELECT_BUSINESS_TYPE after a journey is completed,
    // so more sessions can be added for the same court.
    this.router.navigate([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: this.route.parent
    });
  }

  handleContinue() {
    this.store.dispatch(CreateScheduleActions.createCourtSchedule());

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
