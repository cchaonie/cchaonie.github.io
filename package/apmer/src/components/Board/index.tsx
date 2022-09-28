import { useCallback, useEffect, useRef, useState } from 'react';
import { circlePool } from '../../models';
import { CirclePoolEvents } from '../../models/constant';
import { Circle } from '../../models/types';
import Overlay from '../Overlay';
import Target from '../Target';
import { GameStatus, MaxCountDown } from './constant';
import type { GameStatus as GameStatusType } from './types';

import './index.css';
import StartImg from '../../assets/images/start.png';

export default () => {
  const [hit, setHit] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [miss, setMiss] = useState(0);
  const [targets, setTargets] = useState<Circle[]>([]);

  const [countDown, setCountDown] = useState(MaxCountDown);
  const [status, setStatus] = useState<GameStatusType>(GameStatus.NOT_STARTED);
  const countingDownRef = useRef<any>({ id: undefined });

  if (status === GameStatus.RUNNING && countDown > 0) {
    const { id } = countingDownRef.current;
    if (!id) {
      countingDownRef.current.id = setTimeout(() => {
        setCountDown(c => c - 1);
        countingDownRef.current.id = undefined;
      }, 1000);
    }
  }

  if (countDown === 0 && status !== GameStatus.OVER) {
    circlePool.destroy();

    setStatus(GameStatus.OVER);
    if (countingDownRef.current.id) {
      clearTimeout(countingDownRef.current.id);
    }
  }

  const handleClick = () => {
    if (status === GameStatus.RUNNING) {
      setClickCount(c => c + 1);
    }
  };

  const handleHit = useCallback(
    (i: number) => {
      setHit(h => h + 1);
      const newTargets = targets.slice();
      newTargets.splice(i, 1);
      circlePool.circles = newTargets;
    },
    [targets, circlePool]
  );

  const handleClickStart = () => {
    if (status !== GameStatus.RUNNING) {
      setCountDown(MaxCountDown);
      setStatus(GameStatus.RUNNING);
      setHit(0);
      setClickCount(0);
      setMiss(0);

      circlePool.subscribe(CirclePoolEvents.CREATE, setTargets);
      circlePool.subscribe(CirclePoolEvents.DISPOSE, () => setMiss(m => m + 1));

      circlePool.initPool();
    }
  };

  return (
    <div className='board' onClick={handleClick}>
      <h2>APMER</h2>
      <div className='board_description'>
        <div className='score'>
          <div className='score_item'>{`Hit/Click/Miss: ${hit}/${clickCount}/${miss}`}</div>
          <div className='score_item'>{`命中率: ${(
            (hit / (miss + hit) || 0) * 100
          ).toFixed(4)}%`}</div>
          <div className='score_item'>{`有效命中率: ${(
            (hit / clickCount || 0) * 100
          ).toFixed(4)}%`}</div>
        </div>
        <div className='countDown'>
          <div>{`倒计时: ${countDown}`}</div>
        </div>
      </div>
      <div className='board_battleField'>
        {targets.map(({ x, y }, i) => (
          <Target
            left={x}
            top={y}
            onClick={() => handleHit(i)}
            key={`${x}-${y}`}
          />
        ))}
      </div>
      {status !== GameStatus.RUNNING && (
        <Overlay>
          <img
            onClick={handleClickStart}
            src={StartImg}
            alt='Press Enter to Start the game'
          />
        </Overlay>
      )}
    </div>
  );
};
