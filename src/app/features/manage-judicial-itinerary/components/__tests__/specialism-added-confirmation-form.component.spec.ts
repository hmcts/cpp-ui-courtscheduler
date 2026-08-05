import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import {
  SpecialismAddedConfirmationFormComponent,
  SpecialismAddedConfirmationFormValues
} from '../specialism-added-confirmation-form/specialism-added-confirmation-form.component';
import { Specialism } from '../../model/specialism.enum';
import { SpecialismFormatPipe } from '../../pipes/specialism-format.pipe';

@Component({
  selector: 'app-test-host',
  template: `
    <specialism-added-confirmation-form
      [draftSpecialisms]="draftSpecialisms"
      [initialValues]="initialValues"
      (submitForm)="handleSubmit($event)"
      (errors)="handleErrors($event)"
      (onChange)="handleChange()"
    ></specialism-added-confirmation-form>
  `,
  imports: [SpecialismAddedConfirmationFormComponent]
})
class TestHostComponent {
  draftSpecialisms: Specialism[] = [];
  initialValues: SpecialismAddedConfirmationFormValues | null = null;
  submittedValues?: SpecialismAddedConfirmationFormValues;
  errors?: any;
  changeCalled = false;

  handleSubmit(values: SpecialismAddedConfirmationFormValues): void {
    this.submittedValues = values;
  }

  handleErrors(errors: any): void {
    this.errors = errors;
  }

  handleChange(): void {
    this.changeCalled = true;
  }
}

describe('SpecialismAddedConfirmationFormComponent', () => {
  let component: SpecialismAddedConfirmationFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [SpecialismFormatPipe],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(SpecialismAddedConfirmationFormComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    testHost.draftSpecialisms = [Specialism.MURDER, Specialism.ATTEMPTEDMURDER];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should format specialisms correctly', () => {
    expect.assertions(1);

    testHost.draftSpecialisms = [Specialism.MURDER, Specialism.ATTEMPTEDMURDER];
    fixture.detectChanges();

    const formatted = component.formattedSpecialisms();
    expect(formatted).toBe('Murder, Attempted murder');
  });

  it('should return "Not added" when draftSpecialisms is empty', () => {
    expect.assertions(1);

    testHost.draftSpecialisms = [];
    fixture.detectChanges();

    expect(component.formattedSpecialisms()).toBe('Not added');
  });

  it('should emit onChange when change link is clicked', () => {
    expect.assertions(1);

    testHost.draftSpecialisms = [Specialism.MURDER];
    fixture.detectChanges();

    const changeLink = fixture.nativeElement.querySelector(
      '[data-test-id="change-specialisms-link"]'
    );
    changeLink.click();
    fixture.detectChanges();

    expect(testHost.changeCalled).toBe(true);
  });

  it('should initialize with initialValues when provided', () => {
    expect.assertions(1);

    testHost.draftSpecialisms = [Specialism.MURDER];
    testHost.initialValues = {
      confirmation: true
    };
    fixture.detectChanges();

    expect(component.initialValues()?.confirmation).toBe(true);
  });

  it('should have submitForm output defined', () => {
    expect.assertions(1);

    expect(component.submitForm).toBeDefined();
  });

  it('should have errors output defined', () => {
    expect.assertions(1);

    expect(component.errors).toBeDefined();
  });

  it('should format multiple specialisms with comma separator', () => {
    expect.assertions(1);

    testHost.draftSpecialisms = [
      Specialism.MURDER,
      Specialism.ATTEMPTEDMURDER,
      Specialism.SEXUALOFFENCE
    ];
    fixture.detectChanges();

    const formatted = component.formattedSpecialisms();
    expect(formatted).toBe('Murder, Attempted murder, Serious Sexual offence');
  });

  it('should have onChange output defined', () => {
    expect.assertions(1);
    expect(component.onChange).toBeDefined();
  });

  it('should handle null initialValues correctly', () => {
    expect.assertions(1);

    testHost.initialValues = null;
    fixture.detectChanges();

    expect(component.initialValues()).toBeNull();
  });

  it('should handle initialValues with null confirmation', () => {
    expect.assertions(1);

    testHost.initialValues = {
      confirmation: null
    };
    fixture.detectChanges();

    expect(component.initialValues()?.confirmation).toBeNull();
  });
});
