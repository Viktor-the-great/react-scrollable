import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isEqual, isMore, toContentSize } from '../utils/math';
import type { ScrollableApiType, ScrollEvent } from '../types';

type UseVerticalScrollbarHandlersPropsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  scrollableApiRef: RefObject<ScrollableApiType | null>;
  onScroll: (event: Extract<ScrollEvent, { isVertical: true }>) => void;
}

const useVerticalScrollbarHandlers = ({
  scrollableRef,
  contentRef,
  scrollableApiRef,
  onScroll,
}: UseVerticalScrollbarHandlersPropsType) => {
  const isPointerDown = useRef<boolean>(false);
  const clientYRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      isPointerDown.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      clientYRef.current = event.clientY;
    }
  });
  const onPointerMove = useEvent((event: PointerEvent<HTMLDivElement>) => {
    const contentElement = contentRef.current;
    const scrollableElement = scrollableRef.current;
    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      const thumbElement = event.currentTarget;
      const trackElement = thumbElement.parentElement;

      if (trackElement && contentElement && scrollableElement) {
        const thumbRect = thumbElement.getBoundingClientRect();
        const trackRect = trackElement.getBoundingClientRect();
        if (isMore(trackRect.height, thumbRect.height)) {
          const currentOffset = thumbRect.top - trackRect.top;
          const offset = Math.min(
            Math.max(currentOffset + event.clientY - clientYRef.current, 0),
            trackRect.height - thumbRect.height,
          );
          if (offset !== currentOffset) {
            clientYRef.current = event.clientY;

            const contentRect = contentElement.getBoundingClientRect();
            const scrollableRect = scrollableElement.getBoundingClientRect();

            const scrollTop = toContentSize(
              offset,
              contentRect.height,
              scrollableRect.height
            );

            if (scrollableApiRef.current) {
              scrollableApiRef.current.scrollTop = scrollTop;
              onScroll({
                isVertical: true,
                scrollTop: scrollTop,
                isTopEdgeReached: isEqual(scrollTop, 0),
                isBottomEdgeReached: isEqual(scrollTop, contentRect.height - scrollableRect.height),
              });
            }
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientYRef.current = 0;
  });

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}

export default useVerticalScrollbarHandlers;
