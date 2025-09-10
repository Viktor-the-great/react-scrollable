import { type Ref, type RefObject, useImperativeHandle } from 'react';
import setScrollbarOffset from '../utils/setScrollbarOffset';
import type { ScrollableApiType } from '../types';

type UseScrollableRefOptionsType = {
  scrollableRef: RefObject<HTMLElement | null>;
  hScrollbarRef: RefObject<HTMLElement | null>;
  vScrollbarRef: RefObject<HTMLElement | null>;
}

const useScrollableRef = (ref: Ref<ScrollableApiType>, {
  scrollableRef,
  hScrollbarRef,
  vScrollbarRef,
}: UseScrollableRefOptionsType) => {
  useImperativeHandle(ref, () => ({
    get scrollLeft() {
      return scrollableRef.current?.scrollLeft ?? 0;
    },
    set scrollLeft(value: number) {
      const scrollableElement = scrollableRef.current;
      const scrollbarElement = hScrollbarRef.current;
      if (scrollableElement && scrollbarElement) {
        scrollableElement.scrollLeft = value;
        setScrollbarOffset(scrollbarElement, {
          scrollableElement,
          value,
          isVertical: false,
        });
      }
    },
    get scrollTop() {
      return scrollableRef.current?.scrollTop ?? 0;
    },
    set scrollTop(value: number) {
      const scrollableElement = scrollableRef.current;
      const scrollbarElement = vScrollbarRef.current;
      if (scrollableElement && scrollbarElement) {
        scrollableElement.scrollTop = value;
        setScrollbarOffset(scrollbarElement, {
          scrollableElement,
          value,
          isVertical: true,
        });
      }
    },
  }), [
    scrollableRef,
    hScrollbarRef,
    vScrollbarRef,
  ]);
}

export default useScrollableRef;