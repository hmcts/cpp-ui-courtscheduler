import { afterRenderEffect, Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  PdkAlertComponent,
  PdkContextPanelComponent,
  PdkErrorSummaryComponent,
  PdkMarginDirective
} from '@cpp/pdk';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';

@Component({
  selector: 'manage-judiciary-itinerary-alert-container',
  template: `
    @if (store.formErrors().length > 0) {
      <pdk-error-summary [errors]="store.formErrors()" focusOnChange pdk-margin-top="4" />
    }
    @if (store.specialismAddedSuccess()) {
      <div pdk-margin-bottom="4">
        <pdk-alert icon="true" type="success"> New specialism added </pdk-alert>
      </div>
    }
    @if (store.serverSubmissionError.message() && !store.serverSubmissionError.isSourceForm()) {
      <div pdk-margin-bottom="4">
        <pdk-context-panel icon="warn" type="invalid" #serverSubmissionErrorPanel tabindex="-1">
          {{ store.serverSubmissionError.message() }}
          @if (store.serverSubmissionError.linkText()) {
            <a href="javascript:void(0);" (click)="handleLinkAction()">{{
              store.serverSubmissionError.linkText()
            }}</a>
          }
        </pdk-context-panel>
      </div>
    }
    <router-outlet />
  `,
  imports: [
    PdkAlertComponent,
    PdkContextPanelComponent,
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    RouterOutlet
  ]
})
export class ManageJudiciaryItineraryAlertContainer {
  readonly store = inject(ManageJudicialItineraryStore);
  readonly serverSubmissionErrorPanel = viewChild('serverSubmissionErrorPanel', {
    read: ElementRef<any>
  });
  constructor() {
    afterRenderEffect({
      write: () => {
        if (this.serverSubmissionErrorPanel()) {
          this.serverSubmissionErrorPanel().nativeElement.scrollIntoView({ behavior: 'smooth' });
          this.serverSubmissionErrorPanel().nativeElement.focus();
        }
      }
    });
  }

  handleLinkAction(): void {
    const linkAction = this.store.serverSubmissionError.linkAction();
    if (linkAction) {
      linkAction();
      this.store.clearServerSubmissionError();
    }
  }
}
