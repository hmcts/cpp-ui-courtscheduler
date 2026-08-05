import { Location } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { JudiciaryTypePayload } from '@cpp/reference-data';
import { Store } from '@ngrx/store';
import { catchError, map, of } from 'rxjs';
import { AppState } from '../../../../core';
import type { JudiciarySelectionValue } from '../../../../shared';
import { AssignJudiciaryFormComponent } from '../../components/assign-judiciary-form/assign-judiciary-form.component';
import { JudiciarySessionAssignmentService } from '../../services/judiciary-session-assignment.service';
import { ManageSessionsStore } from '../../../view-schedule/store/manage-sessions.store';
import { ViewScheduleActions } from '../../../view-schedule/state/actions';
import { Router } from '@angular/router';

@Component({
  selector: 'assign-judiciary-container',
  template: `
    <div>
      <a pdk-back-link pdk-margin-top="0" (click)="handleBackLink()" href="javascript:void(0);">
        Back
      </a>
      @if (formErrors?.length > 0) {
        <pdk-error-summary [errors]="formErrors" focusOnChange pdk-margin-top="4" />
      }
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-large">Select judiciary to add to sessions</h1>
      </pdk-grid>
      <pdk-grid two-thirds>
        <assign-judiciary-form
          [initialValues]="initialValues()"
          [suggestionsResource]="suggestionsResource.value()"
          (onQueryJudiciaries)="querySignal.set($event)"
          (errors)="formErrors = $event"
          (submitForm)="handleSubmit($event)"
          (cancel)="handleCancel()"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  imports: [
    PdkBackLink,
    PdkGrid,
    PdkMarginDirective,
    AssignJudiciaryFormComponent,
    PdkErrorSummaryComponent,
    PdkTypographyDirective
  ]
})
export class AssignJudiciaryContainer {
  formErrors: ValidationError[] | null = null;
  readonly store = inject(ManageSessionsStore);
  readonly referrer = input<string | undefined>();

  constructor() {
    effect(() => {
      const r = this.referrer();
      if (r !== undefined) this.store.setReferrer(r);
    });
  }
  readonly globalStore = inject(Store<AppState>);
  readonly location = inject(Location);
  readonly router = inject(Router);
  readonly assignmentService = inject(JudiciarySessionAssignmentService);
  readonly initialValues = computed(() => ({
    judiciarySelection: this.store.selectedJudiciaryByTypeMap(),
    selectedJudiciaryTypes: this.store.selectedJudiciaryTypes() ?? []
  }));
  readonly querySignal = signal<{ type: JudiciaryTypePayload | null; searchText: string }>({
    type: null,
    searchText: ''
  });

  readonly suggestionsResource = rxResource({
    request: this.querySignal,
    loader: ({ request }) => {
      if (!request.type || !request.searchText) {
        return of({ type: request.type, judicialMembers: [] });
      }
      return this.assignmentService
        .getAvailableJudiciaries({
          judiciaryGroup: request.type,
          search: request.searchText,
          limit: 20,
          courtScheduleIds: this.store.selectedSessionIds().join(',')
        })
        .pipe(
          map(({ judiciaries }) => ({
            type: request.type,
            judicialMembers: judiciaries
          })),
          catchError(() => of({ type: request.type, judicialMembers: [] }))
        );
    }
  });

  handleSubmit(value: JudiciarySelectionValue): void {
    this.store.assignJudiciary({
      value,
      onAssignSuccess: () => {
        const referrer = this.store.referrer();
        this.globalStore.dispatch(
          ViewScheduleActions.setViewBanner({
            message: 'Judiciary assigned successfully, sessions updated.',
            bannerType: 'success',
            courtRoomName: this.store.courtRoomNames()[0] ?? ''
          })
        );
        if (referrer) {
          this.router.navigateByUrl(`/${referrer}`);
        } else {
          this.location.back();
        }
        this.store.clearState();
      }
    });
  }

  handleCancel(): void {
    this.store.clearJudiciarySelection();
    this.location.back();
  }

  handleBackLink(): void {
    this.store.clearJudiciarySelection();
    this.location.back();
  }
}
