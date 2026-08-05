import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import {
  PdkButton,
  PdkForm,
  PdkFormFieldComponent,
  PdkSelectComponent,
  PdkMarginDirective,
  SelectOption
} from '@cpp/pdk';
import { BulkActionType } from '../../../model/view-schedule.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'session-actions',
  templateUrl: './session-actions.component.html',
  styles: [
    `
      .action-wrapper {
        display: flex;
        align-items: flex-end;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PdkButton,
    PdkForm,
    PdkFormFieldComponent,
    PdkMarginDirective,
    PdkSelectComponent
  ]
})
export class SessionActionsComponent {
  readonly actionOptions = input<SelectOption<string>[]>([
    { value: BulkActionType.REMOVE, label: 'Remove' },
    { value: BulkActionType.ASSIGN, label: 'Assign courtroom' }
  ]);
  readonly selectedSessionsCount = input<number>(0);
  readonly onSubmit = output<string>();

  formValues: { selectedAction: string | null } = {
    selectedAction: null
  };

  handleSubmit(selectedAction: string) {
    this.onSubmit.emit(selectedAction);
  }
}
