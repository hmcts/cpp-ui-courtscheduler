import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PdkButton,
  PdkForm,
  PdkRadio,
  PdkTable,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';
import type { CourtScheduleSession } from '../../../view-schedule/model/view-schedule.model';
import { JudiciaryNameListComponent } from '../../../../shared/components/judiciary-name-list/judiciary-name-list.component';
import { AsTimePipe } from '../../../../shared/pipes/as-time.pipe';

export type ReassignmentOption = 'yes' | 'no';

@Component({
  selector: 'judiciary-reassignment-confirmation-form',
  template: `
    <form
      #form="ngForm"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="submitForm.emit(form.value.confirmReassignment)"
    >
      <h2 pdk-typography="heading-medium">Sessions with judiciary</h2>

      <table pdk-table aria-label="Sessions with judiciary">
        <thead pdk-table-head>
          <tr pdk-table-row>
            <th pdk-table-header>Courtroom</th>
            <th pdk-table-header>Date</th>
            <th pdk-table-header>Time & session</th>
            <th pdk-table-header>Type</th>
            <th pdk-table-header>Judiciary name</th>
          </tr>
        </thead>
        <tbody pdk-table-body>
          @for (session of sessions(); track session.courtScheduleId) {
            <tr pdk-table-row>
              <td pdk-table-cell>
                {{ session.courtRoomName || 'Courtroom ' + (session.courtRoomNumber || '') }}
              </td>
              <td pdk-table-cell>
                {{ session.sessionDate | date: 'd MMM yyyy' }}
                <br />
                {{ session.sessionDate | date: 'EEEE' }}
              </td>
              <td pdk-table-cell>
                {{ session.sessionStartTime | asTime: { sessionDate: session.sessionDate } }}
                to
                {{ session.sessionEndTime | asTime: { sessionDate: session.sessionDate } }}
                <br />
                {{ session.courtSession === 'AD' ? 'All day' : session.courtSession }}
              </td>
              <td pdk-table-cell>{{ session.businessDescription || session.businessType }}</td>
              <td pdk-table-cell>
                <judiciary-name-list [judiciaries]="session.judiciaries" />
              </td>
            </tr>
          }
        </tbody>
      </table>

      <pdk-form-field
        label="Select an option"
        labelType="small"
        [errorMessages]="[
          { rule: 'required', message: 'Select yes if you want to reassign judiciary.' }
        ]"
      >
        <pdk-radio-group name="confirmReassignment" ngModel required>
          <pdk-radio-button value="yes">Yes</pdk-radio-button>
          <pdk-radio-button value="no">No</pdk-radio-button>
        </pdk-radio-group>
      </pdk-form-field>

      <button type="submit" pdk-button>Continue</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    PdkButton,
    PdkForm,
    PdkRadio,
    PdkTable,
    PdkTypographyDirective,
    JudiciaryNameListComponent,
    AsTimePipe
  ]
})
export class JudiciaryReassignmentConfirmationFormComponent {
  readonly sessions = input<CourtScheduleSession[]>([]);
  readonly submitForm = output<ReassignmentOption>();
  readonly errors = output<ValidationError[] | null>();
}
