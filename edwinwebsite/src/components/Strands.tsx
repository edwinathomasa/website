import { memo, useEffect, useRef } from 'react';

export interface StrandsProps {
  readonly speed?: number;
  readonly hueShift?: number;
  readonly refraction?: number;
  readonly rim?: number;
  readonly scale?: number;
  readonly dispersion?: number;
  readonly count?: number;
  readonly amplitude?: number;
  readonly waviness?: number;
  readonly energy?: number;
  readonly thickness?: number;
  readonly spread?: number;
  readonly glow?: number;
  readonly taper?: number;
  readonly intensity?: number;
  readonly saturation?: number;
  readonly glassSize?: number;
  readonly listening?: boolean;
  readonly level?: number;
  readonly lightMode?: boolean;
  readonly className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uBurst;
  uniform float uListening;
  uniform float uSpeed;
  uniform float uHueShift;
  uniform float uRefraction;
  uniform float uRim;
  uniform float uScale;
  uniform float uDispersion;
  uniform float uCount;
  uniform float uAmplitude;
  uniform float uWaviness;
  uniform float uEnergy;
  uniform float uThickness;
  uniform float uSpread;
  uniform float uGlow;
  uniform float uTaper;
  uniform float uIntensity;
  uniform float uSaturation;
  uniform float uGlassSize;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // Evaluate spectral strand field at a given UV offset (used for RGB dispersion)
  float strandField(vec2 p, float idx, float t, float activeEnergy) {
    float phase = idx * 2.0943951 + t * 0.75;
    // Rotate each strand slightly so they weave and cross in the center
    float angle = sin(t * 0.42 + idx * 1.7) * 0.55 * uSpread + uPointer.x * 0.25;
    float ca = cos(angle);
    float sa = sin(angle);
    vec2 rp = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);

    float env = exp(-rp.x * rp.x * (2.2 * uTaper));
    float freq = (3.2 + idx * 0.65) * uWaviness;
    float amp = (0.22 + 0.16 * activeEnergy) * uAmplitude * env;

    float wave =
      sin(rp.x * freq + t * (1.8 + idx * 0.35) + phase) * amp +
      cos(rp.x * (freq * 1.6) - t * 1.25 + idx) * (amp * 0.45) +
      uPointer.y * 0.12 * env;

    float dist = abs(rp.y - wave);
    float width = (0.022 + 0.018 * activeEnergy) * uThickness * (0.55 + 0.65 * env);
    float core = width / (dist + width * 0.35);
    float halo = exp(-dist * (9.0 / max(0.35, uGlow))) * 0.65;
    return (core * core * 0.58 + halo) * env;
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (vUv - 0.5) * 2.0;
    p.x *= aspect;
    p /= max(0.25, uScale * uGlassSize);

    float r = length(p);
    if (r > 1.05) {
      discard;
    }

    float orbMask = smoothstep(1.02, 0.96, r);
    float z = sqrt(max(0.0, 1.0 - min(1.0, r * r)));
    vec3 normal = normalize(vec3(p, z));

    // Active audio/listening/burst energy
    float activeEnergy = clamp(uEnergy + uListening * 0.48 + uBurst * 0.65, 0.1, 2.0);
    float t = uTime * uSpeed * (1.0 + uListening * 0.55 + uBurst * 0.8);

    // Spherical glass lens refraction near the rim
    float edgeFactor = pow(clamp(r, 0.0, 1.0), 2.6) * uRefraction;
    vec2 refractedP = p * (1.0 - edgeFactor * 0.32);

    // Chromatic dispersion shift along radial normal
    vec2 dispVec = normalize(p + vec2(1e-5)) * (0.018 * uDispersion * (0.35 + edgeFactor * 1.4));

    vec3 accumColor = vec3(0.0);
    float totalDensity = 0.0;

