export type ArgType = string
  | undefined
  | null
  | Record<string, boolean>
  | Array<ArgType>;

function classNames(...args: ArgType[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (arg instanceof Array) {
      classes.push(classNames(...arg));
    } else if (typeof arg === 'string') {
      classes.push(arg);
    } else if (typeof arg === 'object' && arg !== null) {
      classes.push(...Object.keys(arg).reduce<string[]>((res, key) => {
        return arg[key] ? [...res, key] : res;
      }, []));
    }
  }

  return classes.join(' ');
}

export default classNames;