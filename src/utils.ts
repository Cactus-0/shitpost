type CacheFunction<T, U extends string> = (arg: U) => T;

export function cache<T, U extends string>(fn: CacheFunction<T, U>): CacheFunction<T, U> {
  const cacheMap = new Map<U, T>();

  return (arg: U): T => {
    if (cacheMap.has(arg)) {
      return cacheMap.get(arg) as T;
    }

    const result = fn(arg);
    cacheMap.set(arg, result);
    return result;
  };
};
