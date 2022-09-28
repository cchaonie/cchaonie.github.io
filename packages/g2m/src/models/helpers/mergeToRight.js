import { mergeTwoEqualNearSibling } from ".";
import { CellData } from "..";
import { CellTags } from "../../constants";

const mergeToRight = (cells, r, c) => {
    for (let i = 0; i < r; i += 1) {
        let temp = cells[i].slice();

        temp = mergeTwoEqualNearSibling(temp);

        for (let j = temp.length - 1; j >= 0; j -= 1) {
            const cell = temp[j];
            const [x, y] = cell.getPosition();
            const newX = i;
            const newY = c - temp.length + j;

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

        for (let j = c - temp.length - 1; j >= 0; j -= 1) {
            cells[i][j] = new CellData(0);
        }
    }
};

export default mergeToRight;
