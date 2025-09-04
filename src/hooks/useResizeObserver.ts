import {
  useLayoutEffect,
  useMemo,
  useState,
  type RefObject,
} from 'react';
import useEvent from './useEvent';

export type ElementSize = {
  width: number;
  height: number;
}

export type UseResizeObserverPropsType<Element> = {
  elementRef: RefObject<Element | null>;
  onChange?: (size: ElementSize) => void;
}

function useResizeObserver<ElementType extends Element>({
  elementRef,
  onChange,
}: UseResizeObserverPropsType<ElementType>) {
  const [size, setSize] = useState<ElementSize | null>(null);
  const onChangeEvent = useEvent((size: ElementSize) => onChange?.(size));

  const resizeObserver = useMemo(() => new ResizeObserver((entries) => {
    const entry = entries[0];
    const width = entry.borderBoxSize[0].inlineSize;
    const height = entry.borderBoxSize[0].blockSize;
    const size = {
      width,
      height,
    }
    setSize(size)
    onChangeEvent?.(size);
  }), [
    onChangeEvent,
  ]);

  useLayoutEffect(() => {
    const htmlElement = elementRef.current;
    if (htmlElement) {
      resizeObserver.observe(htmlElement);
    }
    return () => {
      if (htmlElement) {
        resizeObserver.unobserve(htmlElement);
      }
    };
  }, [
    resizeObserver,
    elementRef,
  ]);

  return size;
}

export default useResizeObserver;