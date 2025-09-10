import { type RefObject, useLayoutEffect, useMemo } from 'react';
import useEvent from './useEvent';
import { floor, isMore } from '../utils/math';
import type { ScrollbarsSizeType } from '../types';
import makePx from '../utils/makePx.ts';
import setAttributes from '../utils/setAttributes.ts';

type UseScrollableObserverPropsType = {
  /**
   * reference to scrollable element
   */
  scrollableRef: RefObject<HTMLElement | null>;
  hScrollbarRef: RefObject<HTMLElement | null>;
  vScrollbarRef: RefObject<HTMLElement | null>;
  /**
   * onChange function called on scrollable area resized
   * @param {Object} size - calculated vertical/horizontal thumb sizes
   * @param {number} size.hThumbSize - horizontal thumb size
   * @param {number} size.vThumbSize - vertical thumb size
   */
  onResize: (size: ScrollbarsSizeType) => void;
}

const useResizeObserver = ({
  scrollableRef,
  hScrollbarRef,
  vScrollbarRef,
  onResize,
}: UseScrollableObserverPropsType) => {
  const onResizeEvent = useEvent(onResize);
  const resizeObserver = useMemo(() => new ResizeObserver(() => {
    const scrollableElement = scrollableRef.current;
    const contentElement = scrollableElement?.querySelector<HTMLElement>('.scrollable__content');
    if (scrollableElement && contentElement) {
      const scrollableRect = scrollableElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();
      const hThumbSize = isMore(contentRect.width, scrollableRect.width)
        ? floor(scrollableRect.width / (contentRect.width / scrollableRect.width), 1)
        : 0;
      const vThumbSize = isMore(contentRect.height, scrollableRect.height)
        ? floor(scrollableRect.height / (contentRect.height / scrollableRect.height), 1)
        : 0;

      if (vScrollbarRef.current) {
        const isHidden = vThumbSize === 0;
        vScrollbarRef.current.style.height = makePx(vThumbSize);
        setAttributes(vScrollbarRef.current, {
          'aria-hidden': isHidden.toString(),
        });
      }
      if (hScrollbarRef.current) {
        const isHidden = hThumbSize === 0;
        hScrollbarRef.current.style.width = makePx(hThumbSize);
        setAttributes(hScrollbarRef.current, {
          'aria-hidden': isHidden.toString(),
        });
      }

      onResizeEvent({
        hThumbSize,
        vThumbSize,
      })
    }
  }), [
    scrollableRef,
    vScrollbarRef,
    hScrollbarRef,
    onResizeEvent,
  ]);

  useLayoutEffect(() => {
    const scrollableElement = scrollableRef.current;
    const contentElement = scrollableElement?.querySelector<HTMLElement>('.scrollable__content');
    if (scrollableElement) {
      resizeObserver.observe(scrollableElement);
    }
    if (contentElement) {
      resizeObserver.observe(contentElement);
    }
    return () => {
      if (scrollableElement) {
        resizeObserver.unobserve(scrollableElement);
      }
      if (contentElement) {
        resizeObserver.unobserve(contentElement);
      }
    };
  }, [
    resizeObserver,
    scrollableRef,
  ]);
}

export default useResizeObserver;
