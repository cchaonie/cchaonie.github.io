import { getCellValue } from ".";

const isCellEmpty = cell => getCellValue(cell) === 0;

export default isCellEmpty;
