const setAttributes = (
  element: HTMLElement,
  attributes: Record<string, string>
) => {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  })
}

export default setAttributes;
