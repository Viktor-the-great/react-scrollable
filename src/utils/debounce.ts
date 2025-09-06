type TDebounceOptions = number | {
  wait: number;
  leading?: boolean;
}

function debounce<Self, Args extends unknown[]>(func: (...args: Args) => void, options: TDebounceOptions) {
  let wait: number;
  let leading: boolean;
  if (typeof options === 'number') {
    wait = options;
    leading = false;
  } else {
    wait = options.wait;
    leading = options.leading ?? false;
  }
  let isLeadingCalled = false;
  let timeout: number;
  return function (this: Self, ...args: Args) {
    if (leading && !isLeadingCalled) {
      isLeadingCalled = true;
      func.apply(this, args);
    }
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

export default debounce;