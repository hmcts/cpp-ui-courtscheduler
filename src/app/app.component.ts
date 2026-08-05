import { Component, computed, effect, inject, linkedSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, NavigationStart, RouterOutlet } from '@angular/router';
import { DETECT_NETWORK } from '@cpp/core';
import { CppApplicationLayoutComponent, HeaderNavItem } from '@cpp/application';
import { PdkPaddingDirective } from '@cpp/pdk';
import { select, Store } from '@ngrx/store';
import { createRouterSignals } from '../shared-signals/router-signals';
import { AppConfigService } from './config';
import { AppState } from './core/reducers';
import { getHasApiActivity } from './core/selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CppApplicationLayoutComponent, PdkPaddingDirective]
})
export class AppComponent {
  readonly configService = inject(AppConfigService);
  readonly store = inject(Store<AppState>);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly titleService = inject(Title);
  readonly detectNetwork = inject(DETECT_NETWORK);
  readonly routerSignal = createRouterSignals();
  readonly hasApiActivity = toSignal(this.store.pipe(select(getHasApiActivity)));
  readonly online = toSignal(this.detectNetwork(), { requireSync: true });
  readonly hasNavigationActivity = linkedSignal({
    source: computed(() => this.routerSignal.navigationEvent()),
    computation: (event) => !!event && event instanceof NavigationStart
  }).asReadonly();
  readonly hasActivity: Signal<boolean> = computed(() => {
    return this.hasApiActivity() || this.hasNavigationActivity();
  });
  readonly documentTitle = linkedSignal<NavigationEnd | undefined, string>({
    source: this.routerSignal.navigationEndEvent,
    computation: (endEvent, previousTitle) => {
      let child = this.activatedRoute.firstChild;
      if (!endEvent) {
        return previousTitle;
      }
      while (child?.firstChild) {
        child = child.firstChild;
      }
      if (child?.snapshot.data['title']) {
        return child.snapshot.data['title'];
      }
      return previousTitle?.value;
    }
  });
  readonly headerNavItems = computed(() => {
    let navItems: HeaderNavItem[] = [];
    navItems = [...navItems, { title: 'Home', href: this.configService.appUrl }];

    if (this.configService.accountUrl) {
      navItems = [...navItems, { title: 'Your Account', href: this.configService.accountUrl }];
    }

    if (this.configService.logoutUrl) {
      navItems = [...navItems, { title: 'Sign out', href: this.configService.logoutUrl }];
    }

    return navItems;
  });

  constructor() {
    this.documentTitle.set(this.titleService.getTitle());
    effect(() => this.titleService.setTitle(this.documentTitle()));
  }
}
