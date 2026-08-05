import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import {
  AddSpecialismsFormComponent,
  AddSpecialismsFormValues
} from '../add-specialisms-form/add-specialisms-form.component';
import { Specialism } from '../../model/specialism.enum';

@Component({
  selector: 'app-test-host',
  template: `
    <add-specialisms-form
      [existingSpecialisms]="existingSpecialisms"
      [initialValues]="initialValues"
      (submitForm)="handleSubmit($event)"
      (errors)="handleErrors($event)"
    ></add-specialisms-form>
  `,
  imports: [AddSpecialismsFormComponent]
})
class TestHostComponent {
  existingSpecialisms: Specialism[] = [];
  initialValues: AddSpecialismsFormValues | null = null;
  submittedValues?: AddSpecialismsFormValues;
  errors?: any;

  handleSubmit(values: AddSpecialismsFormValues): void {
    this.submittedValues = values;
  }

  handleErrors(errors: any): void {
    this.errors = errors;
  }
}

describe('AddSpecialismsFormComponent', () => {
  let component: AddSpecialismsFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(AddSpecialismsFormComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    testHost.existingSpecialisms = [Specialism.MURDER];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should initialize with initialValues when provided', () => {
    expect.assertions(1);

    testHost.existingSpecialisms = [];
    testHost.initialValues = {
      selectedSpecialisms: [Specialism.MURDER]
    };
    fixture.detectChanges();

    expect(component.initialValues()?.selectedSpecialisms).toEqual([Specialism.MURDER]);
  });

  it('should have submitForm output defined', () => {
    expect.assertions(1);

    expect(component.submitForm).toBeDefined();
  });

  it('should have errors output defined', () => {
    expect.assertions(1);

    expect(component.errors).toBeDefined();
  });

  it('should handle null initialValues correctly', () => {
    expect.assertions(1);

    testHost.initialValues = null;
    fixture.detectChanges();

    expect(component.initialValues()).toBeNull();
  });

  it('should handle initialValues with empty selectedSpecialisms', () => {
    expect.assertions(1);

    testHost.initialValues = {
      selectedSpecialisms: []
    };
    fixture.detectChanges();

    expect(component.initialValues()?.selectedSpecialisms).toEqual([]);
  });
});
