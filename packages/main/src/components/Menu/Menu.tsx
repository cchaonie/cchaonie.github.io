import { MenuProps } from './types';
import { MenuItem } from './components';

import './menu.css';

export default ({ links }: MenuProps) => {
  return (
    <div className='menu'>
      {links.map(({ name, link, subLinks }) => (
        <MenuItem key={name} name={name} link={link} subLinks={subLinks} />
      ))}
    </div>
  );
};
