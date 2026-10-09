import { gsap } from 'gsap';
import noiseSource from './shaders/noise.glsl?raw';
import vertexSource from './shaders/fullscreen.vert.glsl?raw';
import surfaceSource from './shaders/surface.frag.glsl?raw';
import planetSource from './shaders/planet.frag.glsl?raw';
import { prefersReducedMotion } from '../shared/motion.js';

const SHADER_PRELUDE = '#version 300 es\nprecision highp float;\nprecision highp int;\n';
const SURFACE_TEXTURE_WIDTH_COMPACT = 2048;
const SURFACE_TEXTURE_WIDTH_LARGE = 4096;
const LARGE_SCREEN_MIN_PIXELS = 1600;
const MAX_PIXEL_RATIO = 1.5;
const ROTATION_TURNS_PER_SECOND = 0.004;
const CLOUD_DRIFT_TURNS_PER_SECOND = 0.0015;
const DIVE_FOCUS_HEIGHT = 0.6;
const SUN_DIRECTION = normalize([-0.45, 0.5, 0.74]);
const SKY_COLOR_PROPERTIES = ['--sky-high', '--sky-mid', '--sky-low'];

/**
 * @typedef {Object} PlanetView
 * @property {number} radius disc radius as a share of the longer viewport side
 * @property {number} horizon top edge of the disc as a share of the viewport height
 * @property {number} focus 0 rests the disc on its horizon, 1 locks the dive point to the viewport centre
 * @property {number} haze 0 shows the planet, 1 dissolves it into the sky gradient
 */

function normalize([x, y, z]) {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
}

function readCssColor(property) {
  const value = parseInt(getComputedStyle(document.documentElement).getPropertyValue(property).trim().slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, SHADER_PRELUDE + source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, noiseSource + fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

function chooseSurfaceTextureWidth(gl) {
  const longestScreenSide = Math.max(screen.width, screen.height) * Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  const fitsLarge = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= SURFACE_TEXTURE_WIDTH_LARGE;
  return fitsLarge && longestScreenSide > LARGE_SCREEN_MIN_PIXELS ? SURFACE_TEXTURE_WIDTH_LARGE : SURFACE_TEXTURE_WIDTH_COMPACT;
}

function createSurfaceTexture(gl, width) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texStorage2D(gl.TEXTURE_2D, Math.log2(width) + 1, gl.RGBA8, width, width / 2);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

function bakeSurfaceTextures(gl) {
  const program = createProgram(gl, surfaceSource);
  const width = chooseSurfaceTextureWidth(gl);
  const height = width / 2;
  const surface = createSurfaceTexture(gl, width);
  const atmosphere = createSurfaceTexture(gl, width);
  const framebuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, surface, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, atmosphere, 0);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
  gl.viewport(0, 0, width, height);
  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, 'u_size'), width, height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(framebuffer);
  gl.deleteProgram(program);

  for (const texture of [surface, atmosphere]) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  return { surface, atmosphere };
}

function locateUniforms(gl, program, names) {
  return Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]));
}

/**
 * Bakes a procedural Earth on the GPU once, then draws it every frame from the given view.
 * Animate the returned view to move, zoom or dissolve the planet.
 * @param {HTMLCanvasElement} canvas
 * @returns {PlanetView}
 */
export function createPlanet(canvas) {
  const view = { radius: 0.62, horizon: 0.62, focus: 0, haze: 0 };
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) {
    console.warn('WebGL 2 is unavailable, the planet stays hidden');
    return view;
  }

  const textures = bakeSurfaceTextures(gl);
  const program = createProgram(gl, planetSource);
  const uniforms = locateUniforms(gl, program, [
    'u_surface',
    'u_atmosphere',
    'u_resolution',
    'u_center',
    'u_radius',
    'u_radiusInViewports',
    'u_rotation',
    'u_cloudDrift',
    'u_haze',
    'u_sunDirection',
    'u_skyHigh',
    'u_skyMid',
    'u_skyLow',
  ]);

  gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures.surface);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures.atmosphere);
  gl.uniform1i(uniforms.u_surface, 0);
  gl.uniform1i(uniforms.u_atmosphere, 1);
  gl.uniform3fv(uniforms.u_sunDirection, SUN_DIRECTION);
  const [skyHigh, skyMid, skyLow] = SKY_COLOR_PROPERTIES.map(readCssColor);
  gl.uniform3fv(uniforms.u_skyHigh, skyHigh);
  gl.uniform3fv(uniforms.u_skyMid, skyMid);
  gl.uniform3fv(uniforms.u_skyLow, skyLow);

  const draw = (timeInSeconds) => {
    const { width, height } = canvas;
    const radius = view.radius * Math.max(width, height);
    const restingCenterY = view.horizon * height + radius;
    const divingCenterY = height / 2 + DIVE_FOCUS_HEIGHT * radius;
    const centerY = restingCenterY + (divingCenterY - restingCenterY) * view.focus;

    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.u_resolution, width, height);
    gl.uniform2f(uniforms.u_center, width / 2, height - centerY);
    gl.uniform1f(uniforms.u_radius, radius);
    gl.uniform1f(uniforms.u_radiusInViewports, view.radius);
    gl.uniform1f(uniforms.u_rotation, (timeInSeconds * ROTATION_TURNS_PER_SECOND) % 1);
    gl.uniform1f(uniforms.u_cloudDrift, (timeInSeconds * CLOUD_DRIFT_TURNS_PER_SECOND) % 1);
    gl.uniform1f(uniforms.u_haze, view.haze);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const isStatic = prefersReducedMotion();
  let isVisible = true;

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
    canvas.width = Math.round(canvas.clientWidth * pixelRatio);
    canvas.height = Math.round(canvas.clientHeight * pixelRatio);
    if (isStatic) draw(0);
  };

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }).observe(canvas);

  resize();
  window.addEventListener('resize', resize);
  if (!isStatic) {
    gsap.ticker.add((time) => {
      if (isVisible) draw(time);
    });
  }

  return view;
}
