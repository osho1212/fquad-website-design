/**
 * Timing for the bedroom ("suite") scene, shared with the Process section's
 * readout. Kept free of any three.js import so the section can use it
 * without pulling the 3D bundle into the main page chunk.
 */
export const SUITE_MAIN = 8;
export const SUITE_DECOR = 5;
export const BEDROOM_PIECES = SUITE_MAIN + SUITE_DECOR;

/** Progress at which main piece `i` receives its real finishes. */
export const mainAt = (i: number) => 0.5 + i * 0.03;
/** Progress at which styling piece `i` arrives. */
export const decorAt = (i: number) => 0.77 + i * 0.035;

/** How many pieces are finished (in their real materials) at progress p. */
export function bedroomPlaced(p: number): number {
  let n = 0;
  for (let i = 0; i < SUITE_MAIN; i++) if (p >= mainAt(i) + 0.03) n++;
  for (let i = 0; i < SUITE_DECOR; i++) if (p >= decorAt(i) + 0.03) n++;
  return n;
}
