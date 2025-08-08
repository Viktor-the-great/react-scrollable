export type ScrollbarsSizeType = {
  hScrollbarSize: number;
  vScrollbarSize: number;
}

export type ContentApiType = {
  get scrollTop(): number;
  set scrollTop(value: number);
  get scrollLeft(): number;
  set scrollLeft(value: number);
  getLeftScrollSize(value: number): number;
  getTopScrollSize(value: number): number;
}

export type ScrollbarApiType = {
  get scrollTop(): number;
  set scrollTop(value: number);
  get scrollLeft(): number;
  set scrollLeft(value: number);
  getScrollSize(value: number): number;
}