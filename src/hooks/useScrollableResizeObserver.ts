import { type RefObject } from 'react';
import useEvent from './useEvent';
import useResizeObserver from './useResizeObserver';
import { floor, isMore } from '../utils/math';
import type { ScrollableApiType, ScrollbarsSizeType } from '../types';
import makePx from '../utils/makePx.ts';
import setAttributes from '../utils/setAttributes.ts';

type UseScrollableObserverPropsType = {
  /**
   * reference to scrollable element
   */
  scrollableRef: RefObject<HTMLElement | null>;
  /**
   * reference to element containing content
   */
  contentRef: RefObject<HTMLElement | null>;
  hScrollbarRef: RefObject<HTMLElement | null>;
  vScrollbarRef: RefObject<HTMLElement | null>;
  scrollableApiRef: RefObject<ScrollableApiType | null>;
  /**
   * onChange function called on scrollable area resized
   * @param {Object} size - calculated vertical/horizontal thumb sizes
   * @param {number} size.hThumbSize - horizontal thumb size
   * @param {number} size.vThumbSize - vertical thumb size
   */
  onResize: (size: ScrollbarsSizeType) => void;
}

const useScrollableResizeObserver = ({
  scrollableRef,
  contentRef,
  hScrollbarRef,
  vScrollbarRef,
  scrollableApiRef,
  onResize,
}: UseScrollableObserverPropsType) => {
  const onResizeEvent = useEvent((size: ScrollbarsSizeType) => {
    if (vScrollbarRef.current) {
      const isHidden = size.vThumbSize === 0;
      vScrollbarRef.current.style.height = makePx(size.vThumbSize);
      setAttributes(vScrollbarRef.current, {
        'aria-hidden': isHidden.toString(),
      });
    }
    if (hScrollbarRef.current) {
      const isHidden = size.hThumbSize === 0;
      hScrollbarRef.current.style.width = makePx(size.hThumbSize);
      setAttributes(hScrollbarRef.current, {
        'aria-hidden': isHidden.toString(),
      });
    }
    if (scrollableApiRef.current) {
      scrollableApiRef.current.scrollTop = size.scrollTop;
      scrollableApiRef.current.scrollLeft = size.scrollLeft;
    }
    onResize(size);
  });
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
  const scrollableSize = useResizeObserver({
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

  return {
    contentSize,
    scrollableSize,
  }
}

export default useScrollableResizeObserver;
