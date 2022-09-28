import { CellData } from "../models";
import { getCellValue } from ".";
import { CellTags } from "../constants";

const addTwoCells = (c1, c2) =>
    new CellData(getCellValue(c1) + getCellValue(c2), CellTags.MERGED);

export default addTwoCells;
