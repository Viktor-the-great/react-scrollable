import { useMemo } from 'react';
import debounce from '../utils/debounce';
import useEvent from './useEvent';

type TCb<A extends unknown[], R> = (...args: A) => R;

const useDebounce = <A extends unknown[], R>(callback: TCb<A, R>): TCb<A, R> => {
  const onScrollEvent = useEvent(callback);
  return useMemo(() => debounce(onScrollEvent, 100) as TCb<A, R>, [
    onScrollEvent,
  ])
};

export default useDebounce;
