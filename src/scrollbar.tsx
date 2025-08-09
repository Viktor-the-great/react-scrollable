import {
  type ReactElement,
  type Ref,
  type PointerEvent,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';
import cx from './utils/classnames';
import composeRefs from './utils/composeRef';
import makePx from './utils/makePx';
import useEvent from './hooks/useEvent';
import type { ScrollbarApiType } from './types';
import './scrollbar.css';

type ScrollbarPropsType = {
  /**
   * thumb size
   */
  thumbSize?: number;
  /**
   * is vertical or horizontal scrollbar?
   */
  isVertical?: boolean;
  /**
   * onChange function called on mouse position change
   * @param offset - thumb offset
   */
  onScroll?: (offset: number) => void;
}

function Scrollbar({
  thumbSize = 0,
  isVertical = false,
  onScroll: onScrollProp,
}: ScrollbarPropsType, ref: Ref<ScrollbarApiType>): ReactElement {
  const apiRef = useRef<ScrollbarApiType>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const onScroll = useEvent(
    (offset: number) => onScrollProp?.(offset),
  );

  useImperativeHandle(composeRefs(apiRef, ref), () => ({
    get scrollTop() {
      if (!isVertical) {
        throw new Error('method not allowed');
      }
      return offsetRef.current;
    },
    set scrollTop(value) {
      if (!isVertical) {
        throw new Error('method not allowed');
      }

      if (thumbRef.current) {
        thumbRef.current.style.marginTop = makePx(value);
        offsetRef.current = value;
      }
    },
    get scrollLeft() {
      if (isVertical) {
        throw new Error('method not allowed');
      }
      return offsetRef.current;
    },
    set scrollLeft(value) {
      if (isVertical) {
        throw new Error('method not allowed');
      }
      if (thumbRef.current) {
        thumbRef.current.style.marginLeft = makePx(value);
        offsetRef.current = value;
      }
    },
    getScrollSize(value: number) {
      const thumbElement = thumbRef.current;
      const trackElement = thumbElement?.parentElement;
      if (!thumbElement) {
        throw new Error('thumb element not found');
      }
      if (!trackElement) {
        throw new Error('track element not found');
      }
      return isVertical
        ? thumbElement.clientHeight / trackElement.clientHeight * value
        : thumbElement.clientWidth / trackElement.clientWidth * value;
    },
  }), [
    isVertical,
  ]);

  const pointerRef = useRef<number | null>(null);
  const clientXRef = useRef(0);
  const clientYRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent<HTMLDivElement>) => {
    pointerRef.current = event.pointerId;
    thumbRef.current?.setPointerCapture(event.pointerId);
    if (isVertical) {
      clientYRef.current = event.clientY;
    } else {
      clientXRef.current = event.clientX;
    }
  });
  const onPointerMove = useEvent((event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== event.pointerId) {
      return;
    }
    const thumbElement = thumbRef.current;
    const trackElement = thumbElement?.parentElement;

    if (thumbElement && trackElement && apiRef.current) {
      if (isVertical) {
        const offset = Math.min(
          Math.max(offsetRef.current + event.clientY - clientYRef.current, 0),
          trackElement.clientHeight - thumbElement.clientHeight,
        );
        if (
          offset !== offsetRef.current
          && offset >= 0
          && offset <= trackElement.clientHeight - thumbElement.clientHeight
        ) {
          apiRef.current.scrollTop = offset;
          clientYRef.current = event.clientY;
          onScroll(offset);
        }
      } else {
        const offset = Math.min(
          Math.max(offsetRef.current + event.clientX - clientXRef.current, 0),
          trackElement.clientWidth - thumbElement.clientWidth,
        );
        if (
          offset !== offsetRef.current
          && offset >= 0
          && offset <= trackElement.clientWidth - thumbElement.clientWidth
        ) {
          apiRef.current.scrollLeft = offset;
          clientXRef.current = event.clientX;
          onScroll(offset);
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    pointerRef.current = null;
    clientXRef.current = 0;
    clientYRef.current = 0;
  });

  const style = isVertical
    ? { height: thumbSize ?? 0 }
    : { width: thumbSize ?? 0 };

  return (
    <div className="scrollable__track">
      <div
        ref={thumbRef}
        className={cx('scrollable__thumb', {
          scrollable__thumb_vertical: isVertical,
          scrollable__thumb_horizontal: !isVertical,
        })}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}

export default forwardRef<
  ScrollbarApiType,
  ScrollbarPropsType
>(Scrollbar);