import { type Ref, type RefObject, useImperativeHandle } from 'react';
import { isMore, toScrollbarSize } from '../utils/math';
import makePx from '../utils/makePx';
import setAttributes from '../utils/setAttributes';
import type { ScrollableApiType } from '../types';

type UseScrollableRefOptionsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  hScrollbarRef: RefObject<HTMLElement | null>;
  vScrollbarRef: RefObject<HTMLElement | null>;
}
const useScrollableRef = (ref: Ref<ScrollableApiType>, {
  scrollableRef,
  contentRef,
  hScrollbarRef,
  vScrollbarRef,
}: UseScrollableRefOptionsType) => {
  useImperativeHandle(ref, () => ({
    get scrollLeft() {
      return scrollableRef.current?.scrollLeft ?? 0;
    },
    set scrollLeft(value: number) {
      if (scrollableRef.current && contentRef.current && hScrollbarRef.current) {
        scrollableRef.current.scrollLeft = value;
        const contentRect = contentRef.current.getBoundingClientRect();
        const scrollableRect = scrollableRef.current.getBoundingClientRect();
        const scrollLeft = toScrollbarSize(
          value,
          contentRect.width,
          scrollableRect.width,
        );
        hScrollbarRef.current.style.transform = `translateX(${makePx(scrollLeft)})`;
        hScrollbarRef.current.setAttribute('data-scroll-left', scrollLeft.toString());
        const isHidden = !isMore(contentRect.width, scrollableRect.width);
        setAttributes(hScrollbarRef.current, {
          'aria-valuenow': value.toString(),
          'aria-hidden': isHidden.toString(),
          'data-scroll-left': scrollLeft.toString(),
        });
      }
    },
    get scrollTop() {
      return scrollableRef.current?.scrollTop ?? 0;
    },
    set scrollTop(value: number) {
      if (scrollableRef.current && contentRef.current && vScrollbarRef.current) {
        scrollableRef.current.scrollTop = value;
        const contentRect = contentRef.current.getBoundingClientRect();
        const scrollableRect = scrollableRef.current.getBoundingClientRect();
        const scrollTop = toScrollbarSize(
          value,
          contentRect.height,
          scrollableRect.height,
        );
        vScrollbarRef.current.style.transform = `translateY(${makePx(scrollTop)})`;
        vScrollbarRef.current.setAttribute('data-scroll-top', scrollTop.toString());
        const isHidden = !isMore(contentRect.height, scrollableRect.height);
        setAttributes(vScrollbarRef.current, {
          'aria-valuenow': value.toString(),
          'aria-hidden': isHidden.toString(),
          'data-scroll-top': scrollTop.toString(),
        });
      }
    },
  }), [
    scrollableRef,
    contentRef,
    hScrollbarRef,
    vScrollbarRef,
  ]);
}

export default useScrollableRef;