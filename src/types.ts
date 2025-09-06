export type ScrollbarsSizeType = {
  hThumbSize: number;
  vThumbSize: number;
  scrollLeft: number;
  scrollTop: number;
}

export type ContentApiType = {
  get scrollTop(): number;
  set scrollTop(value: number);
  get scrollLeft(): number;
  set scrollLeft(value: number);
  getContentRect(): DOMRect;
  getScrollableRect(): DOMRect;
  setAttributes(attributes: Record<string, string>): void;
}

export type BaseScrollbarApiType = {
  setSize(value: number): void;
  setAttributes(attributes: Record<string, string>): void;
}

export type HScrollbarApiType = BaseScrollbarApiType & {
  get scrollLeft(): number;
  set scrollLeft(value: number);
}

export type VScrollbarApiType = BaseScrollbarApiType & {
  get scrollTop(): number;
  set scrollTop(value: number);
}

export type ScrollableApiType = {
  get scrollLeft(): number;
  set scrollLeft(value: number);
  get scrollTop(): number;
  set scrollTop(value: number);
}

export type ScrollEvent = {
  is_vertical: true;
  scroll_top: number;
  is_top_edge_reached: boolean;
  is_bottom_edge_reached: boolean;
} | {
  is_vertical: false;
  scroll_left: number;
  is_left_edge_reached: boolean;
  is_right_edge_reached: boolean;
};
