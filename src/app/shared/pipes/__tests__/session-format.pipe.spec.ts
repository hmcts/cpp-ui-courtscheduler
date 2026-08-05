import { SessionFormatPipe } from '../session-format.pipe';
import { SessionType } from '../../model/session';

describe('SessionFormatPipe', () => {
  let pipe: SessionFormatPipe;

  beforeEach(() => {
    pipe = new SessionFormatPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should return "Not added" when sessionType is null', () => {
    expect.assertions(1);
    const result = pipe.transform(null);
    expect(result).toBe('Not added');
  });

  it('should return "Not added" when sessionType is undefined', () => {
    expect.assertions(1);
    const result = pipe.transform(undefined);
    expect(result).toBe('Not added');
  });

  it('should return "All day" for AD session type', () => {
    expect.assertions(1);
    const result = pipe.transform('AD' as SessionType);
    expect(result).toBe('All day');
  });

  it('should return "AM" for AM session type', () => {
    expect.assertions(1);
    const result = pipe.transform('AM' as SessionType);
    expect(result).toBe('AM');
  });

  it('should return "PM" for PM session type', () => {
    expect.assertions(1);
    const result = pipe.transform('PM' as SessionType);
    expect(result).toBe('PM');
  });

  it('should return the sessionType value for unknown session types', () => {
    expect.assertions(1);
    const result = pipe.transform('UNKNOWN' as any);
    expect(result).toBe('UNKNOWN');
  });
});
