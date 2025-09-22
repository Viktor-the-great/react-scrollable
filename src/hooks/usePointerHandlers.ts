import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import useRAF from './useRAF';
import { isMore, isNumber } from '../utils/math';
import setScrollbarOffset from '../utils/setScrollbarOffset';

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
  const rAF = useRAF();
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
      let nextScrollTop: number | undefined;
      let nextScrollLeft: number | undefined;

      if (isMore(targetRect.height, scrollableRect.height)) {
        const scrollTop = Math.min(
          Math.max(scrollableElement.scrollTop - (event.clientY - clientYRef.current), 0),
          targetRect.height - scrollableRect.height,
        );
        const scrollbarElement = vScrollbarRef.current;
        if (scrollbarElement && scrollableElement.scrollTop !== scrollTop) {
          clientYRef.current = event.clientY;
          ignoresScrollEvents.current = true;
          nextScrollTop = scrollTop;
          scrollableElement.scrollTop = scrollTop;
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
          nextScrollLeft = scrollLeft
          scrollableElement.scrollLeft = scrollLeft;
        }
      }

      rAF(() => {
        let scrollbarElement = vScrollbarRef.current;
        if (scrollbarElement && isNumber(nextScrollTop)) {
          setScrollbarOffset(scrollbarElement, {
            scrollableElement,
            value: nextScrollTop,
            isVertical: true,
          });
        }
        scrollbarElement = hScrollbarRef.current;
        if (scrollbarElement && isNumber(nextScrollLeft)) {
          setScrollbarOffset(scrollbarElement, {
            scrollableElement,
            value: nextScrollLeft,
            isVertical: false,
          });
        }
      });
    }
  });

  return {
    onPointerDown,
    onPointerMove,
  }
}

export default usePointerHandlers;
