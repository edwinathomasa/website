import { memo, useEffect, useRef, type ReactNode } from 'react';

export interface BeamsProps {
  readonly className?: string;
  readonly angle?: number;
  readonly colors?: readonly string[];
  readonly count?: number;
  readonly curve?: number;
  readonly fan?: number;
  readonly frequency?: number;
  readonly glow?: number;
  readonly interactive?: boolean;
  readonly length?: number;
  readonly seed?: number;
  readonly speed?: number;
  readonly spread?: number;
  readonly tracks?: number;
  readonly children?: ReactNode;
}

const DEFAULT_COLORS: readonly string[] = [
  'var(--beam-cyan)',
  'var(--beam-indigo)',
  'var(--beam-fuchsia)',
  'var(--beam-crimson)',
  'var(--beam-cobalt)',
  'var(--beam-cobalt)',
];

function resolveCssColor(input: string): string {
  const trimmed = input.trim();
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return trimmed;
  }
  const varMatch = /^var\(\s*(--[^,\s)]+)/.exec(trimmed);
  const varName = varMatch
    ? varMatch[1]
    : trimmed.startsWith('--')
      ? trimmed
      : null;
  if (!varName) return trimmed;
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return resolved || trimmed;
}

function hexToRgb(colorInput: string): [number, number, number] {
  const hex = resolveCssColor(colorInput);
  let clean = hex.replace(/^#/, '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const int = parseInt(clean.slice(0, 6), 16);
  if (Number.isNaN(int)) return [1, 1, 1];
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
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
  uniform float uInteractive;
  uniform float uAngle;
  uniform float uCount;
  uniform float uCurve;
  uniform float uFan;
  uniform float uFrequency;
  uniform float uGlow;
  uniform float uLength;
  uniform float uSeed;
  uniform float uSpeed;
  uniform float uSpread;
  uniform float uTracks;
  uniform int uColorCount;
  uniform vec3 uColors[8];

  float hash(float n) {
    return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453123);
  }

  vec3 pickColor(float idx) {
    int cCount = uColorCount > 0 ? uColorCount : 1;
    float m = mod(idx, float(cCount));
    for (int i = 0; i < 8; i++) {
      if (i == int(m)) {
        return uColors[i];
      }
    }
    return uColors[0];
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 centered = (vUv - 0.5) * 2.0;
    centered.x *= aspect;

    // Rotate coordinate space by directional angle (degrees)
    float rad = radians(uAngle);
    float ca = cos(rad);
    float sa = sin(rad);
    vec2 p = vec2(
      centered.x * ca + centered.y * sa,
      -centered.x * sa + centered.y * ca
    );

    if (uInteractive > 0.5) {
      vec2 dPtr = centered - uPointer;
      float ptrInfluence = exp(-dot(dPtr, dPtr) * 2.5) * 0.18;
      p.y += dPtr.y * ptrInfluence;
    }

    // Normalized progress along the travel axis [0..1]
    float u = (p.x / max(aspect, 1.0)) * 0.5 + 0.5;

    vec3 totalColor = vec3(0.0);
    float maxCount = clamp(uCount, 1.0, 128.0);
    float beamLen = clamp(uLength, 0.05, 0.95);
    float glowAmt = clamp(uGlow, 0.01, 1.0);
    float trackOpacity = clamp(uTracks, 0.0, 1.0) * 0.16;

    for (int i = 0; i < 128; i++) {
      if (float(i) >= maxCount) break;
      float fi = float(i);
      float normIdx = (maxCount > 1.0) ? (fi / (maxCount - 1.0)) - 0.5 : 0.0;

      float h1 = hash(fi + 1.0);
      float h2 = hash(fi * 2.37 + 7.13);
      float h3 = hash(fi * 5.19 + 19.41);

      // Transverse offset across the sheaf
      float jitter = (h1 - 0.5) * (0.65 / maxCount);
      float baseOffset = (normIdx + jitter) * uSpread;

      // Fan factor: 0 = parallel lines, 1 = fanning out from left origin
      float fanScale = mix(1.0, 0.18 + 1.45 * clamp(u, 0.0, 1.3), clamp(uFan, 0.0, 1.0));

      // Smooth S-curve & harmonic bowing along the path
      float bowPhase = u * 3.14159265 + (h2 - 0.5) * 1.1;
      float curveArch =
        sin(bowPhase) * (0.26 * uCurve) * (0.6 + 0.7 * normIdx) +
        cos(u * 2.35 + h3 * 6.2831853) * (0.11 * uCurve);

      float pathY = baseOffset * fanScale + curveArch;
      float dist = abs(p.y - pathY);

      // Thin core line + lateral glow halo
      float lineCore = smoothstep(0.011, 0.0012, dist);
      float lineHalo = exp(-dist * (36.0 / (0.35 + glowAmt * 2.4))) * (0.18 + glowAmt * 0.95);
      float crossProfile = lineCore + lineHalo;

      if (crossProfile > 0.0005) {
        vec3 beamColor = pickColor(fi + floor(h3 * float(uColorCount)));

        // 1. Underlying permanent track line
        vec3 trackContribution = beamColor * (lineCore * 0.55 + lineHalo * 0.25) * trackOpacity;

        // 2. Traveling light beam (bright head + halo + fading tail)
        float lineSpeed = uSpeed * (0.22 + 0.16 * h2);
        float cycleRate = clamp(uFrequency, 0.15, 2.5) * (0.55 + 0.45 * h3);
        float phase = fract(u * cycleRate - uTime * lineSpeed + h1);

        // phase near 0 is the leading head; phase in (0..beamLen) is the fading tail
        float inTrail = step(phase, beamLen);
        float tailProgress = 1.0 - clamp(phase / beamLen, 0.0, 1.0);
        float tailEnvelope = pow(tailProgress, 2.15) * smoothstep(0.0, 0.035, phase) * inTrail;

        // Bright leading head & head halo
        float headDist = min(phase, 1.0 - phase);
        float headGlow = exp(-headDist * 52.0) * (1.1 + glowAmt * 0.8);

        // Smooth edge fade at container boundaries
        float edgeFade = smoothstep(-0.18, 0.08, u) * (1.0 - smoothstep(0.92, 1.18, u));

        vec3 pulseColor =
          mix(beamColor, vec3(1.0), clamp(headGlow * 0.68, 0.0, 0.92)) *
          (tailEnvelope * 0.95 + headGlow * 1.15) *
          crossProfile *
          edgeFade;

        totalColor += trackContribution + pulseColor;
      }
    }

    // Soft HDR tone-mapping
    vec3 mapped = 1.0 - exp(-totalColor * 1.15);
    float alpha = clamp(max(mapped.r, max(mapped.g, mapped.b)) * 1.25, 0.0, 1.0);
    gl_FragColor = vec4(mapped, alpha);
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

export const Beams = memo(function Beams({
  className = '',
  angle = -1,
  colors = DEFAULT_COLORS,
  count = 48,
  curve = 1.5,
  fan = 0,
  frequency = 1.05,
  glow = 0.1,
  interactive = false,
  length = 0.38,
  seed = 1,
  speed = 1.9,
  spread = 1.9,
  tracks = 0.5,
  children,
}: BeamsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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

    const palette =
      colors && colors.length > 0 ? colors.slice(0, 8) : DEFAULT_COLORS;
    const flatColors = new Float32Array(8 * 3);
    for (let i = 0; i < 8; i++) {
      const [r, g, b] = hexToRgb(palette[i % palette.length]);
      flatColors[i * 3] = r;
      flatColors[i * 3 + 1] = g;
      flatColors[i * 3 + 2] = b;
    }

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uInteractive = gl.getUniformLocation(program, 'uInteractive');
    const uAngle = gl.getUniformLocation(program, 'uAngle');
    const uCount = gl.getUniformLocation(program, 'uCount');
    const uCurve = gl.getUniformLocation(program, 'uCurve');
    const uFan = gl.getUniformLocation(program, 'uFan');
    const uFrequency = gl.getUniformLocation(program, 'uFrequency');
    const uGlow = gl.getUniformLocation(program, 'uGlow');
    const uLength = gl.getUniformLocation(program, 'uLength');
    const uSeed = gl.getUniformLocation(program, 'uSeed');
    const uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const uSpread = gl.getUniformLocation(program, 'uSpread');
    const uTracks = gl.getUniformLocation(program, 'uTracks');
    const uColorCount = gl.getUniformLocation(program, 'uColorCount');
    const uColors = gl.getUniformLocation(program, 'uColors');

    gl.uniform1f(uInteractive, interactive ? 1.0 : 0.0);
    gl.uniform1f(uAngle, angle);
    gl.uniform1f(uCount, count);
    gl.uniform1f(uCurve, curve);
    gl.uniform1f(uFan, fan);
    gl.uniform1f(uFrequency, frequency);
    gl.uniform1f(uGlow, glow);
    gl.uniform1f(uLength, length);
    gl.uniform1f(uSeed, seed);
    gl.uniform1f(uSpeed, speed);
    gl.uniform1f(uSpread, spread);
    gl.uniform1f(uTracks, tracks);
    gl.uniform1i(uColorCount, palette.length);
    gl.uniform3fv(uColors, flatColors);

    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      const aspect = w / Math.max(h, 1);
      pointerRef.current = {
        x: (((e.clientX - rect.left) / w) * 2 - 1) * aspect,
        y: -(((e.clientY - rect.top) / h) * 2 - 1),
      };
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let animationFrameId = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      animationFrameId = window.requestAnimationFrame(render);
      const elapsed = (now - startTime) * 0.001;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uPointer, pointerRef.current.x, pointerRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [
    angle,
    colors,
    count,
    curve,
    fan,
    frequency,
    glow,
    interactive,
    length,
    seed,
    speed,
    spread,
    tracks,
  ]);

  return (
    <div
      ref={containerRef}
      className={`particles-container ${className}`.trim()}
    >
      <canvas ref={canvasRef} className="particles-canvas" />
      {children}
    </div>
  );
});

export default Beams;
