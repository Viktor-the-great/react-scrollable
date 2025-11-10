export type ClassNameStringOrFnReturnType = string | string[];

export type ClassNameStringOrFnType<Payload = undefined> =
  | ClassNameStringOrFnReturnType
  | (
  Payload extends undefined
    ? () => ClassNameStringOrFnReturnType
    : (payload: Payload) => ClassNameStringOrFnReturnType
  );

export type ClassNamesType = {
  /**
   * the wrapper element class containing the scrollable area and scrollbars, implemented as a dynamic grid.
   */
  scrollable: ClassNameStringOrFnType<{
    hasHorizontalScrollbar: boolean;
    hasVerticalScrollbar: boolean;
    showThumbOnHover: boolean;
  }>;
  /**
   * scrollable element class - uses CSS overflow property
   */
  area: ClassNameStringOrFnType;
  /**
   * content element class
   */
  content: ClassNameStringOrFnType;
  /**
   * scrollbar element class
   */
  scrollbar: ClassNameStringOrFnType<{
    isVertical: boolean;
  }>;
  /**
   * thumb element class
   */
  thumb: ClassNameStringOrFnType<{
    isVertical: boolean;
  }>;
}