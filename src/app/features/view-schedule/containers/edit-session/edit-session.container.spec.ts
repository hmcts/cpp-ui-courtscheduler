import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Component, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ViewScheduleActions } from '../../state/actions';
import { EditSessionComponent } from '../../components/edit-form/edit-form.component';
import {
  CourtCentre,
  mockBusinessType,
  mockCourtCentres,
  mockCourtScheduleSession
} from '../../../../shared';
import { EditSessionContainer } from './edit-session.container';
import { Router } from '@angular/router';
import { ViewScheduleRoutes } from '../../view-schedule.routes';
import { RotaBusinessType } from '@cpp/reference-data';
import { CourtScheduleSession, EditSessionFormValues } from '../../model/view-schedule.model';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { ModalService } from '@cpp/pdk';
import {
  RemoveJudiciaryModalComponent,
  RemoveJudiciaryModalData
} from '../../components/remove-judiciary-modal/remove-judiciary-modal.component';
import { provideCppCoreHttpServices } from '@cpp/core';
import { ExtendedJudicialMember } from '../../../../shared/model';
import { JudiciarySessionAssignmentService } from '../../../judiciary-session-assignment/services/judiciary-session-assignment.service';
import { CourtSchedulerRoutes } from '../../../../app-routes';
import { JudiciarySessionAssignmentRoutes } from '../../../judiciary-session-assignment/judiciary-session-assignment.routes';
import { of } from 'rxjs';
import { ManageSessionsStore } from '../../store/manage-sessions.store';

