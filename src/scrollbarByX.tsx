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
import type { ScrollbarByXApiType, ScrollEvent } from './types';
import './scrollbarByX.css';

type ScrollbarByXPropsType = {
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

function ScrollbarByX({
  thumbSize = 0,
  onScroll,
  contentId,
}: ScrollbarByXPropsType, ref: Ref<ScrollbarByXApiType>): ReactElement {
  const apiRef = useRef<ScrollbarByXApiType>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useImperativeHandle(composeRefs(apiRef, ref), () => ({
    get scrollLeft() {
      return offsetRef.current;
    },
    set scrollLeft(value) {
      if (thumbRef.current) {
        thumbRef.current.style.marginLeft = makePx(value);
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
      return toFixed(thumbRect.width / trackRect.width * value, 1);
    },
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

      if (trackElement && apiRef.current) {
        const thumbRect = thumbElement.getBoundingClientRect();
        const tractRect = trackElement.getBoundingClientRect();
        if (tractRect.width > thumbRect.width) {
          const offset = Math.min(
            Math.max(offsetRef.current + event.clientX - clientXRef.current, 0),
            tractRect.width - thumbRect.width,
          );
          if (offset !== offsetRef.current) {
            apiRef.current.scrollLeft = offset;
            clientXRef.current = event.clientX;
            onScroll?.({
              is_vertical: false,
              scroll_left: offset,
              is_left_edge_reached: offset === 0,
              is_right_edge_reached: offset === tractRect.width - thumbRect.width,
            });
          }
        }
      }
    }
  });
  const onPointerUp = useEvent(() => {
    isPointerDown.current = false;
    clientXRef.current = 0;
  });

  const style = { width: thumbSize ?? 0 }
  const isHidden = thumbSize === 0;

  return (
    <div className="scrollbar_by_x">
      <div
        ref={thumbRef}
        className="scrollbar_by_x__thumb"
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="scrollbar"
        aria-orientation="horizontal"
        aria-label="horizontal scrollbar"
        aria-controls={contentId}
        aria-valuenow={0}
        aria-hidden={isHidden}
      />
    </div>
  );
}

export default memo(forwardRef<
  ScrollbarByXApiType,
  ScrollbarByXPropsType
>(ScrollbarByX));