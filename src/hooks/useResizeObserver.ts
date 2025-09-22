import { type RefObject, useLayoutEffect, useMemo } from 'react';
import useEvent from './useEvent';
import useRAF from './useRAF';
import { floor, isMore } from '../utils/math';
import makePx from '../utils/makePx';
import setAttributes from '../utils/setAttributes';

type ScrollbarsSizeType = {
  hThumbSize: number;
  vThumbSize: number;
}
type UseScrollableObserverPropsType = {
  /**
   * reference to scrollable element
   */
  scrollableRef: RefObject<HTMLElement | null>;
  /**
   * reference to horizontal scrollbar element
   */
  hScrollbarRef: RefObject<HTMLElement | null>;
  /**
   * reference to vertical scrollbar element
   */
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
  const rAF = useRAF();
  const onResizeEvent = useEvent(onResize);
  const resizeObserver = useMemo(() => new ResizeObserver(() => {
    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      const hThumbSize = isMore(scrollableElement.scrollWidth, scrollableElement.offsetWidth)
        ? floor(scrollableElement.offsetWidth / (scrollableElement.scrollWidth / scrollableElement.offsetWidth), 1)
        : 0;
      const vThumbSize = isMore(scrollableElement.scrollHeight, scrollableElement.offsetHeight)
        ? floor(scrollableElement.offsetHeight / (scrollableElement.scrollHeight / scrollableElement.offsetHeight), 1)
        : 0;

      rAF(() => {
        const vScrollbar = vScrollbarRef.current;
        const hScrollbar = hScrollbarRef.current;
        if (vScrollbar) {
          const isHidden = vThumbSize === 0;
          vScrollbar.style.height = makePx(vThumbSize);
          setAttributes(vScrollbar, {
            'aria-hidden': isHidden.toString(),
          });
        }
        if (hScrollbar) {
          const isHidden = hThumbSize === 0;
          hScrollbar.style.width = makePx(hThumbSize);
          setAttributes(hScrollbar, {
            'aria-hidden': isHidden.toString(),
          });
        }
      });

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
    const contentElement = scrollableElement?.firstElementChild;
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
