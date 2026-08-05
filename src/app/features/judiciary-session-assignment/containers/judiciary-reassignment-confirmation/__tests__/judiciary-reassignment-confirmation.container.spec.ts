import { Location } from '@angular/common';
import { Component, input, output, signal, WritableSignal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationError } from '@cpp/pdk';
import { JudiciaryReassignmentConfirmationContainer } from '../judiciary-reassignment-confirmation.container';
import { ManageSessionsStore } from '../../../../view-schedule/store/manage-sessions.store';
import {
  JudiciaryReassignmentConfirmationFormComponent,
  ReassignmentOption
} from '../../../components/judiciary-reassignment-confirmation-form/judiciary-reassignment-confirmation-form.component';
import type { CourtScheduleSession } from '../../../../view-schedule/model/view-schedule.model';

@Component({
  selector: 'judiciary-reassignment-confirmation-form',
  template: ''
})
class MockJudiciaryReassignmentConfirmationFormComponent {
  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly submitForm = output<ReassignmentOption>();
  readonly errors = output<ValidationError[] | null>();
}

describe('JudiciaryReassignmentConfirmationContainer', () => {
  let component: JudiciaryReassignmentConfirmationContainer;
  let fixture: ComponentFixture<JudiciaryReassignmentConfirmationContainer>;
  let mockManageSessionsStore: any;
  let mockRouter: { navigate: jest.Mock; navigateByUrl: jest.Mock };
  let mockLocation: { back: jest.Mock };
  let mockActivatedRoute: object;

  beforeEach(async () => {
    mockManageSessionsStore = {
      setReferrer: jest.fn(),
      sessionsWithJudiciary: signal([]),
      referrer: signal<string | null>(null)
    };

    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() };
    mockLocation = { back: jest.fn() };
    mockActivatedRoute = {};

    await TestBed.configureTestingModule({
      providers: [
        { provide: ManageSessionsStore, useValue: mockManageSessionsStore },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    TestBed.overrideComponent(JudiciaryReassignmentConfirmationContainer, {
      remove: { imports: [JudiciaryReassignmentConfirmationFormComponent] },
      add: { imports: [MockJudiciaryReassignmentConfirmationFormComponent] }
    });

    fixture = TestBed.createComponent(JudiciaryReassignmentConfirmationContainer);
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
    it('should navigate to ../assign when option is yes', () => {
      expect.assertions(1);

      component.handleSubmit('yes');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['../assign'], {
        relativeTo: mockActivatedRoute,
        queryParamsHandling: 'preserve'
      });
    });

    it('should navigate to referrer URL when option is no and referrer is set', () => {
      expect.assertions(2);

      (mockManageSessionsStore.referrer as WritableSignal<string | null>).set('view-schedule');

      component.handleSubmit('no');

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/view-schedule');
      expect(mockLocation.back).not.toHaveBeenCalled();
    });

    it('should call location.back when option is no and no referrer', () => {
      expect.assertions(2);

      component.handleSubmit('no');

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('handleBackLink', () => {
    it('should navigate to referrer URL when referrer is set', () => {
      expect.assertions(2);

      (mockManageSessionsStore.referrer as WritableSignal<string | null>).set('view-schedule');

      component.handleBackLink();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/view-schedule');
      expect(mockLocation.back).not.toHaveBeenCalled();
    });

    it('should call location.back when no referrer', () => {
      expect.assertions(2);

      component.handleBackLink();

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
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
});
