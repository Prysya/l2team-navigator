const METRIKA_ID = 110798252;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ym(...args: any[]) {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { ym?: (...a: unknown[]) => void };
    if (typeof w.ym === 'function') {
      w.ym(METRIKA_ID, ...args);
    }
  }
}

export function hit(path: string) {
  ym('hit', path);
}

export function goal(name: string) {
  ym('reachGoal', name);
}
