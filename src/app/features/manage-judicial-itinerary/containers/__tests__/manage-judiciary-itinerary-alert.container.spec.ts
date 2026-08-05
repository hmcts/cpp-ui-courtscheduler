import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { ManageJudiciaryItineraryAlertContainer } from '../manage-judiciary-itinerary-alert/manage-judiciary-itinerary-alert.container';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { ValidationError } from '@cpp/pdk';
import { CourtSchedulerRoutes } from '../../../../app-routes';

@Component({
  selector: 'app-mock-route',
  template: `<div>Mock Route</div>`
})
class MockRouteComponent {}

const mockRoutes: Routes = [
  {
    path: CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY,
    component: MockRouteComponent
  }
];

@Component({
  selector: 'app-test-host',
  template: `<manage-judiciary-itinerary-alert-container></manage-judiciary-itinerary-alert-container>`,
  imports: [ManageJudiciaryItineraryAlertContainer]
})
class TestHostComponent {}

class MockManageJudicialItineraryStore {
  readonly formErrors = signal<ValidationError[]>([]);
  readonly specialismAddedSuccess = signal<boolean>(false);
  readonly serverSubmissionError = {
    message: signal<string | undefined>(undefined),
    isSourceForm: signal<boolean | undefined>(undefined),
    linkText: signal<string | undefined>(undefined),
    linkAction: signal<(() => void) | undefined>(undefined)
  };
  readonly clearServerSubmissionError = jest.fn();
}

describe('ManageJudiciaryItineraryAlertContainer', () => {
  let component: ManageJudiciaryItineraryAlertContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let store: MockManageJudicialItineraryStore;

  beforeEach(async () => {
    store = new MockManageJudicialItineraryStore();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ManageJudicialItineraryStore,
          useValue: store
        },
        provideRouter(mockRoutes)
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(
      By.directive(ManageJudiciaryItineraryAlertContainer)
    ).componentInstance;

    Element.prototype.scrollIntoView = jest.fn();
    HTMLElement.prototype.focus = jest.fn();

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly with no errors or alerts', () => {
    expect.assertions(1);
    store.formErrors.set([]);
    store.specialismAddedSuccess.set(false);
    store.serverSubmissionError.message.set(undefined);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should display error summary when formErrors exist', () => {
    expect.assertions(2);

    const mockErrors: ValidationError[] = [
      {
        id: 'field1',
        message: 'Error message 1'
      },
      {
        id: 'field2',
        message: 'Error message 2'
      }
    ];

    store.formErrors.set(mockErrors);
    fixture.detectChanges();

    const errorSummary = fixture.nativeElement.querySelector('pdk-error-summary');
    expect(errorSummary).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should not display error summary when formErrors is empty', () => {
    expect.assertions(1);

    store.formErrors.set([]);
    fixture.detectChanges();

    const errorSummary = fixture.nativeElement.querySelector('pdk-error-summary');
    expect(errorSummary).toBeFalsy();
  });

  it('should display specialism added success alert when specialismAddedSuccess is true', () => {
    expect.assertions(2);

    store.specialismAddedSuccess.set(true);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('pdk-alert');
    expect(alert).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should not display specialism added success alert when specialismAddedSuccess is false', () => {
    expect.assertions(1);

    store.specialismAddedSuccess.set(false);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('pdk-alert');
    expect(alert).toBeFalsy();
  });

  it('should display server submission error panel when error exists and isSourceForm is false', () => {
    expect.assertions(2);

    store.serverSubmissionError.message.set('Server error message');
    store.serverSubmissionError.isSourceForm.set(false);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('pdk-context-panel');
    expect(panel).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should not display server submission error panel when isSourceForm is true', () => {
    expect.assertions(1);

    store.serverSubmissionError.message.set('Server error message');
    store.serverSubmissionError.isSourceForm.set(true);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('pdk-context-panel');
    expect(panel).toBeFalsy();
  });

  it('should not display server submission error panel when message is undefined', () => {
    expect.assertions(1);

    store.serverSubmissionError.message.set(undefined);
    store.serverSubmissionError.isSourceForm.set(false);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('pdk-context-panel');
    expect(panel).toBeFalsy();
  });

  it('should display link in server submission error panel when linkText exists', () => {
    expect.assertions(2);

    store.serverSubmissionError.message.set('Server error message');
    store.serverSubmissionError.isSourceForm.set(false);
    store.serverSubmissionError.linkText.set('Click here');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.textContent.trim()).toBe('Click here');
  });

  it('should not display link in server submission error panel when linkText is undefined', () => {
    expect.assertions(1);

    store.serverSubmissionError.message.set('Server error message');
    store.serverSubmissionError.isSourceForm.set(false);
    store.serverSubmissionError.linkText.set(undefined);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[pdk-link]');
    expect(link).toBeFalsy();
  });

  it('should call linkAction and clearServerSubmissionError when handleLinkAction is called with linkAction', () => {
    expect.assertions(2);

    const mockLinkAction = jest.fn();
    store.serverSubmissionError.linkAction.set(mockLinkAction);

    component.handleLinkAction();

    expect(mockLinkAction).toHaveBeenCalled();
    expect(store.clearServerSubmissionError).toHaveBeenCalled();
  });

  it('should not call linkAction when handleLinkAction is called without linkAction', () => {
    expect.assertions(1);

    store.serverSubmissionError.linkAction.set(undefined);
    const mockLinkAction = jest.fn();

    component.handleLinkAction();

    expect(mockLinkAction).not.toHaveBeenCalled();
  });

  it('should not call clearServerSubmissionError when handleLinkAction is called without linkAction', () => {
    expect.assertions(1);

    store.serverSubmissionError.linkAction.set(undefined);

    component.handleLinkAction();

    expect(store.clearServerSubmissionError).not.toHaveBeenCalled();
  });

  it('should render router-outlet', () => {
    expect.assertions(1);

    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should scroll and focus server submission error panel when it exists', (done) => {
    expect.assertions(2);

    store.serverSubmissionError.message.set('Server error message');
    store.serverSubmissionError.isSourceForm.set(false);
    fixture.detectChanges();

    setTimeout(() => {
      const panel = component.serverSubmissionErrorPanel();
      if (panel) {
        const scrollIntoViewSpy = jest.spyOn(panel.nativeElement, 'scrollIntoView');
        const focusSpy = jest.spyOn(panel.nativeElement, 'focus');

        fixture.detectChanges();

        setTimeout(() => {
          expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
          expect(focusSpy).toHaveBeenCalled();
          done();
        }, 100);
      } else {
        done();
      }
    }, 100);
  });
});
