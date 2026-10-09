const mat3 OCTAVE_ROTATION = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
const float OCTAVE_FREQUENCY_GROWTH = 2.03;

float hash13(vec3 point) {
  point = fract(point * 0.1031);
  point += dot(point, point.zyx + 31.32);
  return fract((point.x + point.y) * point.z);
}

float valueNoise(vec3 point) {
  vec3 cell = floor(point);
  vec3 local = fract(point);
  vec3 blend = local * local * (3.0 - 2.0 * local);

  float nearPlane = mix(
    mix(hash13(cell), hash13(cell + vec3(1.0, 0.0, 0.0)), blend.x),
    mix(hash13(cell + vec3(0.0, 1.0, 0.0)), hash13(cell + vec3(1.0, 1.0, 0.0)), blend.x),
    blend.y
  );
  float farPlane = mix(
    mix(hash13(cell + vec3(0.0, 0.0, 1.0)), hash13(cell + vec3(1.0, 0.0, 1.0)), blend.x),
    mix(hash13(cell + vec3(0.0, 1.0, 1.0)), hash13(cell + vec3(1.0, 1.0, 1.0)), blend.x),
    blend.y
  );
  return mix(nearPlane, farPlane, blend.z);
}

float fractalNoise(vec3 point, int octaves) {
  float amplitude = 0.5;
  float total = 0.0;
  float amplitudeSum = 0.0;
  for (int octave = 0; octave < octaves; octave++) {
    total += valueNoise(point) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= 0.5;
    point = OCTAVE_ROTATION * point * OCTAVE_FREQUENCY_GROWTH;
  }
  return total / amplitudeSum;
}
