uniform vec2 u_size;

layout(location = 0) out vec4 o_surface;
layout(location = 1) out vec4 o_atmosphere;

const float PI = 3.14159265;
const float SEA_LEVEL = 0.52;
const float COASTLINE_SOFTNESS = 0.004;
const float POLAR_ICE_LATITUDE = 1.36;
const float ICE_EDGE_SOFTNESS = 0.04;
const float POLAR_CLOUD_FADE_START = 1.0;
const float POLAR_CLOUD_FADE_END = 1.4;

const vec3 OCEAN_DEEP = vec3(5.0, 22.0, 50.0) / 255.0;
const vec3 OCEAN_SHALLOW = vec3(20.0, 72.0, 114.0) / 255.0;
const vec3 LAND_DRY = vec3(176.0, 150.0, 104.0) / 255.0;
const vec3 LAND_LUSH = vec3(44.0, 76.0, 40.0) / 255.0;
const vec3 LAND_ROCK = vec3(116.0, 102.0, 86.0) / 255.0;
const vec3 ICE = vec3(230.0, 236.0, 243.0) / 255.0;

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  float latitude = (uv.y - 0.5) * PI;
  float longitude = uv.x * 2.0 * PI;
  vec3 point = vec3(cos(latitude) * cos(longitude), sin(latitude), cos(latitude) * sin(longitude));

  float elevation = fractalNoise(point * 1.5 + vec3(3.1, 0.0, 0.0), 7);
  float moisture = fractalNoise(point * 2.2 + vec3(9.0, 41.0, 13.0), 4);
  float landAmount = smoothstep(SEA_LEVEL - COASTLINE_SOFTNESS, SEA_LEVEL + COASTLINE_SOFTNESS, elevation);
  float iceEdge = POLAR_ICE_LATITUDE + (moisture - 0.5) * 0.4;
  float iceAmount = smoothstep(iceEdge - ICE_EDGE_SOFTNESS, iceEdge + ICE_EDGE_SOFTNESS, abs(latitude));

  vec3 ocean = mix(OCEAN_SHALLOW, OCEAN_DEEP, smoothstep(0.0, 0.08, SEA_LEVEL - elevation));
  vec3 vegetation = mix(LAND_DRY, LAND_LUSH, smoothstep(0.44, 0.58, moisture));
  vec3 land = mix(vegetation, LAND_ROCK, smoothstep(0.03, 0.16, elevation - SEA_LEVEL) * 0.75);
  vec3 albedo = mix(mix(ocean, land, landAmount), ICE, iceAmount);
  float oceanMask = (1.0 - landAmount) * (1.0 - iceAmount);

  float warp = fractalNoise(point * 1.5 + vec3(71.0), 3);
  vec3 cloudPoint = vec3(point.x * 2.4 + warp * 1.4, point.y * 5.0, point.z * 2.4 + warp);
  float cloudDensity = fractalNoise(cloudPoint + vec3(43.0), 5);
  float polarClearing = 1.0 - smoothstep(POLAR_CLOUD_FADE_START, POLAR_CLOUD_FADE_END, abs(latitude));

  float settlements = smoothstep(0.6, 0.78, fractalNoise(point * 24.0 + vec3(5.0), 3));
  float streets = smoothstep(0.5, 0.75, fractalNoise(point * 90.0 + vec3(27.0), 2));
  float cityLights = settlements * streets * landAmount * (1.0 - iceAmount) * smoothstep(0.42, 0.56, moisture);

  o_surface = vec4(albedo, oceanMask);
  o_atmosphere = vec4(cloudDensity * polarClearing, cityLights, 0.0, 1.0);
}
