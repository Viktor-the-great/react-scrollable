export type ScrollbarsSizeType = {
  hThumbSize: number;
  vThumbSize: number;
}

export type ScrollableApiType = {
  get scrollLeft(): number;
  set scrollLeft(value: number);
  get scrollTop(): number;
  set scrollTop(value: number);
}

export type ScrollEvent = {
  isVertical: true;
  scrollTop: number;
  isTopEdgeReached: boolean;
  isBottomEdgeReached: boolean;
} | {
  isVertical: false;
  scrollLeft: number;
  isLeftEdgeReached: boolean;
  isRightEdgeReached: boolean;
};
