import { test, expect } from 'vitest';
import {
  ceil,
  round,
  floor
} from './math';

test('round function returns the value of a number rounded to the nearest integer', () => {
  expect(round(10, 2)).toBe(10);
  expect(round(10.123, 2)).toBe(10.12);
  expect(round(10.156, 2)).toBe(10.16);
});

test('ceil function rounds up and returns the smallest integer greater than or equal to a given number', () => {
  expect(ceil(10, 2)).toBe(10);
  expect(ceil(10.123, 2)).toBe(10.13);
  expect(ceil(10.156, 2)).toBe(10.16);
});

test('floor function rounds down and returns the largest integer less than or equal to a given number', () => {
  expect(floor(10, 2)).toBe(10);
  expect(floor(10.123, 2)).toBe(10.12);
  expect(floor(10.156, 2)).toBe(10.15);
});