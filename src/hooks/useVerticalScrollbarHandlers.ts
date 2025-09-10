import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore, toContentSize } from '../utils/math';
import type { ScrollableApiType } from '../types';

type UseVerticalScrollbarHandlersPropsType = {
  scrollableApiRef: RefObject<ScrollableApiType | null>;
  scrollableRef: RefObject<HTMLElement | null>;
  ignoresScrollEvents: RefObject<boolean>;
}

const useVerticalScrollbarHandlers = ({
  scrollableRef,
  scrollableApiRef,
  ignoresScrollEvents,
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
    const scrollableElement = scrollableRef.current;
    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      const thumbElement = event.currentTarget;
      const trackElement = thumbElement.parentElement;

      if (trackElement && scrollableElement) {
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

            const contentElement = scrollableElement.querySelector('.scrollable__content');
            if (scrollableApiRef.current && contentElement) {
              const contentRect = contentElement.getBoundingClientRect();
              const scrollableRect = scrollableElement.getBoundingClientRect();

              const scrollTop = toContentSize(
                offset,
                contentRect.height,
                scrollableRect.height
              );

              ignoresScrollEvents.current = true;
              scrollableApiRef.current.scrollTop = scrollTop;
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
