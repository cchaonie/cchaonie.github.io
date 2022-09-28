import { TargetProps } from './types';
import './index.css';

export default ({ left, top, onClick }: TargetProps) => {
  return (
    <div
      className='target'
      onClick={onClick}
      style={{
        left,
        top,
      }}
    ></div>
  );
};
