import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  afterRenderEffect,
  inject,
  input,
  output,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  BulkActionPayload,
  CourtSchedule,
  CourtScheduleSession
} from '../../model/view-schedule.model';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

import { SessionsListComponent } from '../sessions-list/sessions-list.component';
import { BannerMessage } from '../../../../shared/model/banner-message';
import { isEqual } from '../../../../shared/utils/array-utils';
import {
  PdkAccordion,
  PdkAccordionComponent,
  PdkAccordionItemComponent,
  PdkAlertComponent,
  PdkDividerComponent,
  PdkGrid,
  PdkMarginDirective,
  PdkTypographyDirective,
  ValidationError
} from '@cpp/pdk';

@Component({
  selector: 'courtroom-list',
  template: `
    @let banner = bannerMessage();
    <div pdk-grid container pdk-margin-bottom="4">
      <pdk-grid full>
        <h2 pdk-typography="heading-medium" pdk-margin-bottom="0">List of sessions</h2>
        <pdk-divider></pdk-divider>
        <pdk-accordion [open]="openAccordionsIndexes" (openChange)="handleOpenChange($event)">
          @for (courtSchedule of courtSchedules(); let i = $index; track i) {
            <pdk-accordion-item
              [title]="courtSchedule.courtRoomName"
              [id]="i"
              data-test-id="courtroomListItem"
            >
              @if (!!banner?.message && banner.courtRoomName === courtSchedule.courtRoomName) {
                <div pdk-margin-vertical="4" #bannerElement class="banner-alert">
                  <pdk-alert icon="true" type="{{ banner.bannerType }}">{{
                    banner.message
                  }}</pdk-alert>
                </div>
              }
              <sessions-list
                [sessions]="courtSchedule.sessions"
                [jurisdiction]="jurisdiction()"
                (submitForm)="handleBulkAction($event)"
                (setSessionToEdit)="handleEdit($event)"
                (validationErrors)="handleValidationErrors($event)"
              />
            </pdk-accordion-item>
          }
        </pdk-accordion>
      </pdk-grid>
    </div>
  `,
  imports: [
    PdkAccordion,
    PdkAlertComponent,
    PdkDividerComponent,
    PdkGrid,
    PdkMarginDirective,
    PdkTypographyDirective,
    SessionsListComponent
  ],
  styles: `
    .banner-alert {
      scroll-margin-top: 150px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourtroomListComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  readonly courtSchedules = input<CourtSchedule[]>([]);
  readonly bannerMessage = input<BannerMessage>();
  readonly activeCourtroomsIndexes = input<number[]>([]);
  readonly jurisdiction = input<JurisdictionType | null>(null);

  readonly submitForm = output<BulkActionPayload>();
  readonly setSessionToEdit = output<CourtScheduleSession>();
  readonly setActiveCourtroomsIndexes = output<number[]>();
  readonly validationErrors = output<ValidationError[]>();

  readonly banner = viewChild<ElementRef<HTMLDivElement>>('bannerElement');
  readonly accordion = viewChild(PdkAccordionComponent);
  readonly accordionItems = viewChildren(PdkAccordionItemComponent, { read: ElementRef });

  openAccordionsIndexes: number[] = [];

  constructor() {
    afterRenderEffect(() => {
      const banner = this.banner();
      if (banner && banner.nativeElement) {
        banner.nativeElement.scrollIntoView();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courtSchedules']) {
      this.openAccordions();
      this.validationErrors.emit([]);
    }
  }

  handleEdit(event: CourtScheduleSession) {
    this.setSessionToEdit.emit(event);
  }

  handleBulkAction(event: BulkActionPayload) {
    this.submitForm.emit(event);
  }

  handleValidationErrors(errors: ValidationError[]) {
    this.validationErrors.emit(errors);
  }

  handleOpenChange(openAccordionsIndexes: number[]) {
    this.setActiveCourtroomsIndexes.emit(openAccordionsIndexes);
  }

  openAccordions() {
    if (this.accordionItems() && this.activeCourtroomsIndexes().length > 0) {
      const activeCourtroomsIndexes = this.activeCourtroomsIndexes();
      if (!isEqual(this.openAccordionsIndexes, activeCourtroomsIndexes)) {
        this.openAccordionsIndexes = [...activeCourtroomsIndexes];
      }

      this.cdr.detectChanges();
      this.accordion().markItemsForCheck();
    }
  }
}
