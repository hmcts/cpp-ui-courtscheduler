import { Component, OnInit, computed, input } from '@angular/core';
import { FrequencyType, RepeatPattern } from '../../model/repeat-pattern';
import * as dateUtils from '../../../../shared/utils/date-utils';
import { PdkGrid, PdkMarginDirective, PdkSummaryList, PdkTypographyDirective } from '@cpp/pdk';
import { NgPlural, NgPluralCase } from '@angular/common';

@Component({
  selector: 'repeat-pattern-summary',
  template: `
    @let pattern = repeatPattern();
    <div pdk-grid container pdk-margin-bottom="8">
      <pdk-grid one-half>
        <h2 pdk-typography="heading-medium" pdk-margin-bottom="0">Repeat session</h2>

        <div pdk-margin-bottom="8">
          <dl pdk-summary-list>
            <div pdk-summary-list-item>
              <dt pdk-summary-list-key>Start date</dt>
              <dd pdk-summary-list-value data-test-id="startDate">
                {{ repeatPatternDates.startDateLabel }}
              </dd>
            </div>
            <div pdk-summary-list-item>
              <dt pdk-summary-list-key>Every</dt>
              <dd pdk-summary-list-value data-test-id="repeat-for">
                {{ repeatPattern().repeatFor }}
                @if (isMonthlyFrequency()) {
                  <ng-container [ngPlural]="pattern?.repeatFor">
                    <ng-template ngPluralCase="=1">month</ng-template>
                    <ng-template ngPluralCase="other">months</ng-template>
                  </ng-container>
                } @else {
                  <ng-container [ngPlural]="pattern?.repeatFor">
                    <ng-template ngPluralCase="=1">week</ng-template>
                    <ng-template ngPluralCase="other">weeks</ng-template>
                  </ng-container>
                }
              </dd>
            </div>
            <div pdk-summary-list-item>
              <dt pdk-summary-list-key>End date</dt>
              <dd pdk-summary-list-value data-test-id="end-date">
                {{ repeatPatternDates.endDateLabel }}
              </dd>
            </div>
          </dl>
        </div>
      </pdk-grid>
    </div>
  `,
  styles: [
    `
      .pdk-summary-list__key,
      .pdk-summary-list__value {
        border-bottom: 0;
      }
    `
  ],
  imports: [
    NgPlural,
    NgPluralCase,
    PdkGrid,
    PdkMarginDirective,
    PdkSummaryList,
    PdkTypographyDirective
  ]
})
export class RepeatPatternSummaryComponent implements OnInit {
  readonly repeatPattern = input<RepeatPattern>();
  repeatPatternDates: {
    startDateLabel: string;
    endDateLabel: string;
  };

  ngOnInit(): void {
    this.repeatPatternDates = {
      startDateLabel: dateUtils.parseDateToLocaleString(this.repeatPattern().startDate),
      endDateLabel: dateUtils.parseDateToLocaleString(this.repeatPattern().endDate)
    };
  }

  isMonthlyFrequency = computed(() => {
    return this.repeatPattern()?.frequency === FrequencyType.EVERY_MONTH;
  });
}
