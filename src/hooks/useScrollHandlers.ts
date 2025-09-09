import { type RefObject, type UIEvent, useRef } from 'react';
import useEvent from './useEvent';
import type { ElementSize } from './useResizeObserver';
import { isEqual } from '../utils/math';
import type { ScrollEvent } from '../types';

type useScrollHandlersPropsType = {
  onScroll?: (event: ScrollEvent) => void;
  contentSize: ElementSize | null;
  scrollableSize: ElementSize | null;
  ignoresScrollEvents: RefObject<boolean>;
}
const useScrollHandlers = ({
  onScroll,
  contentSize,
  scrollableSize,
  ignoresScrollEvents,
}: useScrollHandlersPropsType) => {
  const lastScrollTopRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const onScrollEvent = useEvent(({
    currentTarget,
  }: UIEvent) => {
    if (ignoresScrollEvents.current) {
      ignoresScrollEvents.current = false;
      return;
    }
    if (lastScrollTopRef.current !== currentTarget.scrollTop) {
      const contentHeight = contentSize?.height ?? 0;
      const scrollableHeight = scrollableSize?.height ?? 0;
      onScroll?.({
        isVertical: true,
        scrollTop: currentTarget.scrollTop,
        isTopEdgeReached: isEqual(currentTarget.scrollTop, 0),
        isBottomEdgeReached: isEqual(currentTarget.scrollTop, contentHeight - scrollableHeight),
      });
      lastScrollTopRef.current = currentTarget.scrollTop;
    } else if (lastScrollLeftRef.current !== currentTarget.scrollLeft) {
      const contentWidth = contentSize?.width ?? 0;
      const scrollableWidth = scrollableSize?.width ?? 0;
      onScroll?.({
        isVertical: false,
        scrollLeft: currentTarget.scrollLeft,
        isLeftEdgeReached: isEqual(currentTarget.scrollLeft, 0),
        isRightEdgeReached: isEqual(currentTarget.scrollLeft, contentWidth - scrollableWidth),
      });
      lastScrollLeftRef.current = currentTarget.scrollLeft;
    }
  });

  return {
    onScroll: onScrollEvent,
  }
}

export default useScrollHandlers;
