import { test, expect } from 'vitest';
import toFixed from './toFixed';

test('toFixed function rounds a number to precision', () => {
  expect(toFixed(10, 2)).toBe(10);
  expect(toFixed(10.123, 2)).toBe(10.12);
  expect(toFixed(10.156, 2)).toBe(10.16);
})