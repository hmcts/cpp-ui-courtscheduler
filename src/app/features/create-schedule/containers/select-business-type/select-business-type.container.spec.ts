import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RotaBusinessTypeCode } from '@cpp/reference-data';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  mockBusinessType,
  mockCrownBusinessTypes,
  mockCrownCourtCentre,
  mockMagistratesBusinessTypes,
  mockMagistratesCourtCentre
} from '../../../../shared';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { CreateScheduleActions } from '../../state/actions';
import { SelectBusinessTypeContainer } from './select-business-type.container';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('SelectBusinessTypeContainer', () => {
  let component: SelectBusinessTypeContainer;
  let fixture: ComponentFixture<SelectBusinessTypeContainer>;
  let router: Router;
  let route: ActivatedRoute;
  let store: MockStore<CreateScheduleState>;

  const mockState: CreateScheduleState = {
    courtScheduleDraft: {
      selectedCourtCentre: mockMagistratesCourtCentre,
      selectedBusinessType: mockBusinessType,
      sessions: [],
      repeatPattern: null,
      isPersisted: false,
      errors: [],
      jurisdiction: JurisdictionType.MAGISTRATES
    },
    referenceData: {
      rotaBusinessTypes: mockMagistratesBusinessTypes
    }
  } as unknown as CreateScheduleState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBusinessTypeContainer],
      providers: [
        provideMockStore({
          initialState: mockState
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
    }).compileComponents();

    fixture = TestBed.createComponent(SelectBusinessTypeContainer);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    store = TestBed.inject(MockStore);

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

    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SELECT_COURT], {
      relativeTo: route.parent
    });
  });

  it('should dispatch clearSessions and setBusinessType when business type changes', () => {
    const newBusinessType = {
      ...mockMagistratesBusinessTypes[0],
      typeCode: '002' as RotaBusinessTypeCode,
      typeDescription: 'Magistrates Business Type 2'
    };

    spyOn(store, 'dispatch');
    spyOn(router, 'navigate');

    store.setState({
      ...mockState,
      referenceData: {
        rotaBusinessTypes: [...mockMagistratesBusinessTypes, newBusinessType]
      },
      courtScheduleDraft: {
        ...mockState.courtScheduleDraft,
        selectedBusinessType: mockMagistratesBusinessTypes[0]
      }
    });
    fixture.detectChanges();

    component.submitBusinessType(newBusinessType.typeCode);

    expect(store.dispatch).toHaveBeenCalledWith(CreateScheduleActions.clearSessions());
    expect(store.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setBusinessType({ businessType: newBusinessType })
    );
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.REPEAT_PATTERN], {
      relativeTo: route.parent
    });
  });

  it('should not dispatch actions when business type has not changed', () => {
    spyOn(store, 'dispatch');
    spyOn(router, 'navigate');

    store.setState({
      ...mockState,
      courtScheduleDraft: {
        ...mockState.courtScheduleDraft,
        selectedBusinessType: mockMagistratesBusinessTypes[0]
      }
    });
    fixture.detectChanges();

    component.submitBusinessType(mockMagistratesBusinessTypes[0].typeCode);

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.REPEAT_PATTERN], {
      relativeTo: route.parent
    });
  });

  it('should select magistrates business types when jurisdiction is MAGISTRATES', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should select crown business types when jurisdiction is CROWN', () => {
    store.setState({
      ...mockState,
      referenceData: {
        rotaBusinessTypes: mockCrownBusinessTypes
      },
      courtScheduleDraft: {
        ...mockState.courtScheduleDraft,
        selectedCourtCentre: mockCrownCourtCentre,
        jurisdiction: JurisdictionType.CROWN
      }
    });
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
