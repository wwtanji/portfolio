const VIEWBOX_SIZE = 2000;
const CENTER = VIEWBOX_SIZE / 2;
const CENTRAL_WINDOW_RADIUS = 215;
const PANE_INNER_RADIUS = 300;
const PANE_OUTER_RADIUS = 660;
const PANE_COUNT = 6;
const FRAME_HALF_WIDTH = 34;
const BOLT_COUNT = 28;
const BOLT_RING_RADIUS = CENTRAL_WINDOW_RADIUS + 40;
const HULL_SEAM_RADII = [760, 880, 1020];

function pointAt(radius, angle, sideways) {
  const x = CENTER + radius * Math.cos(angle) - sideways * Math.sin(angle);
  const y = CENTER + radius * Math.sin(angle) + sideways * Math.cos(angle);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function panePoints(index) {
  const step = (Math.PI * 2) / PANE_COUNT;
  const startAngle = -Math.PI / 2 - step / 2 + index * step;
  const endAngle = startAngle + step;
  return [
    pointAt(PANE_INNER_RADIUS, startAngle, FRAME_HALF_WIDTH),
    pointAt(PANE_OUTER_RADIUS, startAngle, FRAME_HALF_WIDTH),
    pointAt(PANE_OUTER_RADIUS, endAngle, -FRAME_HALF_WIDTH),
    pointAt(PANE_INNER_RADIUS, endAngle, -FRAME_HALF_WIDTH),
  ].join(' ');
}

function boltMarkup() {
  return Array.from({ length: BOLT_COUNT }, (_, index) => {
    const angle = (index / BOLT_COUNT) * Math.PI * 2;
    const [x, y] = pointAt(BOLT_RING_RADIUS, angle, 0).split(',');
    return `<circle cx="${x}" cy="${y}" r="6" fill="#3d444d" />`;
  }).join('');
}

function buildPortholeMarkup() {
  const panes = Array.from({ length: PANE_COUNT }, (_, index) => panePoints(index));
  const paneShapes = (attributes) => panes.map((points) => `<polygon points="${points}" ${attributes} />`).join('');
  const seams = HULL_SEAM_RADII.map(
    (radius) => `<circle cx="${CENTER}" cy="${CENTER}" r="${radius}" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="3" />`,
  ).join('');

  return `
    <svg viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="hull-shade" cx="50%" cy="50%" r="62%">
          <stop offset="0" stop-color="#2b3038" />
          <stop offset="0.42" stop-color="#14171c" />
          <stop offset="1" stop-color="#050608" />
        </radialGradient>
        <linearGradient id="frame-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#a7b0ba" />
          <stop offset="0.45" stop-color="#363c44" />
          <stop offset="0.7" stop-color="#1c2026" />
          <stop offset="1" stop-color="#8d96a1" />
        </linearGradient>
        <linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.09" />
          <stop offset="0.45" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <mask id="hull-cutout">
          <rect width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="#ffffff" />
          <circle cx="${CENTER}" cy="${CENTER}" r="${CENTRAL_WINDOW_RADIUS}" fill="#000000" />
          ${paneShapes('fill="#000000" stroke="#000000" stroke-width="18" stroke-linejoin="round"')}
        </mask>
      </defs>
      <rect width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="url(#hull-shade)" mask="url(#hull-cutout)" />
      ${seams}
      <circle cx="${CENTER}" cy="${CENTER}" r="${CENTRAL_WINDOW_RADIUS}" fill="url(#glass-glare)" />
      ${paneShapes('fill="url(#glass-glare)"')}
      <circle cx="${CENTER}" cy="${CENTER}" r="${CENTRAL_WINDOW_RADIUS}" fill="none" stroke="url(#frame-metal)" stroke-width="16" />
      <circle cx="${CENTER}" cy="${CENTER}" r="${CENTRAL_WINDOW_RADIUS + 70}" fill="none" stroke="#000000" stroke-opacity="0.5" stroke-width="10" />
      ${paneShapes('fill="none" stroke="url(#frame-metal)" stroke-width="12" stroke-linejoin="round"')}
      <circle cx="${CENTER}" cy="${CENTER}" r="${PANE_OUTER_RADIUS + 48}" fill="none" stroke="url(#frame-metal)" stroke-opacity="0.5" stroke-width="10" />
      ${boltMarkup()}
    </svg>`;
}

/**
 * Renders the spacecraft window the hero scene starts behind.
 * @param {HTMLElement} container
 * @returns {void}
 */
export function mountPorthole(container) {
  container.innerHTML = buildPortholeMarkup();
}
