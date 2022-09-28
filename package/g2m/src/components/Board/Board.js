import Row from "../Row";

const Board = ({ cells }) => (
    <div className="game-board">
        {cells.map((row, i) => (
            <Row key={`${i + 1}`} row={row} />
        ))}
    </div>
);

export default Board;
