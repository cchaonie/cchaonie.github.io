export function isElementVisible(parent: Element, el: Element) {
  const parentRect = parent.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return elRect.top > parentRect.top;
}
