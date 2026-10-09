import { CLOCK_LOCALE, CLOCK_REFRESH_MS, HOME_TIME_ZONE, SELECTORS } from '../constants.js';

/**
 * Keeps the local time in Nitra up to date in the footer.
 * @returns {void}
 */
export function initClock() {
  const clock = document.querySelector(SELECTORS.clock);
  const formatter = new Intl.DateTimeFormat(CLOCK_LOCALE, {
    timeZone: HOME_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  });

  const tick = () => {
    const now = new Date();
    clock.textContent = formatter.format(now);
    clock.dateTime = now.toISOString();
  };

  tick();
  setInterval(tick, CLOCK_REFRESH_MS);
}
