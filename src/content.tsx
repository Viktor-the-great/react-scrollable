import {
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
  type PointerEvent,
  type HTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import useResizeObserver from './hooks/useResizeObserver';
import useEvent from './hooks/useEvent';
import { floor, isEqual, isMore } from './utils/math';
import cx from './utils/classnames';
import { NoScrollableApiError } from './errors';
import type {
  ScrollbarsSizeType,
  ContentApiType,
  ScrollEvent,
} from './types';
import './content.css';

type ContentPropsType = Omit<HTMLAttributes<HTMLElement>, 'onScroll'> & {
  /**
   * onChange function called on scrollable area resized
   * @param {Object} size - calculated vertical/horizontal thumb sizes
   * @param {number} size.hThumbSize - horizontal thumb size
   * @param {number} size.vThumbSize - vertical thumb size
   */
  onResize: (size: ScrollbarsSizeType) => void;
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
  onScroll?: (event: ScrollEvent) => void;
  /**
   * content of scrollable area
   */
  children: ReactNode;
}

function Content({
  children,
  onResize,
  onScroll = undefined,
  className = undefined,
  ...props
}: ContentPropsType, ref: Ref<ContentApiType>): ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const onResizeEvent = useEvent(onResize);
  const contentSize = useResizeObserver({
    elementRef: contentRef,
    onChange: (size) => {
      const scrollableElement = scrollableRef.current;
      if (scrollableElement) {
        const scrollableRect = scrollableElement.getBoundingClientRect();
        const hThumbSize = isMore(size.width, scrollableRect.width)
          ? scrollableRect.width / (size.width / scrollableRect.width)
          : 0;
        const vThumbSize = isMore(size.height, scrollableRect.height)
          ? scrollableRect.height / (size.height / scrollableRect.height)
          : 0;

        onResizeEvent({
          hThumbSize: floor(hThumbSize, 1),
          vThumbSize: floor(vThumbSize, 1),
          scrollLeft: scrollableRef.current?.scrollLeft ?? 0,
          scrollTop: scrollableRef.current?.scrollTop ?? 0,
        });
      }
    },
  });
  const scrollableSize = useResizeObserver<HTMLDivElement>({
    elementRef: scrollableRef,
    onChange: (scrollableSize) => {
      if (contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        const hThumbSize = isMore(contentRect.width, scrollableSize.width)
          ? scrollableSize.width / (contentRect.width / scrollableSize.width)
          : 0;
        const vThumbSize = isMore(contentRect.height, scrollableSize.height)
          ? scrollableSize.height / (contentRect.height / scrollableSize.height)
          : 0;

        onResizeEvent({
          hThumbSize: floor(hThumbSize, 1),
          vThumbSize: floor(vThumbSize, 1),
          scrollLeft: scrollableRef.current?.scrollLeft ?? 0,
          scrollTop: scrollableRef.current?.scrollTop ?? 0,
        });
      }
    },
  });

  const ignoresScrollEvents = useRef(false);
  useImperativeHandle(ref, () => ({
    get scrollTop() {
      return scrollableRef.current?.scrollTop ?? 0;
    },
    set scrollTop(value) {
      if (!scrollableRef.current) {
        throw new NoScrollableApiError();
      }
      ignoresScrollEvents.current = true;
      scrollableRef.current.scrollTop = value;
    },
    get scrollLeft() {
      return scrollableRef.current?.scrollLeft ?? 0;
    },
    set scrollLeft(value) {
      if (!scrollableRef.current) {
        throw new NoScrollableApiError();
      }
      ignoresScrollEvents.current = true;
      scrollableRef.current.scrollLeft = value;
    },
    getContentRect(): DOMRect {
      if (!contentRef.current) {
        throw new Error('content element not defined')
      }
      return contentRef.current.getBoundingClientRect();
    },
    getScrollableRect(): DOMRect {
      if (!scrollableRef.current) {
        throw new Error('scrollable element not defined')
      }
      return scrollableRef.current.getBoundingClientRect();
    },
  }));

  const lastScrollTopRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const onScrollEvent = useEvent(({
    currentTarget,
  }: UIEvent) => {
    if (ignoresScrollEvents.current) {
      ignoresScrollEvents.current = false;
      return;
    }
    if (lastScrollTopRef.current !== currentTarget.scrollTop) {
      const contentHeight = contentSize?.height ?? 0;
      const scrollableHeight = scrollableSize?.height ?? 0;
      onScroll?.({
        isVertical: true,
        scrollTop: currentTarget.scrollTop,
        isTopEdgeReached: isEqual(currentTarget.scrollTop, 0),
        isBottomEdgeReached: isEqual(currentTarget.scrollTop, contentHeight - scrollableHeight),
      });
      lastScrollTopRef.current = currentTarget.scrollTop;
    } else if (lastScrollLeftRef.current !== currentTarget.scrollLeft) {
      const contentWidth = contentSize?.width ?? 0;
      const scrollableWidth = scrollableSize?.width ?? 0;
      onScroll?.({
        isVertical: false,
        scrollLeft: currentTarget.scrollLeft,
        isLeftEdgeReached: isEqual(currentTarget.scrollLeft, 0),
        isRightEdgeReached: isEqual(currentTarget.scrollLeft, contentWidth - scrollableWidth),
      });
      lastScrollLeftRef.current = currentTarget.scrollLeft;
    }
  });

  const clientXRef = useRef(0);
  const clientYRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.isPrimary) {
      event.currentTarget.setPointerCapture(event.pointerId);
      clientXRef.current = event.clientX;
      clientYRef.current = event.clientY;
    }
  });
  const onPointerMove = useEvent((event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.isPrimary) {
      const scrollableElement = scrollableRef.current!;
      const targetRect = event.currentTarget.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();

      if (isMore(targetRect.height, scrollableRect.height)) {
        const offsetByY = Math.min(
          Math.max(scrollableElement.scrollTop - (event.clientY - clientYRef.current), 0),
          targetRect.height - scrollableRect.height,
        );
        if (scrollableElement.scrollTop !== offsetByY) {
          clientYRef.current = event.clientY;
          onScroll?.({
            isVertical: true,
            scrollTop: offsetByY,
            isTopEdgeReached: offsetByY === 0,
            isBottomEdgeReached: offsetByY === targetRect.height - scrollableRect.height,
          });
        }
      }

      if (isMore(targetRect.width, scrollableRect.width)) {
        const offsetByX = Math.min(
          Math.max(scrollableElement.scrollLeft - (event.clientX - clientXRef.current), 0),
          targetRect.width - scrollableRect.width,
        );
        if (scrollableElement.scrollLeft !== offsetByX) {
          clientXRef.current = event.clientX;
          onScroll?.({
            isVertical: false,
            scrollLeft: offsetByX,
            isLeftEdgeReached: offsetByX === 0,
            isRightEdgeReached: offsetByX === targetRect.width - scrollableRect.width,
          });
        }
      }
    }
  })

  return (
    <div
      {...props}
      className={cx('scrollable', className)}
      ref={scrollableRef}
      data-testid="scrollable"
      onScroll={onScrollEvent}
    >
      <div
        ref={contentRef}
        className="scrollable__content"
        data-testid="content"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        {children}
      </div>
    </div>
  );
}

export default forwardRef<
  ContentApiType,
  ContentPropsType
>(Content);