import {
  SignalStoreFeature,
  signalStore,
  WritableStateSource,
  StateSource,
  SignalStoreFeatureResult
} from '@ngrx/signals';
import { Type } from '@angular/core';

export type ExtractSignalStoreFeatureResult<T> =
  T extends SignalStoreFeature<SignalStoreFeatureResult, infer X>
    ? Omit<InstanceType<ReturnType<typeof signalStore<X>>>, keyof WritableStateSource<X['state']>> &
        StateSource<X['state']>
    : T extends Type<infer Y>
      ? Y
      : T;
