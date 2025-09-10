import {
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
  type CSSProperties,
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
import useHorizontalScrollbarHandlers from './hooks/useHorizontalScrollbarHandlers';
import useVerticalScrollbarHandlers from './hooks/useVerticalScrollbarHandlers';
import useResizeObserver from './hooks/useResizeObserver';
import useScrollHandlers from './hooks/useScrollHandlers';
import usePointerHandlers from './hooks/usePointerHandlers';
import './scrollable.css';

export type ScrollablePropsType = {
  /**
   * scrollable content
   */
  children: ReactNode;
  /**
   * show thumbs on mouse hover, effects only for pointing devices like a mouse
   */
  showThumbOnHover?: boolean;
  /**
   * function called when the scroll left edge is reached during scrolling
   */
  onLeftEdgeReached?: (event: UIEvent) => void;
  /**
   * function called when the scroll right edge is reached during scrolling
   */
  onRightEdgeReached?: (event: UIEvent) => void;
  /**
   * function called when the scroll top edge is reached during scrolling
   */
  onTopEdgeReached?: (event: UIEvent) => void;
  /**
   * function called when the scroll bottom edge is reached during scrolling
   */
  onBottomEdgeReached?: (event: UIEvent) => void;
  /**
   * function called when scroll event fires
   */
  onScroll?: (event: UIEvent) => void;
  /**
   * adds class to scrollable
   */
  className?: string;
  /**
   * adds style to scrollable
   */
  style?: CSSProperties;
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
  onLeftEdgeReached = undefined,
  onRightEdgeReached = undefined,
  onTopEdgeReached = undefined,
  onBottomEdgeReached = undefined,
}: ScrollablePropsType, ref: Ref<HTMLDivElement>): ReactElement {
  const [visibility, setVisibility] = useState([false, false]);
  const [hasHorizontalScrollbar, hasVerticalScrollbar] = visibility;

  const vScrollbarRef = useRef<HTMLDivElement>(null);
  const hScrollbarRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const id = useMemo(() => generateUniqId(), []);

  useResizeObserver({
    scrollableRef,
    hScrollbarRef,
    vScrollbarRef,
    onResize(size) {
      setVisibility([
        size.hThumbSize !== 0,
        size.vThumbSize !== 0,
      ]);
    },
  });

  const ignoresScrollEvents = useRef(false);

  const scrollHandlers = useScrollHandlers({
    hScrollbarRef,
    vScrollbarRef,
    onScroll,
    onLeftEdgeReached,
    onRightEdgeReached,
    onTopEdgeReached,
    onBottomEdgeReached,
    ignoresScrollEvents,
  });

  const pointerHandlers = usePointerHandlers({
    scrollableRef,
    hScrollbarRef,
    vScrollbarRef,
    ignoresScrollEvents,
  });

  const horizontalScrollbarHandlers = useHorizontalScrollbarHandlers({
    scrollbarRef: hScrollbarRef,
    scrollableRef,
    ignoresScrollEvents,
  });

  const verticalScrollbarHandlers = useVerticalScrollbarHandlers({
    scrollbarRef: vScrollbarRef,
    scrollableRef,
    ignoresScrollEvents,
  });

  return (
    <div
      className={cx('scrollable', {
        'scrollable_has-horizontal-scrollbar': hasHorizontalScrollbar,
        'scrollable_has-vertical-scrollbar': hasVerticalScrollbar,
        'scrollable_show-mouse-on-hover': showThumbOnHover,
      }, className)}
      style={style}
    >
      <div
        id={id}
        className="scrollable__area"
        ref={composeRef(ref, scrollableRef)}
        data-testid="scrollable"
        {...scrollHandlers}
      >
        <div
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
  HTMLDivElement,
  ScrollablePropsType
>(Scrollable));

MemoScrollable.displayName = 'Scrollable';

export default MemoScrollable;
