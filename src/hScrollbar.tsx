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
import type { HScrollbarApiType } from './types';

type HScrollbarPropsType = Omit<HTMLAttributes<HTMLElement>, 'onScroll'> & {
  /**
   * function is called when thumb is moved using mouse pointer or touch pointer
   * @param {scrollLeft} number - number of pixels by which an element's content is scrolled from its left edge
   */
  onScroll?: (scrollLeft: number) => void;
}

function HScrollbar({
  onScroll,
  ...props
}: HScrollbarPropsType, ref: Ref<HScrollbarApiType>): ReactElement {
  const scrollbarApiRef = useRef<HScrollbarApiType>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useImperativeHandle(composeRef(ref, scrollbarApiRef), () => ({
    get scrollLeft() {
      return offsetRef.current;
    },
    set scrollLeft(value) {
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateX(${makePx(value)})`;
        thumbRef.current.setAttribute('data-scroll-left', value.toString());
        offsetRef.current = value;
      }
    },
    setSize(value: number) {
      if (thumbRef.current) {
        thumbRef.current.style.width = makePx(value);
      }
    },
    setAttributes(attributes: Record<string, string>) {
      Object.entries(attributes).forEach(([key, value]) => {
        thumbRef.current?.setAttribute(key, value);
      })
    }
  }), []);

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
    if (isPointerDown.current && (event.pointerType === 'mouse' || event.pointerType === 'touch') && event.isPrimary) {
      const thumbElement = event.currentTarget;
      const trackElement = thumbElement.parentElement;

      if (trackElement) {
        const thumbRect = thumbElement.getBoundingClientRect();
        const tractRect = trackElement.getBoundingClientRect();
        if (isMore(tractRect.width, thumbRect.width)) {
          const offset = Math.min(
            Math.max(offsetRef.current + event.clientX - clientXRef.current, 0),
            tractRect.width - thumbRect.width,
          );
          if (offset !== offsetRef.current) {
            clientXRef.current = event.clientX;
            if (scrollbarApiRef.current) {
              scrollbarApiRef.current.scrollLeft = offset;
            }
            onScroll?.(offset);
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientXRef.current = 0;
  });

  return (
    <Scrollbar
      {...props}
      ref={thumbRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

export default memo(forwardRef<
  HScrollbarApiType,
  HScrollbarPropsType
>(HScrollbar));