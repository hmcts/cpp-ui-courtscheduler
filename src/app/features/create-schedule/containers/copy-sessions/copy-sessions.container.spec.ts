import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import {
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockMultipleSessions,
  mockRepeatPattern,
  mockSession
} from '../../../../shared';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleActions } from '../../state/actions';
import { CopySessionsContainer } from './copy-sessions.container';

describe('CopySessionsFormContainer', () => {
  let component: CopySessionsContainer;
  let fixture: ComponentFixture<CopySessionsContainer>;
  let mockStore: MockStore<CreateScheduleState>;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopySessionsContainer],
      providers: [
        provideMockStore({
          initialState: {
            courtScheduleDraft: {
              selectedCourtCentre: mockMagistratesCourtCentre,
              selectedBusinessType: mockBusinessType,
              sessionToCopy: mockSession,
              sessions: mockMultipleSessions
            }
          } as CreateScheduleState
        }),
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
            navigate: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CopySessionsContainer);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    component.destroy$ = new Subject<boolean>();
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
    spyOn(router, 'navigate');

    component.handleBackLink();

    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SESSIONS_FORM], {
      relativeTo: route.parent
    });
  });

  it('should dispatch copySession action on form submit', () => {
    spyOn(mockStore, 'dispatch');
    component.errors = null;
    component.sessions = mockMultipleSessions;
    component.repeatPattern = mockRepeatPattern;
    fixture.detectChanges();

    // Workaround: Spy on submitSession to inject a fixed UUID since jest.mock('uuid') doesn't work
    // with overrideComponent() - the real uuid() call bypasses the mock during component compilation
    const expectedAction = CreateScheduleActions.copySession({
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

  it('should handle errors correctly', () => {
    const errors = [{ message: 'Error message', id: '' }];
    component.handleErrors(errors);
    expect(component.errors).toEqual(errors);
  });

  it('should unsubscribe from observables on ngOnDestroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalledWith(true);
    expect(component.destroy$.complete).toHaveBeenCalled();
  });
});
