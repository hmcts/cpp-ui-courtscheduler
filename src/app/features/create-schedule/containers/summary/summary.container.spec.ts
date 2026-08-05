import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';
import { SummaryContainer } from './summary.container';
import { By } from '@angular/platform-browser';
import { mockCourtScheduleDraft } from '../../../../shared';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleActions } from '../../state/actions';
import { CreateScheduleState } from '../../state/create-schedule.state';

describe('SummaryContainer', () => {
  let component: SummaryContainer;
  let fixture: ComponentFixture<SummaryContainer>;
  let mockStore: MockStore<CreateScheduleState>;
  let router: Router;
  let route: ActivatedRoute;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryContainer],
      providers: [
        provideMockStore({
          initialState: {
            courtScheduleDraft: mockCourtScheduleDraft
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
          provide: Location,
          useValue: {
            back: jasmine.createSpy('back')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryContainer);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    location = TestBed.inject(Location);
    component.destroy$ = new Subject<boolean>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display the back link when not persisted', () => {
    component.isPersisted = false;
    fixture.detectChanges();

    const backLink = fixture.debugElement.query(By.css('a[pdk-back-link]'));
    expect(backLink).toBeTruthy();
  });

  it('should handle back link navigation', () => {
    component.handleBackLink();
    expect(location.back).toHaveBeenCalled();
  });

  it('should navigate to the given route when handleNavigation is called', () => {
    spyOn(router, 'navigate');
    spyOn(component, 'handleNavigation').and.callThrough();

    const route = CreateScheduleRoutes.SUMMARY;
    component.handleNavigation(route);

    expect(router.navigate).toHaveBeenCalledWith([route], {
      relativeTo: component['route'].parent
    });
  });

  it('should display a success alert when sessions are persisted', () => {
    component.isPersisted = true;
    fixture.detectChanges();

    const successAlert = fixture.debugElement.query(By.css('pdk-alert[type="success"]'));
    expect(successAlert).toBeTruthy();
  });

  it('should dispatch createCourtSchedule action when handleContinue is called', () => {
    spyOn(mockStore, 'dispatch');

    component.handleContinue();

    expect(mockStore.dispatch).toHaveBeenCalledWith(CreateScheduleActions.createCourtSchedule());
  });

  it('should navigate when handleNewSessionsNavigation is called', () => {
    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');

    component.handleNewSessionsNavigation();

    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: route.parent
    });
  });

  it('should unsubscribe from observables on ngOnDestroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalledWith(true);
    expect(component.destroy$.complete).toHaveBeenCalled();
  });
});
