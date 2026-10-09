import { gsap } from 'gsap';
import { SELECTORS } from '../constants.js';
import { splitWords } from '../shared/split-words.js';
import { prefersReducedMotion } from '../shared/motion.js';

/**
 * Lights the about paragraph word by word and drifts the cloud layers at different depths.
 * @returns {void}
 */
export function initAbout() {
  if (prefersReducedMotion()) return;

  const words = splitWords(document.querySelector(SELECTORS.aboutText));

  gsap.fromTo(
    words,
    { opacity: 0.16 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: SELECTORS.aboutText, start: 'top 80%', end: 'bottom 45%', scrub: true },
    },
  );

  document.querySelectorAll(`${SELECTORS.about} ${SELECTORS.parallax}`).forEach((layer) => {
    gsap.to(layer, {
      yPercent: Number(layer.dataset.parallax),
      ease: 'none',
      scrollTrigger: { trigger: SELECTORS.about, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}
