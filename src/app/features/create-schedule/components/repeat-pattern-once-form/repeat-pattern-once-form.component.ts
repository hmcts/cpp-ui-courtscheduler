import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkDatePicker,
  PdkForm,
  PdkGrid,
  PdkInsetTextComponent,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import * as dateUtils from '../../../../shared/utils/date-utils';
import { FrequencyType, RepeatPattern } from '../../model/repeat-pattern';

interface OnceFormValues {
  startDate: Date;
}

@Component({
  selector: 'repeat-pattern-once-form',
  templateUrl: './repeat-pattern-once-form.component.html',
  imports: [
    FormsModule,
    PdkButton,
    PdkDatePicker,
    PdkForm,
    PdkGrid,
    PdkInsetTextComponent,
    PdkMarginDirective,
    PdkTypographyDirective
  ]
})
export class RepeatPatternOnceFormComponent {
  readonly initialValues = input<RepeatPattern | null>();

  readonly submitForm = output<RepeatPattern>();
  readonly errors = output<ValidationError[] | null>();

  readonly minStartDate = new Date();

  readonly startDate = linkedSignal({
    source: () => this.initialValues(),
    computation: (initialValues) => dateUtils.parseDateToString(initialValues?.startDate)
  });

  readonly endDate = computed<Date | null>(() => {
    const startDate = this.startDate();
    return startDate ? dateUtils.addDaysToDate(startDate, dateUtils.DAYS_TO_NEXT_SUNDAY) : null;
  });

  readonly startDateLabel = computed(() => {
    const date = this.startDate();
    return date ? dateUtils.getInsetLabel(date) : null;
  });

  handleStartDateChange(startDate: string) {
    this.startDate.set(dateUtils.parseDateToString(startDate));
  }

  resetForm(): void {
    const initialValues = this.initialValues();
    this.startDate.set(dateUtils.parseDateToString(initialValues?.startDate));
  }

  formatDisplayText = (_: never) => {
    return dateUtils.getDisplayText(this.startDate()!, this.endDate()!);
  };

  isDateBetweenRange = dateUtils.isDateBetweenRange;

  handleSubmitForm(formValues: OnceFormValues) {
    const endDate = this.endDate();
    if (!formValues.startDate || !endDate) {
      return;
    }

    this.submitForm.emit({
      startDate: dateUtils.parseDateToString(formValues.startDate),
      endDate: dateUtils.parseDateToString(endDate),
      repeatFor: 1,
      frequency: FrequencyType.ONCE
    });
  }
}
