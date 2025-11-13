// utils/lengthHelper.ts
export function toFeetInches(meters: number) {
  const feet = meters * 3.28084;
  const ft = Math.floor(feet);
  const inches = Math.round((feet - ft) * 12);
  return `${ft}'${inches}"`;
}
