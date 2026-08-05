import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganisationUnit } from '@cpp/reference-data';
import { By } from '@angular/platform-browser';
import { SelectCourtContainer } from './select-court.container';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockMagistratesCourtCentre, mockCrownCourt } from '../../../../shared';
import { CreateScheduleActions } from '../../state/actions';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { Component, input, output } from '@angular/core';
import { SelectCourtFormComponent } from '../../components/select-court-form/select-court-form.component';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('SelectCourtContainer', () => {
  let component: SelectCourtContainer;
  let fixture: ComponentFixture<SelectCourtContainer>;
  let mockStore: MockStore<CreateScheduleState>;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCourtContainer],
      providers: [
        provideMockStore({
          initialState: {
            courtScheduleDraft: {}
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
        }
      ]
    })
      .overrideComponent(SelectCourtContainer, {
        remove: { imports: [SelectCourtFormComponent] },
        add: { imports: [MockSelectCourtFormComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SelectCourtContainer);
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

  it('should dispatch setCourtCentre action and navigate to SELECT_BUSINESS_TYPE on form submit', () => {
    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');

    component.submitCourtCentre(mockMagistratesCourtCentre);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setCourtCentre({ courtCentre: mockMagistratesCourtCentre })
    );

    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: route.parent
    });
  });

  it('should dispatch setCourtCentre action and navigate to SELECT_BUSINESS_TYPE on crown court form submit', () => {
    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');

    component.submitCourtCentre(mockCrownCourt);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setCourtCentre({ courtCentre: mockCrownCourt })
    );

    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: route.parent
    });
  });

  it('should dispatch setJurisdiction action when jurisdiction is set to MAGISTRATES', () => {
    spyOn(mockStore, 'dispatch');

    component.handleJurisdictionChange(JurisdictionType.MAGISTRATES);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setJurisdiction({ jurisdiction: JurisdictionType.MAGISTRATES })
    );
  });

  it('should dispatch setJurisdiction action when jurisdiction is set to CROWN', () => {
    spyOn(mockStore, 'dispatch');

    component.handleJurisdictionChange(JurisdictionType.CROWN);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setJurisdiction({ jurisdiction: JurisdictionType.CROWN })
    );
  });

  it('should dispatch setJurisdiction action even when jurisdiction is set to the same value', () => {
    spyOn(mockStore, 'dispatch');

    mockStore.setState({
      courtScheduleDraft: {
        jurisdiction: JurisdictionType.MAGISTRATES
      }
    } as CreateScheduleState);
    fixture.detectChanges();

    component.handleJurisdictionChange(JurisdictionType.MAGISTRATES);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setJurisdiction({ jurisdiction: JurisdictionType.MAGISTRATES })
    );
  });
});
@Component({
  selector: 'select-court-form',
  template: ` courtCentre: {{ courtCentre() }} jurisdiction: {{ jurisdiction() }} `
})
class MockSelectCourtFormComponent {
  readonly courtCentre = input<OrganisationUnit>();
  readonly jurisdiction = input<JurisdictionType | null>();
  readonly jurisdictionChange = output<JurisdictionType | null>();
  readonly errors = output<any>();
  readonly courtCentreChange = output<OrganisationUnit>();
}
