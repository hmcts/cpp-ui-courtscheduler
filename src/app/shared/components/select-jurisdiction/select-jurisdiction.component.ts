import { Component, model, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JurisdictionType } from '../../model/jurisdiction';
import { PdkForm, PdkRadio } from '@cpp/pdk';
import { isCrownJurisdiction } from '../../utils/jurisdiction.utils';

@Component({
  selector: 'select-jurisdiction',
  template: `
    <pdk-form-field
      label="Select jurisdiction"
      labelType="small"
      [errorMessages]="[{ rule: 'required', message: 'Select jurisdiction' }]"
    >
      <pdk-radio-group
        name="jurisdictionType"
        [ngModel]="jurisdiction()"
        (ngModelChange)="jurisdiction.set($event)"
        required
      >
        <pdk-radio-button [value]="JurisdictionType.MAGISTRATES"
          >Magistrates' Court
        </pdk-radio-button>
        @if (!isCrownCourt()) {
          <pdk-radio-conditional>
            <ng-content select="[magistrates-court]"></ng-content>
          </pdk-radio-conditional>
        }
        <pdk-radio-button [value]="JurisdictionType.CROWN">Crown Court </pdk-radio-button>
        @if (isCrownCourt()) {
          <pdk-radio-conditional>
            <ng-content select="[crown-court]"></ng-content>
          </pdk-radio-conditional>
        }
      </pdk-radio-group>
    </pdk-form-field>
  `,
  imports: [FormsModule, PdkRadio, PdkForm]
})
export class SelectJurisdictionComponent {
  readonly JurisdictionType = JurisdictionType;
  readonly jurisdiction = model<JurisdictionType | null>();
  readonly isCrownCourt = computed(() => isCrownJurisdiction(this.jurisdiction()));
}
