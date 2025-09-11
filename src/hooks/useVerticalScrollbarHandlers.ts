import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import { isMore, toContentSize } from '../utils/math';
import setScrollbarOffset from '../utils/setScrollbarOffset.ts';

type UseVerticalScrollbarHandlersPropsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  scrollbarRef: RefObject<HTMLElement | null>;
  ignoresScrollEvents: RefObject<boolean>;
}

const useVerticalScrollbarHandlers = ({
  scrollableRef,
  scrollbarRef,
  ignoresScrollEvents,
}: UseVerticalScrollbarHandlersPropsType) => {
  const isPointerDown = useRef<boolean>(false);
  const clientYRef = useRef(0);
  const thumbOffsetRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      isPointerDown.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      clientYRef.current = event.clientY;
      const thumbRect = event.currentTarget.getBoundingClientRect();
      thumbOffsetRef.current = event.clientY - thumbRect.top;
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
    // the cursor is outside the track element + thumb offset
    if (event.clientY < trackRect.top + thumbOffsetRef.current) {
      clientYRef.current = trackRect.top + thumbOffsetRef.current;
      return;
    }
    if (event.clientY > trackRect.top + trackRect.height - (thumbRect.height - thumbOffsetRef.current)) {
      clientYRef.current = trackRect.top + trackRect.height - (thumbRect.height - thumbOffsetRef.current);
      return;
    }

    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      if (isMore(trackRect.height, thumbRect.height)) {
        const currentOffset = thumbRect.top - trackRect.top;
        const offset = Math.min(
          Math.max(currentOffset + event.clientY - clientYRef.current, 0),
          trackRect.height - thumbRect.height,
        );
        if (offset !== currentOffset) {
          clientYRef.current = event.clientY;

          const contentElement = scrollableElement.querySelector('.scrollable__content');
          const scrollbarElement = scrollbarRef.current;
          if (contentElement && scrollbarElement) {
            const contentRect = contentElement.getBoundingClientRect();
            const scrollableRect = scrollableElement.getBoundingClientRect();

            const scrollTop = toContentSize(
              offset,
              contentRect.height,
              scrollableRect.height
            );

            ignoresScrollEvents.current = true;
            scrollableElement.scrollTop = scrollTop;
            setScrollbarOffset(scrollbarElement, {
              scrollableElement,
              value: scrollTop,
              isVertical: true,
            });
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientYRef.current = 0;
    thumbOffsetRef.current = 0;
  });

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}

export default useVerticalScrollbarHandlers;
