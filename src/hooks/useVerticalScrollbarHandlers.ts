import { type PointerEvent, type RefObject, useRef } from 'react';
import useEvent from './useEvent';
import useRAF from './useRAF';
import { isMore, toContentSize } from '../utils/math';
import setScrollbarOffset from '../utils/setScrollbarOffset';

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
  const rAF = useRAF();
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

    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      if (isMore(trackRect.height, thumbRect.height)) {
        const currentOffset = thumbRect.top - trackRect.top;
        let offset: number;
        if (event.clientY < trackRect.top + Math.floor(thumbOffsetRef.current)) {
          // the cursor position is above the track element position
          offset = 0;
        } else if (event.clientY > trackRect.top + trackRect.height - Math.ceil(thumbRect.height - thumbOffsetRef.current)) {
          // the cursor position is under the track element position
          offset = trackRect.height - thumbRect.height;
        } else {
          offset = Math.min(
            Math.max(currentOffset + event.clientY - clientYRef.current, 0),
            trackRect.height - thumbRect.height,
          );
        }
        if (offset !== currentOffset) {
          clientYRef.current = event.clientY;

          const scrollbarElement = scrollbarRef.current;
          if (scrollbarElement) {
            const scrollableRect = scrollableElement.getBoundingClientRect();

            const scrollTop = toContentSize(
              offset,
              scrollableElement.scrollHeight,
              scrollableRect.height
            );

            ignoresScrollEvents.current = true;
            setScrollbarOffset(scrollbarElement, {
              scrollableElement,
              value: scrollTop,
              isVertical: true,
            });

            rAF(() => {
              scrollableElement.scrollTop = scrollTop;
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
