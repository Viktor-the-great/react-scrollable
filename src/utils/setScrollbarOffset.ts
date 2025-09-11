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
  const contentElement = scrollableElement.querySelector('.scrollable__content');
  if (contentElement) {
    const scrollableRect = scrollableElement.getBoundingClientRect();
    const contentRect = contentElement.getBoundingClientRect();
    if (isVertical) {
      const scrollTop = toScrollbarSize(
        value,
        contentRect.height,
        scrollableRect.height,
      );
      scrollbarElement.style.transform = `translateY(${makePx(scrollTop)})`;
      const isHidden = !isMore(contentRect.height, scrollableRect.height);
      setAttributes(scrollbarElement, {
        'aria-valuenow': value.toString(),
        'aria-hidden': isHidden.toString(),
        'data-scroll-top': scrollTop.toString(),
      });
    } else {
      const scrollLeft = toScrollbarSize(
        value,
        contentRect.width,
        scrollableRect.width,
      );
      scrollbarElement.style.transform = `translateX(${makePx(scrollLeft)})`;
      const isHidden = !isMore(contentRect.width, scrollableRect.width);
      setAttributes(scrollbarElement, {
        'aria-valuenow': value.toString(),
        'aria-hidden': isHidden.toString(),
        'data-scroll-left': scrollLeft.toString(),
      });
    }
  }
}

export default setScrollbarOffset;
