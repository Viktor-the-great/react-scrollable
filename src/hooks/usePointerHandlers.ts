import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore } from '../utils/math';
import type { ScrollEvent } from '../types';

type UseContentPointerHandlersPropsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  onScroll?: (event: ScrollEvent) => void;
}

const usePointerHandlers = ({
  scrollableRef,
  onScroll,
}: UseContentPointerHandlersPropsType) => {
  const clientXRef = useRef(0);
  const clientYRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.isPrimary) {
      event.currentTarget.setPointerCapture(event.pointerId);
      clientXRef.current = event.clientX;
      clientYRef.current = event.clientY;
    }
  });
  const onPointerMove = useEvent((event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.isPrimary) {
      const scrollableElement = scrollableRef.current!;
      const targetRect = event.currentTarget.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();

      if (isMore(targetRect.height, scrollableRect.height)) {
        const offsetByY = Math.min(
          Math.max(scrollableElement.scrollTop - (event.clientY - clientYRef.current), 0),
          targetRect.height - scrollableRect.height,
        );
        if (scrollableElement.scrollTop !== offsetByY) {
          clientYRef.current = event.clientY;
          onScroll?.({
            isVertical: true,
            scrollTop: offsetByY,
            isTopEdgeReached: offsetByY === 0,
            isBottomEdgeReached: offsetByY === targetRect.height - scrollableRect.height,
          });
        }
      }

      if (isMore(targetRect.width, scrollableRect.width)) {
        const offsetByX = Math.min(
          Math.max(scrollableElement.scrollLeft - (event.clientX - clientXRef.current), 0),
          targetRect.width - scrollableRect.width,
        );
        if (scrollableElement.scrollLeft !== offsetByX) {
          clientXRef.current = event.clientX;
          onScroll?.({
            isVertical: false,
            scrollLeft: offsetByX,
            isLeftEdgeReached: offsetByX === 0,
            isRightEdgeReached: offsetByX === targetRect.width - scrollableRect.width,
          });
        }
      }
    }
  });

  return {
    onPointerDown,
    onPointerMove,
  }
}

export default usePointerHandlers;