describe('EditSessionContainer', () => {
  let component: EditSessionContainer;
  let fixture: ComponentFixture<EditSessionContainer>;
  let router: Router;
  let modalOpenSpy: jasmine.Spy;
  let lastModalData: RemoveJudiciaryModalData;
  let overlayDisposeSpy: jasmine.Spy;
  let mockManageSessionsStore: any;

  beforeEach(async () => {
    overlayDisposeSpy = jasmine.createSpy('overlayDispose');
    modalOpenSpy = jasmine
      .createSpy('open')
      .and.callFake((_component: unknown, options: { data: RemoveJudiciaryModalData }) => {
        lastModalData = options.data;
        return { dispose: overlayDisposeSpy };
      });

    mockManageSessionsStore = {
      sessions: signal([mockCourtScheduleSession]),
      selectedJudiciaries: signal(null),
      updateSession: jasmine.createSpy('updateSession'),
      handleError: jasmine.createSpy('handleError'),
      removeAllJudiciary: jasmine
        .createSpy('removeAllJudiciary')
        .and.callFake(({ onRemoveSuccess }: any) => onRemoveSuccess?.()),
      clearJudiciarySelection: jasmine.createSpy('clearJudiciarySelection'),
      setSessions: jasmine.createSpy('setSessions'),
      setSelectedJudiciary: jasmine.createSpy('setSelectedJudiciary'),
      setReferrer: jasmine.createSpy('setReferrer')
    };

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [EditSessionContainer],
      providers: [
        {
          provide: ModalService,
          useValue: { open: modalOpenSpy }
        },
        provideCppCoreHttpServices(),
        provideMockStore({
          initialState: {
            referenceData: {
              rotaBusinessTypes: [mockBusinessType],
              organisationUnits: mockCourtCentres
            },
            viewSchedule: {
              sessionToEdit: mockCourtScheduleSession
            }
          }
        }),
        { provide: ManageSessionsStore, useValue: mockManageSessionsStore },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            url: '/view/edit/session-123'
          }
        },
        {
          provide: JudiciarySessionAssignmentService,
          useValue: {
            assignJudiciaries: jasmine.createSpy('assignJudiciaries').and.returnValue(of({})),
            removeAllJudiciaries: jasmine.createSpy('removeAllJudiciaries').and.returnValue(of({}))
          }
        }
      ]
    })
      .overrideComponent(EditSessionContainer, {
        remove: { imports: [EditSessionComponent] },
        add: { imports: [MockEditSessionComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditSessionContainer);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error summary when there are errors', () => {
    component.errors.set([
      {
        message: 'Error message',
        id: 'test-id'
      }
    ]);
    fixture.detectChanges();

    const errorSummary = fixture.debugElement.nativeElement.querySelector('pdk-error-summary');
    expect(errorSummary).toBeTruthy();
  });

  it('should handle back link navigation', () => {
    component.handleBackLink();
    expect(router.navigate).toHaveBeenCalledWith([ViewScheduleRoutes.VIEW]);
  });

  it('should call manageSessionsStore.updateSession with the provided formValues', () => {
    const formValues: EditSessionFormValues = {
      courtRoomId: mockCourtScheduleSession.courtRoomId,
      businessType: mockCourtScheduleSession.businessType,
      panel: mockCourtScheduleSession.panel,
      courtSession: mockCourtScheduleSession.courtSession,
      isOverbookingAllowed: mockCourtScheduleSession.isOverbookingAllowed
    };

    component.handleSubmitForm(formValues);

    expect(mockManageSessionsStore.updateSession).toHaveBeenCalledWith(
      jasmine.objectContaining({ formValues })
    );
  });

  it('should dispatch setViewBanner and navigate on update success', () => {
    const mockNgRxStore = TestBed.inject(MockStore);
    spyOn(mockNgRxStore, 'dispatch');

    mockManageSessionsStore.updateSession.and.callFake(({ onUpdateSuccess }: any) =>
      onUpdateSuccess('Room 1')
    );

    component.handleSubmitForm({} as EditSessionFormValues);

    expect(mockNgRxStore.dispatch).toHaveBeenCalledWith(
      ViewScheduleActions.setViewBanner({
        message: 'Sessions updated successfully',
        bannerType: 'success',
        courtRoomName: 'Room 1'
      })
    );
    expect(router.navigate).toHaveBeenCalledWith([CourtSchedulerRoutes.VIEW_SCHEDULE]);
  });

  it('should set inline error when update fails with status 400', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: JSON.stringify({ error: 'Slot conflict' })
    });
    mockManageSessionsStore.updateSession.and.callFake(({ onUpdateError }: any) =>
      onUpdateError(error)
    );

    component.handleSubmitForm({} as EditSessionFormValues);

    expect(component.errors()).toEqual([{ id: 'backendError', message: 'Slot conflict' }]);
  });

  it('should call handleError when update fails with non-400 status', () => {
    const error = new HttpErrorResponse({ status: 500 });
    mockManageSessionsStore.updateSession.and.callFake(({ onUpdateError }: any) =>
      onUpdateError(error)
    );

    component.handleSubmitForm({} as EditSessionFormValues);

    expect(mockManageSessionsStore.handleError).toHaveBeenCalledWith(error);
  });

  it('should show selected court and judiciary when jurisdiction is CROWN', () => {
    mockManageSessionsStore.sessions.set([
      { ...mockCourtScheduleSession, jurisdiction: JurisdictionType.CROWN }
    ]);
    fixture.detectChanges();

    const selectedCourtAndJudiciary = fixture.debugElement.nativeElement.querySelector(
      'selected-court-and-judiciary'
    );
    expect(selectedCourtAndJudiciary).toBeTruthy();
  });

  it('should not show selected court and judiciary when jurisdiction is not CROWN', () => {
    mockManageSessionsStore.sessions.set([
      { ...mockCourtScheduleSession, jurisdiction: JurisdictionType.MAGISTRATES }
    ]);
    fixture.detectChanges();

    const selectedCourtAndJudiciary = fixture.debugElement.nativeElement.querySelector(
      'selected-court-and-judiciary'
    );
    expect(selectedCourtAndJudiciary).toBeFalsy();
  });

  it('should open remove-all judiciary modal when handleRemoveAllJudiciary is called', () => {
    component.handleRemoveAllJudiciary();
    expect(modalOpenSpy).toHaveBeenCalledWith(RemoveJudiciaryModalComponent, {
      data: jasmine.any(Object),
      disposeOnBackDropClick: false
    });
  });

  it('should call clearJudiciarySelection and dispose overlay when modal confirm is invoked', fakeAsync(() => {
    component.handleRemoveAllJudiciary();
    lastModalData.confirm();
    tick();

    expect(mockManageSessionsStore.removeAllJudiciary).toHaveBeenCalled();
    expect(mockManageSessionsStore.clearJudiciarySelection).toHaveBeenCalled();
    expect(overlayDisposeSpy).toHaveBeenCalled();
  }));

  it('should dispose overlay without removing judiciary when modal cancel is invoked', () => {
    component.handleRemoveAllJudiciary();
    lastModalData.cancel();

    expect(overlayDisposeSpy).toHaveBeenCalled();
    expect(mockManageSessionsStore.removeAllJudiciary).not.toHaveBeenCalled();
  });

  it('should navigate to assign judiciary', () => {
    component.navigateToAssignJudiciary();

    expect(router.navigate).toHaveBeenCalledWith(
      [
        CourtSchedulerRoutes.VIEW_SCHEDULE,
        ViewScheduleRoutes.EDIT,
        CourtSchedulerRoutes.JUDICIARY_SESSION_ASSIGNMENT,
        JudiciarySessionAssignmentRoutes.ASSIGN
      ],
      jasmine.objectContaining({ queryParams: jasmine.any(Object) })
    );
  });

  it('should navigate to assign judiciary when session already has judiciaries', () => {
    mockManageSessionsStore.sessions.set([
      { ...mockCourtScheduleSession, judiciaries: [{ id: 'j1' } as ExtendedJudicialMember] }
    ]);

    component.navigateToAssignJudiciary();

    expect(router.navigate).toHaveBeenCalledWith(
      [
        CourtSchedulerRoutes.VIEW_SCHEDULE,
        ViewScheduleRoutes.EDIT,
        CourtSchedulerRoutes.JUDICIARY_SESSION_ASSIGNMENT,
        JudiciarySessionAssignmentRoutes.ASSIGN
      ],
      jasmine.objectContaining({ queryParams: jasmine.any(Object) })
    );
  });
});

@Component({
  selector: 'edit-sessions-form',
  template: `
    businessTypes: {{ businessTypes() }} courtCentres: {{ courtCentres() }} sessionToEdit:
    {{ sessionToEdit() }}
  `
})
class MockEditSessionComponent {
  readonly businessTypes = input<RotaBusinessType[]>([]);
  readonly courtCentres = input<CourtCentre[]>([]);
  readonly sessionToEdit = input<CourtScheduleSession>();
  readonly jurisdiction = input<JurisdictionType | null>();
}
