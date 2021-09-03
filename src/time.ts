const NS_TO_MS = 1e6;

export function nsToMs(ns: number) {
  return ns / NS_TO_MS;
}

export function msToNs(ms: number) {
  return ms * NS_TO_MS;
}