import {
  useRef,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import useEvent from './useEvent';

export type ElementSize = {
  width: number;
  height: number;
}

export type UseResizeObserverPropsType = {
  onChange?: (size: ElementSize) => void;
}

function useResizeObserver<ElementType extends HTMLElement>(props?: UseResizeObserverPropsType) {
  const [size, setSize] = useState<ElementSize | null>(null);
  const ref = useRef<ElementType>(null);
  const onChange = useEvent((size: ElementSize) => {
    props?.onChange?.(size);
  });

  const resizeObserver = useMemo(() => new ResizeObserver((entries) => {
    for (const entry of entries) {
      const width = entry.borderBoxSize[0].inlineSize;
      const height = entry.borderBoxSize[0].blockSize;
      const size = {
        width,
        height,
      }
      setSize(size)
      onChange(size);
    }
  }), [
    onChange,
  ]);

  useLayoutEffect(() => {
    const htmlElement = ref.current;
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
    ref,
  ]);

  return [ref, size] as const;
}

export default useResizeObserver;