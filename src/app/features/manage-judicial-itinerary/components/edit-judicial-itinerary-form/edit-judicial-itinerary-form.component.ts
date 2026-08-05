import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output
} from '@angular/core';
import { FormControl, FormsModule, ValidationErrors } from '@angular/forms';
import {
  ErrorMessageConfig,
  PdkButton,
  PdkButtonGroupComponent,
  PdkDividerComponent,
  PdkForm,
  PdkFormFieldComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkPaddingDirective,
  PdkRadioGroupComponent,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { SessionType } from '../../../../shared/model';
import { formatDate, normalizeDate } from '../../../../shared/utils/date-utils';
import { DraftItinerary } from '../../model/judicial-itinerary.interface';
import { DateRangeComponent } from '../../../../shared/components/date-range/date-range.component';
import { DaysOfWeekSelectorComponent } from '../../../../shared/components/days-of-week-selector/days-of-week-selector.component';
import { UnavailabilitiesControlComponent } from '../unavailabilities-control/unavailabilities-control.component';
import { InDateRangeValidator } from '../../../../shared/validators/in-date-range.validator';

@Component({
  selector: 'edit-judicial-itinerary-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-judicial-itinerary-form.component.html',
  imports: [
    FormsModule,
    PdkButton,
    PdkButtonGroupComponent,
    PdkDividerComponent,
    PdkForm,
    PdkFormFieldComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkRadioGroupComponent,
    PdkPaddingDirective,
    PdkTypographyDirective,
    DateRangeComponent,
    DaysOfWeekSelectorComponent,
    UnavailabilitiesControlComponent,
    InDateRangeValidator
  ],
  styles: `
    pdk-divider {
      clear: both;
    }
  `
})
export class EditJudicialItineraryFormComponent {
  readonly initialValues = input.required<DraftItinerary | null>();
  readonly serverSubmissionErrorMessage = input<string | null>(null);
  readonly submitForm = output<DraftItinerary>();
  readonly errors = output<ValidationError[] | null>();

  readonly sessionOptions = [
    { label: 'All day', value: 'AD' as SessionType },
    { label: 'AM', value: 'AM' as SessionType },
    { label: 'PM', value: 'PM' as SessionType }
  ];

  readonly sessionSignal = linkedSignal({
    source: () => this.initialValues()?.session ?? 'AD',
    computation: (value) => value
  });

  readonly serverSubmissionError = computed<ValidationErrors | null>(() => {
    if (this.serverSubmissionErrorMessage()) {
      return {
        serverSubmissionError: true
      };
    }
    return null;
  });

  readonly minStartDate = computed(() => {
    const today = formatDate(new Date());
    const {
      availability: { startDate }
    } = this.initialValues() ?? { availability: { startDate: null } };
    if (!startDate) {
      return today;
    }
    return new Date(today) <= new Date(startDate) ? today : startDate;
  });

  readonly startDateErrorMessages = computed(() => {
    const minDate = this.minStartDate();
    const serverSubmissionErrorMessage = this.serverSubmissionErrorMessage();
    const errorMessages = [
      {
        rule: 'minDate',
        message: `Start date must be on or after ${formatDate(new Date(minDate), 'dd MMMM yyyy')}`
      },
      {
        rule: 'weekDate',
        message: 'Start date must be a weekday (Monday to Friday)'
      }
    ];
    if (serverSubmissionErrorMessage) {
      errorMessages.push({
        rule: 'serverSubmissionError',
        message: this.serverSubmissionErrorMessage()
      });
    }
    return errorMessages;
  });

  readonly endDateErrorMessages: ErrorMessageConfig[] = [
    {
      rule: 'weekDate',
      message: 'End date must be a weekday (Monday to Friday)'
    },
    {
      rule: 'minDate',
      message: 'End date must be on or after provided start date'
    },
    {
      rule: 'maxDate',
      message: 'End date must be within 3 years of provided start date'
    }
  ];

  readonly getMinEndDate = (startDate: string) => {
    if (!startDate) {
      return this.minStartDate();
    }
    const minDate = normalizeDate(new Date(startDate));
    return formatDate(minDate);
  };

  readonly getMaxEndDate = (startDate: string) => {
    if (!startDate) {
      return null;
    }
    const maxDate = normalizeDate(new Date(startDate));
    maxDate.setFullYear(maxDate.getFullYear() + 3);
    return formatDate(maxDate);
  };

  readonly onStartDateChange = (
    startDate: string,
    endateControl: FormControl<string | null>
  ): void => {
    const endDate = endateControl.value;
    if (startDate && endDate) {
      const endDateObj = new Date(endDate);
      const startDateObj = new Date(startDate);
      const maxDate = new Date(startDateObj);
      maxDate.setFullYear(maxDate.getFullYear() + 3);
      if (endDateObj > maxDate || endDateObj < startDateObj) {
        endateControl.setValue(null);
      }
    }
  };
}
