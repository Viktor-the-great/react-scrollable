import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore, toContentSize } from '../utils/math';
import type { ScrollableApiType } from '../types';

type UseHorizontalScrollbarHandlersPropsType = {
  scrollableApiRef: RefObject<ScrollableApiType | null>;
  scrollableRef: RefObject<HTMLElement | null>;
  ignoresScrollEvents: RefObject<boolean>;
}

const useHorizontalScrollbarHandlers = ({
  scrollableApiRef,
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
    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      const thumbElement = event.currentTarget;
      const trackElement = thumbElement.parentElement;

      if (trackElement && scrollableElement) {
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

            const contentElement = scrollableElement.querySelector('.scrollable__content');
            if (scrollableApiRef.current && contentElement) {
              const contentRect = contentElement.getBoundingClientRect();
              const scrollableRect = scrollableElement.getBoundingClientRect();

              const scrollLeft = toContentSize(
                offset,
                contentRect.width,
                scrollableRect.width
              );

              ignoresScrollEvents.current = true;
              scrollableApiRef.current.scrollLeft = scrollLeft;
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
