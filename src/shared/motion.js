import { REDUCED_MOTION_QUERY } from '../constants.js';

/**
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
