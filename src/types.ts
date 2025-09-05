export type ScrollbarsSizeType = {
  hThumbSize: number;
  vThumbSize: number;
}

export type ContentApiType = {
  get scrollTop(): number;
  set scrollTop(value: number);
  get scrollLeft(): number;
  set scrollLeft(value: number);
  getLeftScrollSize(value: number): number;
  getTopScrollSize(value: number): number;
}

export type ScrollbarByXApiType = {
  get scrollLeft(): number;
  set scrollLeft(value: number);
  getScrollSize(value: number): number;
}

export type ScrollbarByYApiType = {
  get scrollTop(): number;
  set scrollTop(value: number);
  getScrollSize(value: number): number;
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
