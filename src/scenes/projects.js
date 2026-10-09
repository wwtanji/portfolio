import { gsap } from 'gsap';
import { SELECTORS, SIDEWAYS_WORK_QUERY, STACKED_WORK_MOTION_QUERY } from '../constants.js';

/**
 * On wide screens pins the concrete room and walks the project track sideways while the sunbeam crosses the wall.
 * On narrow screens the projects stack and only the sunbeam follows the scroll.
 * @returns {void}
 */
export function initProjects() {
  const track = document.querySelector(SELECTORS.workTrack);
  const travelDistance = () => track.scrollWidth - window.innerWidth;
  const media = gsap.matchMedia();

  media.add(SIDEWAYS_WORK_QUERY, () => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: SELECTORS.work,
          start: 'top top',
          end: () => `+=${travelDistance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      })
      .to(track, { x: () => -travelDistance(), ease: 'none' }, 0)
      .fromTo(SELECTORS.sunbeam, { xPercent: -80 }, { xPercent: 190, ease: 'none' }, 0);
  });

  media.add(STACKED_WORK_MOTION_QUERY, () => {
    gsap.fromTo(
      SELECTORS.sunbeam,
      { xPercent: -80 },
      {
        xPercent: 190,
        ease: 'none',
        scrollTrigger: { trigger: SELECTORS.work, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}
