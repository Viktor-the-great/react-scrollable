import {
  type ReactElement,
  type ReactNode,
  type Ref,
  type PointerEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import useResizeObserver from './hooks/useResizeObserver';
import useEvent from './hooks/useEvent';
import makePx from './utils/makePx';
import { floor, isEqual, isMore } from './utils/math';
import type {
  ScrollbarsSizeType,
  ContentApiType,
  ScrollEvent,
} from './types';
import './content.css';

type ContentPropsType = {
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
   * @param {boolean | null} event.is_left_edge_reached - flag indicating that the left edge of the element's content has been reached, applies to horizontal scrolling
   * @param {boolean | null} event.is_right_edge_reached - flag indicating that the right edge of the element's content has been reached, applies to horizontal scrolling
   */
  onScroll?: (event: ScrollEvent) => void;
  /**
   * content of scrollable area
   */
  children: ReactNode;
  /**
   * scrollable element id to create aria-controls attribute
   */
  contentId: string;
}

function Content({
  children,
  onResize,
  contentId,
  onScroll = undefined,
}: ContentPropsType, ref: Ref<ContentApiType>): ReactElement {
  const offsetLeftRef = useRef(0);
  const offsetTopRef = useRef(0);
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
        let scrollTop = Math.max(0, offsetTopRef.current);
        if (isMore(size.height, scrollableRect.height)) {
          scrollTop = Math.min(scrollTop, size.height - scrollableRect.height)
        }
        let scrollLeft = Math.max(0, offsetLeftRef.current);
        if (isMore(size.width, scrollableRect.width)) {
          scrollLeft = Math.min(scrollLeft, size.width - scrollableRect.width)
        }

        onResizeEvent({
          hThumbSize: floor(hThumbSize, 2),
          vThumbSize: floor(vThumbSize, 2),
          scrollLeft,
          scrollTop,
        });
      }
    },
  });
  useResizeObserver<HTMLDivElement>({
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
        let scrollTop = Math.max(0, offsetTopRef.current);
        if (isMore(contentRect.height, scrollableSize.height)) {
          scrollTop = Math.min(scrollTop, contentRect.height - scrollableSize.height)
        }
        let scrollLeft = Math.max(0, offsetLeftRef.current);
        if (isMore(contentRect.width, scrollableSize.width)) {
          scrollLeft = Math.min(scrollLeft, contentRect.width - scrollableSize.width)
        }

        onResizeEvent({
          hThumbSize: floor(hThumbSize, 2),
          vThumbSize: floor(vThumbSize, 2),
          scrollLeft,
          scrollTop,
        });
      }
    },
  });

  useImperativeHandle(ref, () => ({
    get scrollTop() {
      return offsetTopRef.current;
    },
    set scrollTop(value) {
      if (!contentRef.current) {
        throw new Error('content element not defined');
      }
      contentRef.current.style.transform = `translate(${makePx(-offsetLeftRef.current)}, ${makePx(-value)})`;
      contentRef.current.setAttribute('data-scroll-top', `-${value}`)
      offsetTopRef.current = value;
    },
    get scrollLeft() {
      return offsetLeftRef.current;
    },
    set scrollLeft(value) {
      if (!contentRef.current) {
        throw new Error('content element not defined');
      }
      contentRef.current.style.transform = `translate(${makePx(-value)}, ${makePx(-offsetTopRef.current)})`;
      contentRef.current.setAttribute('data-scroll-left', `-${value}`)
      offsetLeftRef.current = value;
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
    setAttributes(attributes: Record<string, string>) {
      Object.entries(attributes).forEach(([key, value]) => {
        contentRef.current?.setAttribute(key, value);
      })
    }
  }));

  const onWheel = useEvent((event: WheelEvent) => {
    if (!contentSize) {
      return;
    }

    const scrollableElement = scrollableRef.current;
    if (!scrollableElement) {
      return;
    }

    const scrollableRect = scrollableElement.getBoundingClientRect();

    if (event.shiftKey && isMore(contentSize.width, scrollableRect.width)) {
      const offsetByX = Math.min(
        Math.max(offsetLeftRef.current + event.deltaY, 0),
        contentSize.width - scrollableRect.width,
      );

      if (offsetByX !== offsetLeftRef.current) {
        event.preventDefault();
        event.stopPropagation();
        offsetLeftRef.current = offsetByX;
        onScroll?.({
          isVertical: false,
          scrollLeft: offsetByX,
          is_left_edge_reached: isEqual(offsetByX, 0),
          is_right_edge_reached: isEqual(offsetByX, contentSize.width - scrollableRect.width),
        });
      }
    }

    if (!event.shiftKey && isMore(contentSize.height, scrollableRect.height)) {
      const offsetByY = Math.min(
        Math.max(offsetTopRef.current + event.deltaY, 0),
        contentSize.height - scrollableRect.height,
      );

      if (offsetByY !== offsetTopRef.current) {
        event.preventDefault();
        event.stopPropagation();
        offsetTopRef.current = offsetByY;
        onScroll?.({
          isVertical: true,
          scrollTop: offsetByY,
          isTopEdgeReached: isEqual(offsetByY, 0),
          isBottomEdgeReached: isEqual(offsetByY, contentSize.height - scrollableRect.height),
        });
      }
    }
  });

  useEffect(() => {
    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      scrollableElement.addEventListener('wheel', onWheel, { passive: false });
    }
    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('wheel', onWheel);
      }
    }
  }, [
    scrollableRef,
    onWheel
  ])

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
          Math.max(offsetTopRef.current - (event.clientY - clientYRef.current), 0),
          targetRect.height - scrollableRect.height,
        );
        if (offsetTopRef.current !== offsetByY) {
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
          Math.max(offsetLeftRef.current - (event.clientX - clientXRef.current), 0),
          targetRect.width - scrollableRect.width,
        );
        if (offsetLeftRef.current !== offsetByX) {
          clientXRef.current = event.clientX;
          onScroll?.({
            isVertical: false,
            scrollLeft: offsetByX,
            is_left_edge_reached: offsetByX === 0,
            is_right_edge_reached: offsetByX === targetRect.width - scrollableRect.width,
          });
        }
      }
    }
  });

  return (
    <div
      className="scrollable__scrollable"
      ref={scrollableRef}
      data-testid="scrollable-wrapper"
    >
      <div className="scrollable__content">
        <div
          id={contentId}
          ref={contentRef}
          className="scrollable__content"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          data-testid="scrollable-content"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default forwardRef<
  ContentApiType,
  ContentPropsType
>(Content);