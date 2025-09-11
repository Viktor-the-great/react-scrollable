import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore, toContentSize } from '../utils/math';
import setScrollbarOffset from '../utils/setScrollbarOffset.ts';

type UseHorizontalScrollbarHandlersPropsType = {
  scrollbarRef: RefObject<HTMLElement | null>;
  scrollableRef: RefObject<HTMLElement | null>;
  ignoresScrollEvents: RefObject<boolean>;
}

const useHorizontalScrollbarHandlers = ({
  scrollbarRef,
  scrollableRef,
  ignoresScrollEvents,
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
    const scrollableElement = scrollableRef.current;
    const thumbElement = event.currentTarget;
    const trackElement = thumbElement.parentElement;

    if (!scrollableElement) {
      return;
    }

    if (!trackElement) {
      return;
    }

    const trackRect = trackElement.getBoundingClientRect();
    // the cursor is outside the track element
    if (event.clientX < trackRect.left) {
      clientXRef.current = trackRect.left;
      return;
    }
    if (event.clientX > trackRect.left + trackRect.width) {
      clientXRef.current = trackRect.left + trackRect.width;
      return;
    }

    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      const thumbRect = thumbElement.getBoundingClientRect();
      if (isMore(trackRect.width, thumbRect.width)) {
        const currentOffset = thumbRect.left - trackRect.left;
        const offset = Math.min(
          Math.max(currentOffset + event.clientX - clientXRef.current, 0),
          trackRect.width - thumbRect.width,
        );
        if (offset !== currentOffset) {
          clientXRef.current = event.clientX;

          const contentElement = scrollableElement.querySelector('.scrollable__content');
          const scrollbarElement = scrollbarRef.current;
          if (contentElement && scrollbarElement) {
            const contentRect = contentElement.getBoundingClientRect();
            const scrollableRect = scrollableElement.getBoundingClientRect();

            const scrollLeft = toContentSize(
              offset,
              contentRect.width,
              scrollableRect.width
            );

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
