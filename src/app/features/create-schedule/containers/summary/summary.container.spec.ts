import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
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
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display the back link', () => {
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

  it('should dispatch createCourtSchedule action when handleContinue is called', () => {
    spyOn(mockStore, 'dispatch');

    component.handleContinue();

    expect(mockStore.dispatch).toHaveBeenCalledWith(CreateScheduleActions.createCourtSchedule());
  });
});
