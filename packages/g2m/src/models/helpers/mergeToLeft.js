import { mergeTwoEqualNearSibling } from ".";
import { CellData } from "..";
import { CellTags } from "../../constants";

const mergeToLeft = (cells, r, c) => {
    for (let i = 0; i < r; i += 1) {
        let temp = cells[i].slice().reverse();

        temp = mergeTwoEqualNearSibling(temp);

        for (let j = 0; j < temp.length; j += 1) {
            const cell = temp[temp.length - j - 1];
            const [x, y] = cell.getPosition();
            const newX = i;
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

        for (let j = temp.length; j < c; j += 1) {
            cells[i][j] = new CellData(0);
        }
    }
};

export default mergeToLeft;
