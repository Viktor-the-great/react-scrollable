import {
  type ReactElement,
  type ReactNode,
  type WheelEvent,
  type Ref,
  type PointerEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import useResizeObserver from './hooks/useResizeObserver';
import useEvent from './hooks/useEvent';
import composeRefs from './utils/composeRef';
import makePx from './utils/makePx';
import toFixed from './utils/toFixed';
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
      const scrollableElement = scrollableRef.current;
      if (scrollableElement) {
        const scrollableRect = scrollableElement.getBoundingClientRect();
        const hThumbSize = size.width > scrollableRect.width
          ? scrollableRect.width / (size.width / scrollableRect.width)
          : 0;
        const vThumbSize = size.height > scrollableRect.height
          ? scrollableRect.height / (size.height / scrollableRect.height)
          : 0;

        onChange({
          hThumbSize: toFixed(hThumbSize, 1),
          vThumbSize: toFixed(vThumbSize, 1),
        });
      }
    },
  });
  const [scrollableRef] = useResizeObserver<HTMLDivElement>({
    onChange: (scrollableSize) => {
      if (contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        const hThumbSize = contentRect.width > scrollableSize.width
          ? scrollableSize.width / (contentRect.width / scrollableSize.width)
          : 0;
        const vThumbSize = contentRect.height > scrollableSize.height
          ? scrollableSize.height / (contentRect.height / scrollableSize.height)
          : 0;

        onChange({
          hThumbSize: toFixed(hThumbSize, 1),
          vThumbSize: toFixed(vThumbSize, 1),
        });
      }
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
      const scrollableElement = scrollableRef.current;
      const contentElement = contentRef.current;
      if (!contentElement) {
        throw new Error('content element not defined');
      }
      if (!scrollableElement) {
        throw new Error('scrollable element not defined');
      }
      const contentRect = contentElement.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();
      return toFixed(value * contentRect.width / scrollableRect.width, 1);
    },
    getTopScrollSize(value: number) {
      const scrollableElement = scrollableRef.current;
      const contentElement = contentRef.current;
      if (!contentElement) {
        throw new Error('content element not defined');
      }
      if (!scrollableElement) {
        throw new Error('scrollable element not defined');
      }
      const contentRect = contentElement.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();
      return toFixed(value * contentRect.height / scrollableRect.height, 1);
    },
  }));

  const onWheel = useEvent((event: WheelEvent<HTMLDivElement>) => {
    if (!contentSize) {
      return;
    }

    const scrollableElement = scrollableRef.current;
    if (!scrollableElement) {
      return;
    }

    if (!apiRef.current) {
      throw new Error('content api is not defined');
    }

    const scrollableRect = scrollableElement.getBoundingClientRect();

    if (
      event.shiftKey
      && offsetLeftRef.current >= 0
      && offsetLeftRef.current <= contentSize.width - scrollableRect.width
    ) {
      offsetLeftRef.current += event.deltaY > 0
        ? Math.min(event.deltaY, contentSize.width - scrollableRect.width - offsetLeftRef.current)
        : Math.max(event.deltaY, -offsetLeftRef.current);
      apiRef.current.scrollLeft = offsetLeftRef.current;
      onScrollByX?.(offsetLeftRef.current);
    }

    if (
      !event.shiftKey
      && offsetTopRef.current >= 0
      && offsetTopRef.current <= contentSize.height - scrollableRect.height
    ) {
      offsetTopRef.current += event.deltaY > 0
        ? Math.min(event.deltaY, contentSize.height - scrollableRect.height - offsetTopRef.current)
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
      const scrollableElement = scrollableRef.current!;
      const api = apiRef.current!;
      const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();
      const offsetByY = Math.min(
        Math.max(offsetTopRef.current - (event.clientY - clientYRef.current), 0),
        targetRect.height - scrollableRect.height,
      );
      if (offsetTopRef.current !== offsetByY) {
        api.scrollTop = offsetByY;
        onScrollByY?.(offsetByY);
        clientYRef.current = event.clientY;
      }
      const offsetByX = Math.min(
        Math.max(offsetLeftRef.current - (event.clientX - clientXRef.current), 0),
        targetRect.width - scrollableRect.width,
      );
      if (offsetLeftRef.current !== offsetByX) {
        api.scrollLeft = offsetByX;
        onScrollByX?.(offsetByX);
        clientXRef.current = event.clientX;
      }
    }
  });

  return (
    <div
      className="scrollable__content"
      onWheel={onWheel}
      ref={scrollableRef}
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