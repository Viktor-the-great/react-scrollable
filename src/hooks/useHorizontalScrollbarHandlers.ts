import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore, toContentSize } from '../utils/math';
import setScrollbarOffset from '../utils/setScrollbarOffset';

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
  const thumbOffsetRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      isPointerDown.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      clientXRef.current = event.clientX;
      const thumbRect = event.currentTarget.getBoundingClientRect();
      thumbOffsetRef.current = event.clientX - thumbRect.left;
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
    const thumbRect = thumbElement.getBoundingClientRect();

    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      if (isMore(trackRect.width, thumbRect.width)) {
        const currentOffset = thumbRect.left - trackRect.left;
        let offset: number;
        if (event.clientX < trackRect.left + Math.floor(thumbOffsetRef.current)) {
          // the cursor position is to the left of the track element position
          offset = 0;
        } else if (event.clientX > trackRect.left + trackRect.width - Math.ceil(thumbRect.width - thumbOffsetRef.current)) {
          // the cursor position is to the right of the track element position
          offset = trackRect.width - thumbRect.width;
        } else {
          offset = Math.min(
            Math.max(currentOffset + event.clientX - clientXRef.current, 0),
            trackRect.width - thumbRect.width,
          );
        }
        if (offset !== currentOffset) {
          clientXRef.current = event.clientX;

          const scrollbarElement = scrollbarRef.current;
          if (scrollbarElement) {
            const scrollableRect = scrollableElement.getBoundingClientRect();

            const scrollLeft = toContentSize(
              offset,
              scrollableElement.scrollWidth,
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
    thumbOffsetRef.current = 0;
  });

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}

export default useHorizontalScrollbarHandlers;
