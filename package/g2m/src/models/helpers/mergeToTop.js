import { mergeTwoEqualNearSibling } from ".";
import { CellData } from "..";
import { CellTags } from "../../constants";

const mergeToTop = (cells, r, c) => {
    for (let j = 0; j < c; j += 1) {
        let temp = [];
        for (let i = 0; i < r; i += 1) {
            temp.unshift(cells[i][j]);
        }

        temp = mergeTwoEqualNearSibling(temp);

        for (let i = 0; i < temp.length; i += 1) {
            const cell = temp[temp.length - i - 1];
            const [x, y] = cell.getPosition();

            if (x === i && y === j) {
                cell.setTag(CellTags.OLD);
            } else {
                if (cell.tags !== CellTags.MERGED) {
                    cell.setTag(CellTags.MOVED);
                }

                cell.setPosition(i, j);
            }

            cells[i][j] = cell;
        }

        for (let i = temp.length; i < r; i += 1) {
            cells[i][j] = new CellData(0);
        }
    }
};

export default mergeToTop;
