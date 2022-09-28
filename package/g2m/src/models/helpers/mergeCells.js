import {
    addTwoCells,
    isCellEmpty,
    isTwoCellsEqual,
    getCellValue,
} from "../../utils";
import { CellData } from "..";
import { CellTags } from "../../constants";

const mergeAllEqualSiblings = array => {
    const len = array.length;
    let temp = [];
    for (let i = 0; i < len; i += 1) {
        if (!isCellEmpty(array[i])) {
            temp.push(new CellData(getCellValue(array[i]), CellTags.MOVED));
        }
    }
    if (temp.length > 1) {
        let merged = false;
        for (let i = 0; i < temp.length - 1; i += 1) {
            if (isTwoCellsEqual(temp[i], temp[i + 1])) {
                temp[i] = addTwoCells(temp[i], temp[i + 1]);
                temp[i + 1] = new CellData();
                merged = true;
            }
        }

        if (merged) {
            return mergeAllEqualSiblings(temp);
        }
    }
    return temp;
};

// const merge = array => {
//     const len = array.length;
//     if (len > 1) {
//         for (let i = 0; i < len - 1; i += 1) {
//             if (isTwoCellsEqual(array[i], array[i + 1])) {
//                 array[i] = addTwoCells(array[i], array[i + 1]);
//                 array[i + 1] = new CellData();
//             }
//         }
//         return array.filter(c => !isCellEmpty(c));
//     }
//     return array;
// };

const mergeFromTail = array => {
    const len = array.length;
    if (len > 1) {
        for (let i = len - 1; i > 0; i -= 1) {
            if (isTwoCellsEqual(array[i], array[i - 1])) {
                array[i] = addTwoCells(array[i], array[i - 1]);
                array[i - 1] = new CellData();
            }
        }
        return array.filter(c => !isCellEmpty(c));
    }
    return array;
};

const mergeTwoEqualNearSibling = array => {
    const len = array.length;
    let temp = [];
    for (let i = 0; i < len; i += 1) {
        const cell = array[i];
        if (!isCellEmpty(cell)) {
            temp.push(new CellData(getCellValue(cell)).setPosition(...cell.getPosition()));
        }
    }
    return mergeFromTail(temp);
};

export { mergeAllEqualSiblings, mergeTwoEqualNearSibling };
