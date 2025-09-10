import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore } from '../utils/math';
import setScrollbarOffset from '../utils/setScrollbarOffset.ts';

type UseContentPointerHandlersPropsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  hScrollbarRef: RefObject<HTMLElement | null>;
  vScrollbarRef: RefObject<HTMLElement | null>;
  ignoresScrollEvents: RefObject<boolean>;
}

const usePointerHandlers = ({
  scrollableRef,
  vScrollbarRef,
  hScrollbarRef,
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
    if (event.pointerType === 'touch' && event.isPrimary) {
      const scrollableElement = scrollableRef.current!;
      const targetRect = event.currentTarget.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();

      if (isMore(targetRect.height, scrollableRect.height)) {
        const scrollTop = Math.min(
          Math.max(scrollableElement.scrollTop - (event.clientY - clientYRef.current), 0),
          targetRect.height - scrollableRect.height,
        );
        const scrollbarElement = vScrollbarRef.current;
        if (scrollbarElement && scrollableElement.scrollTop !== scrollTop) {
          clientYRef.current = event.clientY;
          ignoresScrollEvents.current = true;
          scrollableElement.scrollTop = scrollTop;
          setScrollbarOffset(scrollbarElement, {
            scrollableElement,
            value: scrollTop,
            isVertical: true,
          });
        }
      }

      if (isMore(targetRect.width, scrollableRect.width)) {
        const scrollLeft = Math.min(
          Math.max(scrollableElement.scrollLeft - (event.clientX - clientXRef.current), 0),
          targetRect.width - scrollableRect.width,
        );
        const scrollbarElement = hScrollbarRef.current;
        if (scrollbarElement && scrollableElement.scrollLeft !== scrollLeft) {
          clientXRef.current = event.clientX;
          ignoresScrollEvents.current = true;
          scrollableElement.scrollLeft = scrollLeft;
          setScrollbarOffset(scrollbarElement, {
            scrollableElement,
            value: scrollLeft,
            isVertical: false,
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
