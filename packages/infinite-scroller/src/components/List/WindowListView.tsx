import { useCallback, useMemo, useState } from 'react';
import { WindowList } from './windowList';
import ListView from './ListView';

interface WindowListViewProps {
  listData: any[];
}

/**
 * 接收整个列表数据，产出固定长度窗口（windowSize)，当视图在窗口发生变化时，更新窗口的内容。
 * @param param0
 */
export default function WindowListView({ listData }: WindowListViewProps) {
  const windowList = useMemo(() => new WindowList(listData), [listData]);

  const [windowItems, setWindowItems] = useState(windowList.windowItems);
  const [shouldReload, setShouldReload] = useState(false);
  const updateView = useCallback(
    (viewTop: number) => {
      if (viewTop !== windowList.viewTop) {
        const updated = windowList.viewMove(viewTop);
        if (updated) {
          setShouldReload(true);
          setWindowItems(windowList.windowItems);
        } else {
          setShouldReload(false);
        }
      }
    },
    [windowList]
  );

  return (
    <ListView
      list={windowItems}
      updateView={updateView}
      viewStartIndex={windowList.viewTop}
      shouldReload={shouldReload}
    />
  );
}
