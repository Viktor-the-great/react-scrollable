import {
  type CSSProperties,
  type ReactElement,
  type ReactNode, useMemo,
  useRef,
  useState,
} from 'react';
import useEvent from './hooks/useEvent';
import cx from './utils/classnames';
import Content from './content';
import Scrollbar from './scrollbar';
import generateUniqId from './generateUniqId';
import type {
  ScrollbarsSizeType,
  ContentApiType,
  ScrollbarApiType,
  ScrollEvent,
} from './types';
import './scrollable.css';

export type ScrollablePropsType = {
  /**
   * content of scrollable area
   */
  children: ReactNode;
  /**
   * use class to customize element styles
   */
  className?: string;
  /**
   * use styles to customize element styles
   */
  style?: CSSProperties;
  /**
   * show thumbs on mouse hover, effects only for pointing devices like a mouse
   */
  showThumbOnHover?: boolean;
  /**
   * function called when scrolling using wheel, mouse pointer, touch pointer
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
}

function Scrollable({
  children,
  showThumbOnHover = false,
  className = undefined,
  style = undefined,
  onScroll = undefined,
}: ScrollablePropsType): ReactElement {
  const [vThumbSize, setVThumbSize] = useState<number>(0);
  const [hThumbSize, setHThumbSize] = useState<number>(0);

  const vScrollbarRef = useRef<ScrollbarApiType>(null);
  const hScrollbarRef = useRef<ScrollbarApiType>(null);
  const contentRef = useRef<ContentApiType>(null);

  const onContentChange = useEvent((size: ScrollbarsSizeType) => {
    setVThumbSize(size.vThumbSize);
    setHThumbSize(size.hThumbSize);
  });
  const onScrollByContent = useEvent((event: ScrollEvent) => {
    if (event.is_vertical) {
      if (vScrollbarRef.current) {
        vScrollbarRef.current.scrollTop = vScrollbarRef.current.getScrollSize(event.scroll_top);
      }
    } else {
      if (hScrollbarRef.current) {
        hScrollbarRef.current.scrollLeft = hScrollbarRef.current.getScrollSize(event.scroll_left);
      }
    }
    onScroll?.(event);
  });
  const onScrollByScrollbar = useEvent((event: ScrollEvent) => {
    if (event.is_vertical) {
      if (contentRef.current) {
        const scrollTop = contentRef.current.getTopScrollSize(event.scroll_top);
        contentRef.current.scrollTop = scrollTop;
        onScroll?.({
          ...event,
          scroll_top: scrollTop,
        });
      }
    } else {
      if (contentRef.current) {
        const scrollLeft = contentRef.current.getLeftScrollSize(event.scroll_left);
        contentRef.current.scrollLeft = scrollLeft;
        onScroll?.({
          ...event,
          scroll_left: scrollLeft,
        });
      }
    }
  });

  const contentId = useMemo(() => generateUniqId(), []);

  return (
    <div
      className={cx('scrollable', {
        'scrollable_by-x': hThumbSize !== 0,
        'scrollable_by-y': vThumbSize !== 0,
        'scrollable_show-mouse-on-hover': showThumbOnHover,
      }, className)}
      style={style}
    >
      <Content
        ref={contentRef}
        onChange={onContentChange}
        contentId={contentId}
        onScroll={onScrollByContent}
      >
        {children}
      </Content>
      <Scrollbar
        ref={vScrollbarRef}
        thumbSize={vThumbSize}
        isVertical
        onScroll={onScrollByScrollbar}
        contentId={contentId}
      />
      <Scrollbar
        ref={hScrollbarRef}
        thumbSize={hThumbSize}
        onScroll={onScrollByScrollbar}
        contentId={contentId}
      />
      <div data-testid="extreme-point" />
    </div>
  );
}

export default Scrollable;