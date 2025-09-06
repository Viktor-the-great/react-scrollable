import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import debounce from './debounce';

beforeEach(() => {
  vi.useFakeTimers()
});

afterEach(() => {
  vi.restoreAllMocks()
});

it('debounce function delay passed function calls until timeout is finished', () => {
  const func = vi.fn();
  const debouncedFn = debounce(func, 300);
  debouncedFn(1);
  debouncedFn(2);
  debouncedFn(3);
  debouncedFn(4);
  debouncedFn(5);
  vi.runOnlyPendingTimers()
  expect(func).toHaveBeenCalledTimes(1);
  expect(func).toHaveBeenLastCalledWith(5);
});

it('debounce function invoke leading edge of the timeout and delay passed function calls until timeout is finished', () => {
  const func = vi.fn();
  const debouncedFn = debounce(func, {
    wait: 300,
    leading: true,
  });
  debouncedFn(1);
  debouncedFn(2);
  debouncedFn(3);
  debouncedFn(4);
  debouncedFn(5);
  vi.runOnlyPendingTimers()
  expect(func).toHaveBeenCalledTimes(2);
  expect(func).toHaveBeenNthCalledWith(1, 1);
  expect(func).toHaveBeenNthCalledWith(2, 5);
})