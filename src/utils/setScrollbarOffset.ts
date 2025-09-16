import { isMore, toScrollbarSize } from './math';
import makePx from './makePx';
import setAttributes from './setAttributes';

type OptionsType = {
  scrollableElement: HTMLElement;
  value: number;
  isVertical: boolean;
}

const setScrollbarOffset = (scrollbarElement: HTMLElement, {
  value,
  scrollableElement,
  isVertical,
}: OptionsType) => {
  const scrollableRect = scrollableElement.getBoundingClientRect();
  if (isVertical) {
    const scrollTop = toScrollbarSize(
      value,
      scrollableElement.scrollHeight,
      scrollableRect.height,
    );
    scrollbarElement.style.transform = `translateY(${makePx(scrollTop)})`;
    const isHidden = !isMore(scrollableElement.scrollHeight, scrollableRect.height);
    setAttributes(scrollbarElement, {
      'aria-valuenow': value.toString(),
      'aria-hidden': isHidden.toString(),
      'data-scroll-top': scrollTop.toString(),
    });
  } else {
    const scrollLeft = toScrollbarSize(
      value,
      scrollableElement.scrollWidth,
      scrollableRect.width,
    );
    scrollbarElement.style.transform = `translateX(${makePx(scrollLeft)})`;
    const isHidden = !isMore(scrollableElement.scrollWidth, scrollableRect.width);
    setAttributes(scrollbarElement, {
      'aria-valuenow': value.toString(),
      'aria-hidden': isHidden.toString(),
      'data-scroll-left': scrollLeft.toString(),
    });
  }
}

export default setScrollbarOffset;
