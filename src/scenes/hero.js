import { gsap } from 'gsap';
import { SELECTORS } from '../constants.js';
import { splitWords } from '../shared/split-words.js';
import { prefersReducedMotion } from '../shared/motion.js';

/**
 * Plays the one orchestrated entrance: the window settles, the planet rises and the headline resolves out of blur.
 * @param {import('../space/planet.js').PlanetView} planetView
 * @returns {void}
 */
export function playHeroIntro(planetView) {
  if (prefersReducedMotion()) return;

  const words = [...document.querySelectorAll(SELECTORS.heroLine)].flatMap(splitWords);

  gsap
    .timeline()
    .from(SELECTORS.portholeIntro, { scale: 1.35, duration: 2.4, ease: 'expo.out' }, 0)
    .from(SELECTORS.planet, { opacity: 0, duration: 2, ease: 'power2.out' }, 0.2)
    .from(planetView, { horizon: 0.85, duration: 2.8, ease: 'expo.out' }, 0)
    .from(words, { yPercent: 100, opacity: 0, filter: 'blur(14px)', duration: 1.2, stagger: 0.07, ease: 'power4.out' }, 0.5)
    .from(SELECTORS.heroDetail, { opacity: 0, y: 16, duration: 0.9, stagger: 0.12, ease: 'power2.out' }, 1.1);
}

/**
 * Pins the hero and scrubs the flight: through the window, towards the planet, down through the clouds into the sky.
 * @param {import('../space/planet.js').PlanetView} planetView
 * @returns {void}
 */
export function initHeroScroll(planetView) {
  if (prefersReducedMotion()) return;

  gsap
    .timeline({
      scrollTrigger: { trigger: SELECTORS.hero, start: 'top top', end: '+=320%', scrub: 1, pin: true },
    })
    .to(SELECTORS.heroFade, { opacity: 0, y: -80, duration: 0.12, ease: 'none' }, 0)
    .to(SELECTORS.porthole, { scale: 12, duration: 0.4, ease: 'power2.in' }, 0)
    .to(SELECTORS.porthole, { opacity: 0, duration: 0.08, ease: 'none' }, 0.32)
    .to(planetView, { horizon: 0.2, radius: 0.8, duration: 0.42, ease: 'power1.inOut' }, 0)
    .to(planetView, { radius: 40, duration: 0.55, ease: 'expo.in' }, 0.42)
    .to(planetView, { focus: 1, duration: 0.4, ease: 'power2.inOut' }, 0.42)
    .to(planetView, { haze: 1, duration: 0.25, ease: 'power1.in' }, 0.72)
    .to(SELECTORS.starfield, { opacity: 0, duration: 0.2, ease: 'none' }, 0.5)
    .to(SELECTORS.sky, { opacity: 1, duration: 0.1, ease: 'none' }, 0.9);
}
