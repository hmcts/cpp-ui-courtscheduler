import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ErrorMessageConfig,
  PdkButton,
  PdkForm,
  PdkFormFieldComponent,
  PdkFormGroupComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import { OrganisationUnitAutosuggestComponent } from '@cpp/reference-data';
import { FormsModule } from '@angular/forms';
import * as dateUtils from '../../../../shared/utils/date-utils';
import { ItinerarySearchParams } from '../../store/manage-judiciary-itinerary.store.interfaces';
import { DateRangeComponent } from '../../../../shared/components/date-range/date-range.component';

@Component({
  selector: 'judicial-itinerary-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './judicial-itinerary-form.component.html',
  imports: [
    FormsModule,
    PdkButton,
    PdkForm,
    PdkFormFieldComponent,
    PdkFormGroupComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    OrganisationUnitAutosuggestComponent,
    DateRangeComponent
  ]
})
export class JudicialItineraryFormComponent {
  readonly minStartDate = dateUtils.formatDate(new Date());
  readonly initialValues = input<ItinerarySearchParams>();
  readonly submitForm = output<ItinerarySearchParams>();
  readonly errors = output<ValidationError[] | null>();

  readonly getMinEndDate = (startDate: string | null): string | null => {
    if (!startDate) {
      return this.minStartDate;
    }
    const minDate = dateUtils.normalizeDate(new Date(startDate));
    return dateUtils.formatDate(minDate);
  };

  readonly startDateErrorMessages: ErrorMessageConfig[] = [
    {
      rule: 'minDate',
      message: 'Start date must be on or after today'
    },
    {
      rule: 'weekDate',
      message: 'Start date must be a weekday (Monday to Friday)'
    }
  ];
  readonly endDateErrorMessages: ErrorMessageConfig[] = [
    {
      rule: 'weekDate',
      message: 'End date must be a weekday (Monday to Friday)'
    },
    {
      rule: 'minDate',
      message: 'End date must be on or after start date'
    }
  ];
}
