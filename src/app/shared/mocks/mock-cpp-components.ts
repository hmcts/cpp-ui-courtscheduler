import { Component, Injector, inject, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { FormFieldControl } from '@cpp/pdk';
import { OrganisationUnit } from '@cpp/reference-data';

/**
 * Universal mock function for all @cpp/reference-data form control components.
 * Works for autosuggest, select, and checkbox components.
 * Pass the exact selector string that matches the actual component selector.
 *
 * @param selector - The selector string (e.g., 'cpp-organisation-unit-autosuggest', 'cpp-rota-business-type-select', 'special-requirements-chekbox')
 * @returns A mock component class implementing ControlValueAccessor and FormFieldControl
 *
 * Examples:
 * - mockCppFormControlComponent('cpp-organisation-unit-autosuggest')
 * - mockCppFormControlComponent('cpp-rota-business-type-select')
 * - mockCppFormControlComponent('special-requirements-chekbox')
 */
export function mockCppFormControlComponent(selector: string) {
  @Component({
    selector,
    template: ``,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        multi: true,
        useExisting: MockCppFormControlComponent
      },
      {
        provide: FormFieldControl,
        useExisting: MockCppFormControlComponent
      }
    ]
  })
  class MockCppFormControlComponent implements ControlValueAccessor, FormFieldControl {
    injector = inject(Injector);

    get ngControl() {
      return this.injector.get(NgControl);
    }

    // Common inputs for all form control types
    @Input() id!: string;
    @Input() name?: string;
    @Input() required = false;
    @Input() disabled = false;
    @Input() fetchOptionsOnMount = false;
    @Input() placeholder?: string;
    @Input() inputWidth?: string;
    @Input() ariaDescribedBy: string;
    @Input() ariaLabel?: string;
    @Input() ariaLabelledBy?: string;
    @Input() hasError = false;

    // Autosuggest-specific inputs (ignored by select/checkbox)
    @Input() jurisdictionCode?: 'B' | 'C';
    @Input() maxResults?: number;
    @Input() filterBy?: (org: OrganisationUnit) => boolean;
    @Input() highlightFirstSuggestion = false;
    @Input() highlightMatchedText = false;

    // Select-specific inputs (ignored by autosuggest/checkbox)
    @Input() justified = false;

    // FormFieldControl properties
    controlType = 'mock-control-type';
    multi = false;

    // ControlValueAccessor implementation
    propagateChange: (_: any) => void = (_: any) => {};
    propagateTouched: () => void = () => {};

    writeValue(value: any): void {
      // Mock implementation - value can be OrganisationUnit, RotaBusinessType, string[], etc.
    }

    registerOnChange(fn: (_: any) => void): void {
      this.propagateChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.propagateTouched = fn;
    }
  }

  return MockCppFormControlComponent;
}
