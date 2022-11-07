export const longList = new Array(10000).fill(0).map((_, i) => ({
  name: `${i}`,
  description: `${i}-${i}+${i}`,
}));
