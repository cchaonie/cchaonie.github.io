import { useEffect, useRef, useState } from 'react';

import ListItem from './ListItem';
import './index.css';
import { isElementVisible } from './isElementVisible';

export default function ListView({
  list,
  updateView,
  viewStartIndex,
  shouldReload,
}: any) {
  const listRef = useRef<HTMLUListElement>(null);
  const [status, setStatus] = useState('init');

  useEffect(() => {
    const ulEl = listRef.current;
    if (ulEl) {
      if (shouldReload) {
        const items = ulEl.children;
        let scrollDistances = 0;
        for (let i = 0; i <= viewStartIndex; i++) {
          scrollDistances += items[i].getBoundingClientRect().height;
        }
        setStatus('scrolled');
        ulEl.scrollTo({ top: scrollDistances });
      }
    }
  }, [shouldReload, viewStartIndex]);

  useEffect(() => {
    const ulEl = listRef.current;
    let handler = () => {
      if (status === 'init') {
        if (ulEl) {
          let visibleStartIndex = 0;
          const items = ulEl.children;
          for (let i = 0; i < items.length; i++) {
            if (isElementVisible(ulEl, items[i])) {
              visibleStartIndex = i;
              break;
            }
          }
          updateView(visibleStartIndex);
        }
      } else {
        setStatus('init');
      }
    };

    if (ulEl) {
      ulEl.addEventListener('scroll', handler);
      return () => {
        ulEl.removeEventListener('scroll', handler);
      };
    }
    return () => {};
  }, [updateView, shouldReload, status]);

  return (
    <ul className='largeListContainer' ref={listRef}>
      {list.map((item: any, idx: number) => (
        <ListItem item={item} key={`${idx}- ${item.name}`} />
      ))}
    </ul>
  );
}
