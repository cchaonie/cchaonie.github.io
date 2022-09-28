import { mergeToRight } from "..";
import { CellData } from "../..";
import { getCellValue } from "../../../utils";

const buildCells = array => array.map(r => r.map(c => new CellData(c)));
const getCellsValues = cells => cells.map(r => r.map(c => getCellValue(c)));

describe("mergeToRight", () => {
    it.each([
        [
            [
                [2, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 2, 0],
                [0, 0, 0, 2],
            ],
            [
                [0, 0, 0, 2],
                [0, 0, 0, 2],
                [0, 0, 0, 2],
                [0, 0, 0, 2],
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
                [0, 0, 0, 2],
                [0, 0, 0, 4],
                [0, 0, 0, 4],
                [0, 0, 0, 4],
            ],
        ],
        [
            [
                [0, 0, 8, 0],
                [2, 2, 4, 2],
                [16, 4, 2, 2],
                [2, 2, 2, 2],
            ],
            [
                [0, 0, 0, 8],
                [0, 4, 4, 2],
                [0, 16, 4, 4],
                [0, 0, 4, 4],
            ],
        ],
    ])("should return correct data", (a, b) => {
        const cells = buildCells(a);
        mergeToRight(cells, a.length, a[0].length);
        expect(getCellsValues(cells)).toEqual(b);
    });
});
