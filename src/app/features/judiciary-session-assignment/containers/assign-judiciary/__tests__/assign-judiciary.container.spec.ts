import { Location } from '@angular/common';
import { Component, input, output, signal, WritableSignal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ValidationError } from '@cpp/pdk';
import { JudiciaryTypePayload } from '@cpp/reference-data';
import { AssignJudiciaryContainer } from '../assign-judiciary.container';
import { AssignJudiciaryFormComponent } from '../../../components/assign-judiciary-form/assign-judiciary-form.component';
import { JudiciarySessionAssignmentService } from '../../../services/judiciary-session-assignment.service';
import { ManageSessionsStore } from '../../../../view-schedule/store/manage-sessions.store';
import { ViewScheduleActions } from '../../../../view-schedule/state/actions';
import { JudiciarySelectionValue, JudiciarySelectionSuggestion } from '../../../../../shared';

@Component({
  selector: 'assign-judiciary-form',
  template: ''
})
class MockAssignJudiciaryFormComponent {
  readonly initialValues = input<any>();
  readonly suggestionsResource = input<JudiciarySelectionSuggestion>();
  readonly submitForm = output<JudiciarySelectionValue>();
  readonly cancel = output<void>();
  readonly errors = output<ValidationError[] | null>();
  readonly onQueryJudiciaries = output<{ type: JudiciaryTypePayload | null; searchText: string }>();
}

describe('AssignJudiciaryContainer', () => {
  let component: AssignJudiciaryContainer;
  let fixture: ComponentFixture<AssignJudiciaryContainer>;
  let mockManageSessionsStore: any;
  let mockRouter: { navigate: jest.Mock; navigateByUrl: jest.Mock };
  let mockLocation: { back: jest.Mock };
  let mockNgRxStore: MockStore;

  beforeEach(async () => {
    mockManageSessionsStore = {
      setReferrer: jest.fn(),
      selectedJudiciaryByTypeMap: signal(null),
      selectedJudiciaryTypes: signal([]),
      selectedSessionIds: signal([]),
      assignJudiciary: jest.fn(),
      referrer: signal<string | null>(null),
      courtRoomNames: signal<string[]>([]),
      clearState: jest.fn(),
      clearJudiciarySelection: jest.fn()
    };

    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() };
    mockLocation = { back: jest.fn() };

    await TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: ManageSessionsStore, useValue: mockManageSessionsStore },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
        {
          provide: JudiciarySessionAssignmentService,
          useValue: { getAvailableJudiciaries: jest.fn() }
        }
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    TestBed.overrideComponent(AssignJudiciaryContainer, {
      remove: { imports: [AssignJudiciaryFormComponent] },
      add: { imports: [MockAssignJudiciaryFormComponent] }
    });

    mockNgRxStore = TestBed.inject(Store) as MockStore;
    fixture = TestBed.createComponent(AssignJudiciaryContainer);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    expect.assertions(1);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  describe('handleSubmit', () => {
    it('should call store.assignJudiciary with the submitted value', () => {
      expect.assertions(1);
      const mockValue: JudiciarySelectionValue = { Judge: null, Recorder: null, Magistrate: [] };

      component.handleSubmit(mockValue);

      expect(mockManageSessionsStore.assignJudiciary).toHaveBeenCalledWith({
        value: mockValue,
        onAssignSuccess: expect.any(Function)
      });
    });

    it('should dispatch setViewBanner, navigate to referrer, and clear state on success with referrer', () => {
      expect.assertions(4);
      const dispatchSpy = jest.spyOn(mockNgRxStore, 'dispatch');

      (mockManageSessionsStore.referrer as WritableSignal<string | null>).set('view-schedule');
      (mockManageSessionsStore.courtRoomNames as WritableSignal<string[]>).set(['Room 1']);
      mockManageSessionsStore.assignJudiciary.mockImplementation(({ onAssignSuccess }: any) =>
        onAssignSuccess()
      );

      component.handleSubmit({} as JudiciarySelectionValue);

      expect(dispatchSpy).toHaveBeenCalledWith(
        ViewScheduleActions.setViewBanner({
          message: 'Judiciary assigned successfully, sessions updated.',
          bannerType: 'success',
          courtRoomName: 'Room 1'
        })
      );
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/view-schedule');
      expect(mockLocation.back).not.toHaveBeenCalled();
      expect(mockManageSessionsStore.clearState).toHaveBeenCalled();
    });

    it('should dispatch setViewBanner, call location.back, and clear state on success without referrer', () => {
      expect.assertions(4);
      const dispatchSpy = jest.spyOn(mockNgRxStore, 'dispatch');

      (mockManageSessionsStore.referrer as WritableSignal<string | null>).set(null);
      (mockManageSessionsStore.courtRoomNames as WritableSignal<string[]>).set(['Room 2']);
      mockManageSessionsStore.assignJudiciary.mockImplementation(({ onAssignSuccess }: any) =>
        onAssignSuccess()
      );

      component.handleSubmit({} as JudiciarySelectionValue);

      expect(dispatchSpy).toHaveBeenCalledWith(
        ViewScheduleActions.setViewBanner({
          message: 'Judiciary assigned successfully, sessions updated.',
          bannerType: 'success',
          courtRoomName: 'Room 2'
        })
      );
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockLocation.back).toHaveBeenCalled();
      expect(mockManageSessionsStore.clearState).toHaveBeenCalled();
    });
  });

  describe('handleCancel', () => {
    it('should clear judiciary selection and navigate back', () => {
      expect.assertions(2);

      component.handleCancel();

      expect(mockManageSessionsStore.clearJudiciarySelection).toHaveBeenCalled();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('handleBackLink', () => {
    it('should clear judiciary selection and navigate back', () => {
      expect.assertions(2);

      component.handleBackLink();

      expect(mockManageSessionsStore.clearJudiciarySelection).toHaveBeenCalled();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('referrer input effect', () => {
    it('should call setReferrer when referrer input is set', () => {
      expect.assertions(1);

      fixture.componentRef.setInput('referrer', 'test-referrer');
      fixture.detectChanges();

      expect(mockManageSessionsStore.setReferrer).toHaveBeenCalledWith('test-referrer');
    });

    it('should not call setReferrer when referrer input is undefined', () => {
      expect.assertions(1);

      fixture.componentRef.setInput('referrer', undefined);
      fixture.detectChanges();

      expect(mockManageSessionsStore.setReferrer).not.toHaveBeenCalled();
    });
  });

  describe('initialValues computed', () => {
    it('should return judiciary selection and types from store', () => {
      expect.assertions(1);
      const mockJudiciaryMap: JudiciarySelectionValue = { Judge: null, Recorder: null };
      const mockSelectedTypes: (keyof JudiciarySelectionValue)[] = ['Judge', 'Recorder'];

      (mockManageSessionsStore.selectedJudiciaryByTypeMap as WritableSignal<any>).set(
        mockJudiciaryMap
      );
      (mockManageSessionsStore.selectedJudiciaryTypes as WritableSignal<any>).set(
        mockSelectedTypes
      );

      expect(component.initialValues()).toEqual({
        judiciarySelection: mockJudiciaryMap,
        selectedJudiciaryTypes: mockSelectedTypes
      });
    });

    it('should default selectedJudiciaryTypes to empty array when store returns null', () => {
      expect.assertions(1);

      (mockManageSessionsStore.selectedJudiciaryTypes as WritableSignal<any>).set(null);

      expect(component.initialValues().selectedJudiciaryTypes).toEqual([]);
    });
  });
});
