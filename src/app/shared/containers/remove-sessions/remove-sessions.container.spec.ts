import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from '../../../core/reducers';
import { ActivatedRoute, Router } from '@angular/router';
import {
  mockCourtScheduleSession,
  mockMagistratesCourtCentre,
  mockMultipleRotaBusinessTypes,
  mockSession
} from '../../mocks/mocks';
import { Component, input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RemoveSessionsContainer } from './remove-sessions.container';
import { ViewScheduleActions } from '../../../features/view-schedule/state/actions';
import { CreateScheduleActions } from '../../../features/create-schedule/state/actions';
import { Location } from '@angular/common';
import { getYesterday } from '../../utils/date-utils';
import { ViewScheduleState } from '../../../features/view-schedule/state/view-schedule.state';
import { SessionDetailsComponent } from '../../../features/create-schedule/components/session-details/session-details.component';
import { SessionsListComponent } from '../../../features/view-schedule/components/sessions-list/sessions-list.component';
import { RemoveSessionsFormComponent } from '../../components/remove-sessions-form/remove-sessions-form.component';
import { CourtScheduleSession } from '../../../features/view-schedule/model/view-schedule.model';
import { Session } from '../../model/session';
import { JurisdictionType } from '../../model/jurisdiction';

describe('RemoveSessionsContainer', () => {
  let component: RemoveSessionsContainer;
  let fixture: ComponentFixture<RemoveSessionsContainer>;
  let mockStore: MockStore<AppState>;
  let router: Router;
  let location: Location;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockActivatedRoute = {
      parent: {
        snapshot: {
          params: {}
        }
      },
      snapshot: {
        data: { isCreateJourney: true, isViewJourney: false }
      }
    };

    await TestBed.configureTestingModule({
      imports: [RemoveSessionsContainer],
      providers: [
        provideMockStore({
          initialState: {
            courtScheduleDraft: {
              sessionsToRemove: [mockSession],
              selectedCourtCentre: mockMagistratesCourtCentre
            },
            viewSchedule: {},
            referenceData: {
              rotaBusinessTypes: mockMultipleRotaBusinessTypes
            }
          }
        }),
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: Location,
          useValue: {
            back: jasmine.createSpy('back')
          }
        }
      ]
    })
      .overrideComponent(RemoveSessionsContainer, {
        remove: {
          imports: [SessionDetailsComponent, SessionsListComponent, RemoveSessionsFormComponent]
        },
        add: {
          imports: [
            MockSessionDetailsComponent,
            MockSessionsListComponent,
            MockRemoveSessionsFormComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RemoveSessionsContainer);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture.detectChanges();
  });

  it('should create create journey', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should create view journey', () => {
    mockActivatedRoute.snapshot.data = { isCreateJourney: false, isViewJourney: true };
    component.isViewJourney = true;
    component.isCreateJourney = false;
    fixture.detectChanges();

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

  it('should handle back link navigation on CREATE journey', () => {
    spyOn(router, 'navigate');

    component.handleBackLink();

    expect(location.back).toHaveBeenCalled();
  });

  it('should handle back link navigation on VIEW journey', () => {
    spyOn(router, 'navigate');
    mockActivatedRoute.snapshot.data = { isCreateJourney: false, isViewJourney: true };
    component.isViewJourney = true;
    component.isCreateJourney = false;

    component.handleBackLink();

    expect(location.back).toHaveBeenCalled();
  });

  it('should handle errors correctly', () => {
    const errors = [{ message: 'Error message', id: '' }];
    component.handleErrors(errors);
    expect(component.errors).toEqual(errors);
  });

  it('should clean up on ngOnDestroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');
    spyOn(mockStore, 'dispatch');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalledWith(true);
    expect(component.destroy$.complete).toHaveBeenCalled();
  });

  it('should dispatch removeSessions action for CourtScheduleSession', () => {
    spyOn(router, 'navigate');
    spyOn(mockStore, 'dispatch');

    component.isViewJourney = true;
    component.isCreateJourney = false;
    component.sessionsToRemove = [mockCourtScheduleSession];
    component.removableSessions = [mockCourtScheduleSession];

    component.submitRemoveSessions(true);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ViewScheduleActions.removeSessions({ sessionsToRemove: [mockCourtScheduleSession] })
    );
  });

  it('should dispatch removeSession action for Session', () => {
    spyOn(router, 'navigate');
    spyOn(mockStore, 'dispatch');

    component.isCreateJourney = true;
    component.isViewJourney = false;
    component.sessionsToRemove = [mockSession];

    component.submitRemoveSessions(true);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.removeSession({ sessions: [mockSession] })
    );
  });

  it('should not dispatch any action and navigate if removeConfirmation is false', () => {
    spyOn(router, 'navigate');
    spyOn(mockStore, 'dispatch');

    component.submitRemoveSessions(false);

    expect(mockStore.dispatch).not.toHaveBeenCalled();
    expect(location.back).toHaveBeenCalled();
  });

  it('should populate removable, non removable and past sessions', () => {
    mockActivatedRoute.snapshot.data = { isCreateJourney: false, isViewJourney: true };
    component.isViewJourney = true;
    component.isCreateJourney = false;

    mockStore.setState({
      viewSchedule: {
        sessionsToRemove: [
          {
            courtScheduleId: 'id-1',
            slotBased: true,
            totalBooked: 0,
            sessionDate: new Date().toDateString()
          },
          {
            courtScheduleId: 'id-2',
            slotBased: true,
            totalBooked: 1
          },
          {
            courtScheduleId: 'id-3',
            slotBased: true,
            totalBooked: 0,
            sessionDate: getYesterday().toDateString()
          }
        ]
      }
    } as ViewScheduleState);

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});

@Component({
  selector: 'session-details',
  template: `
    sessions: {{ sessions() }} isSlot: {{ isSlot() }} isSummary: {{ isSummary() }} actionsEnabled:
    {{ actionsEnabled() }}
  `
})
class MockSessionDetailsComponent {
  readonly sessions = input<Session[]>([]);
  readonly isSlot = input<boolean>();
  readonly isSummary = input<boolean>(false);
  readonly actionsEnabled = input<boolean>(false);
}

@Component({
  selector: 'sessions-list',
  template: `
    sessions: {{ sessions() }} removableSessions: {{ removableSessions() }} ineligibleWithHearings:
    {{ ineligibleWithHearings() }} ineligiblePastSessions:
    {{ ineligiblePastSessions() }} isDeleteView: {{ isDeleteView() }} isEditView: {{ isEditView() }}
  `
})
class MockSessionsListComponent {
  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly removableSessions = input<CourtScheduleSession[]>([]);
  readonly ineligibleWithHearings = input<CourtScheduleSession[]>([]);
  readonly ineligiblePastSessions = input<CourtScheduleSession[]>([]);
  readonly isDeleteView = input<boolean>(false);
  readonly isEditView = input<boolean>(false);
  readonly jurisdiction = input<JurisdictionType | null>(null);
}

@Component({
  selector: 'remove-sessions-form',
  template: ` sessionsToRemoveTotal: {{ sessionsToRemoveTotal() }} `
})
class MockRemoveSessionsFormComponent {
  readonly sessionsToRemoveTotal = input<number>(0);
}
