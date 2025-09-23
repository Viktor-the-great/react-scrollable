import {
  type ReactElement,
  type Ref,
  type UIEvent,
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
  memo,
  useMemo,
  useRef,
  useState,
} from 'react';
import CssVariables from './css-variables';
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

export type ScrollablePropsType = HTMLAttributes<HTMLElement> & {
  /**
   * show thumbs on mouse hover, effects only for pointing devices like a mouse
   */
  showThumbOnHover?: boolean;
  /**
   * <a name="on-left-edge-reached-props-anchor"></a>
   * called when the scrollable area reaches its left edge
   */
  onLeftEdgeReached?: (event: UIEvent) => void;
  /**
   * called when the scrollable area reaches its right edge
   */
  onRightEdgeReached?: (event: UIEvent) => void;
  /**
   * called when the scrollable area reaches its top edge
   */
  onTopEdgeReached?: (event: UIEvent) => void;
  /**
   * called when the scrollable area reaches its bottom edge
   */
  onBottomEdgeReached?: (event: UIEvent) => void;
  /**
   * <a name="classname-props-anchor"></a>
   * The property serves as a prefix for generating new classes for internal elements, which are appended to the existing classes
   *
   * Generated classes:
   *
   * * `[className]` - the wrapper element class containing the scrollable area and scrollbars, implemented as a dynamic grid.
   * * `[className]__area` - scrollable element class - uses CSS overflow property
   * * `[className]__content` - content element class
   * * `[className]__scrollbar` - scrollbar element class
   * * `[className]__scrollbar_vertical` - vertical scrollbar modifier class
   * * `[className]__scrollbar_horizontal` - horizontal scrollbar modifier class
   * * `[className]__scrollbar__thumb` - thumb element class
   */
  className?: string;
  /**
   * Applies styles to the overflow-enabled scrollable element.
   * The width and height properties are applied exclusively to the inner content element, excluding scrollbars.
   * Use the `wrapperStyle` property to define the size of the container encompassing all elements.
   */
  style?: CSSProperties;
  /**
   * Applies styles to the wrapper containing all component elements and scrollbars
   */
  wrapperStyle?: CSSProperties;
}

/**
 * Scrollable is a custom component made to handle scrolling with a custom scrollbar.
 * The scrolling functionality relies on the browser's native implementation, while the scrollbars are hidden (`scrollbar-width: none;` `::-webkit-scrollbar { width: 0; }`).
 * Scrollbars are implemented as separate programmatically controlled elements.
 *
 * The component supports all properties of the HTML element that are passed to the inner element with the CSS overflow rule. For example, this allows configuring scrolling rules.
 *
 * Using [additional properties](#on-left-edge-reached-props-anchor), the component can intercept events when the scrollable area reaches its top, bottom, left, or right edge.
 *
 * The component supports multiple styling techniques:
 * 1. using CSS variables to support simple scrollbar styling. See available variables and default values below:
 *  - thumb variables:
 *      - `--thumb-border: none;`
 *      - `--thumb-border-radius: 3px;`
 *      - `--thumb-background: #C7CED480;`
 *      - `--thumb-size: 6px;`
 *  - scrollbar variables:
 *      - `--scrollbar-background: none;`
 *      - `--scrollbar-border: none;`
 *      - `--scrollbar-border-radius: 0;`
 * 2. using component's internal classes to support more complex styling
 *  - `scrollable` - the wrapper element class containing the scrollable area and scrollbars, implemented as a dynamic grid.
 *  - `scrollable__area` - scrollable element class - uses CSS overflow property
 *  - `scrollable__content` - content element class
 *  - `scrollable__scrollbar` - scrollbar element class
 *  - `scrollable__scrollbar_vertical` - vertical scrollbar modifier class
 *  - `scrollable__scrollbar_horizontal` - horizontal scrollbar modifier class
 *  - `scrollable__scrollbar__thumb` - thumb element class
 * 3. using the [className property](#classname-props-anchor) to generate new classes for internal elements.
 */
function Scrollable({
  children,
  showThumbOnHover = false,
  className = undefined,
  style = undefined,
  wrapperStyle = undefined,
  onLeftEdgeReached = undefined,
  onRightEdgeReached = undefined,
  onTopEdgeReached = undefined,
  onBottomEdgeReached = undefined,
  ...props
}: ScrollablePropsType, ref: Ref<HTMLDivElement>): ReactElement {
  const [visibility, setVisibility] = useState([false, false]);
  const [hasHorizontalScrollbar, hasVerticalScrollbar] = visibility;

  const vScrollbarRef = useRef<HTMLDivElement>(null);
  const hScrollbarRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const scrollableId = useMemo(() => props.id ?? generateUniqId(), [props.id]);

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
    onScroll: props.onScroll,
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
    <CssVariables>
      <div
        className={cx('scrollable', {
          'scrollable_has-horizontal-scrollbar': hasHorizontalScrollbar,
          'scrollable_has-vertical-scrollbar': hasVerticalScrollbar,
          'scrollable_show-mouse-on-hover': showThumbOnHover,
        }, className)}
        style={wrapperStyle}
      >
        <div
          {...props}
          id={scrollableId}
          className={cx('scrollable__area', {
            [`${className}__area`]: !!className,
          })}
          style={style}
          ref={composeRef(ref, scrollableRef)}
          data-testid="scrollable"
          {...scrollHandlers}
        >
          <div
            className={cx('scrollable__content', {
              [`${className}__content`]: !!className,
            })}
            {...pointerHandlers}
          >
            {children}
          </div>
        </div>
        <Scrollbar
          ref={vScrollbarRef}
          isVertical
          aria-controls={scrollableId}
          className={className}
          {...verticalScrollbarHandlers}
        />
        <Scrollbar
          ref={hScrollbarRef}
          aria-controls={scrollableId}
          className={className}
          {...horizontalScrollbarHandlers}
        />
        <div data-testid="extreme-point" />
      </div>
    </CssVariables>
  );
}

const MemoScrollable = memo(forwardRef<
  HTMLDivElement,
  ScrollablePropsType
>(Scrollable));

MemoScrollable.displayName = 'Scrollable';

export default MemoScrollable;
