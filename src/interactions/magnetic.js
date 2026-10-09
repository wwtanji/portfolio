import { gsap } from 'gsap';
import { FINE_POINTER_QUERY, MAGNETIC_STRENGTH } from '../constants.js';
import { prefersReducedMotion } from '../shared/motion.js';

/**
 * Makes elements lean towards the cursor while it hovers them.
 * @param {NodeListOf<HTMLElement>} elements
 * @returns {void}
 */
export function initMagnetic(elements) {
  if (!window.matchMedia(FINE_POINTER_QUERY).matches || prefersReducedMotion()) return;

  elements.forEach((element) => {
    const moveX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' });

    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      moveX((event.clientX - bounds.left - bounds.width / 2) * MAGNETIC_STRENGTH);
      moveY((event.clientY - bounds.top - bounds.height / 2) * MAGNETIC_STRENGTH);
    });
    element.addEventListener('pointerleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}
