import { MouseEventHandler } from 'react';

export interface TargetProps {
  left: number;
  top: number;
  onClick: MouseEventHandler<HTMLDivElement>;
}
