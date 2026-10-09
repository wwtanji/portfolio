export const SELECTORS = Object.freeze({
  preloader: '[data-preloader]',
  preloaderCount: '[data-preloader-count]',
  preloaderBar: '[data-preloader-bar]',
  hero: '[data-hero]',
  heroLine: '[data-hero-line]',
  heroDetail: '[data-hero-detail]',
  heroFade: '[data-hero-fade]',
  starfield: '[data-starfield]',
  planet: '[data-planet]',
  planetCanvas: '[data-planet-canvas]',
  sky: '[data-sky]',
  porthole: '[data-porthole]',
  portholeIntro: '[data-porthole-intro]',
  telemetry: '[data-telemetry]',
  altitude: '[data-altitude]',
  about: '[data-about]',
  aboutText: '[data-about-text]',
  parallax: '[data-parallax]',
  work: '[data-work]',
  workTrack: '[data-work-track]',
  sunbeam: '[data-sunbeam]',
  clock: '[data-clock]',
  magnetic: '[data-magnetic]',
  scrollLink: '[data-scroll-link]',
});

export const CLASS_WORD = 'word';
export const CLASS_IS_LOADING = 'is-loading';

export const ALTITUDE_ORBIT_KM = 408;
export const ALTITUDE_GROUND_KM = 0.19;

export const HOME_TIME_ZONE = 'Europe/Bratislava';
export const CLOCK_LOCALE = 'en-GB';
export const CLOCK_REFRESH_MS = 30000;

export const MAGNETIC_STRENGTH = 0.35;
export const FINE_POINTER_QUERY = '(pointer: fine)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const SIDEWAYS_WORK_QUERY = '(min-width: 769px) and (prefers-reduced-motion: no-preference)';
export const STACKED_WORK_MOTION_QUERY = '(max-width: 768px) and (prefers-reduced-motion: no-preference)';
