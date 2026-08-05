import { Component, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ManageSessionsStore } from '../../store/manage-sessions.store';

@Component({
  selector: 'edit-sessions-shell',
  template: `<router-outlet />`,
  imports: [RouterOutlet]
})
export class EditSessionsShellComponent implements OnDestroy {
  private readonly store = inject(ManageSessionsStore);

  ngOnDestroy(): void {
    this.store.clearState();
  }
}
