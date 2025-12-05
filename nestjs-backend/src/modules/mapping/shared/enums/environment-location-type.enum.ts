export enum EnvironmentLocationType {
  EMPLOYER_ESTABLISHMENT = 'EMPLOYER_ESTABLISHMENT',
  THIRD_PARTY_ESTABLISHMENT = 'THIRD_PARTY_ESTABLISHMENT',
  MOBILE = 'MOBILE',
}

export const EnvironmentLocationTypeLabels = {
  [EnvironmentLocationType.EMPLOYER_ESTABLISHMENT]: 'Estabelecimento do Empregador',
  [EnvironmentLocationType.THIRD_PARTY_ESTABLISHMENT]: 'Estabelecimento de Terceiros',
  [EnvironmentLocationType.MOBILE]: 'Itinerante',
};



