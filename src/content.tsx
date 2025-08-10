import {
  type ReactElement,
  type ReactNode,
  type WheelEvent,
  type Ref,
  forwardRef,
  useCallback,
  useImperativeHandle, useRef, PointerEvent,
} from 'react';
import useResizeObserver from './hooks/useResizeObserver';
import useEvent from './hooks/useEvent';
import composeRefs from './utils/composeRef';
import makePx from './utils/makePx';
import type {
  ScrollbarsSizeType,
  ContentApiType,
} from './types';
import './content.css';

type ContentPropsType = {
  /**
   * onChange function called on scrollable area resized
   * @param {Object} size - calculated vertical/horizontal thumb sizes
   * @param {number} size.hThumbSize - horizontal thumb size
   * @param {number} size.vThumbSize - vertical thumb size
   */
  onChange: (size: ScrollbarsSizeType) => void;
  /**
   * onScrollByX function called when the content is scrolled on the X axis
   * @param {number} offsetByX - scrolled distance on the X axis
   */
  onScrollByX: (offsetByX: number) => void;
  /**
   * onScrollByX function called when the content is scrolled on the Y axis
   * @param {number} offsetByY - scrolled distance on the Y axis
   */
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
      const hThumbSize = scrollableElement && size.width > scrollableElement.offsetWidth
        ? scrollableElement.offsetWidth / (size.width / scrollableElement.offsetWidth)
        : 0;
      const vThumbSize = scrollableElement && size.height > scrollableElement.offsetHeight
        ? scrollableElement.offsetHeight / (size.height / scrollableElement.offsetHeight)
        : 0;
      onChange({
        hThumbSize,
        vThumbSize,
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

  const clientXRef = useRef(0);
  const clientYRef = useRef(0);
  const onPointerDown = useEvent((event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      (event.target as Element).setPointerCapture(event.pointerId);
      clientXRef.current = event.clientX;
      clientYRef.current = event.clientY;
    }
  });
  const onPointerMove = useEvent((event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      const scrollableElement = getScrollableElement()!;
      const api = apiRef.current!;
      const offsetByY = Math.min(
        Math.max(offsetTopRef.current - (event.clientY - clientYRef.current), 0),
        (event.currentTarget as HTMLElement).offsetHeight - scrollableElement.offsetHeight,
      );
      if (offsetTopRef.current !== offsetByY) {
        api.scrollTop = offsetByY;
        onScrollByY?.(offsetByY);
      }
      const offsetByX = Math.min(
        Math.max(offsetLeftRef.current - (event.clientX - clientXRef.current), 0),
        (event.currentTarget as HTMLElement).offsetWidth - scrollableElement.offsetWidth,
      );
      if (offsetLeftRef.current !== offsetByY) {
        api.scrollLeft = offsetByX;
        onScrollByX?.(offsetByX);
      }
    }
  });

  return (
    <div
      className="scrollable__content"
      onWheel={onWheel}
    >
      <div className="scrollable__inline-block">
        <div
          ref={contentRef}
          className="scrollable__inline-block"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
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