import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import useEvent from './hooks/useEvent';
import cx from './utils/classnames';
import Content from './content';
import Scrollbar from './scrollbar';
import type {
  ScrollbarsSizeType,
  ContentApiType,
  ScrollbarApiType,
} from './types';
import './scrollable.css';

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
  const [vScrollbarSize, setVScrollbarSize] = useState<number>(0);
  const [hScrollbarSize, setHScrollbarSize] = useState<number>(0);

  const vScrollbarRef = useRef<ScrollbarApiType>(null);
  const hScrollbarRef = useRef<ScrollbarApiType>(null);
  const contentRef = useRef<ContentApiType>(null);

  const onContentChange = useEvent((size: ScrollbarsSizeType) => {
    setVScrollbarSize(size.vScrollbarSize);
    setHScrollbarSize(size.hScrollbarSize);
  });
  const onContentScrollByX = useEvent((offset: number) => {
    if (hScrollbarRef.current) {
      hScrollbarRef.current.scrollLeft = hScrollbarRef.current.getScrollSize(offset);
    }
  });
  const onContentScrollByY = useEvent((offset: number) => {
    if (vScrollbarRef.current) {
      vScrollbarRef.current.scrollTop = vScrollbarRef.current.getScrollSize(offset);
    }
  });
  const onScrollByX = useEvent((offset: number) => {
    if (contentRef.current) {
      contentRef.current.scrollLeft = contentRef.current.getLeftScrollSize(offset);
    }
  });
  const onScrollByY = useEvent((offset: number) => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.getTopScrollSize(offset);
    }
  });
  return (
    <div
      className={cx('scrollable', className)}
      style={style}
    >
      <Content
        ref={contentRef}
        onChange={onContentChange}
        onScrollByX={onContentScrollByX}
        onScrollByY={onContentScrollByY}
      >
        {children}
      </Content>
      <Scrollbar
        ref={vScrollbarRef}
        length={vScrollbarSize}
        isVertical
        onScroll={onScrollByY}
      />
      <Scrollbar
        ref={hScrollbarRef}
        length={hScrollbarSize}
        onScroll={onScrollByX}
      />
      <div />
    </div>
  );
}

export default Scrollable;