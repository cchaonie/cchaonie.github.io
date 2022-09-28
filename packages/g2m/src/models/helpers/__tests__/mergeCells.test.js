import { mergeAllEqualSiblings, mergeTwoEqualNearSibling } from "..";
import { getCellValue } from "../../../utils";
import CellData from "../../CellData";

const buildCells = array => array.map(c => new CellData(c));
const getCellsValues = cells => cells.map(c => getCellValue(c));

describe("mergeAllEqualSiblings", () => {
    it.each([
        [[0, 0, 0, 0], []],
        [[2, 0, 0, 0], [2]],
        [[0, 2, 0, 0], [2]],
        [[0, 0, 2, 0], [2]],
        [[0, 0, 0, 2], [2]],
        [
            [2, 2, 4, 2],
            [8, 2],
        ],
        [
            [2, 4, 2, 2],
            [2, 8],
        ],
        [
            [0, 2, 4, 2],
            [2, 4, 2],
        ],
        [[0, 0, 4, 4], [8]],
        [[2, 2, 2, 2], [8]],
        [
            [2, 4, 8, 16],
            [2, 4, 8, 16],
        ],
    ])("should return correct data", (a, b) => {
        const result = mergeAllEqualSiblings(buildCells(a));
        expect(getCellsValues(result)).toEqual(b);
    });
});

describe("mergeTwoEqualNearSibling", () => {
    it.each([
        [[0, 0, 0, 0], []],
        [[2, 0, 0, 0], [2]],
        [[0, 2, 0, 0], [2]],
        [[0, 0, 2, 0], [2]],
        [[0, 0, 0, 2], [2]],
        [
            [2, 2, 4, 2],
            [4, 4, 2],
        ],
        [
            [2, 4, 2, 2],
            [2, 4, 4],
        ],
        [
            [0, 2, 4, 2],
            [2, 4, 2],
        ],
        [[0, 0, 4, 4], [8]],
        [[2, 2, 2, 2], [4, 4]],
        [
            [2, 4, 8, 16],
            [2, 4, 8, 16],
        ],
    ])("should return correct data", (a, b) => {
        const result = mergeTwoEqualNearSibling(buildCells(a));
        expect(getCellsValues(result)).toEqual(b);
    });
});
