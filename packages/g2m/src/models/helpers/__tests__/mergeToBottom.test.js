import { mergeToBottom } from "..";
import { CellData } from "../..";
import { getCellValue } from "../../../utils";

const buildCells = array => array.map(r => r.map(c => new CellData(c)));
const getCellsValues = cells => cells.map(r => r.map(c => getCellValue(c)));

describe("mergeToBottom", () => {
    it.each([
        [
            [
                [2, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 2, 0],
                [0, 0, 0, 2],
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 2, 2, 2],
            ],
        ],
        [
            [
                [2, 0, 0, 0],
                [2, 2, 0, 0],
                [2, 0, 2, 0],
                [2, 0, 0, 2],
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [4, 0, 0, 0],
                [4, 2, 2, 2],
            ],
        ],
        [
            [
                [0, 0, 8, 0],
                [2, 4, 0, 0],
                [2, 0, 8, 0],
                [4, 2, 2, 2],
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [4, 4, 16, 0],
                [4, 2, 2, 2],
            ],
        ],
    ])("should return correct data", (a, b) => {
        const cells = buildCells(a);
        mergeToBottom(cells, a.length, a[0].length);
        expect(getCellsValues(cells)).toEqual(b);
    });
});
