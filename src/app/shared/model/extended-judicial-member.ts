import { JudicialMember } from '@cpp/reference-data';

export interface ExtendedJudicialMember extends JudicialMember {
  isBenchChairman?: boolean;
  isDeputy?: boolean;
}
