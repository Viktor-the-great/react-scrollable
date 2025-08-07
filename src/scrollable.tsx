import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type WheelEvent,
  useMemo, useRef,
} from 'react';
import useResizeObserver from './hooks/useResizeObserver';
import useEvent from './hooks/useEvent';
import cx from './utils/classnames';
import makePx from './utils/makePx';
import Scrollbar from './scrollbar';
import styles from './scrollable.module.css';

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
}

function Scrollable({
  children,
  className = undefined,
  style = undefined,
}: ScrollablePropsType): ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);
  const vScrollbarRef = useRef<HTMLDivElement>(null);
  const hScrollbarRef = useRef<HTMLDivElement>(null);
  const [cResizeObserverRef, contentSize] = useResizeObserver<HTMLDivElement>();
  const [scrollableRef, scrollableSize] = useResizeObserver<HTMLDivElement>();
  const height = useMemo(() => {
    if (contentSize && scrollableSize && contentSize.height > scrollableSize.height) {
      return scrollableSize.height / (contentSize.height / scrollableSize.height);
    }
    return undefined;
  }, [
    contentSize,
    scrollableSize,
  ]);
  const width = useMemo(() => {
    if (contentSize && scrollableSize && contentSize.width > scrollableSize.width) {
      return scrollableSize.width / (contentSize.width / scrollableSize.width);
    }
    return undefined;
  }, [
    contentSize,
    scrollableSize,
  ]);
  const scrollTopRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const onWheel = useEvent((event: WheelEvent<HTMLDivElement>) => {
    if (!contentSize) {
      return;
    }
    if (!scrollableSize) {
      return;
    }

    if (
      event.shiftKey
      && scrollLeftRef.current >= 0
      && scrollLeftRef.current <= contentSize.width - scrollableSize.width
    ) {
      scrollLeftRef.current += event.deltaY > 0
        ? Math.min(event.deltaY, contentSize.width - scrollableSize.width - scrollLeftRef.current)
        : Math.max(event.deltaY, -scrollLeftRef.current);
      if (contentRef.current) {
        contentRef.current.style.marginLeft = makePx(-scrollLeftRef.current);
      }
      if (hScrollbarRef.current) {
        hScrollbarRef.current.style.marginLeft = makePx(
          scrollLeftRef.current / (contentSize.width / scrollableSize.width),
        );
      }
    }

    if (
      !event.shiftKey
      && scrollTopRef.current >= 0
      && scrollTopRef.current <= contentSize.height - scrollableSize.height
    ) {
      scrollTopRef.current += event.deltaY > 0
        ? Math.min(event.deltaY, contentSize.height - scrollableSize.height - scrollTopRef.current)
        : Math.max(event.deltaY, -scrollTopRef.current);
      if (contentRef.current) {
        contentRef.current.style.marginTop = makePx(-scrollTopRef.current);
      }
      if (vScrollbarRef.current) {
        vScrollbarRef.current.style.marginTop = makePx(
          scrollTopRef.current / (contentSize.height / scrollableSize.height),
        );
      }
    }
  });
  const onScrollByX = useEvent((offset: number) => {
    if (contentRef.current && scrollableRef.current) {
      contentRef.current.style.marginLeft = makePx(
        -offset * contentRef.current.clientWidth / scrollableRef.current.clientWidth,
      );
    }
  });
  const onScrollByY = useEvent((offset: number) => {
    if (contentRef.current && scrollableRef.current) {
      contentRef.current.style.marginTop = makePx(
        -offset * contentRef.current.clientHeight / scrollableRef.current.clientHeight,
      );
    }
  });
  return (
    <div
      className={cx(styles.grid, className)}
      style={style}
    >
      <div
        ref={scrollableRef}
        className={styles.scrollable}
        onWheel={onWheel}
      >
        <div ref={contentRef} className={styles.content}>
          <div ref={cResizeObserverRef} className={styles.cResizeObserver}>
            {children}
          </div>
        </div>
      </div>
      <Scrollbar
        ref={vScrollbarRef}
        length={height}
        isVertical
        onScroll={onScrollByY}
      />
      <Scrollbar
        ref={hScrollbarRef}
        length={width}
        onScroll={onScrollByX}
      />
      <div />
    </div>
  );
}

export default Scrollable;