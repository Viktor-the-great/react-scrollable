import {
  type ReactElement,
  type Ref,
  forwardRef,
  useLayoutEffect,
  useRef,
} from 'react';
import cx from './utils/classnames';
import composeRefs from './utils/composeRef';
import makePx from './utils/makePx';
import useEvent from './hooks/useEvent';
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
}: ScrollbarPropsType, ref: Ref<HTMLDivElement>): ReactElement {
  const thumbRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const onScroll = useEvent(
    (offset: number) => onScrollProp?.(offset),
  );
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
      if (isMoving && thumbElement && trackElement) {
        if (isVertical) {
          const offset = offsetRef.current + event.clientY - clientY;
          if (offset >= 0 && offset <= trackElement.clientHeight - thumbElement.clientHeight) {
            offsetRef.current = offset;
            thumbElement.style.marginTop = makePx(offset);
            clientY = event.clientY;
            onScroll(offset);
          }
        } else {
          const offset = offsetRef.current + event.clientX - clientX;
          if (offset >= 0 && offset <= trackElement.clientWidth - thumbElement.clientWidth) {
            offsetRef.current = offset;
            thumbElement.style.marginLeft = makePx(offset);
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
        ref={composeRefs(ref, thumbRef)}
        className={cx('track__thumb', {
          track__thumb_vertical: isVertical,
          track__thumb_horizontal: !isVertical,
        })}
        style={style}
      />
    </div>
  );
}

export default forwardRef<HTMLDivElement, ScrollbarPropsType>(Scrollbar);