import { MenuProps } from './types';
import './menu.css';

export default ({ links }: MenuProps) => {
  return (
    <div className='menu'>
      {links.map(l => (
        <div key={l.name} className='menu_item'>
          {l.link ? (
            <a className='menu_link' href={l.link}>
              {l.name}
            </a>
          ) : (
            <span>{l.name}</span>
          )}
          {l.children && (
            <div className='submenu'>
              {l.children.map(lc => (
                <div key={lc.name} className='submenu_item'>
                  <a className='menu_link' href={lc.link}>
                    {lc.name}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
