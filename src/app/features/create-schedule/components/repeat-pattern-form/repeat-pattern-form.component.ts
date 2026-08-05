import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { PdkTabComponent, PdkTabs, PdkTypographyDirective, ValidationError } from '@cpp/pdk';
import { FrequencyType, FrequencyTypeUnion, RepeatPattern } from '../../model/repeat-pattern';
import { RepeatPatternOnceFormComponent } from '../repeat-pattern-once-form/repeat-pattern-once-form.component';
import { RepeatPatternMoreThanOnceFormComponent } from '../repeat-pattern-more-than-once-form/repeat-pattern-more-than-once-form.component';

@Component({
  selector: 'repeat-pattern-form',
  templateUrl: './repeat-pattern-form.component.html',
  imports: [
    PdkTabs,
    PdkTypographyDirective,
    RepeatPatternOnceFormComponent,
    RepeatPatternMoreThanOnceFormComponent
  ]
})
export class RepeatPatternFormComponent {
  readonly initialValues = input<RepeatPattern>();

  readonly submitForm = output<RepeatPattern>();
  readonly errors = output<ValidationError[] | null>();

  readonly currentTabIndex = signal<number>(0);

  readonly onceForm = viewChild(RepeatPatternOnceFormComponent);
  readonly moreThanOnceForm = viewChild(RepeatPatternMoreThanOnceFormComponent);

  readonly tabOptionIndex = computed(() => {
    const currentTab = this.currentTabIndex();
    if (currentTab !== 0) return currentTab;
    const frequency = this.initialValues()?.frequency;
    return frequency ? this.getTabIndexFromFrequency(frequency) : 0;
  });

  readonly initialValuesForOnce = computed(() => this.getInitialValuesForTab(0));
  readonly initialValuesForMoreThanOnce = computed(() => this.getInitialValuesForTab(1));

  private getInitialValuesForTab(tabIndex: number): RepeatPattern | null {
    const initialValues = this.initialValues();
    if (!initialValues?.frequency) return null;
    return this.getTabIndexFromFrequency(initialValues.frequency) === tabIndex
      ? initialValues
      : null;
  }

  private getTabIndexFromFrequency(frequency: FrequencyTypeUnion): number {
    return frequency === FrequencyType.ONCE ? 0 : 1;
  }

  handleTabChange(event: PdkTabComponent) {
    this.currentTabIndex.set(event.index);
    this.errors.emit([]);
    this.resetForms();
  }

  resetForms(): void {
    this.onceForm()?.resetForm();
    this.moreThanOnceForm()?.resetForm();
  }

  handleFormSubmit(repeatPattern: RepeatPattern) {
    this.submitForm.emit(repeatPattern);
  }

  handleErrors(errors: ValidationError[] | null) {
    this.errors.emit(errors);
  }
}
