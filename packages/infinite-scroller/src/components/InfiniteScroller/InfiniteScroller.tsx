import { InfiniteScrollerProps } from './types';
import './InfiniteScroller.css';

const InfiniteScroller = ({ list }: InfiniteScrollerProps) => {
  const handleScroll = () => {
    
  };
  return (
    <div className='InfiniteScroller'>
      <div className='scroller-container' onScroll={handleScroll}></div>
      <div className='list-content'></div>
    </div>
  );
};

export default InfiniteScroller;
