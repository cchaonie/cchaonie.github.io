import { OverlayProps } from './types';

import './index.css';

export default ({ children }: OverlayProps) => (
  <div className='overlay'>{children}</div>
);
