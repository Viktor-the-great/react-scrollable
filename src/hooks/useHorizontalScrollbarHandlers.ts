import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isEqual, isMore, toContentSize } from '../utils/math';
import type { ScrollableApiType, ScrollEvent } from '../types';

type UseHorizontalScrollbarHandlersPropsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  scrollableApiRef: RefObject<ScrollableApiType | null>;
  onScroll: (event: Extract<ScrollEvent, { isVertical: false }>) => void;
}

const useHorizontalScrollbarHandlers = ({
  scrollableRef,
  contentRef,
  scrollableApiRef,
  onScroll,
}: UseHorizontalScrollbarHandlersPropsType) => {
  const isPointerDown = useRef<boolean>(false);
  const clientXRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      isPointerDown.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      clientXRef.current = event.clientX;
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
        if (isMore(trackRect.width, thumbRect.width)) {
          const currentOffset = thumbRect.left - trackRect.left;
          const offset = Math.min(
            Math.max(currentOffset + event.clientX - clientXRef.current, 0),
            trackRect.width - thumbRect.width,
          );
          if (offset !== currentOffset) {
            clientXRef.current = event.clientX;

            const contentRect = contentElement.getBoundingClientRect();
            const scrollableRect = scrollableElement.getBoundingClientRect();

            const scrollLeft = toContentSize(
              offset,
              contentRect.width,
              scrollableRect.width
            );

            if (scrollableApiRef.current) {
              scrollableApiRef.current.scrollLeft = scrollLeft;
              onScroll({
                isVertical: false,
                scrollLeft: scrollLeft,
                isLeftEdgeReached: isEqual(scrollLeft, 0),
                isRightEdgeReached: isEqual(scrollLeft, contentRect.width - scrollableRect.width),
              });
            }
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientXRef.current = 0;
  });

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}

export default useHorizontalScrollbarHandlers;
