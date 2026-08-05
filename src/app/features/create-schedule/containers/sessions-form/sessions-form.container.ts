import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  viewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PdkAlertComponent,
  PdkBackLink,
  PdkButton,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { JourneySummaryComponent } from '../../components/journey-summary/journey-summary.component';
import { Session } from '../../../../shared/model/session';
import {
  getBannerMessage,
  getErrors,
  getJurisdiction,
  getRepeatPattern,
  getSelectedBusinessType,
  getSelectedCourtCentre,
  getSessions
} from '../../state/selectors/create-schedule.selectors';
import { CreateScheduleActions } from '../../state/actions';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { AddSessionsFormComponent } from '../../components/add-sessions-form/add-sessions-form.component';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { SessionDetailsComponent } from '../../components/session-details/session-details.component';
import { BannerMessage } from '../../../../shared/model/banner-message';
import { RepeatPattern } from '../../model/repeat-pattern';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { Actions, ofType } from '@ngrx/effects';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'sessions-form-container',
  template: `
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4" />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">
          Add sessions for {{ (businessType$ | async)?.typeDescription }}
        </h1>
        <journey-summary
          [courtCentre]="courtCentre$ | async"
          [businessTypeLabel]="(businessType$ | async)?.typeDescription"
        />

        <add-sessions-form
          [courtCentre]="courtCentre$ | async"
          [isSlot]="(businessType$ | async)?.slot"
          [businessType]="businessType$ | async"
          [jurisdiction]="jurisdiction"
          [repeatPattern]="repeatPattern"
          (errors)="handleErrors($event)"
          (submitForm)="submitSession($event)"
        />

        <div #banner>
          @if (!!bannerMessage?.message) {
            <div pdk-margin-vertical="4">
              <pdk-alert icon="true" type="{{ bannerMessage.bannerType }}">{{
                bannerMessage.message
              }}</pdk-alert>
            </div>
          }
        </div>

        <session-details
          [sessions]="sessions"
          [isSlot]="(businessType$ | async)?.slot"
          [actionsEnabled]="actionsEnabled"
          [jurisdiction]="jurisdiction"
          [defaultStartTime]="(courtCentre$ | async)?.defaultStartTime"
          (sessionToCopy)="setSessionToCopy($event)"
          (sessionToRemove)="setSessionsToRemove($event)"
        />
        <button
          pdk-button
          pdk-margin-top="2"
          type="submit"
          (click)="handleContinue()"
          [disabled]="sessions.length === 0"
        >
          Continue
        </button>
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    AsyncPipe,
    PdkAlertComponent,
    PdkBackLink,
    PdkButton,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    AddSessionsFormComponent,
    JourneySummaryComponent,
    SessionDetailsComponent
  ]
})
export class SessionsFormContainer implements OnDestroy, OnInit, AfterViewInit {
  route = inject(ActivatedRoute);
  private store = inject<Store<CreateScheduleState>>(Store);
  private router = inject(Router);
  private actions$ = inject(Actions);

  readonly addSessionComponent = viewChild(AddSessionsFormComponent);
  readonly banner = viewChild<ElementRef<HTMLDivElement>>('banner');

  courtCentre$: Observable<OrganisationUnit>;
  businessType$: Observable<RotaBusinessType>;

  sessions: Session[];
  actionsEnabled: boolean = true;

  errors: ValidationError[] = [];
  errors$: Observable<ValidationError[]>;

  destroy$: Subject<boolean> = new Subject<boolean>();
  bannerMessage: BannerMessage;

  jurisdiction: JurisdictionType | null = null;
  repeatPattern: RepeatPattern;

  constructor() {
    this.courtCentre$ = this.store.pipe(select(getSelectedCourtCentre));
    this.businessType$ = this.store.pipe(select(getSelectedBusinessType));
    this.errors$ = this.store.select(getErrors);

    // TODO: Create a generic wrapper for HTML and deal with subscriptions using async pipe instead of destroy$.
    this.store
      .select(getBannerMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe((bannerMessage) => {
        this.bannerMessage = bannerMessage;
        if (this.bannerMessage?.message) {
          this.scrollIntoView();
        }
      });

    this.store
      .select(getSessions)
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessions) => {
        this.sessions = sessions;
      });

    this.store
      .select(getJurisdiction)
      .pipe(takeUntil(this.destroy$))
      .subscribe((jurisdiction) => {
        this.jurisdiction = jurisdiction;
      });

    this.store
      .select(getRepeatPattern)
      .pipe(takeUntil(this.destroy$))
      .subscribe((repeatPattern) => {
        this.repeatPattern = repeatPattern;
      });

    this.actions$
      .pipe(ofType(CreateScheduleActions.submitSessionSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        const form = this.addSessionComponent()?.form();
        if (form) {
          form.resetForm();
        }
      });

    this.errors$.pipe(takeUntil(this.destroy$)).subscribe((errors) => {
      this.errors = [...errors];
      if (!!errors.length) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(CreateScheduleActions.setSessionToCopy({ session: null }));
    this.store.dispatch(CreateScheduleActions.setCreateSessionsToRemove({ sessionsToRemove: [] }));
    this.store.dispatch(CreateScheduleActions.setErrors({ errors: [] }));
  }

  ngAfterViewInit() {
    if (this.bannerMessage?.message) {
      this.scrollIntoView();
    }
  }

  scrollIntoView() {
    const banner = this.banner();
    if (banner?.nativeElement?.scrollIntoView) {
      banner.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  submitSession(session: Session) {
    this.store.dispatch(
      CreateScheduleActions.submitSession({
        existingSessions: this.sessions,
        sessionToBeAdded: { ...session, id: uuid() },
        repeatPattern: this.repeatPattern
      })
    );
  }

  handleContinue() {
    if (this.sessions.length !== 0) {
      this.router.navigate([CreateScheduleRoutes.SUMMARY], {
        relativeTo: this.route.parent
      });
    }
  }

  handleBackLink() {
    this.router.navigate([CreateScheduleRoutes.REPEAT_PATTERN], {
      relativeTo: this.route.parent
    });
  }

  handleErrors(errors: ValidationError[]) {
    this.errors = errors;
  }

  setSessionToCopy(session: Session) {
    this.store.dispatch(
      CreateScheduleActions.setSessionToCopy({
        session
      })
    );
    this.router.navigate([CreateScheduleRoutes.COPY_SESSIONS], {
      relativeTo: this.route.parent
    });
  }

  setSessionsToRemove(sessionsToRemove: Session[]) {
    this.store.dispatch(
      CreateScheduleActions.setCreateSessionsToRemove({
        sessionsToRemove
      })
    );
    this.router.navigate([CreateScheduleRoutes.REMOVE_SESSIONS], {
      relativeTo: this.route.parent
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
