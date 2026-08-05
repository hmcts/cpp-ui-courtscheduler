import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectBusinessTypeFormComponent } from './select-business-type-form.component';
import { NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { provideMockStore } from '@ngrx/store/testing';
import { mockBusinessType, mockMagistratesCourtCentre } from '../../../../shared';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

const initialRotaBusinessType: RotaBusinessType = mockBusinessType;

const courtCentre: OrganisationUnit = mockMagistratesCourtCentre;

describe('SelectBusinessTypeFormComponent', () => {
  let component: SelectBusinessTypeFormComponent;
  let fixture: ComponentFixture<SelectBusinessTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBusinessTypeFormComponent],
      providers: [provideMockStore()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectBusinessTypeFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('courtCentre', courtCentre);
    fixture.componentRef.setInput('initialValues', initialRotaBusinessType);
    fixture.componentRef.setInput('jurisdiction', JurisdictionType.MAGISTRATES);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should emit submitForm with business type code on form submit', () => {
    spyOn(component.submitForm, 'emit');
    component.handleSubmitForm({
      rotaBusinessTypeCode: initialRotaBusinessType.typeCode
    });
    fixture.detectChanges();
    expect(component.submitForm.emit).toHaveBeenCalledWith(initialRotaBusinessType.typeCode);
  });

  it('should emit errors if the form is invalid', () => {
    spyOn(component.errors, 'emit');
    fixture.componentRef.setInput('initialValues', null);
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();
    fixture.detectChanges();

    expect(component.errors.emit).toHaveBeenCalled();
  });

  it('should reset the form when Clear is clicked', () => {
    const clearButton = fixture.debugElement.query(
      By.css('a[data-test-id="clear-court"]')
    ).nativeElement;
    const formDebugElement = fixture.debugElement.query(By.css('form'));
    const ngForm = formDebugElement.injector.get(NgForm);

    spyOn(ngForm, 'reset').and.callThrough();

    clearButton.click();
    fixture.detectChanges();

    expect(ngForm.reset).toHaveBeenCalled();
  });
});
