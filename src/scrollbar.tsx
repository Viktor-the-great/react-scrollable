import {
  type ReactElement,
  type Ref,
  forwardRef,
  useLayoutEffect,
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
   * thumb length
   */
  length?: number;
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
  length,
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

  useLayoutEffect(() => {
    const thumbElement = thumbRef.current;
    const trackElement = thumbElement?.parentElement;
    let isMoving = false;
    let clientX = 0;
    let clientY = 0;
    const onMouseDown = (event: MouseEvent) => {
      isMoving = true;
      if (isVertical) {
        clientY = event.clientY;
      } else {
        clientX = event.clientX;
      }
    };
    const onMouseMove = (event: MouseEvent) => {
      if (isMoving && thumbElement && trackElement && apiRef.current) {
        if (isVertical) {
          const offset = offsetRef.current + event.clientY - clientY;
          if (offset >= 0 && offset <= trackElement.clientHeight - thumbElement.clientHeight) {
            apiRef.current.scrollTop = offset;
            clientY = event.clientY;
            onScroll(offset);
          }
        } else {
          const offset = offsetRef.current + event.clientX - clientX;
          if (offset >= 0 && offset <= trackElement.clientWidth - thumbElement.clientWidth) {
            apiRef.current.scrollLeft = offset;
            clientX = event.clientX;
            onScroll(offset);
          }
        }
      }
    };
    const onMouseUp = () => {
      if (isMoving) {
        isMoving = false;
      }
    };
    thumbElement?.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      thumbElement?.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [
    isVertical,
    onScroll,
  ]);

  const style = isVertical
    ? { height: length ?? 0 }
    : { width: length ?? 0 };

  return (
    <div className="track">
      <div
        ref={thumbRef}
        className={cx('track__thumb', {
          track__thumb_vertical: isVertical,
          track__thumb_horizontal: !isVertical,
        })}
        style={style}
      />
    </div>
  );
}

export default forwardRef<
  ScrollbarApiType,
  ScrollbarPropsType
>(Scrollbar);