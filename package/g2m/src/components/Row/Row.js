import Cell from "../Cell";

const Row = ({ row }) => row.map((cell, i) => <Cell key={`${i + 1}`} cell={cell} />);

export default Row;
