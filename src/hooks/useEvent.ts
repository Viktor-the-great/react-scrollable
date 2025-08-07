import { useLayoutEffect, useCallback, useRef } from 'react';

type TCb<A extends unknown[], R> = (...args: A) => R;

const useEvent = <A extends unknown[], R>(callback: TCb<A, R>): TCb<A, R> => {
  const handlerRef = useRef(callback);

  useLayoutEffect(() => {
    handlerRef.current = callback;
  });

  return useCallback((...args) => handlerRef.current(...args), []);
};

export default useEvent;
