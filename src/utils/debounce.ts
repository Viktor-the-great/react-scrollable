function debounce<Self, Args extends unknown[]>(func: (...args: Args) => void, ms: number) {
  let timeout: number;
  return function (this: Self, ...args: Args) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), ms);
  };
}

export default debounce;