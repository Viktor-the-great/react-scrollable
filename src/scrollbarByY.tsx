import {
  type ReactElement,
  type Ref,
  type PointerEvent,
  forwardRef,
  memo,
  useRef,
  useImperativeHandle,
} from 'react';
import composeRefs from './utils/composeRef';
import makePx from './utils/makePx';
import toFixed from './utils/toFixed';
import useEvent from './hooks/useEvent';
import type { ScrollbarByYApiType, ScrollEvent } from './types';
import './scrollbarByY.css';

type ScrollbarByYPropsType = {
  /**
   * thumb size
   */
  thumbSize?: number;
  /**
   * function called when thumb is moved using mouse pointer or touch pointer
   * @param {object} event - custom scroll event
   * @param {boolean} event.is_vertical - is vertical scrolling?
   * @param {number | null} event.scroll_top - number of pixels by which an element's content is scrolled from its top edge, applies to vertical scrolling
   * @param {number | null} event.scroll_left - number of pixels by which an element's content is scrolled from its left edge, applies to horizontal scrolling
   * @param {boolean | null} event.is_top_edge_reached - flag indicating that the top edge of the element's content has been reached, applies to vertical scrolling
   * @param {boolean | null} event.is_bottom_edge_reached - flag indicating that the bottom edge of the element's content has been reached, applies to vertical scrolling
   * @param {boolean | null} event.is_left_edge_reached - flag indicating that the left edge of the element's content has been reached, applies to horizontal scrolling
   * @param {boolean | null} event.is_right_edge_reached - flag indicating that the right edge of the element's content has been reached, applies to horizontal scrolling
   */
  onScroll?: (event: ScrollEvent) => void;
  /**
   * scrollable element id to create aria-controls attribute
   */
  contentId: string;
}

function Scrollbar({
  thumbSize = 0,
  onScroll,
  contentId,
}: ScrollbarByYPropsType, ref: Ref<ScrollbarByYApiType>): ReactElement {
  const apiRef = useRef<ScrollbarByYApiType>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useImperativeHandle(composeRefs(apiRef, ref), () => ({
    get scrollTop() {
      return offsetRef.current;
    },
    set scrollTop(value) {
      if (thumbRef.current) {
        thumbRef.current.style.marginTop = makePx(value);
        thumbRef.current.setAttribute('aria-valuenow', value.toString());
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
      const thumbRect = thumbElement.getBoundingClientRect();
      const trackRect = trackElement.getBoundingClientRect();
      return toFixed(thumbRect.height / trackRect.height * value, 1);
    },
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

      if (trackElement && apiRef.current) {
        const thumbRect = thumbElement.getBoundingClientRect();
        const tractRect = trackElement.getBoundingClientRect();
        if (tractRect.height > thumbRect.height) {
          const offset = Math.min(
            Math.max(offsetRef.current + event.clientY - clientYRef.current, 0),
            tractRect.height - thumbRect.height,
          );
          if (offset !== offsetRef.current) {
            apiRef.current.scrollTop = offset;
            clientYRef.current = event.clientY;
            onScroll?.({
              is_vertical: true,
              scroll_top: offset,
              is_top_edge_reached: offset === 0,
              is_bottom_edge_reached: offset === tractRect.height - thumbRect.height,
            });
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientYRef.current = 0;
  });

  const style = { height: thumbSize ?? 0 };
  const isHidden = thumbSize === 0;

  return (
    <div className="scrollbar_by_y">
      <div
        ref={thumbRef}
        className="scrollbar_by_y__thumb"
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="scrollbar"
        aria-orientation="vertical"
        aria-label="vertical scrollbar"
        aria-controls={contentId}
        aria-valuenow={0}
        aria-hidden={isHidden}
      />
    </div>
  );
}

export default memo(forwardRef<
  ScrollbarByYApiType,
  ScrollbarByYPropsType
>(Scrollbar));