import { forwardRef } from 'react';
import { BlackBoardProps } from './types';

export default forwardRef<HTMLCanvasElement, BlackBoardProps>(
  ({ width, height }, ref) => (
    <canvas ref={ref} height={height} width={width}></canvas>
  )
);
