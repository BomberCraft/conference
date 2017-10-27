
const mapper = {
  'platinium-partner': 'Platinium',
  'after-partner': 'After Party',
  'gold-partner': 'Gold',
  'other-partner': 'Partenaires',
};

export const getNameFromTitle = title => mapper[title];