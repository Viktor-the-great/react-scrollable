import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
  forwardRef,
  memo,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import useEvent from './hooks/useEvent';
import cx from './utils/classnames';
import debounce from './utils/debounce';
import generateUniqId from './utils/generateUniqId';
import composeRef from './utils/composeRef';
import {
  isEqual, isMore,
  toContentSize,
  toScrollbarSize,
} from './utils/math';
import Content from './content';
import HScrollbar from './hScrollbar';
import VScrollbar from './vScrollbar';
import {
  NoContentApiError,
  NoScrollableApiError,
} from './errors';
import type {
  ScrollbarsSizeType,
  ContentApiType,
  HScrollbarApiType,
  VScrollbarApiType,
  ScrollEvent,
  ScrollableApiType,
} from './types';
import './scrollable.css';

type ScrollablePropsType = {
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
   * @param {boolean} event.isVertical - is vertical scrolling?
   * @param {number | null} event.scrollTop - number of pixels by which an element's content is scrolled from its top edge, applies to vertical scrolling
   * @param {number | null} event.scrollLeft - number of pixels by which an element's content is scrolled from its left edge, applies to horizontal scrolling
   * @param {boolean | null} event.isTopEdgeReached - flag indicating that the top edge of the element's content has been reached, applies to vertical scrolling
   * @param {boolean | null} event.isBottomEdgeReached - flag indicating that the bottom edge of the element's content has been reached, applies to vertical scrolling
   * @param {boolean | null} event.isLeftEdgeReached - flag indicating that the left edge of the element's content has been reached, applies to horizontal scrolling
   * @param {boolean | null} event.isRightEdgeReached - flag indicating that the right edge of the element's content has been reached, applies to horizontal scrolling
   */
  onScroll?: (event: ScrollEvent) => void | Promise<void>;
}

/**
 * Scrollable is a custom component made to handle scrolling with a custom scrollbar.
 */
