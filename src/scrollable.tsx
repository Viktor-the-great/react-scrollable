import {
  type CSSProperties,
  type ReactElement,
  type ReactNode, useMemo,
  useRef,
  useState,
} from 'react';
import useEvent from './hooks/useEvent';
import cx from './utils/classnames';
import Content from './content';
import Scrollbar from './scrollbar';
import generateUniqId from './generateUniqId';
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
  /**
   * show thumbs on mouse hover
   */
  showThumbOnHover?: boolean;
}

function Scrollable({
  children,
  showThumbOnHover = false,
  className = undefined,
  style = undefined,
}: ScrollablePropsType): ReactElement {
  const [vThumbSize, setVThumbSize] = useState<number>(0);
  const [hThumbSize, setHThumbSize] = useState<number>(0);

  const vScrollbarRef = useRef<ScrollbarApiType>(null);
  const hScrollbarRef = useRef<ScrollbarApiType>(null);
  const contentRef = useRef<ContentApiType>(null);

  const onContentChange = useEvent((size: ScrollbarsSizeType) => {
    setVThumbSize(size.vThumbSize);
    setHThumbSize(size.hThumbSize);
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
  const contentId = useMemo(() => generateUniqId(), []);

  return (
    <div
      className={cx('scrollable', {
        'scrollable_by-x': hThumbSize !== 0,
        'scrollable_by-y': vThumbSize !== 0,
        'scrollable_show-mouse-on-hover': showThumbOnHover,
      }, className)}
      style={style}
    >
      <Content
        ref={contentRef}
        onChange={onContentChange}
        onScrollByX={onContentScrollByX}
        onScrollByY={onContentScrollByY}
        contentId={contentId}
      >
        {children}
      </Content>
      <Scrollbar
        ref={vScrollbarRef}
        thumbSize={vThumbSize}
        isVertical
        onScroll={onScrollByY}
        contentId={contentId}
      />
      <Scrollbar
        ref={hScrollbarRef}
        thumbSize={hThumbSize}
        onScroll={onScrollByX}
        contentId={contentId}
      />
      <div data-testid="extreme-point" />
    </div>
  );
}

export default Scrollable;