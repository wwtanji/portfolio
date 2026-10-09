import { gsap } from 'gsap';
import { SELECTORS } from '../constants.js';

/**
 * @typedef {Object} Preloader
 * @property {(progress: number) => void} update eases the readout towards progress from 0 to 1
 * @property {() => Promise<void>} hide waits for the readout to finish, then slides the preloader away
 */

/**
 * @param {HTMLElement} element
 * @returns {Preloader}
 */
export function createPreloader(element) {
  const count = element.querySelector(SELECTORS.preloaderCount);
  const bar = element.querySelector(SELECTORS.preloaderBar);
  const shown = { progress: 0 };
  let progressTween = null;

  const render = () => {
    count.textContent = String(Math.round(shown.progress * 100));
    bar.style.transform = `scaleX(${shown.progress})`;
  };

  return {
    update(progress) {
      progressTween = gsap.to(shown, { progress, duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: render });
    },
    async hide() {
      await progressTween?.then();
      await gsap
        .timeline()
        .to(element.children, { opacity: 0, y: -24, duration: 0.5, stagger: 0.05, ease: 'power2.in' })
        .to(element, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
        .set(element, { display: 'none' })
        .then();
    },
  };
}
