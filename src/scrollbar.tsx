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
import styles from './scrollbar.module.css';

type ScrollbarPropsType = {
  /**
   * slider length
   */
  length?: number;
  /**
   * is vertical or horizontal scrollbar?
   */
  isVertical?: boolean;
  /**
   * onChange function called on mouse position change
   * @param offset - slider offset
   */
  onScroll?: (offset: number) => void;
}

function Scrollbar({
  length,
  isVertical = false,
  onScroll: onScrollProp,
}: ScrollbarPropsType, ref: Ref<HTMLDivElement>): ReactElement {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const onScroll = useEvent(
    (offset: number) => onScrollProp?.(offset),
  );
  useLayoutEffect(() => {
    const sliderElement = sliderRef.current;
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
      if (isMoving && sliderElement && scrollbarRef.current) {
        if (isVertical) {
          const offset = offsetRef.current + event.clientY - clientY;
          if (offset >= 0 && offset <= scrollbarRef.current.clientHeight - sliderElement.clientHeight) {
            offsetRef.current = offset;
            sliderElement.style.marginTop = makePx(offset);
            clientY = event.clientY;
            onScroll(offset);
          }
        } else {
          const offset = offsetRef.current + event.clientX - clientX;
          if (offset >= 0 && offset <= scrollbarRef.current.clientWidth - sliderElement.clientWidth) {
            offsetRef.current = offset;
            sliderElement.style.marginLeft = makePx(offset);
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
    sliderElement?.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      sliderElement?.removeEventListener('mousedown', onMouseDown);
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
    <div
      ref={scrollbarRef}
      className={styles.scrollbar}
    >
      <div
        ref={composeRefs(ref, sliderRef)}
        className={cx(styles.slider, {
          [styles.verticalSlider]: isVertical,
        })}
        style={style}
      />
    </div>
  );
}

export default forwardRef<HTMLDivElement, ScrollbarPropsType>(Scrollbar);