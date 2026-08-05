import { Location } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import {
  JudiciaryReassignmentConfirmationFormComponent,
  ReassignmentOption
} from '../../components/judiciary-reassignment-confirmation-form/judiciary-reassignment-confirmation-form.component';
import { ManageSessionsStore } from '../../../view-schedule/store/manage-sessions.store';

@Component({
  selector: 'judiciary-reassignment-confirmation-container',
  template: `
    <div>
      <a pdk-back-link pdk-margin-top="0" (click)="handleBackLink()" href="javascript:void(0);"
        >Back</a
      >

      @if (formErrors?.length > 0) {
        <pdk-error-summary [errors]="formErrors" focusOnChange pdk-margin-top="4" />
      }
    </div>

    <pdk-grid container>
      <pdk-grid two-thirds>
        <h1 pdk-typography="heading-large">
          Are you sure you want to reassign the following session with judiciary?
        </h1>
      </pdk-grid>

      <pdk-grid full>
        <judiciary-reassignment-confirmation-form
          [sessions]="store.sessionsWithJudiciary()"
          (errors)="formErrors = $event"
          (submitForm)="handleSubmit($event)"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkBackLink,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    JudiciaryReassignmentConfirmationFormComponent
  ]
})
export class JudiciaryReassignmentConfirmationContainer {
  readonly store = inject(ManageSessionsStore);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly location = inject(Location);
  readonly referrer = input<string | undefined>();

  formErrors: ValidationError[] | null = null;

  constructor() {
    effect(() => {
      const r = this.referrer();
      if (r !== undefined) this.store.setReferrer(r);
    });
  }

  handleSubmit(option: ReassignmentOption): void {
    if (option === 'yes') {
      this.router.navigate(['../assign'], {
        relativeTo: this.route,
        queryParamsHandling: 'preserve'
      });
      return;
    }
    this.navigateBack();
  }

  handleBackLink(): void {
    this.navigateBack();
  }

  private navigateBack(): void {
    const referrer = this.store.referrer();
    if (referrer) {
      this.router.navigateByUrl(`/${referrer}`);
    } else {
      this.location.back();
    }
  }
}
