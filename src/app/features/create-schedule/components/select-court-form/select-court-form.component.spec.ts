import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectCourtFormComponent } from './select-court-form.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, NgForm } from '@angular/forms';
import { FormFieldControl } from '@cpp/pdk';
import { Component, Injector, inject } from '@angular/core';
import { By } from '@angular/platform-browser';
import { mockCrownCourtCentre, mockMagistratesCourtCentre } from '../../../../shared';
import { provideMockStore } from '@ngrx/store/testing';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('SelectCourtFormComponent', () => {
  let component: SelectCourtFormComponent;
  let fixture: ComponentFixture<SelectCourtFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectCourtFormComponent,
        createMockControlValueAccessor('cpp-organisation-unit-autosuggest')
      ],
      providers: [provideMockStore()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectCourtFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should create with magistrates jurisdiction selected', () => {
    component.jurisdiction.set(JurisdictionType.MAGISTRATES);
    fixture.componentRef.setInput('courtCentre', mockMagistratesCourtCentre);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should create with crown jurisdiction selected', () => {
    component.jurisdiction.set(JurisdictionType.CROWN);
    fixture.componentRef.setInput('courtCentre', mockCrownCourtCentre);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render with magistrates jurisdiction selected', () => {
    component.jurisdiction.set(JurisdictionType.MAGISTRATES);
    fixture.componentRef.setInput('courtCentre', mockMagistratesCourtCentre);

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render with crown jurisdiction selected', () => {
    component.jurisdiction.set(JurisdictionType.CROWN);
    fixture.componentRef.setInput('courtCentre', mockMagistratesCourtCentre);

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit errors if the form is invalid', () => {
    spyOn(component.errors, 'emit');
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();
    fixture.detectChanges();
    expect(component.errors.emit).toHaveBeenCalled();
  });

  it('should reset the form and set null jurisdiction when clear button is clicked', () => {
    component.jurisdiction.set(JurisdictionType.MAGISTRATES);
    fixture.componentRef.setInput('courtCentre', mockMagistratesCourtCentre);

    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(
      By.css('a[data-test-id="clear-court"]')
    ).nativeElement;
    const formDebugElement = fixture.debugElement.query(By.css('form'));
    const ngForm = formDebugElement.injector.get(NgForm);

    spyOn(ngForm, 'reset').and.callThrough();

    clearButton.click();
    fixture.detectChanges();

    expect(ngForm.reset).toHaveBeenCalled();
    expect(component.jurisdiction()).toBeNull();
  });

  it('should clear court centre when courtCentre input becomes null', () => {
    fixture.componentRef.setInput('courtCentre', mockMagistratesCourtCentre);
    fixture.detectChanges();
    expect(component.courtCentre()).toEqual(mockMagistratesCourtCentre);

    fixture.componentRef.setInput('courtCentre', null);
    fixture.detectChanges();
    expect(component.courtCentre()).toBeNull();
  });
});

function createMockControlValueAccessor(selector: string) {
  @Component({
    selector,
    template: ``,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        multi: true,
        useExisting: MockControlValueAccessorComponent
      },
      {
        provide: FormFieldControl,
        useExisting: MockControlValueAccessorComponent
      }
    ],
    imports: [SelectCourtFormComponent]
  })
  class MockControlValueAccessorComponent implements ControlValueAccessor, FormFieldControl {
    injector = inject(Injector);

    get ngControl() {
      return this.injector.get(NgControl);
    }
    id!: string;
    ariaDescribedBy!: string;
    controlType = 'typeahead';
    multi = false;
    propagateChange: (_: any) => void = (_: any) => {};
    writeValue(_: string) {}
    registerOnChange(fn: (_: any) => void): void {
      this.propagateChange = fn;
    }
    registerOnTouched() {}
  }
  return MockControlValueAccessorComponent;
}
