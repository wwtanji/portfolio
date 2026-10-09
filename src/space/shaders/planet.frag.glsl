uniform sampler2D u_surface;
uniform sampler2D u_atmosphere;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_radiusInViewports;
uniform float u_rotation;
uniform float u_cloudDrift;
uniform float u_haze;
uniform vec3 u_sunDirection;
uniform vec3 u_skyHigh;
uniform vec3 u_skyMid;
uniform vec3 u_skyLow;

out vec4 o_color;

const float PI = 3.14159265;
const float AXIAL_TILT = 0.28;
const float GLOW_WIDTH = 0.07;
const float SKY_MID_STOP = 0.55;
const float DETAIL_START_RADIUS = 0.7;
const float DETAIL_FULL_RADIUS = 3.0;
const float CLOUD_SHADOW_OFFSET = 0.0016;

const vec3 CLOUD = vec3(244.0, 247.0, 252.0) / 255.0;
const vec3 ATMOSPHERE = vec3(118.0, 170.0, 255.0) / 255.0;
const vec3 TWILIGHT = vec3(255.0, 140.0, 80.0) / 255.0;
const vec3 CITY_LIGHT = vec3(255.0, 196.0, 120.0) / 255.0;

vec3 skyGradient() {
  float depth = 1.0 - gl_FragCoord.y / u_resolution.y;
  if (depth < SKY_MID_STOP) {
    return mix(u_skyHigh, u_skyMid, depth / SKY_MID_STOP);
  }
  return mix(u_skyMid, u_skyLow, (depth - SKY_MID_STOP) / (1.0 - SKY_MID_STOP));
}

vec3 shadePlanet(vec2 disc, float distanceSquared) {
  vec3 normal = vec3(disc, sqrt(max(0.0, 1.0 - distanceSquared)));
  float tiltSin = sin(AXIAL_TILT);
  float tiltCos = cos(AXIAL_TILT);
  vec3 world = vec3(normal.x, normal.y * tiltCos + normal.z * tiltSin, normal.z * tiltCos - normal.y * tiltSin);

  float latitude = asin(clamp(world.y, -1.0, 1.0));
  float longitude = atan(world.z, world.x) + u_rotation * 2.0 * PI;
  vec2 surfaceUv = vec2(fract(longitude / (2.0 * PI)), 0.5 + latitude / PI);
  vec2 cloudUv = vec2(fract(surfaceUv.x + u_cloudDrift), surfaceUv.y);
  float textureLevel = max(0.0, log2(float(textureSize(u_surface, 0).x) / (2.0 * PI * u_radius)));

  vec4 surface = textureLod(u_surface, surfaceUv, textureLevel);
  vec4 atmosphere = textureLod(u_atmosphere, cloudUv, textureLevel);
  float shadowDensity = textureLod(u_atmosphere, cloudUv + u_sunDirection.xy * CLOUD_SHADOW_OFFSET, textureLevel).r;

  float detailAmount = smoothstep(DETAIL_START_RADIUS, DETAIL_FULL_RADIUS, u_radiusInViewports);
  float detail = 0.5;
  if (detailAmount > 0.0) {
    vec3 surfacePoint = vec3(cos(latitude) * cos(longitude), sin(latitude), cos(latitude) * sin(longitude));
    detail = fractalNoise(surfacePoint * 70.0, 3) * 0.6 + fractalNoise(surfacePoint * 320.0, 3) * 0.4;
  }
  float detailShift = (detail - 0.5) * detailAmount;

  float cloud = smoothstep(0.5, 0.7, atmosphere.r + detailShift * 0.8);
  float cloudShadow = smoothstep(0.5, 0.7, shadowDensity) * (1.0 - cloud);
  vec3 albedo = surface.rgb * (1.0 - 0.45 * cloudShadow) * (1.0 + detailShift * 1.2);
  vec3 color = mix(albedo, CLOUD, cloud);

  float diffuse = dot(normal, u_sunDirection);
  float daylight = smoothstep(-0.12, 0.45, diffuse);
  vec3 halfway = normalize(u_sunDirection + vec3(0.0, 0.0, 1.0));
  float specular = surface.a * (1.0 - cloud) * pow(max(dot(normal, halfway), 0.0), 60.0) * 0.6 * daylight;
  float twilight = smoothstep(-0.12, 0.04, diffuse) * (1.0 - smoothstep(0.04, 0.32, diffuse));
  float night = 1.0 - smoothstep(-0.2, 0.1, diffuse);

  vec3 lit = color * (0.02 + 0.98 * daylight) + specular;
  lit += TWILIGHT * twilight * 0.28;
  lit += CITY_LIGHT * atmosphere.g * night * (1.0 - cloud) * 1.6;

  float rim = pow(1.0 - normal.z, 3.0) * (0.15 + 0.85 * daylight) * 0.85 + 0.05 * daylight;
  return mix(lit, ATMOSPHERE, rim);
}

void main() {
  vec2 disc = (gl_FragCoord.xy - u_center) / u_radius;
  float distanceSquared = dot(disc, disc);
  float edgeDistance = sqrt(distanceSquared);
  vec3 haze = skyGradient();

  float sunFacing = dot(disc / max(edgeDistance, 1e-5), normalize(u_sunDirection.xy));
  float glowFalloff = clamp(1.0 - (edgeDistance - 1.0) / GLOW_WIDTH, 0.0, 1.0);
  float glowAlpha = pow(glowFalloff, 3.0) * (0.2 + 0.8 * smoothstep(-0.5, 0.6, sunFacing)) * 0.7;

  vec3 color = ATMOSPHERE;
  float alpha = glowAlpha;
  float coverage = clamp((1.0 - edgeDistance) * u_radius + 0.5, 0.0, 1.0);
  if (coverage > 0.0) {
    color = mix(ATMOSPHERE, shadePlanet(disc, min(distanceSquared, 1.0)), coverage);
    alpha = mix(glowAlpha, 1.0, coverage);
  }

  color = mix(color, haze, u_haze);
  alpha = mix(alpha, 1.0, u_haze);
  color += (hash13(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 255.0;
  o_color = vec4(color * alpha, alpha);
}
