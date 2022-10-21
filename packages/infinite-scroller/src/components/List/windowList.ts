export class WindowList {
  allItems: any[];
  // 相对整个数据列表而言
  windowTop: number;
  // 相对window而言
  viewTop: number;
  windowSize: number;
  viewSize: number;
  threshold: number;
  beforeWindowItems: any[];
  windowItems: any[];
  afterWindowItems: any[];
  constructor(items: any[], windowSize = 20, viewSize = 5, threshold = 0.6) {
    this.allItems = items.slice();
    this.windowTop = 0;
    this.viewTop = 0;
    this.windowSize = windowSize;
    this.viewSize = viewSize;
    this.threshold = threshold;
    this.beforeWindowItems = [];
    this.windowItems = [];
    this.afterWindowItems = [];
    this.updateItems();
  }

  updateItems() {
    this.beforeWindowItems = [];
    this.windowItems = [];
    this.afterWindowItems = [];
    for (let i = 0; i < this.allItems.length; i++) {
      if (i < this.windowTop) {
        this.beforeWindowItems.push(this.allItems[i]);
      } else if (i >= this.windowTop + this.windowSize) {
        this.afterWindowItems.push(this.allItems[i]);
      } else {
        this.windowItems.push(this.allItems[i]);
      }
    }
  }

  viewMove(newViewTop: number): boolean {
    const oldWindowTop = this.windowTop;
    const oldViewTop = this.viewTop;
    newViewTop > oldViewTop
      ? this.viewDown(newViewTop)
      : this.viewUp(Math.abs(newViewTop));
    if (oldWindowTop !== this.windowTop) {
      this.updateItems();
      this.viewTop = newViewTop - (this.windowTop - oldWindowTop);
      return true;
    }
    return false;
  }

  viewDown(newViewTop: number) {
    this.viewTop = this.afterWindowItems.length
      ? Math.min(this.bottomLine - this.windowTop - this.viewSize, newViewTop)
      : newViewTop;
    const overBottomCount =
      this.windowTop + this.viewTop + this.viewSize - this.bottomLine;
    if (overBottomCount >= 0 && this.afterWindowItems.length) {
      this.windowTop = Math.min(
        this.windowTop + Math.max(overBottomCount, 4),
        this.allItems.length - 1
      );
    }
  }

  viewUp(newViewTop: number) {
    this.viewTop = this.beforeWindowItems.length
      ? Math.max(this.topLine - this.windowTop, newViewTop)
      : newViewTop;
    const overTopCount = this.topLine - (this.windowTop + newViewTop);
    if (overTopCount > 0 && this.beforeWindowItems.length) {
      this.windowTop = Math.max(this.windowTop - Math.max(4, overTopCount), 0);
    }
  }

  get topLine() {
    const center = this.windowTop + (this.windowSize >> 1);
    return center - ((this.windowSize * this.threshold) >> 1);
  }

  get bottomLine() {
    const center = this.windowTop + (this.windowSize >> 1);
    return center + ((this.windowSize * this.threshold) >> 1);
  }
}
