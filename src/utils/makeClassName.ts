import type { ClassNameStringOrFnType, ClassNameStringOrFnReturnType } from '../types';

function makeClassName(fnOrString: ClassNameStringOrFnType | undefined): ClassNameStringOrFnReturnType | undefined;
function makeClassName<Payload>(fnOrString: ClassNameStringOrFnType<Payload> | undefined, payload: Payload): ClassNameStringOrFnReturnType | undefined;
function makeClassName<Payload>(
  fnOrString: ClassNameStringOrFnType<Payload> | undefined,
  payload?: Payload,
) {
  return typeof fnOrString === 'function'
    ? fnOrString(payload!)
    : fnOrString
}

export default makeClassName;
