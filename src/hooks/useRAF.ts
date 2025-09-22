import { useRef } from 'react';
import useEvent from './useEvent';

const useRAF = () => {
  const requestId = useRef<number | null>(null);
  return useEvent((callback: FrameRequestCallback) => {
    if (requestId.current) {
      cancelAnimationFrame(requestId.current);
      requestId.current = null;
    }
    requestId.current = requestAnimationFrame((time) => {
      callback(time);
      requestId.current = null;
    });
  });
}

export default useRAF;
