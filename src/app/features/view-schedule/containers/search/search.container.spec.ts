import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ViewScheduleActions } from '../../state/actions';
import { SearchFormComponent } from '../../components/search-form/search-form.component';
import { CourtroomListComponent } from '../../components/courtroom-list/courtroom-list.component';
import {
  CourtCentre,
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockCourtScheduleResponse,
  mockCourtScheduleSession,
  mockSearchFormValues
} from '../../../../shared';
import { By } from '@angular/platform-browser';
import { SearchContainer } from './search.container';
import { ViewScheduleRoutes } from '../../view-schedule.routes';
import { Component, input, output } from '@angular/core';
import { RotaBusinessType } from '@cpp/reference-data';
import {
  BulkActionType,
  BulkActionPayload,
  CourtSchedule,
  SearchFormValues
} from '../../model/view-schedule.model';
import { BannerMessage } from '../../../../shared/model/banner-message';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('SearchContainer', () => {
  let component: SearchContainer;
  let fixture: ComponentFixture<SearchContainer>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let router: Router;
  let route: ActivatedRoute;

  const initialState = {
    referenceData: {
      courtCentres: [mockMagistratesCourtCentre],
      rotaBusinessTypes: [mockBusinessType]
    },
    viewSchedule: {
      courtSchedules: mockCourtScheduleResponse.courtSchedules,
      searchValues: mockSearchFormValues
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchContainer],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: { parent: { snapshot: {} } } },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
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
      .overrideComponent(SearchContainer, {
        remove: { imports: [SearchFormComponent, CourtroomListComponent] },
        add: { imports: [MockSearchFormComponent, MockCourtroomListComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchContainer);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

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

    const errorSummary = fixture.debugElement.query(By.css('pdk-error-summary'));
    expect(errorSummary).toBeTruthy();
  });

  it('should dispatch searchSchedules action on searchValues', () => {
    const searchFormValues = mockSearchFormValues;

    component.searchValues(searchFormValues);
    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.searchSchedules({ searchFormValues })
    );
  });

  it('should display the correct number of sessions', () => {
    const insetText = fixture.debugElement.query(
      By.css('pdk-inset-text[data-test-id="totalSessions"]')
    ).nativeElement;
    expect(insetText.textContent).toContain('4 session(s) found');
  });

  it('should dispatch setViewSessionsToRemove action and navigate to remove route on handleBulkAction with remove action', () => {
    const sessionsToRemove = [mockCourtScheduleSession];
    const payload: BulkActionPayload = {
      action: BulkActionType.REMOVE,
      sessions: sessionsToRemove
    };
    component.handleBulkAction(payload);
    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.setViewSessionsToRemove({ sessionsToRemove })
    );
    expect(router.navigate).toHaveBeenCalledWith([ViewScheduleRoutes.REMOVE_SESSIONS], {
      relativeTo: route.parent
    });
  });

  it('should dispatch setViewSessionsToAssign action and navigate to assign courtroom route on handleBulkAction with assign action', () => {
    const sessionsToAssign = [mockCourtScheduleSession];
    const payload: BulkActionPayload = {
      action: BulkActionType.ASSIGN,
      sessions: sessionsToAssign
    };
    component.handleBulkAction(payload);
    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.setViewSessionsToAssign({ sessionsToAssign })
    );
    expect(router.navigate).toHaveBeenCalledWith([ViewScheduleRoutes.ASSIGN_COURTROOM], {
      relativeTo: route.parent
    });
  });

  it('should dispatch setSessionToEdit action and navigate to edit route on handleEdit', () => {
    const session = { ...mockCourtScheduleSession };
    component.handleEdit(session);
    expect(dispatchSpy).toHaveBeenCalledWith(ViewScheduleActions.setSessionToEdit({ session }));
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should dispatch setActiveCourtroomsIndexes action on handleActiveCourtroomsIndexes', () => {
    const activeCourtroomsIndexes = [1];
    component.handleActiveCourtroomsIndexes([1]);
    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.setActiveCourtroomsIndexes({ activeCourtroomsIndexes })
    );
  });

  it('should dispatch setJurisdiction action when jurisdiction is set to MAGISTRATES', () => {
    component.handleJurisdictionChange(JurisdictionType.MAGISTRATES);

    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.setJurisdiction({ jurisdiction: JurisdictionType.MAGISTRATES })
    );
  });

  it('should dispatch setJurisdiction action when jurisdiction is set to CROWN', () => {
    component.handleJurisdictionChange(JurisdictionType.CROWN);

    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.setJurisdiction({ jurisdiction: JurisdictionType.CROWN })
    );
  });

  it('should dispatch setJurisdiction action when jurisdiction is cleared', () => {
    store.setState({
      ...initialState,
      viewSchedule: {
        ...initialState.viewSchedule,
        jurisdiction: JurisdictionType.MAGISTRATES
      }
    });
    fixture.detectChanges();

    component.handleJurisdictionChange(null);

    expect(dispatchSpy).toHaveBeenCalledWith(
      ViewScheduleActions.setJurisdiction({ jurisdiction: null })
    );
  });
});

@Component({
  selector: 'search-form',
  template: `
    rotaBusinessTypes: {{ rotaBusinessTypes() }} courtCentres: {{ courtCentres() }} initialValues:
    {{ initialValues() }} jurisdiction: {{ jurisdiction() }}
  `
})
class MockSearchFormComponent {
  readonly courtCentres = input<CourtCentre[]>();
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly initialValues = input<SearchFormValues>();
  readonly jurisdiction = input<JurisdictionType | null>();
  readonly jurisdictionChange = output<JurisdictionType | null>();
  readonly errors = output<any>();
  readonly submitForm = output<SearchFormValues>();
}

@Component({
  selector: 'courtroom-list',
  template: `
    courtSchedules: {{ courtSchedules() }} bannerMessage:
    {{ bannerMessage() }} activeCourtroomsIndexes:
    {{ activeCourtroomsIndexes() }}
  `
})
class MockCourtroomListComponent {
  readonly courtSchedules = input<CourtSchedule[]>([]);
  readonly bannerMessage = input<BannerMessage>();
  readonly activeCourtroomsIndexes = input<number[]>([]);
  readonly jurisdiction = input<JurisdictionType | null>(null);
}
