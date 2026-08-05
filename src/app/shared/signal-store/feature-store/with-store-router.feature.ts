import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStoreFeature, withMethods } from '@ngrx/signals';

export function withStoreRouter() {
  return signalStoreFeature(
    withMethods((_, router = inject(Router)) => ({
      navigateTo: (routes: string[]) => router.navigate(routes),
      navigateByUrlTo: (url: string) => router.navigateByUrl(url)
    }))
  );
}
