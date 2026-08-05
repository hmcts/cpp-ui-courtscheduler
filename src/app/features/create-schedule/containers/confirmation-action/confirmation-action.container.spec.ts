import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationActionContainer } from './confirmation-action.container';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { mockCourtScheduleDraft } from '../../../../shared';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('ConfirmationActionContainer', () => {
  let component: ConfirmationActionContainer;
  let fixture: ComponentFixture<ConfirmationActionContainer>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationActionContainer],
      providers: [
        provideMockStore({
          initialState: {
            courtScheduleDraft: {
              ...mockCourtScheduleDraft,
              jurisdiction: JurisdictionType.CROWN
            }
          } as CreateScheduleState
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationActionContainer);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display success panel with Sessions added successfully and message', () => {
    const panel = fixture.debugElement.query(By.css('pdk-panel[type="confirmation"]'));
    expect(panel).toBeTruthy();
    expect(panel.nativeElement.textContent).toContain('Sessions added successfully');
    expect(panel.nativeElement.textContent).toContain(
      'Sessions added to L3 Name for Business Type 1'
    );
  });

  it('should display Create new sessions button', () => {
    const button = fixture.debugElement.query(
      By.css('button[data-test-id="create-new-sessions-button"]')
    );
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent?.trim()).toBe('Create new sessions');
  });

  it('should navigate to SELECT_BUSINESS_TYPE when handleCreateNewSessions is called', () => {
    spyOn(router, 'navigate');
    component.handleCreateNewSessions();
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: component['route'].parent
    });
  });
});
