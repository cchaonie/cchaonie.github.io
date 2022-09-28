import { GameStatus } from './constant';

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];
