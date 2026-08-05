import { Component, inject } from '@angular/core';
import { PDK_MODAL_DATA_TOKEN, PdkButton, PdkCore } from '@cpp/pdk';

export interface RemoveJudiciaryModalData extends Record<string, unknown> {
  confirm: () => void;
  cancel: () => void;
}

@Component({
  selector: 'remove-judiciary-modal',
  imports: [PdkCore, PdkButton],
  template: `
    <pdk-focus-trap>
      <div role="alertdialog" aria-modal="true" pdk-fill-colour="white" pdk-padding="4">
        <h2 pdk-margin-vertical="0" pdk-typography="heading-medium" pdk-margin-bottom="4">
          Remove all judiciary
        </h2>
        <p pdk-margin-top="6" pdk-margin-bottom="6" pdk-typography="body">
          Do you want to remove all judiciary assigned to this session?
        </p>
        <div class="actions" role="group" aria-label="Confirm or cancel removing all judiciary">
          <button
            type="button"
            pdk-button
            pdk-margin-bottom="1"
            data-test-id="remove-all-judiciary-confirm-button"
            (click)="modalData.confirm()"
          >
            Yes
          </button>
          <a
            pdk-link
            href="javascript:void(0);"
            pdk-margin-top="1"
            data-test-id="remove-all-judiciary-cancel-link"
            (click)="modalData.cancel()"
          >
            Cancel
          </a>
        </div>
      </div>
    </pdk-focus-trap>
  `,
  styles: [
    `
      .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `
  ]
})
export class RemoveJudiciaryModalComponent {
  readonly modalData = inject(PDK_MODAL_DATA_TOKEN) as RemoveJudiciaryModalData;
}
