export enum RiskType {
  PHYSICAL = 'PHYSICAL',
  CHEMICAL = 'CHEMICAL',
  BIOLOGICAL = 'BIOLOGICAL',
  ERGONOMIC = 'ERGONOMIC',
  ACCIDENT = 'ACCIDENT',
}

export const RiskTypeLabels = {
  [RiskType.PHYSICAL]: 'Físico',
  [RiskType.CHEMICAL]: 'Químico',
  [RiskType.BIOLOGICAL]: 'Biológico',
  [RiskType.ERGONOMIC]: 'Ergonômico',
  [RiskType.ACCIDENT]: 'Acidente',
};



