/**
 * One queue for all heavy 3D work on the page (creating a WebGL context,
 * building a model, its first draw). Jobs run one at a time, each in an
 * idle slot, and only once the page has been still — no scroll, wheel or
 * touch — for QUIET_MS, so that work never lands in a frame the visitor is
 * scrolling through. A job that has waited MAX_WAIT_MS runs regardless, so a
 * visitor who never pauses still gets their models.
 */

const QUIET_MS = 250;
const MAX_WAIT_MS = 6000;

type Job = { run: () => void; queuedAt: number; cancelled: boolean };

const queue: Job[] = [];
let pumping = false;
let lastInput = 0;
let bound = false;

type IdleDeadline = { timeRemaining: () => number; didTimeout: boolean };
const ric = (cb: (d: IdleDeadline) => void, timeout = 500) => {
  const w = window as Window & {
    requestIdleCallback?: (cb: (d: IdleDeadline) => void, o?: { timeout: number }) => number;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout });
  else window.setTimeout(() => cb({ timeRemaining: () => 8, didTimeout: false }), 60);
};

function bind() {
  if (bound) return;
  bound = true;
  const mark = () => {
    lastInput = performance.now();
  };
  for (const ev of ["scroll", "wheel", "touchmove", "keydown"]) {
    window.addEventListener(ev, mark, { passive: true, capture: true });
  }
}

function pump() {
  if (pumping) return;
  pumping = true;
  const step = () => {
    while (queue.length && queue[0].cancelled) queue.shift();
    const job = queue[0];
    if (!job) {
      pumping = false;
      return;
    }
    const now = performance.now();
    const quiet = now - lastInput > QUIET_MS && !document.hidden;
    if (!quiet && now - job.queuedAt < MAX_WAIT_MS) {
      window.setTimeout(() => ric(step), 120);
      return;
    }
    queue.shift();
    try {
      job.run();
    } catch (err) {
      console.error(err);
    }
    // One heavy job per idle slot; give the page a couple of frames between.
    window.setTimeout(() => ric(step), 40);
  };
  ric(step);
}

/** Queue heavy work; returns a handle to drop it if it hasn't run yet. */
export function whenIdle(run: () => void): { cancel: () => void } {
  bind();
  const job: Job = { run, queuedAt: performance.now(), cancelled: false };
  queue.push(job);
  pump();
  return {
    cancel: () => {
      job.cancelled = true;
    },
  };
}
