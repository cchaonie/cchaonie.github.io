import { Circle } from '../models/types';
import distance from './distance';

/**
 * collisionDetection
 */
export default (
  { x: x1, y: y1 }: Circle,
  { x: x2, y: y2 }: Circle,
  minDistance: number
) => distance(x1, y1, x2, y2) < minDistance;
