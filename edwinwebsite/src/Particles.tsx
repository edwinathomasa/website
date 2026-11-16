import { memo, useEffect, useRef } from 'react';

export interface ParticlesProps {
  readonly particleCount?: number;
  readonly particleSpread?: number;
  readonly speed?: number;
  readonly particleColors?: readonly string[];
  readonly moveParticlesOnHover?: boolean;
  readonly hoverEffect?: 'parallax' | 'repel' | 'attract';
  readonly particleHoverFactor?: number;
  readonly hoverRadius?: number;
  readonly alphaParticles?: boolean;
  readonly particleBaseSize?: number;
  readonly sizeRandomness?: number;
  readonly cameraDistance?: number;
  readonly disableRotation?: boolean;
  readonly glow?: number;
  readonly twinkle?: number;
  readonly shape?: 'circle' | 'square' | 'star' | 'diamond' | 'ring';
  readonly depthOfField?: number;
  readonly connections?: boolean;
  readonly connectionDistance?: number;
  readonly drift?: 'none' | 'up' | 'down' | 'left' | 'right';
  readonly driftSpeed?: number;
  readonly variation?: number;
  readonly opacity?: number;
  readonly clickBurst?: boolean;
  readonly intro?: boolean;
  readonly lightMode?: boolean;
  readonly className?: string;
}

const DEFAULT_COLORS: readonly string[] = ['#ffffff', '#ffffff', '#ffffff'];

