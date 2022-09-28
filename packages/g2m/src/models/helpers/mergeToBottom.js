import { mergeTwoEqualNearSibling } from ".";
import { CellData } from "..";
import { CellTags } from "../../constants";

const mergeToBottom = (cells, r, c) => {
    for (let j = 0; j < c; j += 1) {
        let temp = [];
        for (let i = 0; i < r; i += 1) {
            temp.push(cells[i][j]);
        }

        temp = mergeTwoEqualNearSibling(temp);

        for (let i = temp.length - 1; i >= 0; i -= 1) {
            const cell = temp[i];
            const [x, y] = cell.getPosition();
            const newX = c - temp.length + i;
            const newY = j;

            if (x === newX && y === newY) {
                cell.setTag(CellTags.OLD);
            } else {
                if (cell.tags !== CellTags.MERGED) {
                    cell.setTag(CellTags.MOVED);
                }

                cell.setPosition(newX, newY);
            }

            cells[newX][newY] = cell;
        }

        for (let i = r - temp.length - 1; i >= 0; i -= 1) {
            cells[i][j] = new CellData(0);
        }
    }
};

export default mergeToBottom;
