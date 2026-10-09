import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SELECTORS } from '../constants.js';
import { prefersReducedMotion } from '../shared/motion.js';

/**
 * Starts inertial scrolling synced with ScrollTrigger, unless the visitor prefers reduced motion.
 * @returns {Lenis | null}
 */
export function initSmoothScroll() {
  if (prefersReducedMotion()) return null;

  const lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/**
 * Routes in-page anchor links through the smooth scroller.
 * @param {Lenis | null} lenis
 * @returns {void}
 */
export function initScrollLinks(lenis) {
  document.querySelectorAll(SELECTORS.scrollLink).forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { duration: 2.2 });
      } else {
        target.scrollIntoView();
      }
    });
  });
}
