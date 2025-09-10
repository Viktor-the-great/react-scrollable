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
} from 'react';
import Scrollbar from './scrollbar';
import cx from './utils/classnames';
import generateUniqId from './utils/generateUniqId';
import composeRef from './utils/composeRef';
import type {
  ScrollEvent,
  ScrollableApiType,
} from './types';
import useEvent from './hooks/useEvent';
import useDebounce from './hooks/useDebounce';
import useHorizontalScrollbarHandlers from './hooks/useHorizontalScrollbarHandlers';
import useVerticalScrollbarHandlers from './hooks/useVerticalScrollbarHandlers';
import useScrollableResizeObserver from './hooks/useScrollableResizeObserver';
import useScrollHandlers from './hooks/useScrollHandlers';
import usePointerHandlers from './hooks/usePointerHandlers';
import useScrollableRef from './hooks/useScrollableRef';
import './scrollable.css';

type ScrollablePropsType = {
  /**
   * scrollable content
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
  const vScrollbarRef = useRef<HTMLDivElement>(null);
  const hScrollbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useScrollableRef(composeRef(ref, scrollableApiRef), {
    scrollableRef,
    vScrollbarRef,
    hScrollbarRef,
  });

  const onDebounceScroll = useDebounce((event: ScrollEvent) => onScroll?.(event));

  const id = useMemo(() => generateUniqId(), []);

  const {
    scrollableSize,
    contentSize,
  } = useScrollableResizeObserver({
    scrollableRef,
    contentRef,
    hScrollbarRef,
    vScrollbarRef,
    scrollableApiRef,
    onResize(size) {
      setScrollbarByY(size.vThumbSize !== 0);
      setScrollbarByX(size.hThumbSize !== 0);
    },
  });

  const ignoresScrollEvents = useRef(false);
  const onContentScroll = useEvent((event: ScrollEvent) => {
    if (scrollableApiRef.current) {
      ignoresScrollEvents.current = true;

      if (event.isVertical) {
        scrollableApiRef.current.scrollTop = event.scrollTop;
      } else {
        scrollableApiRef.current.scrollLeft = event.scrollLeft;
      }
      onDebounceScroll(event);
    }
  });

  const scrollHandlers = useScrollHandlers({
    ignoresScrollEvents,
    contentSize,
    scrollableSize,
    onScroll: onContentScroll,
  });

  const pointerHandlers = usePointerHandlers({
    scrollableRef,
    onScroll: onContentScroll,
  });

  const horizontalScrollbarHandlers = useHorizontalScrollbarHandlers({
    onScroll: onDebounceScroll,
    scrollableRef,
    contentRef,
    scrollableApiRef,
  });

  const verticalScrollbarHandlers = useVerticalScrollbarHandlers({
    onScroll: onDebounceScroll,
    scrollableRef,
    contentRef,
    scrollableApiRef,
  });

  return (
    <div
      className={cx('scrollable__wrapper', {
        'scrollable_by-x': isScrollbarByX,
        'scrollable_by-y': isScrollbarByY,
        'scrollable_show-mouse-on-hover': showThumbOnHover,
      }, className)}
      style={style}
    >
      <div
        id={id}
        className={cx('scrollable', className)}
        ref={scrollableRef}
        data-testid="scrollable"
        {...scrollHandlers}
      >
        <div
          ref={contentRef}
          className="scrollable__content"
          data-testid="content"
          {...pointerHandlers}
        >
          {children}
        </div>
      </div>
      <Scrollbar
        ref={vScrollbarRef}
        isVertical
        aria-controls={id}
        {...verticalScrollbarHandlers}
      />
      <Scrollbar
        ref={hScrollbarRef}
        aria-controls={id}
        {...horizontalScrollbarHandlers}
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