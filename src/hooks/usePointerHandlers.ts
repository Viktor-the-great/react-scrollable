import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore } from '../utils/math';
import type { ScrollableApiType } from '../types.ts';

type UseContentPointerHandlersPropsType = {
  scrollableApiRef: RefObject<ScrollableApiType | null>;
  scrollableRef: RefObject<HTMLElement | null>;
  ignoresScrollEvents: RefObject<boolean>;
}

const usePointerHandlers = ({
  scrollableApiRef,
  scrollableRef,
  ignoresScrollEvents,
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
    if (event.pointerType === 'touch' && event.isPrimary && scrollableApiRef.current) {
      const scrollableElement = scrollableRef.current!;
      const targetRect = event.currentTarget.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();

      if (isMore(targetRect.height, scrollableRect.height)) {
        const scrollTop = Math.min(
          Math.max(scrollableElement.scrollTop - (event.clientY - clientYRef.current), 0),
          targetRect.height - scrollableRect.height,
        );
        if (scrollableElement.scrollTop !== scrollTop) {
          clientYRef.current = event.clientY;
          ignoresScrollEvents.current = true;
          scrollableApiRef.current.scrollTop = scrollTop;
        }
      }

      if (isMore(targetRect.width, scrollableRect.width)) {
        const scrollLeft = Math.min(
          Math.max(scrollableElement.scrollLeft - (event.clientX - clientXRef.current), 0),
          targetRect.width - scrollableRect.width,
        );
        if (scrollableElement.scrollLeft !== scrollLeft) {
          clientXRef.current = event.clientX;
          ignoresScrollEvents.current = true;
          scrollableApiRef.current.scrollLeft = scrollLeft;
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
