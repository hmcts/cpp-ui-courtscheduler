import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SpecialismsSelectorComponent } from '../specialisms-selector.component';
import { Specialism } from '../../../../features/manage-judicial-itinerary/model/specialism.enum';

@Component({
  selector: 'app-test-host',
  template: `
    <specialisms-selector
      [label]="label"
      [labelType]="labelType"
      [required]="required"
      [minCount]="minCount"
      [filterOptionsBy]="filterOptionsBy"
    ></specialisms-selector>
  `,
  imports: [SpecialismsSelectorComponent]
})
class TestHostComponent {
  label = 'Select specialisms';
  labelType: 'small' | 'none' = 'small';
  required: boolean | string = false;
  minCount: number | undefined = undefined;
  filterOptionsBy: (specialism: Specialism) => boolean = (specialism: Specialism) => true;
}

describe('SpecialismsSelectorComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let component: SpecialismsSelectorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(SpecialismsSelectorComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should transform string "true" to boolean true for required input', () => {
    expect.assertions(1);
    testHost.required = 'true';
    fixture.detectChanges();
    expect(component.required()).toBe(true);
  });

  it('should transform string "false" to boolean false for required input', () => {
    expect.assertions(1);
    testHost.required = 'false';
    fixture.detectChanges();
    expect(component.required()).toBe(false);
  });

  it('should use default filter function that returns true for all specialisms', () => {
    expect.assertions(1);
    // Use the default function (same as component default on line 46)
    testHost.filterOptionsBy = (specialism: Specialism) => true;
    fixture.detectChanges();
    const allSpecialisms = Object.values(Specialism);
    const available = component.availableSpecialisms();
    expect(available.length).toBe(allSpecialisms.length);
  });

  it('should filter specialisms when filterOptionsBy is provided', () => {
    expect.assertions(1);
    testHost.filterOptionsBy = (specialism: Specialism) => specialism === Specialism.MURDER;
    fixture.detectChanges();
    const available = component.availableSpecialisms();
    expect(available).toEqual([Specialism.MURDER]);
  });

  it('should include required error message when required is true', () => {
    expect.assertions(2);
    testHost.required = true;
    fixture.detectChanges();
    const errorMessages = component.errorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(errorMessages.some((msg) => msg.rule === 'required')).toBe(true);
  });

  it('should not include required error message when required is false', () => {
    expect.assertions(1);
    testHost.required = false;
    fixture.detectChanges();
    const errorMessages = component.errorMessages();
    expect(errorMessages.some((msg) => msg.rule === 'required')).toBe(false);
  });

  it('should include minCount error message when minCount is defined', () => {
    expect.assertions(2);
    testHost.minCount = 1;
    fixture.detectChanges();
    const errorMessages = component.errorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(errorMessages.some((msg) => msg.rule === 'minCount')).toBe(true);
  });

  it('should not include minCount error message when minCount is undefined', () => {
    expect.assertions(1);
    testHost.minCount = undefined;
    fixture.detectChanges();
    const errorMessages = component.errorMessages();
    expect(errorMessages.some((msg) => msg.rule === 'minCount')).toBe(false);
  });

  it('should disable form control when setDisabledState is called with true', () => {
    expect.assertions(1);
    component.setDisabledState(true);
    expect(component.formControl.disabled).toBe(true);
  });

  it('should enable form control when setDisabledState is called with false', () => {
    expect.assertions(1);
    component.formControl.disable();
    component.setDisabledState(false);
    expect(component.formControl.enabled).toBe(true);
  });

  it('should render correctly', () => {
    testHost.label = 'Test Label';
    testHost.required = true;
    testHost.minCount = 1;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
