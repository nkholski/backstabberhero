export const makeRandom = (seed: number) => {
  seed *= 100; // I'll pass level number so the second "random" r below for level 1 would be === first random r of level 2
  return (max, min = 0) => {
    const x = Math.sin(seed++) * 10000;
    return Math.round(min + (x - Math.floor(x)) * (max - min));
  };
};
