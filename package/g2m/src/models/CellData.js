import { CellTags } from "../constants";

class CellData {
    constructor(value = 0, tag = CellTags.VOID, background = "") {
        this.value = value;
        this.tag = tag;
        this.background = background;
        this.position = [];
    }

    getTag = () => {
        return this.tag;
    }

    setTag = tag => {
        this.tag = tag;
        return this;
    }

    setPosition = (x, y) => {
        this.position[0] = x;
        this.position[1] = y;
        return this;
    }

    getPosition = () => {
        return this.position;
    }
}

export default CellData;
