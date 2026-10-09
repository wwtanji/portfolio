import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import './styles.css';
import { CLASS_IS_LOADING, SELECTORS } from './constants.js';
import { initSmoothScroll, initScrollLinks } from './interactions/smooth-scroll.js';
import { initMagnetic } from './interactions/magnetic.js';
import { mountPorthole } from './space/porthole.js';
import { initStarfield } from './space/starfield.js';
import { createPlanet } from './space/planet.js';
import { createPreloader } from './scenes/preloader.js';
import { initHeroScroll, playHeroIntro } from './scenes/hero.js';
import { initTelemetry } from './scenes/telemetry.js';
import { initAbout } from './scenes/about.js';
import { initProjects } from './scenes/projects.js';
import { initClock } from './scenes/clock.js';

gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';

const nextFrame = () => new Promise(requestAnimationFrame);

async function start() {
  const lenis = initSmoothScroll();
  lenis?.stop();

  const preloader = createPreloader(document.querySelector(SELECTORS.preloader));
  mountPorthole(document.querySelector(SELECTORS.porthole));
  initStarfield(document.querySelector(SELECTORS.starfield));
  preloader.update(0.35);
  await nextFrame();

  const planetView = createPlanet(document.querySelector(SELECTORS.planetCanvas));
  preloader.update(0.8);
  await document.fonts.ready;
  preloader.update(1);

  initHeroScroll(planetView);
  initTelemetry();
  initAbout();
  initProjects();
  initClock();
  initMagnetic(document.querySelectorAll(SELECTORS.magnetic));
  initScrollLinks(lenis);

  await preloader.hide();
  document.body.classList.remove(CLASS_IS_LOADING);
  lenis?.start();
  ScrollTrigger.refresh();
  playHeroIntro(planetView);
}

start();
