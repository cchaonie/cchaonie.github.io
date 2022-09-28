const getRandomN = (n: number) => Math.random() * n;

export default (maxX: number, maxY: number) => [
  getRandomN(maxX),
  getRandomN(maxY),
];
