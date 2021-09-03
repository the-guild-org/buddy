export function batch<A, R, K>(
  loader: (args: A[]) => Promise<Promise<R>[]>
): (arg: A) => Promise<R> {
  let currentBatch: {
    args: A[];
    callbacks: Array<{ resolve(r: R): void; reject(error: Error): void }>;
  } = {
    args: [],
    callbacks: [],
  };

  return (arg: A) => {
    const schedule = currentBatch.args.length === 0;

    if (schedule) {
      process.nextTick(() => {
        const tickArgs = [...currentBatch.args];
        const tickCallbacks = [...currentBatch.callbacks];

        // reset the batch
        currentBatch = {
          args: [],
          callbacks: [],
        };

        loader(tickArgs).then((promises) => {
          for (let i = 0; i < tickCallbacks.length; i++) {
            promises[i].then(
              (result) => {
                tickCallbacks[i].resolve(result);
              },
              (error) => {
                tickCallbacks[i].reject(error);
              }
            );
          }
        });
      });
    }

    currentBatch.args.push(arg);
    return new Promise<R>((resolve, reject) => {
      currentBatch.callbacks.push({ resolve, reject });
    });
  };
}