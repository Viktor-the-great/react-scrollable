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
  const prevScrollTopRef = useRef(0);
  const prevScrollLeftRef = useRef(0);
  const isScrollingRef = useRef(false);
  const onScrollEvent = useEvent((event: UIEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const verticalScrollbarElement = vScrollbarRef.current;
    const horizontalScrollbarElement = hScrollbarRef.current;
    const contentElement = currentTarget.querySelector('.scrollable__content');

    if (!verticalScrollbarElement) {
      return;
    }

    if (!horizontalScrollbarElement) {
      return;
    }

    if (!contentElement) {
      return;
    }

    if (!ignoresScrollEvents.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      requestAnimationFrame(() => {
        setScrollbarOffset(verticalScrollbarElement, {
          scrollableElement: currentTarget,
          value: currentTarget.scrollTop,
          isVertical: true,
        });

        setScrollbarOffset(horizontalScrollbarElement, {
          scrollableElement: currentTarget,
          value: currentTarget.scrollLeft,
          isVertical: false,
        });
        isScrollingRef.current = false;
      })
    }

    ignoresScrollEvents.current = false;

    const scrollableRect = currentTarget.getBoundingClientRect();
    const contentRect = contentElement?.getBoundingClientRect();

    if (prevScrollTopRef.current !== currentTarget.scrollTop) {
      if (currentTarget.scrollTop === 0) {
        onTopEdgeReached?.(event);
      }
      if (currentTarget.scrollTop === contentRect.height - scrollableRect.height) {
        onBottomEdgeReached?.(event);
      }
    }
    if (prevScrollLeftRef.current !== currentTarget.scrollLeft) {
      if (currentTarget.scrollLeft === 0) {
        onLeftEdgeReached?.(event);
      }
      if (currentTarget.scrollLeft === contentRect.width - scrollableRect.width) {
        onRightEdgeReached?.(event);
      }
    }

    prevScrollTopRef.current = currentTarget.scrollTop;
    prevScrollLeftRef.current = currentTarget.scrollLeft;

    onScroll?.(event);
  });

  return {
    onScroll: onScrollEvent,
  }
}

export default useScrollHandlers;