    for (int i = 0; i < 5; i++) {
      if (float(i) >= uCount) break;
      float fi = float(i);

      float sR = strandField(refractedP + dispVec, fi, t, activeEnergy);
      float sG = strandField(refractedP, fi, t, activeEnergy);
      float sB = strandField(refractedP - dispVec, fi, t, activeEnergy);

      // Spectral Siri-like palette (cyan -> violet -> magenta -> warm rose)
      float hue = fract(0.56 + fi * 0.16 + p.x * 0.12 + sin(t * 0.3 + fi) * 0.06 + uHueShift);
      vec3 baseRgb = hsv2rgb(vec3(hue, clamp(0.78 * uSaturation, 0.0, 1.0), 1.0));
      vec3 altRgb = hsv2rgb(vec3(fract(hue + 0.14), clamp(0.85 * uSaturation, 0.0, 1.0), 1.0));
      vec3 strandTint = mix(baseRgb, altRgb, 0.5 + 0.5 * sin(p.x * 3.0 + t));

      vec3 dispersedStrand = vec3(sR, sG, sB) * strandTint;
      accumColor += dispersedStrand;
      totalDensity += (sR + sG + sB) * 0.333;
    }

    // Smooth central convergence bulge where strands cross and burn toward white
    float convergence = pow(max(0.0, totalDensity / max(1.0, uCount * 0.55)), 1.75);
    float centerGlow = exp(- dot(p, p) * 3.4) * (0.35 + 0.45 * activeEnergy);
    accumColor += vec3(0.88, 0.92, 1.0) * convergence * 0.55;
    accumColor += hsv2rgb(vec3(fract(0.78 + uHueShift), 0.45 * uSaturation, 1.0)) * centerGlow * 0.45;

    // Frosted glass orb body & Fresnel rim with spectral dispersion
    float fresnel = pow(1.0 - z, 3.2);
    float rimRing = smoothstep(0.76, 0.985, r) * smoothstep(1.02, 0.965, r);
    float rimAngle = atan(p.y, p.x);
    vec3 rimSpectrum = hsv2rgb(vec3(
      fract(rimAngle / 6.2831853 + t * 0.12 + uHueShift),
      clamp(0.65 * uDispersion * uSaturation, 0.0, 1.0),
      1.0
    ));

    // Specular highlight top-left + bottom-right rim reflection
    float specTop = pow(max(0.0, dot(normal, normalize(vec3(-0.45, 0.55, 0.7)))), 18.0);
    float specBot = pow(max(0.0, dot(normal, normalize(vec3(0.45, -0.55, 0.6)))), 14.0) * 0.55;

    vec3 glassBase = vec3(0.08, 0.08, 0.14) * (0.35 + 0.35 * (1.0 - z));
    vec3 rimLight = mix(vec3(0.98, 0.96, 0.93), rimSpectrum, 0.55) * (fresnel * 0.85 + rimRing * 0.75) * uRim;
    vec3 specular = vec3(0.98, 0.97, 0.95) * (specTop * 0.75 + specBot * 0.45) * uRim;

    vec3 finalRgb = glassBase + accumColor * uIntensity + rimLight + specular;
    // Soft tone map so bright convergence stays rich and glossy
    finalRgb = 1.0 - exp(-finalRgb * 1.15);

