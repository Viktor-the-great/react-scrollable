import {
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
  type HTMLAttributes,
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
import useHorizontalScrollbarHandlers from './hooks/useHorizontalScrollbarHandlers';
import useVerticalScrollbarHandlers from './hooks/useVerticalScrollbarHandlers';
import useResizeObserver from './hooks/useResizeObserver';
import useScrollHandlers from './hooks/useScrollHandlers';
import usePointerHandlers from './hooks/usePointerHandlers';
import useScrollableRef from './hooks/useScrollableRef';
import './scrollable.css';

type ScrollablePropsType = HTMLAttributes<HTMLElement> & {
  /**
   * scrollable content
   */
  children: ReactNode;
  /**
   * show thumbs on mouse hover, effects only for pointing devices like a mouse
   */
  showThumbOnHover?: boolean;
  onLeftEdgeReached?: (event: UIEvent) => void;
  onRightEdgeReached?: (event: UIEvent) => void;
  onTopEdgeReached?: (event: UIEvent) => void;
  onBottomEdgeReached?: (event: UIEvent) => void;
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
}: ScrollablePropsType, ref: Ref<ScrollableApiType>): ReactElement {
  const [visibility, setVisibility] = useState([false, false]);
  const [hasHorizontalScrollbar, hasVerticalScrollbar] = visibility;

  const scrollableApiRef = useRef<ScrollableApiType>(null);
  const vScrollbarRef = useRef<HTMLDivElement>(null);
  const hScrollbarRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useScrollableRef(composeRef(ref, scrollableApiRef), {
    scrollableRef,
    vScrollbarRef,
    hScrollbarRef,
  });

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
    scrollableApiRef,
    scrollableRef,
    ignoresScrollEvents,
  });

  const horizontalScrollbarHandlers = useHorizontalScrollbarHandlers({
    scrollableApiRef,
    scrollableRef,
    ignoresScrollEvents,
  });

  const verticalScrollbarHandlers = useVerticalScrollbarHandlers({
    scrollableApiRef,
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
        ref={scrollableRef}
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