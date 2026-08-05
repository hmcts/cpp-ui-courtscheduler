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
  PdkDateInput,
  PdkDividerComponent,
  PdkForm,
  PdkFormFieldComponent,
  PdkGrid,
  PdkLinkDirective,
  PdkMarginDirective,
  PdkPaddingDirective,
  PdkRadioGroupComponent,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { SessionType } from '../../../../shared/model/session';
import { formatDate, normalizeDate } from '../../../../shared/utils/date-utils';
import { DraftItinerary } from '../../model/judicial-itinerary.interface';
import { DateRangeComponent } from '../../../../shared/components/date-range/date-range.component';
import { DaysOfWeekSelectorComponent } from '../../../../shared/components/days-of-week-selector/days-of-week-selector.component';

@Component({
  selector: 'add-sitting-days-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-sitting-days-form.component.html',
  imports: [
    FormsModule,
    PdkButton,
    PdkButtonGroupComponent,
    PdkDateInput,
    PdkDividerComponent,
    PdkForm,
    PdkFormFieldComponent,
    PdkGrid,
    PdkLinkDirective,
    PdkMarginDirective,
    PdkRadioGroupComponent,
    PdkTypographyDirective,
    DateRangeComponent,
    PdkPaddingDirective,
    DaysOfWeekSelectorComponent
  ],
  styles: `
    pdk-divider {
      clear: both;
    }
  `
})
export class AddSittingDaysFormComponent {
  readonly initialValues = input<DraftItinerary | null>(null);
  readonly serverSubmissionErrorMessage = input<string | null>(null);
  readonly submitForm = output<DraftItinerary>();
  readonly errors = output<ValidationError[] | null>();
  readonly clearForm = output<void>();

  readonly sessionOptions = [
    { label: 'All day', value: 'AD' as SessionType },
    { label: 'AM', value: 'AM' as SessionType },
    { label: 'PM', value: 'PM' as SessionType }
  ];

  readonly minStartDate = formatDate(new Date());
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
  readonly startDateErrorMessages = computed((): ErrorMessageConfig[] => {
    if (this.serverSubmissionErrorMessage()) {
      return [
        {
          rule: 'minDate',
          message: 'Start date must be on or after today'
        },
        {
          rule: 'weekDate',
          message: 'Start date must be a weekday (Monday to Friday)'
        },
        {
          rule: 'serverSubmissionError',
          message: this.serverSubmissionErrorMessage()
        }
      ];
    }
    return [
      {
        rule: 'minDate',
        message: 'Start date must be on or after today'
      },
      {
        rule: 'weekDate',
        message: 'Start date must be a weekday (Monday to Friday)'
      }
    ];
  });
  readonly endDateErrorMessages: ErrorMessageConfig[] = [
    {
      rule: 'minDate',
      message: 'End date must be on or after start date'
    },
    {
      rule: 'maxDate',
      message: 'End date must be within 3 years of start date'
    },
    {
      rule: 'weekDate',
      message: 'End date must be a weekday (Monday to Friday)'
    }
  ];
  readonly getMinEndDate = (startDate: string) => {
    if (!startDate) {
      return this.minStartDate;
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
