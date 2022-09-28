import { CellTags } from "../../constants";

const Cell = ({ cell: { value, background, tag } }) => (
    <div className="game-cell">
        {!!value ? (
            <div
                style={{ background }}
                className={`game-cell__item  level_${Math.log2(value)} ${
                    tag === CellTags.CREATED ? "cell_created" : ""
                }`}
            >
                {value}
            </div>
        ) : (
            ""
        )}
    </div>
);

export default Cell;
