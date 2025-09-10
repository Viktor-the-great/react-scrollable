import { type RefObject, type UIEvent, useRef } from 'react';
import useEvent from './useEvent';
import setScrollbarOffset from '../utils/setScrollbarOffset';

type useScrollHandlersPropsType = {
  hScrollbarRef: RefObject<HTMLElement | null>;
  vScrollbarRef: RefObject<HTMLElement | null>;
  onScroll?: (event: UIEvent<HTMLElement>) => void;
  onLeftEdgeReached?: (event: UIEvent<HTMLElement>) => void;
  onRightEdgeReached?: (event: UIEvent<HTMLElement>) => void;
  onTopEdgeReached?: (event: UIEvent<HTMLElement>) => void;
  onBottomEdgeReached?: (event: UIEvent<HTMLElement>) => void;
  ignoresScrollEvents: RefObject<boolean>;
}
const useScrollHandlers = ({
  hScrollbarRef,
  vScrollbarRef,
  onScroll,
  onLeftEdgeReached,
  onRightEdgeReached,
  onTopEdgeReached,
  onBottomEdgeReached,
  ignoresScrollEvents,
}: useScrollHandlersPropsType) => {
  const prevScrollTop = useRef(0);
  const prevScrollLeft = useRef(0);
  const onScrollEvent = useEvent((event: UIEvent<HTMLElement>) => {
    const { currentTarget } = event;

    if (!ignoresScrollEvents.current) {
      const verticalScrollbarElement = vScrollbarRef.current;
      const horizontalScrollbarElement = hScrollbarRef.current;
      if (prevScrollTop.current !== currentTarget.scrollTop && verticalScrollbarElement) {
        setScrollbarOffset(verticalScrollbarElement, {
          scrollableElement: currentTarget,
          value: currentTarget.scrollTop,
          isVertical: true,
        });
      }

      if (prevScrollLeft.current !== currentTarget.scrollLeft && horizontalScrollbarElement) {
        setScrollbarOffset(horizontalScrollbarElement, {
          scrollableElement: currentTarget,
          value: currentTarget.scrollLeft,
          isVertical: false,
        });
      }
    }

    ignoresScrollEvents.current = false;

    const contentElement = currentTarget.querySelector('.scrollable__content');
    const scrollableRect = currentTarget.getBoundingClientRect();
    const contentRect = contentElement?.getBoundingClientRect();

    if (contentRect) {
      if (prevScrollTop.current !== currentTarget.scrollTop) {
        if (currentTarget.scrollTop === 0) {
          onTopEdgeReached?.(event);
        }
        if (currentTarget.scrollTop === contentRect.height - scrollableRect.height) {
          onBottomEdgeReached?.(event);
        }
      }
      if (prevScrollLeft.current !== currentTarget.scrollLeft) {
        if (currentTarget.scrollLeft === 0) {
          onLeftEdgeReached?.(event);
        }
        if (currentTarget.scrollLeft === contentRect.width - scrollableRect.width) {
          onRightEdgeReached?.(event);
        }
      }
    }

    prevScrollTop.current = currentTarget.scrollTop;
    prevScrollLeft.current = currentTarget.scrollLeft;

    onScroll?.(event);
  });

  return {
    onScroll: onScrollEvent,
  }
}

export default useScrollHandlers;
