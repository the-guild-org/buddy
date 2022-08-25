const atomicPromises = new Map<string, Promise<any>>();

export function atomicPromise<A>(hashFn: (arg: A) => string) {
  return (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (arg: A, ...rest: any[]) {
      if (rest.length) {
        console.warn(
          `@atomicPromise detected more than 1 argument in "${propertyKey}"`
        );
      }

      const key = `${propertyKey}_${hashFn(arg)}`;

      if (atomicPromises.has(key)) {
        return atomicPromises.get(key);
      }

      const promise = originalMethod.call(this, arg);
      atomicPromises.set(key, promise);

      return promise.finally(() => {
        atomicPromises.delete(key);
      });
    };
  };
}

export function sharePromise<T>(setter: () => Promise<T>): () => Promise<T> {
  let sharedPromise: Promise<T> | null = null;

  return () => {
    if (!sharedPromise) {
      sharedPromise = Promise.resolve().then(setter);
    }
    return sharedPromise;
  };
}

export function cacheResult<TInput>(
  cacheKeyFn: (arg: TInput) => string
): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const cacheSymbol = Symbol('@cache');
    const originalMethod = descriptor.value;

    function ensureCache(obj: any): Map<string, any> {
      if (!obj[cacheSymbol]) {
        obj[cacheSymbol] = new Map<string, any>();
      }

      return obj[cacheSymbol];
    }

    return {
      ...descriptor,
      value(this: any, arg: TInput) {
        const cacheMap = ensureCache(this);
        const key = cacheKeyFn(arg);
        const cachedValue = cacheMap.get(key);

        if (cachedValue !== null && typeof cachedValue !== "undefined") {
          return cachedValue;
        }

        const result = (originalMethod as any).call(this, arg);

        cacheMap.set(key, result);

        return result;
      },
    } as TypedPropertyDescriptor<any>;
  };
}

export async function promiseTuple<T>(
  promise: Promise<T>
): Promise<[null, T] | [unknown, null]> {
  try {
    return [null, await promise];
  } catch (error: unknown) {
    return [error, null];
  }
}
