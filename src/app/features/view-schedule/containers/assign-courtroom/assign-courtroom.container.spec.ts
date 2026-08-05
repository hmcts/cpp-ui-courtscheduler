import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AssignCourtroomContainer } from './assign-courtroom.container';
import { ViewScheduleActions } from '../../state/actions';
import { mockCourtScheduleSession, mockMagistratesCourtCentre } from '../../../../shared';
import { ViewScheduleState } from '../../state/view-schedule.state';
import { SessionsListComponent } from '../../components/sessions-list/sessions-list.component';
import { AssignCourtroomFormComponent } from '../../components/assign-courtroom-form/assign-courtroom-form.component';
import { CourtScheduleSession } from '../../model/view-schedule.model';
import { ValidationError } from '@cpp/pdk';
import { CourtRoom } from '../../../../shared/model/court-centre';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('AssignCourtroomContainer', () => {
  let component: AssignCourtroomContainer;
  let fixture: ComponentFixture<AssignCourtroomContainer>;
  let mockStore: MockStore<ViewScheduleState>;
  let router: Router;

  const mockSessions: CourtScheduleSession[] = [
    {
      ...mockCourtScheduleSession,
      courtScheduleId: 'id-1',
      courtHouseId: mockMagistratesCourtCentre.id
    }
  ];

  const initialState = {
    viewSchedule: {
      sessionsToAssign: mockSessions,
      errors: [] as ValidationError[]
    },
    referenceData: {
      courtCentres: [mockMagistratesCourtCentre]
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCourtroomContainer],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                params: {}
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    })
      .overrideComponent(AssignCourtroomContainer, {
        remove: {
          imports: [SessionsListComponent, AssignCourtroomFormComponent]
        },
        add: {
          imports: [MockSessionsListComponent, MockAssignCourtroomFormComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AssignCourtroomContainer);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display error summary when there are errors', () => {
    component.errors = [
      {
        message: 'Error message',
        id: ''
      }
    ];
    fixture.detectChanges();

    const errorSummary = fixture.debugElement.query(By.css('pdk-error-summary'));
    expect(errorSummary).toBeTruthy();
  });

  it('should handle back link navigation', () => {
    component.handleBackLink();

    expect(router.navigate).toHaveBeenCalledWith(['..'], {
      relativeTo: TestBed.inject(ActivatedRoute)
    });
  });

  it('should handle errors correctly', () => {
    const errors = [{ message: 'Error message', id: '' }];
    component.handleErrors(errors);
    expect(component.errors).toEqual(errors);
  });

  it('should dispatch assignCourtroom action with correct payload', () => {
    spyOn(mockStore, 'dispatch');

    component.assignableSessions = mockSessions;
    component.submitAssignCourtroom('courtroom-1');

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ViewScheduleActions.assignCourtroom({
        sessionsToAssign: mockSessions,
        courtroomId: 'courtroom-1',
        courtRoomName: ''
      })
    );
  });

  it('should not dispatch action if courtroomId is empty', () => {
    spyOn(mockStore, 'dispatch');

    component.assignableSessions = mockSessions;
    component.submitAssignCourtroom('');

    expect(mockStore.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should not dispatch action if assignableSessions is empty', () => {
    spyOn(mockStore, 'dispatch');

    component.assignableSessions = [];
    component.submitAssignCourtroom('courtroom-1');

    expect(mockStore.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should clean up on ngOnDestroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalledWith(true);
    expect(component.destroy$.complete).toHaveBeenCalled();
  });

  it('should dispatch setErrors on ngOnInit', () => {
    spyOn(mockStore, 'dispatch');

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(ViewScheduleActions.setErrors({ errors: [] }));
  });

  it('should populate assignable sessions from store', () => {
    mockStore.setState({
      viewSchedule: {
        sessionsToAssign: mockSessions
      }
    } as ViewScheduleState);

    component.ngOnInit();

    expect(component.sessionsToAssign).toEqual(mockSessions);
  });
});

@Component({
  selector: 'sessions-list',
  template: `
    sessions: {{ sessions() }} removableSessions: {{ removableSessions() }} ineligibleWithHearings:
    {{ ineligibleWithHearings() }} ineligiblePastSessions:
    {{ ineligiblePastSessions() }} ineligibleAssigned: {{ ineligibleAssigned() }} isAssignView:
    {{ isAssignView() }}
  `
})
class MockSessionsListComponent {
  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly removableSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleWithHearings = input<CourtScheduleSession[]>([]);
  readonly ineligiblePastSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleAssigned = input<CourtScheduleSession[]>([]);
  readonly isAssignView = input<boolean>(false);
  readonly jurisdiction = input<JurisdictionType | null>(null);
}

@Component({
  selector: 'assign-courtroom-form',
  template: `
    sessionsToAssignTotal: {{ sessionsToAssignTotal() }} courtrooms:
    {{ courtrooms() }}
  `
})
class MockAssignCourtroomFormComponent {
  readonly sessionsToAssignTotal = input<number>(0);
  readonly courtrooms = input<CourtRoom[]>([]);
}
