import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import {
  PdkButton,
  PdkDatePicker,
  PdkForm,
  PdkGrid,
  PdkInsetTextComponent,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkPaddingDirective,
  PdkSelectComponent,
  PdkTypographyDirective,
  SelectOption,
  ValidationError
} from '@cpp/pdk';
import {
  OrganisationUnit,
  OrganisationUnitAutosuggestComponent,
  RotaBusinessTypeSelectComponent
} from '@cpp/reference-data';
import * as dateUtils from '../../../../shared/utils/date-utils';

import {
  DAYS_TO_NEXT_SUNDAY,
  getJurisdictionCode,
  SelectJurisdictionComponent
} from '../../../../shared';

import { SearchFormValues } from '../../model/view-schedule.model';
import { FormsModule, NgForm } from '@angular/forms';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';
import { NgTemplateOutlet } from '@angular/common';
@Component({
  selector: 'search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-form.component.html',
  styles: [
    `
      .actions {
        display: flex;
        align-items: center;
      }
    `
  ],
  imports: [
    FormsModule,
    PdkButton,
    PdkDatePicker,
    PdkForm,
    PdkGrid,
    PdkInsetTextComponent,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkPaddingDirective,
    PdkSelectComponent,
    PdkTypographyDirective,
    OrganisationUnitAutosuggestComponent,
    SelectJurisdictionComponent,
    NgTemplateOutlet,
    RotaBusinessTypeSelectComponent
  ]
})
export class SearchFormComponent {
  readonly initialValues = input<SearchFormValues>();
  readonly jurisdiction = model<JurisdictionType | null>();
  readonly jurisdictionChange = output<JurisdictionType | null>();
  readonly JurisdictionType = JurisdictionType;

  readonly jurisdictionCode = computed(() => {
    const type = this.jurisdiction();
    return type ? getJurisdictionCode(type) : null;
  });
  readonly form = viewChild<NgForm>('form');
  readonly submitForm = output<SearchFormValues>();
  readonly errors = output<ValidationError[] | null>();

  courtroomOptions: SelectOption<string>[] = [];

  defaultValues: SearchFormValues = {
    courtCentre: null,
    businessType: null,
    courtroomId: null,
    startDate: null,
    minEndDate: null,
    endDate: null
  };

  formValues: SearchFormValues = { ...this.defaultValues };

  startDateLabel: string = '';
  endDateLabel: string = '';

  constructor() {
    effect(() => {
      const initialValues = this.initialValues();

      this.jurisdiction();

      if (initialValues) {
        this.formValues = { ...initialValues };
        if (this.formValues.courtCentre) {
          const courtroomId = this.formValues.courtroomId;
          this.handleCourtCentreChange(this.formValues.courtCentre);
          this.formValues.courtroomId = courtroomId;
        }
        if (this.formValues.startDate) {
          if (this.formValues.endDate) {
            this.updateDateLabels(this.formValues.startDate, this.formValues.endDate);
          } else {
            this.handleStartDateChange(this.formValues.startDate);
          }
        }
      } else {
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.formValues = { ...this.defaultValues };
    this.courtroomOptions = [];
    this.startDateLabel = '';
    this.endDateLabel = '';
    this.form()?.resetForm(this.defaultValues);
    this.errors.emit([]);
  }

  handleCourtCentreChange(courtCentre: OrganisationUnit): void {
    this.formValues.courtCentre = courtCentre;
    this.formValues.courtroomId = null;
    this.courtroomOptions =
      courtCentre?.courtrooms?.map((courtroom) => ({
        value: courtroom.id,
        label: courtroom.courtroomName
      })) || [];
  }

  isDateNotMonday = (date: Date): boolean => {
    return dateUtils.isDateNotMonday(date);
  };

  isDateDisabled = (date: Date): boolean => {
    if (!this.formValues.startDate) {
      return true;
    }

    const normalizedDate = dateUtils.normalizeDate(date);
    const startDateParsed = dateUtils.parseDateToString(this.formValues.startDate);
    const sundays = dateUtils.getSundaysAfterStartDate(startDateParsed, 1);

    return !sundays.some(
      (sunday) => normalizedDate.getTime() === dateUtils.normalizeDate(sunday).getTime()
    );
  };

  private updateDateLabels(startDate: string, endDate: string): void {
    this.startDateLabel = dateUtils.getInsetLabel(new Date(startDate));
    this.endDateLabel = dateUtils.getInsetLabel(new Date(endDate));
  }

  handleStartDateChange = (startDate: string): void => {
    if (startDate) {
      const startDateParsed = new Date(startDate);
      const endDate = dateUtils.addDaysToDate(startDateParsed, DAYS_TO_NEXT_SUNDAY);
      this.formValues.startDate = dateUtils.parseDateToString(startDate);
      this.formValues.endDate = dateUtils.parseDateToString(endDate);
      this.formValues.minEndDate = endDate;
      this.updateDateLabels(this.formValues.startDate, this.formValues.endDate);
    }
  };

  handleEndDateChange = (endDate: string): void => {
    if (endDate) {
      this.formValues.endDate = endDate;
      this.endDateLabel = dateUtils.getInsetLabel(new Date(endDate));
    }
  };

  handleSubmitForm(values: SearchFormValues): void {
    this.submitForm.emit(values);
  }

  clearForm(): void {
    this.resetForm();
    this.jurisdiction.set(null);
  }
}
