import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  ModalService,
  PdkBackLink,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { HttpErrorResponse } from '@angular/common/http';
import { EditSessionFormValues } from '../../model/view-schedule.model';
import { ViewScheduleState } from '../../state/view-schedule.state';
import { getCourtCentres } from '../../../../core/selectors/reference-data/reference-data';
import { ViewScheduleActions } from '../../state/actions';
import { ViewScheduleRoutes } from '../../view-schedule.routes';
import { EditSessionComponent } from '../../components/edit-form/edit-form.component';
import { SelectedCourtAndJudiciaryComponent } from '../../components/selected-court-and-judiciary/selected-court-and-judiciary.component';
import {
  RemoveJudiciaryModalComponent,
  RemoveJudiciaryModalData
} from '../../components/remove-judiciary-modal/remove-judiciary-modal.component';
import { JurisdictionType } from '../../../../../app/shared/model/jurisdiction';
import { CourtSchedulerRoutes } from '../../../../../app/app-routes';
import { JudiciarySessionAssignmentRoutes } from '../../../../features/judiciary-session-assignment/judiciary-session-assignment.routes';
import { ManageSessionsStore } from '../../store/manage-sessions.store';

@Component({
  selector: 'edit-session',
  template: `
    @if (errors()?.length > 0) {
      <pdk-error-summary [errors]="errors()" focusOnChange pdk-margin-top="4" />
    }
    <div pdk-margin-bottom="4">
      <a pdk-back-link (click)="handleBackLink()" href="javascript:void(0);">Back</a>
    </div>
    <pdk-grid container>
      <pdk-grid full>
        <h1 pdk-typography="heading-xlarge">Edit session details</h1>
        @if (jurisdiction() === JurisdictionType.CROWN) {
          <selected-court-and-judiciary
            [courtName]="sessionToEdit().courtHouseName"
            [assignedJudiciary]="manageSessionsStore.selectedJudiciaries() ?? []"
            (assignJudiciary)="navigateToAssignJudiciary()"
            (removeAllJudiciary)="handleRemoveAllJudiciary()"
          />
        }

        <edit-sessions-form
          [courtCentres]="courtCentres()"
          [sessionToEdit]="sessionToEdit()"
          [jurisdiction]="jurisdiction()"
          (submitForm)="handleSubmitForm($event)"
          (handleBackNav)="handleBackLink()"
          (errors)="errors.set($event)"
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
    EditSessionComponent,
    SelectedCourtAndJudiciaryComponent
  ]
})
export class EditSessionContainer {
  private store = inject<Store<ViewScheduleState>>(Store);
  private router = inject(Router);
  private modalService = inject(ModalService);

  readonly manageSessionsStore = inject(ManageSessionsStore);
  readonly sessionToEdit = computed(() => this.manageSessionsStore.sessions()[0]);
  readonly courtCentres = this.store.selectSignal(getCourtCentres);
  readonly jurisdiction = computed(() => this.sessionToEdit()?.jurisdiction ?? null);
  readonly JurisdictionType = JurisdictionType;

  errors = signal<ValidationError[]>([]);

  handleSubmitForm(formValues: EditSessionFormValues) {
    this.manageSessionsStore.updateSession({
      formValues,
      onUpdateSuccess: (courtRoomName) => {
        this.store.dispatch(
          ViewScheduleActions.setViewBanner({
            message: 'Sessions updated successfully',
            bannerType: 'success',
            courtRoomName
          })
        );
        this.router.navigate([CourtSchedulerRoutes.VIEW_SCHEDULE]);
      },
      onUpdateError: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          const parsedError = JSON.parse(error.error);
          this.errors.set([{ id: 'backendError', message: parsedError.error }]);
        } else {
          this.manageSessionsStore.handleError(error);
        }
      }
    });
  }

  handleBackLink() {
    this.store.dispatch(ViewScheduleActions.clearViewBanner());
    this.router.navigate([ViewScheduleRoutes.VIEW]);
  }

  navigateToAssignJudiciary(): void {
    this.router.navigate(
      [
        CourtSchedulerRoutes.VIEW_SCHEDULE,
        ViewScheduleRoutes.EDIT,
        CourtSchedulerRoutes.JUDICIARY_SESSION_ASSIGNMENT,
        JudiciarySessionAssignmentRoutes.ASSIGN
      ],
      { queryParams: { referrer: this.router.url.split('?')[0].slice(1) } }
    );
  }

  handleRemoveAllJudiciary(): void {
    const overlayRef = this.modalService.open<RemoveJudiciaryModalData>(
      RemoveJudiciaryModalComponent,
      {
        data: {
          confirm: () => {
            this.manageSessionsStore.removeAllJudiciary({
              onRemoveSuccess: () => {
                this.manageSessionsStore.clearJudiciarySelection();
                overlayRef.dispose();
              }
            });
          },
          cancel: () => {
            overlayRef.dispose();
          }
        },
        disposeOnBackDropClick: false
      }
    );
  }
}
