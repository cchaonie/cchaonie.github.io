import { getCellValue } from ".";

const isTwoCellsEqual = (c1, c2) => getCellValue(c1) === getCellValue(c2);

export default isTwoCellsEqual;
