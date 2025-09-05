import { test, expect } from 'vitest';
import generateUniqId from './generateUniqId';

test('generateUniqId function generate unique id', () => {
  expect(generateUniqId()).not.toBe(generateUniqId());
  expect(generateUniqId()).not.toBe(generateUniqId());
  expect(generateUniqId()).not.toBe(generateUniqId());
});