function Scrollable({
  children,
  showThumbOnHover = false,
  className = undefined,
  style = undefined,
  onScroll = undefined,
}: ScrollablePropsType, ref: Ref<ScrollableApiType>): ReactElement {
  const [isScrollbarByX, setScrollbarByX] = useState<boolean>(false);
  const [isScrollbarByY, setScrollbarByY] = useState<boolean>(false);

  const scrollableApiRef = useRef<ScrollableApiType>(null);
  const vScrollbarRef = useRef<VScrollbarApiType>(null);
  const hScrollbarRef = useRef<HScrollbarApiType>(null);
  const contentApiRef = useRef<ContentApiType>(null);

  const onScrollEvent = useEvent((event: ScrollEvent) => onScroll?.(event));
  const onDebounceScroll = useMemo(() => debounce(onScrollEvent, 100), [
    onScrollEvent,
  ])

  const onResize = useEvent((size: ScrollbarsSizeType) => {
    if (!scrollableApiRef.current) {
      throw new NoScrollableApiError();
    }
    if (vScrollbarRef.current) {
      const isHidden = size.vThumbSize === 0;
      vScrollbarRef.current.setSize(size.vThumbSize);
      vScrollbarRef.current.setAttributes({
        'aria-hidden': isHidden.toString(),
      });
      setScrollbarByY(!isHidden);
    }
    if (hScrollbarRef.current) {
      const isHidden = size.hThumbSize === 0;
      hScrollbarRef.current.setSize(size.hThumbSize);
      hScrollbarRef.current.setAttributes({
        'aria-hidden': isHidden.toString(),
      });
      setScrollbarByX(!isHidden);
    }
    scrollableApiRef.current.scrollTop = size.scrollTop;
    scrollableApiRef.current.scrollLeft = size.scrollLeft;
  });
  const onContentScroll = useEvent((event: ScrollEvent) => {
    if (!scrollableApiRef.current) {
      throw new NoScrollableApiError();
    }

    if (event.isVertical) {
      scrollableApiRef.current.scrollTop = event.scrollTop;
    } else {
      scrollableApiRef.current.scrollLeft = event.scrollLeft;
    }
    onDebounceScroll(event);
  });
  const onByXScroll = useEvent((offset: number) => {
    if (!contentApiRef.current) {
      throw new NoContentApiError();
    }
    if (!scrollableApiRef.current) {
      throw new NoScrollableApiError();
    }
    const contentRect = contentApiRef.current.getContentRect();
    const scrollableRect = contentApiRef.current.getScrollableRect();

    const scrollLeft = toContentSize(
      offset,
      contentRect.width,
      scrollableRect.width
    );
    scrollableApiRef.current.scrollLeft = scrollLeft;
    onDebounceScroll({
      isVertical: false,
      scrollLeft: scrollLeft,
      isLeftEdgeReached: isEqual(scrollLeft, 0),
      isRightEdgeReached: isEqual(scrollLeft, contentRect.width - scrollableRect.width),
    });
  });
  const onByYScroll = useEvent((offset: number) => {
    if (!contentApiRef.current) {
      throw new NoContentApiError();
    }
    if (!scrollableApiRef.current) {
      throw new NoScrollableApiError();
    }
    const contentRect = contentApiRef.current.getContentRect();
    const scrollableRect = contentApiRef.current.getScrollableRect();

    const scrollTop = toContentSize(
      offset,
      contentRect.height,
      scrollableRect.height
    );
    scrollableApiRef.current.scrollTop = scrollTop;
    onDebounceScroll({
      isVertical: true,
      scrollTop: scrollTop,
      isTopEdgeReached: isEqual(scrollTop, 0),
      isBottomEdgeReached: isEqual(scrollTop, contentRect.height - scrollableRect.height),
    });
  });

  useImperativeHandle(composeRef(ref, scrollableApiRef), () => ({
    get scrollLeft() {
      return contentApiRef.current?.scrollLeft ?? 0;
    },
    set scrollLeft(value: number) {
      if (!contentApiRef.current) {
        throw new NoContentApiError();
      }
      contentApiRef.current.scrollLeft = value;
      const contentRect = contentApiRef.current.getContentRect();
      const scrollableRect = contentApiRef.current.getScrollableRect();
      if (hScrollbarRef.current) {
        const scrollLeft = toScrollbarSize(
          value,
          contentRect.width,
          scrollableRect.width,
        );
        hScrollbarRef.current.scrollLeft = scrollLeft;
        const isHidden = !isMore(contentRect.width, scrollableRect.width);
        hScrollbarRef.current.setAttributes({
          'aria-valuenow': value.toString(),
          'aria-hidden': isHidden.toString(),
          'data-scroll-left': scrollLeft.toString(),
        });
      }
    },
    get scrollTop() {
      return contentApiRef.current?.scrollTop ?? 0;
    },
    set scrollTop(value: number) {
      if (!contentApiRef.current) {
        throw new NoContentApiError();
      }
      contentApiRef.current.scrollTop = value;
      const contentRect = contentApiRef.current.getContentRect();
      const scrollableRect = contentApiRef.current.getScrollableRect();
      if (vScrollbarRef.current) {
        const scrollTop = toScrollbarSize(
          value,
          contentRect.height,
          scrollableRect.height,
        );
        vScrollbarRef.current.scrollTop = scrollTop;
        const isHidden = !isMore(contentRect.height, scrollableRect.height);
        vScrollbarRef.current.setAttributes({
          'aria-valuenow': value.toString(),
          'aria-hidden': isHidden.toString(),
          'data-scroll-top': scrollTop.toString(),
        });
      }
    },
  }), []);

  const id = useMemo(() => generateUniqId(), []);

  return (
    <div
      className={cx('scrollable', {
        'scrollable_by-x': isScrollbarByX,
        'scrollable_by-y': isScrollbarByY,
        'scrollable_show-mouse-on-hover': showThumbOnHover,
      }, className)}
      style={style}
    >
      <Content
        id={id}
        ref={contentApiRef}
        onResize={onResize}
        onScroll={onContentScroll}
      >
        {children}
      </Content>
      <VScrollbar
        ref={vScrollbarRef}
        onScroll={onByYScroll}
        aria-controls={id}
      />
      <HScrollbar
        ref={hScrollbarRef}
        onScroll={onByXScroll}
        aria-controls={id}
      />
      <div data-testid="extreme-point" />
    </div>
  );
}

const MemoScrollable = memo(forwardRef<
  ScrollableApiType,
  ScrollablePropsType
>(Scrollable));

MemoScrollable.displayName = 'Scrollable';

export default MemoScrollable;

export type {
  ScrollablePropsType,
  ScrollEvent,
  ScrollableApiType,
}