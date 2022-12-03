import { useState, MouseEvent } from 'react';

import { Link } from '../../types';

import './menuItem.css';

export const MenuItem = ({ name, link, subLinks }: Link) => {
  const [showChildren, setShowChildren] = useState(false);

  const handleMouseMove = () => {
    setShowChildren(true);
  };

  const handleMouseLeave = () => {
    setShowChildren(false);
  };

  return (
    <div
      className='menu_item'
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {link ? (
        <a className='menu_link' href={link}>
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
      {showChildren && subLinks && (
        <div className='submenu'>
          {subLinks.map(child => (
            <div key={child.name} className='submenu_item'>
              <a className='menu_link' href={child.link}>
                {child.name}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
