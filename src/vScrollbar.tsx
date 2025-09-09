import {
  type ReactElement,
  type Ref,
  type PointerEvent,
  type HTMLAttributes,
  forwardRef,
  memo,
  useRef,
  useImperativeHandle,
} from 'react';
import Scrollbar from './scrollbar';
import makePx from './utils/makePx';
import composeRef from './utils/composeRef';
import { isMore } from './utils/math';
import useEvent from './hooks/useEvent';
import type { VScrollbarApiType } from './types';

type VScrollbarPropsType = Omit<HTMLAttributes<HTMLElement>, 'onScroll'> & {
  /**
   * function is called when thumb is moved using mouse pointer or touch pointer
   * @param {scrollTop} number - number of pixels by which an element's content is scrolled from its top edge
   */
  onScroll?: (scrollTop: number) => void;
}

function VScrollbar({
  onScroll,
  ...props
}: VScrollbarPropsType, ref: Ref<VScrollbarApiType>): ReactElement {
  const scrollbarApiRef = useRef<VScrollbarApiType>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(composeRef(ref, scrollbarApiRef), () => ({
    get scrollTop() {
      if (thumbRef.current) {
        const thumbElement = thumbRef.current;
        const trackElement = thumbElement.parentElement!
        const thumbRect = thumbElement.getBoundingClientRect();
        const trackRect = trackElement.getBoundingClientRect();
        return thumbRect.top - trackRect.top;
      }
      return 0;
    },
    set scrollTop(value) {
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateY(${makePx(value)})`;
        thumbRef.current.setAttribute('data-scroll-top', value.toString());
      }
    },
    setSize(value: number) {
      if (thumbRef.current) {
        thumbRef.current.style.height = makePx(value);
      }
    },
    setAttributes(attributes: Record<string, string>) {
      Object.entries(attributes).forEach(([key, value]) => {
        thumbRef.current?.setAttribute(key, value);
      })
    }
  }), []);

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
    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      const thumbElement = event.currentTarget;
      const trackElement = thumbElement.parentElement;

      if (trackElement) {
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
            if (scrollbarApiRef.current) {
              scrollbarApiRef.current.scrollTop = offset;
            }
            onScroll?.(offset);
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientYRef.current = 0;
  });

  return (
    <Scrollbar
      {...props}
      isVertical
      ref={thumbRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

export default memo(forwardRef<
  VScrollbarApiType,
  VScrollbarPropsType
>(VScrollbar));