export function printDecimal(value: number, places: number = 2) {
  const ratio = Math.pow(10, places);
  return (Math.round(value * ratio) / ratio).toFixed(places);
}

const siSymbols = ['', 'K', 'M', 'G', 'T', 'P', 'E'];

export function printSINumber(value: number) {
  // what tier? (determines SI symbol)
  const tier = (Math.log10(Math.abs(value)) / 3) | 0;

  // if zero, we don't need a suffix
  if (tier == 0) {
    return value;
  }

  // get suffix and determine scale
  const suffix = siSymbols[tier];
  const scale = Math.pow(10, tier * 3);

  // scale the number
  const scaled = value / scale;

  // format number and add suffix
  return scaled.toFixed(1) + suffix;
}