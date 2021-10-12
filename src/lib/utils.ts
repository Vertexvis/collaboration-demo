export function unimplemented<T>(theClass: string, funcKey: keyof T) {
  return (): never => {
    throw new Error(`${theClass}#${funcKey.toString()} not implemented.`);
  };
}
