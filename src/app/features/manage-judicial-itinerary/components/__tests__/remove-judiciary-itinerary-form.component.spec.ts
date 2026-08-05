import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RemoveJudiciaryItineraryFormComponent } from '../remove-judiciary-itinerary-form/remove-judiciary-itinerary-form.component';
import { ValidationError } from '@cpp/pdk';

@Component({
  selector: 'app-test-host',
  template: `
    <remove-judiciary-itinerary-form
      (submitForm)="handleSubmit($event)"
      (errors)="handleErrors($event)"
    ></remove-judiciary-itinerary-form>
  `,
  imports: [RemoveJudiciaryItineraryFormComponent, FormsModule]
})
class TestHostComponent {
  submittedValue?: boolean;
  errors?: ValidationError[] | null;

  handleSubmit(value: boolean): void {
    this.submittedValue = value;
  }

  handleErrors(errors: ValidationError[] | null): void {
    this.errors = errors;
  }
}

describe('RemoveJudiciaryItineraryFormComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect.assertions(1);
    expect(fixture).toMatchSnapshot();
  });

  it('should emit true when form is submitted with Yes selected', () => {
    expect.assertions(1);

    const radioGroup = fixture.nativeElement.querySelector('[data-test-id="removeConfirmation"]');
    const yesRadio = radioGroup.querySelector('input[value="true"]');
    yesRadio.click();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('[data-test-id="continue-button"]');
    submitButton.click();
    fixture.detectChanges();

    expect(testHost.submittedValue).toBe(true);
  });
});
