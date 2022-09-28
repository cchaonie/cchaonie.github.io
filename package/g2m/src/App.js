import "./App.css";
import { useContext, useState, useEffect, useRef } from "react";
import { GameDataContext } from "./contexts";
import { Board, OperationCounter } from "./components";
import { GameStatus, Directions, GAME_OVER } from "./constants";

function App() {
  const {
    getCells,
    move,
    addNewCell,
    reset: resetData,
    isGameOver,
    containsMergedCell,
    containsMovedCell,
  } = useContext(GameDataContext);

  const [cells, setCells] = useState(getCells());

  const [status, setStatus] = useState(GameStatus.INITIALIZED);

  const [operationCount, setOperationCount] = useState(0);

  const mainElementRef = useRef(null);

  const initGame = () => {
    addNewCell();
    setCells(getCells());
    setStatus(GameStatus.RUNNING);
  };

  const resetGame = () => {
    resetData();
    setCells(getCells());
    setOperationCount(0);
    setStatus(GameStatus.INITIALIZED);
  };

  useEffect(() => {
    const keydownHandler = (event) => {
      let map = {
        37: Directions.LEFT,
        38: Directions.TOP,
        39: Directions.RIGHT,
        40: Directions.BOTTOM,
      };
      let modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      let mapped = map[event.which];
      if (!modifiers && mapped !== undefined && status === GameStatus.RUNNING) {
        event.preventDefault();
        move(mapped);
        setCells(getCells());
        if (containsMergedCell() || containsMovedCell()) {
          setOperationCount(prev => prev + 1);
          setStatus(GameStatus.NEED_NEW_CELL);
        }
      }
    };
    document.addEventListener("keydown", keydownHandler);

    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, [move, status, getCells, containsMergedCell, containsMovedCell]);

  useEffect(() => {
    const mainElement = mainElementRef.current;

    let touchStartClientX, touchStartClientY;

    const touchStartHandler = (event) => {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
      event.preventDefault();
    };

    const touchMoveHandler = (event) => {
      event.preventDefault();
    };

    const touchEndHandler = (event) => {
      let touchEndClientX, touchEndClientY;

      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;

      let dx = touchEndClientX - touchStartClientX;
      let absDx = Math.abs(dx);
      let dy = touchEndClientY - touchStartClientY;
      let absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        const direction = absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0;
        move(direction);
        setCells(getCells());
        if (containsMergedCell() || containsMovedCell()) {
          setOperationCount(prev => prev + 1);
          setStatus(GameStatus.NEED_NEW_CELL);
        }
      }
    };
    if (mainElement) {
      mainElement.addEventListener("touchstart", touchStartHandler);
      mainElement.addEventListener("touchmove", touchMoveHandler);
      mainElement.addEventListener("touchend", touchEndHandler);
    }
    return () => {
      if (mainElement) {
        mainElement.removeEventListener("touchstart", touchStartHandler);
        mainElement.removeEventListener("touchmove", touchMoveHandler);
        mainElement.removeEventListener("touchend", touchEndHandler);
      }
    };
  }, [move, getCells, containsMergedCell, containsMovedCell]);

  useEffect(() => {
    if (status === GameStatus.NEED_NEW_CELL) {
      addNewCell();
      setCells(getCells());
      if (isGameOver()) {
        setStatus(GameStatus.OVER);
      } else {
        setStatus(GameStatus.RUNNING);
      }
    }
  }, [status, addNewCell, isGameOver, getCells]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="game-title">2048</div>
        <div className="game-infoPanel">
          <div className="game-controller">
            <button
              onClick={initGame}
              className="game-controller__button game-start"
              disabled={status !== GameStatus.INITIALIZED}
            >
              开始
            </button>
            <button
              onClick={resetGame}
              className="game-controller__button game-reset"
              disabled={status === GameStatus.INITIALIZED}
            >
              重置
            </button>
          </div>
          <div className="game-statics">
            <div className="game-statics__title">统计数据</div>
            <OperationCounter count={operationCount}/>
          </div>
        </div>
      </header>
      <main className="game-main" ref={mainElementRef}>
        <Board cells={cells} />
        {status === GameStatus.OVER && (
          <div className="game-over__message">{GAME_OVER}</div>
        )}
      </main>
    </div>
  );
}

export default App;
