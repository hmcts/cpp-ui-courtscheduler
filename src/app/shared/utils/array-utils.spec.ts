import { isEqual } from './array-utils';

describe('isEqual', () => {
  it('should return true for identical arrays', () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return false for different lengths arrays', () => {
    expect(isEqual([1, 2, 3], [1, 2])).toBe(false);
  });

  it('should return false for arrays with different elements', () => {
    expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('should return true for empty arrays', () => {
    expect(isEqual([], [])).toBe(true);
  });

  it('should return false for one empty array and one non-empty array', () => {
    expect(isEqual([], [1])).toBe(false);
  });
});
