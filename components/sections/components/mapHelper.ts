

// const clearLabels = (labelsRef: any) => {
//   if (!Array.isArray(labelsRef.current)) {
//     labelsRef.current = [];
//     return;
//   }
//   labelsRef.current.forEach((m: any) => m.remove());
//   labelsRef.current = [];
// };

export const toFeetInches = (feetValue: number): string => {
  if (!isFinite(feetValue) || feetValue < 0) return `0'0"`;
  const feet = Math.floor(feetValue);
  const inches = Math.round((feetValue - feet) * 12);
  return `${feet}'${inches}"`;
};

export const normalizeBearing = (bearing: number): number => {
  const normalized = ((bearing % 360) + 360) % 360;
  const snapped = Math.round(normalized / 90) * 90;
  return snapped % 360;
};


