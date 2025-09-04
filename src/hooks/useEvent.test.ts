import {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
} from 'react';
import { test, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useEvent from './useEvent';

test('useEvent create stable function that calls the latest version of the function you passed', async () => {
  const fn = vi.fn();
  const testCustomEvent = new CustomEvent('test')
  renderHook(() => {
    const isFirstDidMountRef = useRef(false);
    const isSecondDidMountRef = useRef(false);
    const isThirdDidMountRef = useRef(false);
    const [state, setState] = useState('state 0')
    const callback = useEvent(() => fn(state));

    useLayoutEffect(() => {
      document.addEventListener('test', callback)
      return () => {
        document.removeEventListener('test', callback)
      }
    }, [
      callback,
    ])

    useEffect(() => {
      if (!isFirstDidMountRef.current) {
        isFirstDidMountRef.current = true;
        setState('state 1');
        callback();
      }
    }, [
      callback,
    ]);

    const isFirstDidMount = isFirstDidMountRef.current
    useEffect(() => {
      if (isFirstDidMount && !isSecondDidMountRef.current) {
        isSecondDidMountRef.current = true;
        setState('state 2');
        callback();
      }
    }, [
      callback,
      isFirstDidMount,
    ]);

    const isSecondDidMount = isSecondDidMountRef.current
    useEffect(() => {
      if (isSecondDidMount && !isThirdDidMountRef.current) {
        isThirdDidMountRef.current = true;
        setState('state 3');
        callback();
      }
    }, [
      callback,
      isSecondDidMount,
    ]);

    const isThirdDidMount = isThirdDidMountRef.current
    useEffect(() => {
      if (isThirdDidMount) {
        document.dispatchEvent(testCustomEvent);
      }
    }, [
      callback,
      isThirdDidMount,
    ]);
  })

  await waitFor(() => {
    expect(fn.mock.calls[0]).toEqual(['state 0']);
    expect(fn.mock.calls[1]).toEqual(['state 1']);
    expect(fn.mock.calls[2]).toEqual(['state 2']);
    expect(fn.mock.calls[3]).toEqual(['state 3']);
  })
})