function hexToRgb(hex: string): [number, number, number] {
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
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  uniform float uCameraDistance;
  uniform vec3 uRotation;
  uniform vec2 uTranslation;
  uniform vec2 uDriftOffset;
  uniform float uIntro;
  uniform float uGlow;
  uniform float uPixelRatio;

  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vDepth;

  mat4 rotationMatrix(vec3 rot) {
    float cx = cos(rot.x), sx = sin(rot.x);
    float cy = cos(rot.y), sy = sin(rot.y);
    float cz = cos(rot.z), sz = sin(rot.z);

    mat4 rx = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, cx,  sx,  0.0,
      0.0, -sx, cx,  0.0,
      0.0, 0.0, 0.0, 1.0
    );
    mat4 ry = mat4(
      cy,  0.0, -sy, 0.0,
      0.0, 1.0, 0.0, 0.0,
      sy,  0.0, cy,  0.0,
      0.0, 0.0, 0.0, 1.0
    );
    mat4 rz = mat4(
      cz,  sz,  0.0, 0.0,
      -sz, cz,  0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
    return rz * ry * rx;
  }

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread * uIntro;
    pos.xy += uDriftOffset;

    mat4 modelMat = rotationMatrix(uRotation);
    vec4 mPos = modelMat * vec4(pos, 1.0);
    mPos.x += uTranslation.x;
    mPos.y += uTranslation.y;

    float t = uTime;
    mPos.x += sin(t * random.z + 6.2831853 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.2831853 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.2831853 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = vec4(mPos.x, mPos.y, mPos.z - uCameraDistance, 1.0);
    float dist = max(1.0, length(mvPos.xyz));
    vDepth = dist;

    float sizeFactor = 1.0 + uSizeRandomness * (random.x - 0.5);
    float glowScale = 1.0 + clamp(uGlow, 0.0, 1.0) * 1.6;
    gl_PointSize = max(1.5, (uBaseSize * sizeFactor * glowScale * uPixelRatio) / dist);

    // Perspective projection
    float fovRad = radians(35.0);
    float f = 1.0 / tan(fovRad * 0.5);
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    float near = 0.1;
    float far = 200.0;

    vec4 clipPos = vec4(
      (mvPos.x * f) / aspect,
      mvPos.y * f,
      mvPos.z * ((far + near) / (near - far)) + (2.0 * far * near) / (near - far),
      -mvPos.z
    );

    gl_Position = clipPos;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  uniform float uGlow;
  uniform float uTwinkle;
  uniform float uOpacity;
  uniform float uVariation;
  uniform float uDepthOfField;
  uniform float uCameraDistance;
  uniform int uShape;

  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    vec2 p = uv - vec2(0.5);
    float d = length(p);

    float shapeDist = d;
    if (uShape == 1) {
      shapeDist = max(abs(p.x), abs(p.y));
    } else if (uShape == 2) {
      shapeDist = (abs(p.x) + abs(p.y)) * 0.75;
    }

    if (shapeDist > 0.5) {
      discard;
    }

    float g = clamp(uGlow, 0.0, 1.0);
    float coreRadius = 0.5 / (1.0 + g * 1.6);
    float coreMask = smoothstep(coreRadius, max(0.01, coreRadius * 0.7), shapeDist);
    float glowFalloff = exp(-pow(shapeDist / max(0.12, coreRadius * 1.35), 2.0) * 2.2) * g;
    float softCircle = smoothstep(0.5, 0.08, shapeDist);

    float alphaMask = uAlphaParticles > 0.5
      ? softCircle
      : clamp(coreMask + glowFalloff * 0.75, 0.0, 1.0);

    vec3 tint = vColor + (0.2 * clamp(uVariation, 0.0, 1.0)) * sin(uv.yxx + uTime + vRandom.y * 6.2831853);

    float twinkleWave = 0.5 + 0.5 * sin(uTime * 3.2 + vRandom.w * 6.2831853 + vRandom.x * 12.0);
    float twinkleFactor = mix(1.0, 0.3 + 0.7 * twinkleWave, clamp(uTwinkle, 0.0, 1.0));

    float dofBlur = uDepthOfField > 0.0
      ? clamp(1.0 - (abs(vDepth - uCameraDistance) / 18.0) * uDepthOfField, 0.25, 1.0)
      : 1.0;

    float finalAlpha = alphaMask * twinkleFactor * dofBlur * clamp(uOpacity, 0.0, 1.0);
    if (finalAlpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(clamp(tint, 0.0, 1.0), finalAlpha);
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

const Particles = memo(function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors = DEFAULT_COLORS,
  moveParticlesOnHover = false,
  hoverEffect = 'parallax',
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  glow = 0.5,
  twinkle = 0.3,
  shape = 'circle',
  depthOfField = 0,
  drift = 'none',
  driftSpeed = 1,
  variation = 0,
  opacity = 1,
  intro = true,
  lightMode = false,
  className = '',
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    container.appendChild(canvas);

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        depth: false,
        premultipliedAlpha: false,
      }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      return () => {
        if (container.contains(canvas)) {
          container.removeChild(canvas);
        }
      };
    }

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

    const count = Math.max(1, particleCount);
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette =
      particleColors && particleColors.length > 0
        ? particleColors
        : DEFAULT_COLORS;

    let seed = 987654321;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let z = 0;
      let len = 0;
      do {
        x = rand() * 2 - 1;
        y = rand() * 2 - 1;
        z = rand() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);

      const r = Math.cbrt(rand());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([rand(), rand(), rand(), rand()], i * 4);

      const hex = palette[Math.floor(rand() * palette.length)];
      const [cr, cg, cb] = hexToRgb(hex);
      const vShift = (rand() - 0.5) * variation * 0.25;
      colors.set(
        [
          Math.min(1, Math.max(0, cr + vShift)),
          Math.min(1, Math.max(0, cg + vShift)),
          Math.min(1, Math.max(0, cb + vShift)),
        ],
        i * 3
      );
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    if (posLoc >= 0) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    }

    const randBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, randBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);
    const randLoc = gl.getAttribLocation(program, 'random');
    if (randLoc >= 0) {
      gl.enableVertexAttribArray(randLoc);
      gl.vertexAttribPointer(randLoc, 4, gl.FLOAT, false, 0, 0);
    }

    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const colLoc = gl.getAttribLocation(program, 'color');
    if (colLoc >= 0) {
      gl.enableVertexAttribArray(colLoc);
      gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 0, 0);
    }

    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uSpread = gl.getUniformLocation(program, 'uSpread');
    const uBaseSize = gl.getUniformLocation(program, 'uBaseSize');
    const uSizeRandomness = gl.getUniformLocation(program, 'uSizeRandomness');
    const uCameraDistance = gl.getUniformLocation(program, 'uCameraDistance');
    const uRotation = gl.getUniformLocation(program, 'uRotation');
    const uTranslation = gl.getUniformLocation(program, 'uTranslation');
    const uDriftOffset = gl.getUniformLocation(program, 'uDriftOffset');
    const uIntro = gl.getUniformLocation(program, 'uIntro');
    const uGlow = gl.getUniformLocation(program, 'uGlow');
    const uPixelRatio = gl.getUniformLocation(program, 'uPixelRatio');
    const uAlphaParticles = gl.getUniformLocation(program, 'uAlphaParticles');
    const uTwinkle = gl.getUniformLocation(program, 'uTwinkle');
    const uOpacity = gl.getUniformLocation(program, 'uOpacity');
    const uVariation = gl.getUniformLocation(program, 'uVariation');
    const uDepthOfField = gl.getUniformLocation(program, 'uDepthOfField');
    const uShape = gl.getUniformLocation(program, 'uShape');

    const shapeIndex =
      shape === 'square' ? 1 : shape === 'diamond' ? 2 : 0;

    gl.uniform1f(uSpread, particleSpread);
    gl.uniform1f(uBaseSize, particleBaseSize);
    gl.uniform1f(uSizeRandomness, sizeRandomness);
    gl.uniform1f(uCameraDistance, cameraDistance);
    gl.uniform1f(uAlphaParticles, alphaParticles ? 1.0 : 0.0);
    gl.uniform1f(uGlow, glow);
    gl.uniform1f(uTwinkle, twinkle);
    gl.uniform1f(uOpacity, opacity);
    gl.uniform1f(uVariation, variation);
    gl.uniform1f(uDepthOfField, depthOfField);
    gl.uniform1i(uShape, shapeIndex);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uPixelRatio, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      const x = ((e.clientX - rect.left) / w) * 2 - 1;
      const y = -(((e.clientY - rect.top) / h) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let animationFrameId = 0;
    let lastTime = performance.now();
    const mountTime = lastTime;
    let elapsed = 0;
    let rotZ = 0;
    let currentTransX = 0;
    let currentTransY = 0;

    const update = (now: number) => {
      animationFrameId = window.requestAnimationFrame(update);
      const delta = now - lastTime;
      lastTime = now;
      elapsed += delta * speed;

      const timeSec = elapsed * 0.001;
      gl.uniform1f(uTime, timeSec);

      const sinceMount = (now - mountTime) * 0.001;
      const introProgress = intro
        ? 1 - Math.pow(1 - Math.min(1, sinceMount / 1.2), 3)
        : 1;
      gl.uniform1f(uIntro, Math.max(0.05, introProgress));

      if (moveParticlesOnHover) {
        const dir = hoverEffect === 'attract' ? 1 : -1;
        const targetX = mouseRef.current.x * particleHoverFactor * dir;
        const targetY = mouseRef.current.y * particleHoverFactor * dir;
        currentTransX += (targetX - currentTransX) * 0.08;
        currentTransY += (targetY - currentTransY) * 0.08;
        gl.uniform2f(uTranslation, currentTransX, currentTransY);
      } else {
        gl.uniform2f(uTranslation, 0, 0);
      }

      let driftX = 0;
      let driftY = 0;
      if (drift !== 'none') {
        const dAmount = ((now - mountTime) * 0.0002 * driftSpeed) % 2.0;
        if (drift === 'up') driftY = dAmount;
        if (drift === 'down') driftY = -dAmount;
        if (drift === 'left') driftX = -dAmount;
        if (drift === 'right') driftX = dAmount;
      }
      gl.uniform2f(uDriftOffset, driftX, driftY);

      if (!disableRotation) {
        const rotX = Math.sin(elapsed * 0.0002) * 0.1;
        const rotY = Math.cos(elapsed * 0.0005) * 0.15;
        rotZ += 0.01 * speed;
        gl.uniform3f(uRotation, rotX, rotY, rotZ);
      } else {
        gl.uniform3f(uRotation, 0, 0, 0);
      }

      if (lightMode) {
        gl.clearColor(0.96, 0.96, 0.96, 1.0);
      } else {
        gl.clearColor(0, 0, 0, 0);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.POINTS, 0, count);
    };

    animationFrameId = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (moveParticlesOnHover) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(randBuffer);
      gl.deleteBuffer(colBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    hoverEffect,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    glow,
    twinkle,
    shape,
    depthOfField,
    drift,
    driftSpeed,
    variation,
    opacity,
    intro,
    lightMode,
  ]);

  return <div ref={containerRef} className={`particles-container ${className}`.trim()} />;
});

export default Particles;
