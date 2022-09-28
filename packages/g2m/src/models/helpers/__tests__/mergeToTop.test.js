import { mergeToTop } from "..";
import { CellData } from "../..";
import { getCellValue } from "../../../utils";

const buildCells = array => array.map(r => r.map(c => new CellData(c)));
const getCellsValues = cells => cells.map(r => r.map(c => getCellValue(c)));

describe("mergeToTop", () => {
    it.each([
        [
            [
                [2, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 2, 0],
                [0, 0, 0, 2],
            ],
            [
                [2, 2, 2, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
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
                [4, 2, 2, 2],
                [4, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
        ],
        [
            [
                [0, 0, 8, 0],
                [4, 2, 2, 2],
                [2, 4, 0, 0],
                [2, 0, 2, 0],
            ],
            [
                [4, 2, 8, 2],
                [4, 4, 4, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
        ],
    ])("should return correct data", (a, b) => {
        const cells = buildCells(a);
        mergeToTop(cells, a.length, a[0].length);
        expect(getCellsValues(cells)).toEqual(b);
    });
});
