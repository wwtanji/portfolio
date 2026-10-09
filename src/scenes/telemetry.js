import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ALTITUDE_GROUND_KM, ALTITUDE_ORBIT_KM, SELECTORS } from '../constants.js';

function altitudeAt(progress) {
  return ALTITUDE_ORBIT_KM * Math.pow(ALTITUDE_GROUND_KM / ALTITUDE_ORBIT_KM, progress);
}

function formatAltitude(kilometres) {
  return kilometres >= 1 ? `${Math.round(kilometres)} km` : `${Math.round(kilometres * 1000)} m`;
}

/**
 * Ties the altitude readout to scroll, from orbit down to street level in Nitra.
 * @returns {void}
 */
export function initTelemetry() {
  const telemetry = document.querySelector(SELECTORS.telemetry);
  const altitude = telemetry.querySelector(SELECTORS.altitude);

  ScrollTrigger.create({
    start: 0,
    endTrigger: SELECTORS.about,
    end: 'bottom bottom',
    onUpdate: ({ progress }) => {
      altitude.textContent = formatAltitude(altitudeAt(progress));
    },
  });

  gsap.to(telemetry, {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: SELECTORS.work, start: 'top 85%', end: 'top 45%', scrub: true },
  });
}
