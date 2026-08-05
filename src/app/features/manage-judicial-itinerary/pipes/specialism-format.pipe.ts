import { Pipe, PipeTransform } from '@angular/core';
import { Specialism } from '@cpp/reference-data';

const SPECIALISM_DISPLAY_MAP: Record<Specialism, string> = {
  [Specialism.MURDER]: 'Murder',
  [Specialism.ATTEMPTEDMURDER]: 'Attempted murder',
  [Specialism.SEXUALOFFENCE]: 'Serious Sexual offence',
  [Specialism.TERRORISM]: 'Terrorism'
};

@Pipe({
  name: 'specialismFormat'
})
export class SpecialismFormatPipe implements PipeTransform {
  transform(specialism: Specialism): string {
    return SPECIALISM_DISPLAY_MAP[specialism] || specialism;
  }
}
