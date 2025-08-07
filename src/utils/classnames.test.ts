import { test, expect } from 'vitest';
import classNames from './classnames';

test('classNames function conditionally join classNames together', () => {
  expect(classNames('class1', null, undefined, {
    class2: false,
    class3: true,
  }, ['class4', ['class5'], {
    class6: false,
    class7: true,
  }])).toBe('class1 class3 class4 class5 class7');
})