import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Component, input } from '@angular/core';
import { ViewScheduleState } from '../../state/view-schedule.state';
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
import { ViewScheduleActions } from '../../state/actions';
import { RotaBusinessType } from '@cpp/reference-data';
import { CourtScheduleSession } from '../../model/view-schedule.model';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('EditSessionContainer', () => {
  let component: EditSessionContainer;
  let fixture: ComponentFixture<EditSessionContainer>;
  let router: Router;
  let store: MockStore<ViewScheduleState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [EditSessionContainer],
      providers: [
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
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
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
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error summary when there are errors', () => {
    component.errors = [
      {
        message: 'Error message',
        id: ''
      }
    ];
    fixture.detectChanges();

    const errorSummary = fixture.debugElement.nativeElement.querySelector('pdk-error-summary');
    expect(errorSummary).toBeTruthy();
  });

  it('should handle back link navigation', () => {
    component.handleBackLink();
    expect(router.navigate).toHaveBeenCalledWith([ViewScheduleRoutes.VIEW]);
  });

  it('should dispatch updateSession action', () => {
    spyOn(store, 'dispatch');
    const session = { ...mockCourtScheduleSession };

    component.handleSubmitForm(session);

    expect(store.dispatch).toHaveBeenCalledWith(ViewScheduleActions.updateSession({ session }));
  });

  it('should clean up on ngOnDestroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalledWith(true);
    expect(component.destroy$.complete).toHaveBeenCalled();
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
