import { SpecialismFormatPipe } from '../specialism-format.pipe';
import { Specialism } from '@cpp/reference-data';

describe('SpecialismFormatPipe', () => {
  let pipe: SpecialismFormatPipe;

  beforeEach(() => {
    pipe = new SpecialismFormatPipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should format MURDER to "Murder"', () => {
    expect.assertions(1);

    const result = pipe.transform(Specialism.MURDER);
    expect(result).toBe('Murder');
  });

  it('should format ATTEMPTEDMURDER to "Attempted murder"', () => {
    expect.assertions(1);

    const result = pipe.transform(Specialism.ATTEMPTEDMURDER);
    expect(result).toBe('Attempted murder');
  });

  it('should format SEXUALOFFENCE to "Serious Sexual offence"', () => {
    expect.assertions(1);

    const result = pipe.transform(Specialism.SEXUALOFFENCE);
    expect(result).toBe('Serious Sexual offence');
  });

  it('should format TERRORISM to "Terrorism"', () => {
    expect.assertions(1);

    const result = pipe.transform(Specialism.TERRORISM);
    expect(result).toBe('Terrorism');
  });

  it('should return the specialism value for unknown specialisms', () => {
    expect.assertions(1);

    const result = pipe.transform('UNKNOWN' as Specialism);
    expect(result).toBe('UNKNOWN');
  });
});
