export enum PanelType {
  ADULT = 'ADULT',
  YOUTH = 'YOUTH'
}

export type PanelTypeUnion = keyof typeof PanelType;
