export const BEGINNER = {
  level: 1,
};
export const INTERMEDIATE = {
  level: 2,
};
export const EXPERT = {
  level: 3,
};

const ENUM = {BEGINNER, INTERMEDIATE, EXPERT};

export const checkDifficulty = (complexity, aimDifficulty) => {
  const parsedDifficulty = valueOf(complexity);

  const enable = parsedDifficulty && parsedDifficulty.level >= aimDifficulty.level;

  return enable ? 'primary' : 'lightgrey';
};

export const valueOf = value => {
  return value ? ENUM[value.toUpperCase()] : undefined;
};