    float alpha = orbMask * clamp(0.28 + totalDensity * 0.42 + fresnel * 0.75 + specTop * 0.6, 0.0, 0.98);
    gl_FragColor = vec4(finalRgb, alpha);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * React Bits Strands animation component.
 * Renders spectral twisting strands inside a frosted glass orb that swells
 * at the core and reacts to voice/listening state and clicks.
 */
const Strands = memo(function Strands({
  speed = 1,
  hueShift = 0,
  refraction = 1,
  rim = 1,
  scale = 1,
  dispersion = 1,
  count = 3,
  amplitude = 1,
  waviness = 1,
  energy = 0.65,
  thickness = 1,
  spread = 1,
  glow = 1,
  taper = 1,
  intensity = 1,
  saturation = 1,
  glassSize = 1,
  listening = false,
  level,
  className = '',
}: StrandsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const burstRef = useRef<number>(0);
  const listeningRef = useRef<boolean>(listening);
  const levelRef = useRef<number | undefined>(level);

  useEffect(() => {
    listeningRef.current = listening;
    if (listening) {
      burstRef.current = Math.max(burstRef.current, 0.75);
    }
  }, [listening]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    if (aPosition >= 0) {
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    }

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uBurst = gl.getUniformLocation(program, 'uBurst');
    const uListening = gl.getUniformLocation(program, 'uListening');
    const uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const uHueShift = gl.getUniformLocation(program, 'uHueShift');
    const uRefraction = gl.getUniformLocation(program, 'uRefraction');
    const uRim = gl.getUniformLocation(program, 'uRim');
    const uScale = gl.getUniformLocation(program, 'uScale');
    const uDispersion = gl.getUniformLocation(program, 'uDispersion');
    const uCount = gl.getUniformLocation(program, 'uCount');
    const uAmplitude = gl.getUniformLocation(program, 'uAmplitude');
    const uWaviness = gl.getUniformLocation(program, 'uWaviness');
    const uEnergy = gl.getUniformLocation(program, 'uEnergy');
    const uThickness = gl.getUniformLocation(program, 'uThickness');
    const uSpread = gl.getUniformLocation(program, 'uSpread');
    const uGlow = gl.getUniformLocation(program, 'uGlow');
    const uTaper = gl.getUniformLocation(program, 'uTaper');
    const uIntensity = gl.getUniformLocation(program, 'uIntensity');
    const uSaturation = gl.getUniformLocation(program, 'uSaturation');
    const uGlassSize = gl.getUniformLocation(program, 'uGlassSize');

    gl.uniform1f(uSpeed, speed);
    gl.uniform1f(uHueShift, hueShift);
    gl.uniform1f(uRefraction, refraction);
    gl.uniform1f(uRim, rim);
    gl.uniform1f(uScale, scale);
    gl.uniform1f(uDispersion, dispersion);
    gl.uniform1f(uCount, count);
    gl.uniform1f(uAmplitude, amplitude);
    gl.uniform1f(uWaviness, waviness);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uThickness, thickness);
    gl.uniform1f(uSpread, spread);
    gl.uniform1f(uGlow, glow);
    gl.uniform1f(uTaper, taper);
    gl.uniform1f(uIntensity, intensity);
    gl.uniform1f(uSaturation, saturation);
    gl.uniform1f(uGlassSize, glassSize);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 160;
      const h = canvas.clientHeight || 160;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleClickBurst = () => {
      burstRef.current = 1.0;
    };

    canvas.addEventListener('pointerdown', handleClickBurst);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let animationFrameId = 0;
    const startTime = performance.now();
    let smoothListen = listening ? 1 : 0;

    const render = (now: number) => {
      animationFrameId = window.requestAnimationFrame(render);
      const elapsed = (now - startTime) * 0.001;

      burstRef.current *= 0.94;

      const targetListen =
        typeof levelRef.current === 'number'
          ? levelRef.current
          : listeningRef.current
            ? 0.75 + 0.25 * Math.sin(elapsed * 6.5)
            : 0.0;
      smoothListen += (targetListen - smoothListen) * 0.1;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uPointer, pointerRef.current.x, pointerRef.current.y);
      gl.uniform1f(uBurst, burstRef.current);
      gl.uniform1f(uListening, smoothListen);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handleClickBurst);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [
    speed,
    hueShift,
    refraction,
    rim,
    scale,
    dispersion,
    count,
    amplitude,
    waviness,
    energy,
    thickness,
    spread,
    glow,
    taper,
    intensity,
    saturation,
    glassSize,
    listening,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`strands-canvas ${className}`.trim()}
    />
  );
});

export default Strands;
