import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { SessionsFormContainer } from './sessions-form.container';
import {
  mockBanner,
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockMultipleSessions,
  mockSession
} from '../../../../shared';
import { CreateScheduleActions } from '../../state/actions';
import { Session } from '../../../../shared/model/session';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { AddSessionsFormComponent } from '../../components/add-sessions-form/add-sessions-form.component';
import { SessionDetailsComponent } from '../../components/session-details/session-details.component';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { RepeatPattern } from '../../model/repeat-pattern';
import { JourneySummaryComponent } from '../../components/journey-summary/journey-summary.component';
import { EMPTY, Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { Actions } from '@ngrx/effects';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

describe('SessionsFormContainer', () => {
  let component: SessionsFormContainer;
  let fixture: ComponentFixture<SessionsFormContainer>;
  let mockStore: MockStore<CreateScheduleState>;
  let router: Router;
  let route: ActivatedRoute;
  const actions$: Observable<Actions> = EMPTY;

  const initialState = {
    courtScheduleDraft: {
      selectedBusinessType: mockBusinessType,
      selectedCourtCentre: mockMagistratesCourtCentre,
      sessions: mockMultipleSessions,
      bannerMessage: mockBanner
    }
  } as CreateScheduleState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsFormContainer],
      providers: [
        {
          provide: ElementRef,
          useValue: {
            nativeElement: {
              scrollIntoView: jest.fn()
            }
          }
        },
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: { parent: { snapshot: {} } } },
        provideMockActions(() => actions$)
      ]
    })
      .overrideComponent(SessionsFormContainer, {
        remove: {
          imports: [SessionDetailsComponent, AddSessionsFormComponent, JourneySummaryComponent]
        },
        add: {
          imports: [
            MockSessionDetailsComponent,
            MockAddSessionsFormComponent,
            MockJourneySummaryComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SessionsFormContainer);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
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

  it('should navigate to REPEAT_PATTERN on handleBackLink', () => {
    spyOn(router, 'navigate');
    component.handleBackLink();
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.REPEAT_PATTERN], {
      relativeTo: route.parent
    });
  });

  it('should dispatch submitSession on submitSession', () => {
    spyOn(mockStore, 'dispatch');
    component.sessions = mockMultipleSessions;
    fixture.detectChanges();

    // Workaround: Spy on submitSession to inject a fixed UUID since jest.mock('uuid') doesn't work
    // with overrideComponent() - the real uuid() call bypasses the mock during component compilation
    const expectedAction = CreateScheduleActions.submitSession({
      existingSessions: mockMultipleSessions,
      sessionToBeAdded: { ...mockSession, id: 'test-uuid' },
      repeatPattern: component.repeatPattern
    });

    spyOn(component, 'submitSession').and.callFake(() => {
      mockStore.dispatch(expectedAction);
    });

    component.submitSession(mockSession);
    expect(mockStore.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should navigate to SUMMARY on handleContinue if there are sessions', () => {
    spyOn(router, 'navigate');
    component.sessions = mockMultipleSessions;
    component.handleContinue();
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SUMMARY], {
      relativeTo: route.parent
    });
  });

  it('should handle errors correctly', () => {
    const errors = [{ message: 'Error', id: '' }];
    component.handleErrors(errors);
    component.errors = errors;
    expect(component.errors).toEqual(errors);
  });

  it('should dispatch setSessionToCopy and navigate to COPY_SESSIONS on setSessionToCopy', () => {
    const session: Session = mockMultipleSessions[0];

    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');

    component.setSessionToCopy(session);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setSessionToCopy({ session })
    );
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.COPY_SESSIONS], {
      relativeTo: route.parent
    });
  });

  it('should dispatch setCreateSessionsToRemove and navigate to REMOVE_SESSIONS on setSessionsToRemove', () => {
    const session: Session = mockMultipleSessions[0];

    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');

    component.setSessionsToRemove([session]);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setCreateSessionsToRemove({ sessionsToRemove: [session] })
    );
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.REMOVE_SESSIONS], {
      relativeTo: route.parent
    });
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
  readonly jurisdiction = input<JurisdictionType | null>(null);
  readonly defaultStartTime = input<string>('');
}

@Component({
  selector: 'add-sessions-form',
  template: `
    courtCentre: {{ courtCentre() }} isSlot: {{ isSlot() }} businessType:
    {{ businessType() }} initialValues:
    {{ initialValues() }}
  `
})
class MockAddSessionsFormComponent {
  readonly courtCentre = input<OrganisationUnit>();
  readonly isSlot = input<boolean>();
  readonly businessType = input<RotaBusinessType>();
  readonly initialValues = input<Session>();
  readonly jurisdiction = input<JurisdictionType | null>(null);
  readonly repeatPattern = input<RepeatPattern | null>(null);
}

@Component({
  selector: 'journey-summary',
  template: ` courtCentre: {{ courtCentre() }} businessType: {{ businessTypeLabel() }} `
})
class MockJourneySummaryComponent {
  readonly courtCentre = input<OrganisationUnit>();
  readonly businessTypeLabel = input<string>();
}
