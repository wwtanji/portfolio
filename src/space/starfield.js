import { gsap } from 'gsap';
import { createRandom } from './random.js';
import { prefersReducedMotion } from '../shared/motion.js';

const STARS_PER_MEGAPIXEL = 420;
const MAX_PIXEL_RATIO = 2;
const STAR_SEED = 2026;

/**
 * @typedef {Object} Star
 * @property {number} x
 * @property {number} y
 * @property {number} size
 * @property {number} brightness
 * @property {number} twinkleSpeed
 * @property {number} twinklePhase
 */

/**
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @returns {Star[]}
 */
function createStars(width, height, pixelRatio) {
  const random = createRandom(STAR_SEED);
  const count = Math.round(((width * height) / 1e6) * STARS_PER_MEGAPIXEL);
  return Array.from({ length: count }, () => ({
    x: random() * width,
    y: random() * height,
    size: (random() < 0.92 ? 1 : 2) * pixelRatio,
    brightness: 0.25 + random() * 0.6,
    twinkleSpeed: 0.6 + random() * 2.2,
    twinklePhase: random() * Math.PI * 2,
  }));
}

/**
 * Draws a twinkling starfield that only animates while the canvas is on screen.
 * @param {HTMLCanvasElement} canvas
 * @returns {void}
 */
export function initStarfield(canvas) {
  const context = canvas.getContext('2d');
  let stars = [];
  let isVisible = true;
  const isStatic = prefersReducedMotion();

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    stars = createStars(canvas.width, canvas.height, pixelRatio);
    if (isStatic) draw(0);
  };

  const draw = (time) => {
    if (!isVisible) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    for (const star of stars) {
      context.globalAlpha = star.brightness * (0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
      context.fillRect(star.x, star.y, star.size, star.size);
    }
  };

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }).observe(canvas);

  resize();
  window.addEventListener('resize', resize);
  if (!isStatic) gsap.ticker.add(draw);
}
