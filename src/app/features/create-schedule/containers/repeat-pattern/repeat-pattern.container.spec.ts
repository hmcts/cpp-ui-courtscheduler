import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { RepeatPatternContainer } from './repeat-pattern.container';
import { CreateScheduleRoutes } from '../../create-schedule.routes';
import {
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockRepeatPattern
} from '../../../../shared';
import { CreateScheduleState } from '../../state/create-schedule.state';
import { RepeatPattern } from '../../model/repeat-pattern';
import { CreateScheduleActions } from '../../state/actions';
import { PdkTextInput, FormFieldControl } from '@cpp/pdk';
import { Directive, Injector } from '@angular/core';
import { NgControl } from '@angular/forms';
import { RepeatPatternFormComponent } from '../../components/repeat-pattern-form/repeat-pattern-form.component';
@Directive({
  selector: '[pdk-text-input]',
  providers: [
    {
      provide: FormFieldControl,
      useExisting: MockPdkTextInputDirective
    }
  ]
})
class MockPdkTextInputDirective implements FormFieldControl {
  constructor(public injector: Injector) {}

  get ngControl() {
    return this.injector.get(NgControl);
  }
  id!: string;
  ariaDescribedBy!: string;
  controlType = 'text';
  multi = false;
}

describe('RepeatPatternContainer', () => {
  let component: RepeatPatternContainer;
  let fixture: ComponentFixture<RepeatPatternContainer>;
  let mockStore: MockStore<CreateScheduleState>;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatPatternContainer],
      providers: [
        provideMockStore({
          initialState: {
            courtScheduleDraft: {
              selectedCourtCentre: mockMagistratesCourtCentre,
              selectedBusinessType: mockBusinessType,
              repeatPattern: mockRepeatPattern
            }
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
      .overrideComponent(RepeatPatternFormComponent, {
        remove: { imports: [PdkTextInput] },
        add: { imports: [MockPdkTextInputDirective] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RepeatPatternContainer);
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

  it('should handle back link navigation', () => {
    spyOn(router, 'navigate');

    component.handleBackLink();

    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SELECT_BUSINESS_TYPE], {
      relativeTo: route.parent
    });
  });

  it('should dispatch clearSessions and setRepeatPattern when repeat pattern changes', fakeAsync(() => {
    const newRepeatPattern: RepeatPattern = {
      ...mockRepeatPattern,
      repeatFor: 2
    };
    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');
    mockStore.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: mockBusinessType,
        repeatPattern: mockRepeatPattern
      }
    } as CreateScheduleState);

    component.submitRepeatPattern(newRepeatPattern);
    tick();

    expect(mockStore.dispatch).toHaveBeenCalledWith(CreateScheduleActions.clearSessions());
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      CreateScheduleActions.setRepeatPattern({ repeatPattern: newRepeatPattern })
    );
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SESSIONS_FORM], {
      relativeTo: route.parent
    });
  }));

  it('should not dispatch actions when repeat pattern has not changed', fakeAsync(() => {
    spyOn(mockStore, 'dispatch');
    spyOn(router, 'navigate');
    mockStore.setState({
      courtScheduleDraft: {
        selectedCourtCentre: mockMagistratesCourtCentre,
        selectedBusinessType: mockBusinessType,
        repeatPattern: mockRepeatPattern
      }
    } as CreateScheduleState);

    component.submitRepeatPattern(mockRepeatPattern);
    tick();

    expect(mockStore.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([CreateScheduleRoutes.SESSIONS_FORM], {
      relativeTo: route.parent
    });
  }));
});
