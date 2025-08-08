import {
  type ReactElement,
  type ReactNode,
  type WheelEvent,
  type Ref,
  forwardRef,
  useCallback,
  useImperativeHandle, useRef,
} from 'react';
import useResizeObserver from './hooks/useResizeObserver';
import useEvent from './hooks/useEvent';
import composeRefs from './utils/composeRef';
import makePx from './utils/makePx';
import type {
  ScrollbarsSizeType,
  ContentApiType,
} from './types';
import './index.css';

type ContentPropsType = {
  onChange: (size: ScrollbarsSizeType) => void;
  onScrollByX: (offsetByX: number) => void;
  onScrollByY: (offsetByY: number) => void;
  /**
   * content of scrollable area
   */
  children: ReactNode;
}

function Content({
  children,
  onChange,
  onScrollByX,
  onScrollByY,
}: ContentPropsType, ref: Ref<ContentApiType>): ReactElement {
  const apiRef = useRef<ContentApiType>(null);
  const offsetLeftRef = useRef(0);
  const offsetTopRef = useRef(0);
  const [contentRef, contentSize] = useResizeObserver<HTMLDivElement>({
    onChange: (size) => {
      const scrollableElement = getScrollableElement();
      const hScrollbarSize = scrollableElement && size.width > scrollableElement.offsetWidth
        ? scrollableElement.offsetWidth / (size.width / scrollableElement.offsetWidth)
        : 0;
      const vScrollbarSize = scrollableElement && size.height > scrollableElement.offsetHeight
        ? scrollableElement.offsetHeight / (size.height / scrollableElement.offsetHeight)
        : 0;
      onChange({
        hScrollbarSize,
        vScrollbarSize,
      });
    },
  });

  useImperativeHandle(composeRefs(apiRef, ref), () => ({
    get scrollTop() {
      return offsetTopRef.current;
    },
    set scrollTop(value) {
      if (!contentRef.current) {
        throw new Error('content element not defined');
      }
      contentRef.current.style.marginTop = makePx(-value);
      offsetTopRef.current = value;
    },
    get scrollLeft() {
      return offsetLeftRef.current;
    },
    set scrollLeft(value) {
      if (!contentRef.current) {
        throw new Error('content element not defined');
      }
      contentRef.current.style.marginLeft = makePx(-value);
      offsetLeftRef.current = value;
    },
    getLeftScrollSize(value: number) {
      const scrollableElement = getScrollableElement();
      const contentElement = contentRef.current;
      if (!contentElement) {
        throw new Error('content element not defined');
      }
      if (!scrollableElement) {
        throw new Error('scrollable element not defined');
      }
      return value * contentElement.offsetWidth / scrollableElement.clientWidth;
    },
    getTopScrollSize(value: number) {
      const scrollableElement = getScrollableElement();
      const contentElement = contentRef.current;
      if (!contentElement) {
        throw new Error('content element not defined');
      }
      if (!scrollableElement) {
        throw new Error('scrollable element not defined');
      }
      return value * contentElement.offsetHeight / scrollableElement.offsetHeight;
    },
  }));

  const getScrollableElement = useCallback(
    () => contentRef?.current?.parentElement?.parentElement,
    [
      contentRef,
    ]);
  const onWheel = useEvent((event: WheelEvent<HTMLDivElement>) => {
    if (!contentSize) {
      return;
    }

    const scrollableElement = getScrollableElement();
    if (!scrollableElement) {
      return;
    }

    if (!apiRef.current) {
      throw new Error('content api is not defined');
    }

    if (
      event.shiftKey
      && offsetLeftRef.current >= 0
      && offsetLeftRef.current <= contentSize.width - scrollableElement.offsetWidth
    ) {
      offsetLeftRef.current += event.deltaY > 0
        ? Math.min(event.deltaY, contentSize.width - scrollableElement.offsetWidth - offsetLeftRef.current)
        : Math.max(event.deltaY, -offsetLeftRef.current);
      apiRef.current.scrollLeft = offsetLeftRef.current;
      onScrollByX?.(offsetLeftRef.current);
    }

    if (
      !event.shiftKey
      && offsetTopRef.current >= 0
      && offsetTopRef.current <= contentSize.height - scrollableElement.offsetHeight
    ) {
      offsetTopRef.current += event.deltaY > 0
        ? Math.min(event.deltaY, contentSize.height - scrollableElement.offsetHeight - offsetTopRef.current)
        : Math.max(event.deltaY, -offsetTopRef.current);
      apiRef.current.scrollTop = offsetTopRef.current;
      onScrollByY?.(offsetTopRef.current);
    }
  });

  return (
    <div
      className="scrollable"
      onWheel={onWheel}
    >
      <div className="scrollable__content">
        <div ref={contentRef} className="scrollable__content">
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