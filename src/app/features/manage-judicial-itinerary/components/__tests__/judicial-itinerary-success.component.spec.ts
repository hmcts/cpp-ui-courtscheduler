import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { provideRouter, Routes } from '@angular/router';
import { JudicialItinerarySuccessComponent } from '../judicial-itinerary-success/judicial-itinerary-success.component';
import { ManageJudicialItineraryStore } from '../../store/manage-judicial-itinerary.store';
import { signal } from '@angular/core';
import { CourtSchedulerRoutes } from '../../../../app-routes';

class MockManageJudicialItineraryStore {
  readonly successMessage = signal<string | null>(null);
  readonly clearSuccessMessage = jest.fn();
}

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
  template: `<judicial-itinerary-success></judicial-itinerary-success>`,
  imports: [JudicialItinerarySuccessComponent]
})
class TestHostComponent {}

describe('JudicialItinerarySuccessComponent', () => {
  let component: JudicialItinerarySuccessComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let store: MockManageJudicialItineraryStore;
  let router: Router;

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
      By.directive(JudicialItinerarySuccessComponent)
    ).componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    store.successMessage.set("Judiciary John Smith's availability added to Test Court");
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should display success message from store', () => {
    expect.assertions(1);

    const message = "Judiciary John Smith's availability added to Test Court";
    store.successMessage.set(message);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('pdk-panel');
    expect(panel.textContent.trim()).toBe(message);
  });

  it('should navigate to manage judiciary itinerary when button is clicked', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigateByUrl');

    const button = fixture.nativeElement.querySelector(
      '[data-test-id="go-to-manage-judiciary-itinerary-button"]'
    );
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(`/${CourtSchedulerRoutes.MANAGE_JUDICIAL_ITINERARY}`);
  });

  it('should call clearSuccessMessage when component is destroyed', () => {
    expect.assertions(1);

    fixture.destroy();

    expect(store.clearSuccessMessage).toHaveBeenCalled();
  });
});
