import { gameData } from "..";
import { CellData } from "..";

const buildCells = array => array.map(r => r.map(c => new CellData(c)));

describe("gameData", () => {
    describe("isGameOver", () => {
        it.each([
            {
                a: [
                    [2, 0, 0, 0],
                    [0, 2, 0, 0],
                    [0, 0, 2, 0],
                    [0, 0, 0, 2],
                ],
                b: false,
            },
            {
                a: [
                    [2, 4, 32, 64],
                    [4, 2, 4, 8],
                    [8, 16, 2, 32],
                    [16, 8, 64, 2],
                ],
                b: true,
            },
            {
                a: [
                    [2, 4, 32, 64],
                    [4, 2, 4, 8],
                    [8, 16, 2, 32],
                    [16, 8, 8, 2],
                ],
                b: false,
            },
            {
                a: [
                    [2, 4, 32, 16],
                    [4, 2, 4, 2],
                    [8, 16, 2, 4],
                    [16, 8, 16, 4],
                ],
                b: false,
            },
        ])("should return $b", ({ a, b }) => {
            gameData.cells = buildCells(a);
            expect(gameData.isGameOver()).toBe(b);
        });
    });
});
