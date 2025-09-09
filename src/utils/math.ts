export const PRECISION = 1;

export function ceil(value: number, precision: number) {
  return Math.ceil(value * 10 ** precision) / 10 ** precision;
}

export function floor(value: number, precision: number) {
  return Math.floor(value * 10 ** precision) / 10 ** precision;
}

export function round(value: number, precision: number) {
  return Math.round(value * 10 ** precision) / 10 ** precision;
}

export const isEqual = (
  value: number,
  valueToCompare: number
) => value - valueToCompare >= -PRECISION && value - valueToCompare <= PRECISION;

export const isMore = (
  value: number,
  valueToCompare: number
) =>  value - valueToCompare >= PRECISION;

export const toContentSize = (
  value: number,
  contentSize: number,
  scrollableSize: number,
) => {
  return floor(value * contentSize / scrollableSize, 2)
}

export const toScrollbarSize = (
  value: number,
  contentSize: number,
  scrollableSize: number,
) => {
  return floor(value * scrollableSize / contentSize, 2)
}