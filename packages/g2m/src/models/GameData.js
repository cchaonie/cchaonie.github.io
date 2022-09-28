import produce from "immer";

import { mergeToTop, mergeToRight, mergeToBottom, mergeToLeft } from "./helpers";
import { random, isCellEmpty, getCellValue } from "../utils";
import { Directions, CellTags } from "../constants";
import CellData from "./CellData";

class GameData {
    constructor(rows = 4, cols = 4) {
        this.rows = rows;
        this.cols = cols;
        this.cells = new Array(rows)
            .fill(0)
            .map(v => new Array(cols).fill(new CellData()));
        this.optionsForNext = [2];
    }

    generateIndex = () => {
        let [x, y, z] = [0, 0, 0];
        do {
            x = random(this.rows);
            y = random(this.cols);
        } while (!isCellEmpty(this.cells[x][y]));

        z = this.optionsForNext[random(this.optionsForNext.length)];
        return [x, y, z];
    };

    addNewCell = () => {
        const [x, y, z] = this.generateIndex();
        this.fillCell(x, y, z);
    };

    reset = () => {
        this.cells = new Array(this.rows)
            .fill(0)
            .map(v => new Array(this.cols).fill(new CellData()));
    };

    move = direction => {
        this.cells = produce(this.cells, cells => {
            switch (direction) {
                case Directions.TOP:
                    mergeToTop(cells, this.rows, this.cols);
                    break;
                case Directions.RIGHT:
                    mergeToRight(cells, this.rows, this.cols);
                    break;
                case Directions.BOTTOM:
                    mergeToBottom(cells, this.rows, this.cols);
                    break;
                case Directions.LEFT:
                    mergeToLeft(cells, this.rows, this.cols);
                    break;
                default:
            }
        });
    };

    fillCell = (x, y, z) => {
        this.cells = produce(this.cells, cells => {
            cells[x][y] = new CellData(z)
                .setTag(CellTags.CREATED)
                .setPosition(x, y);
        });
    };

    getCells = () => {
        return this.cells;
    };

    getCountOfFilledCells = () => {
        return this.cells.reduce((c, r) => {
            r.forEach(cell => (isCellEmpty(cell) ? c : (c += 1)));
            return c;
        }, 0);
    };

    isFull = () => {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                if (isCellEmpty(this.cells[i][j])) return false;
            }
        }
        return true;
    };

    containsMergedCell = () => {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                if (this.cells[i][j].getTag() === CellTags.MERGED) return true;
            }
        }
        return false;
    };

    containsMovedCell = () => {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                if (this.cells[i][j].getTag() === CellTags.MOVED) return true;
            }
        }
        return false;
    };

    isGameOver = () => {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols - 1; j += 1) {
                if (
                    isCellEmpty(this.cells[i][j]) ||
                    getCellValue(this.cells[i][j]) === getCellValue(this.cells[i][j + 1])
                ) {
                    return false;
                }
            }
        }

        for (let i = 0; i < this.cols; i += 1) {
            for (let j = 0; j < this.rows - 1; j += 1) {
                if (
                    isCellEmpty(this.cells[j][i]) ||
                    getCellValue(this.cells[j][i]) === getCellValue(this.cells[j + 1][i])
                ) {
                    return false;
                }
            }
        }
        return true;
    };
}

export default new GameData();
