if (typeof Array.prototype.toSorted !== 'function') {
  // eslint-disable-next-line no-extend-native
  Array.prototype.toSorted = function <T>(this: T[], compareFn?: (a: T, b: T) => number): T[] {
    return [...this].sort(compareFn);
  };
}

// mock internal windows object for scrolling and the pdk-text-area resize styling
const noop = (options?: ScrollOptions) => {};

Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

Object.defineProperty(window, 'getComputedStyle', {
  value: (node: any) => ({
    getPropertyValue: (prop: any) => {
      return '';
    }
  }),
  writable: false
});
