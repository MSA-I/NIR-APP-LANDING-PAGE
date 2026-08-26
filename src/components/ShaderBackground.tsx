// The ground under the title page and the close.
//
// From 21st.dev: @paper-design/fluted-glass-folds (id 21875), adapted from
// Paper Shaders under Apache-2.0. Fluted glass, not a mesh gradient: the
// owner's note on 26.08.2026 was that the gradient this build shipped first
// read as a smear rather than as a shader, and fluted glass is a material a
// serious product can stand behind. Ribbed panes, a slow fold travelling
// through them, and light catching the crown of each rib.
//
// Three changes from the catalogue component:
//
//   1. The palette is the running product's, converted from the OKLCH tokens
//      in data/product-tokens.json: shell -> action -> action-line -> topbar.
//      scripts/gates/g3-palette.mjs fails the build if a colour appears here
//      that the application does not contain.
//   2. The pointer is gone. Not disabled, removed: the catalogue ships a
//      cursor branch in the fragment shader and four pointer listeners on
//      window, and the owner asked for a ground that does not answer the
//      mouse. Code that cannot run cannot regress.
//   3. `prefers-reduced-motion: reduce` freezes the field at t=0, so the
//      ground becomes a still pane rather than a moving one.

import { useEffect, useRef } from 'react'

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
// Six packed vectors + eight colour vectors = 14 fragment uniform vectors, two
// below WebGL1's guaranteed minimum. Macros preserve the public u_* API.
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, unused.zw

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
// Keep hash inputs inside mediump's guaranteed +-2^14 range.
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Even, un-structured white noise for film grain (Dave Hoskins hash12). The
// multiply hash above is fine for value noise but shows a faint axis-aligned
// mesh at integer fragment coords, which reads as a net over flat areas.
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// --- OKLab colour mixing (perceptual), gated by u_oklab ----------------------
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  // max() guards the sRGB branch: out-of-gamut OKLab interpolations can send a
  // channel negative, and pow(negative, ...) is NaN which mix()/step() would
  // then propagate.
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

// Mix through the recipe colours; x is clamped to 0..1. WebGL1 forbids dynamic
// uniform indexing in fragment shaders, hence the constant loop.
vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,
                          0.587, -0.274, -0.523,
                          0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0,
                          0.956, -0.272, -1.106,
                          0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

// Fluted glass. Each rib refracts the field behind it a little, and catches a
// highlight down its crown.
vec3 shade(vec2 uv, vec2 p, float t) {
  float flutes = mix(42.0, 7.0, u_paramA);
  float cell = fract((p.x + 1.0) * flutes) - 0.5;
  float prism = sin(cell * 3.1415926) * (0.03 + u_intensity * 0.2);
  vec2 samplePoint = p + vec2(prism, sin(p.x * flutes + t * 0.9) * prism * 0.55);
  float field = fbm(samplePoint * 2.2 + vec2(t * 0.11, -t * 0.08) + u_seed);
  field += 0.24 * sin(samplePoint.y * 3.0 + samplePoint.x * 1.3 + t * 0.35);
  float highlight = pow(1.0 - abs(cell) * 2.0, mix(12.0, 2.0, u_intensity));
  float shadow = smoothstep(0.18, 0.5, abs(cell));
  // The fold. The header of this file has always said a slow fold travels
  // through the ribs; until round eight only the fbm drifted, which at the
  // pace it drifted at is a still image to anyone not watching for it, and
  // that is what the owner meant by asking for a ground that is ALIVE. This
  // is the moving part: a soft band crossing the pane, lighting the crown of
  // every rib it passes and leaving them as it goes. It is a function of
  // u_time and of nothing else, so it stays a ground rather than becoming
  // something that answers the reader.
  float foldPos = fract(t * 0.055) * 1.7 - 0.35;
  float fold = exp(-pow((uv.x - foldPos) * 3.1, 2.0));
  float wake = exp(-pow((uv.x - foldPos + 0.16) * 5.0, 2.0));
  vec3 glass = palette(clamp(field + highlight * 0.3 + fold * 0.10, 0.0, 1.0));
  return glass * (0.72 + highlight * 0.42 - shadow * 0.12
    + fold * (0.16 + highlight * 0.55) - wake * 0.06);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

// The running product's own ramp, dark to light:
//   #0a171d  color-shell / color-ink   the application's chrome
//   #003f47  color-action              its primary action
//   #5d9096  color-action-line         the line that action draws
//   #e8eef1  color-topbar              the bar above every screen
export const SHADER_PALETTE = ['#0a171d', '#003f47', '#5d9096', '#e8eef1']

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
]

const PALETTE = SHADER_PALETTE.map(rgb)
const COLORS: [number, number, number][] = Array.from(
  { length: 8 },
  (_, i) => PALETTE[Math.min(i, PALETTE.length - 1)],
)

const UNIFORMS = {
  colors: COLORS,
  colorCount: PALETTE.length,
  scale: 1.62,
  // Narrow highlights. The catalogue ships 0.86, which lights the crown of
  // every rib right across the pane; behind a display headline that is a
  // texture competing with the type rather than a ground under it.
  intensity: 0.5,
  paramA: 0.34,
  warp: 0.09,
  detail: 2.4,
  contrast: 1.06,
  brightness: -0.045,
  saturation: 1.04,
  hue: 0.0,
  vignette: 0.36,
  blur: 0.0,
  grain: 0.055,
  seed: 4.0,
  rotate: 1.9373,
  offsetX: 0.0,
  offsetY: 0.0,
  // Round eight. 0.03 and 0.32 were a ground that moved about a pixel a
  // second: correct on paper, motionless to look at. Measured against the
  // title page at 1440x900, the fold now crosses the pane in about 18
  // seconds and the field underneath it never stops sliding.
  drift: 0.09,
  oklab: 1.0,
  timeScale: 0.85,
}

const pendingContextReleases = new WeakMap<HTMLCanvasElement, number>()

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pendingRelease = pendingContextReleases.get(canvas)
    if (pendingRelease !== undefined) window.clearTimeout(pendingRelease)
    pendingContextReleases.delete(canvas)
    const gl = canvas.getContext('webgl', { antialias: false })
    if (!gl) return

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timeScale = calm ? 0 : UNIFORMS.timeScale

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    const vertexShader = compile(gl.VERTEX_SHADER, VERT)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG)
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const loc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uni = {
      colors: gl.getUniformLocation(program, 'u_colors'),
      scene: gl.getUniformLocation(program, 'u_scene'),
      shape: gl.getUniformLocation(program, 'u_shape'),
      surface: gl.getUniformLocation(program, 'u_surface'),
      finish: gl.getUniformLocation(program, 'u_finish'),
      transform: gl.getUniformLocation(program, 'u_transform'),
      space: gl.getUniformLocation(program, 'u_space'),
    }
    gl.uniform3fv(uni.colors, new Float32Array(UNIFORMS.colors.flat()))
    gl.uniform4f(uni.shape, UNIFORMS.scale, UNIFORMS.intensity, UNIFORMS.paramA, UNIFORMS.warp)
    gl.uniform4f(
      uni.surface,
      UNIFORMS.detail,
      UNIFORMS.contrast,
      UNIFORMS.brightness,
      UNIFORMS.saturation,
    )
    gl.uniform4f(uni.finish, UNIFORMS.hue, UNIFORMS.vignette, UNIFORMS.blur, UNIFORMS.grain)
    gl.uniform4f(uni.transform, UNIFORMS.seed, UNIFORMS.rotate, UNIFORMS.drift, UNIFORMS.oklab)
    gl.uniform4f(uni.space, UNIFORMS.offsetX, UNIFORMS.offsetY, 0, 0)

    let bounds = canvas.getBoundingClientRect()
    let raf = 0
    let visible = document.visibilityState === 'visible'
    let inView = true
    let disposed = false
    const start = performance.now()
    const timeAnimated = Math.abs(timeScale) > 0.0001

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rawWidth = Math.max(1, Math.round(bounds.width * dpr))
      const rawHeight = Math.max(1, Math.round(bounds.height * dpr))
      const pixelScale = Math.min(
        1,
        Math.sqrt(2_000_000 / Math.max(1, rawWidth * rawHeight)),
      )
      const width = Math.max(1, Math.round(rawWidth * pixelScale))
      const height = Math.max(1, Math.round(rawHeight * pixelScale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    // Arrow functions, not declarations: a hoisted declaration loses the
    // non-null narrowing on canvas and gl that the two early returns above
    // established, and TypeScript then rejects every use inside it.
    const requestRender = () => {
      if (!disposed && visible && inView && raf === 0) {
        raf = requestAnimationFrame(render)
      }
    }

    const updateLayout = () => {
      bounds = canvas.getBoundingClientRect()
      resizeCanvas()
      requestRender()
    }
    window.addEventListener('resize', updateLayout)

    const resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(canvas)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true
      if (inView) requestRender()
      else if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    intersectionObserver.observe(canvas)
    const onVisibilityChange = () => {
      visible = document.visibilityState === 'visible'
      if (visible) requestRender()
      else if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const render = (now: number) => {
      raf = 0
      if (disposed || !visible || !inView) return
      resizeCanvas()
      gl.uniform4f(
        uni.scene,
        canvas.width,
        canvas.height,
        ((now - start) / 1000) * timeScale,
        UNIFORMS.colorCount,
      )
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (timeAnimated) requestRender()
    }
    requestRender()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('resize', updateLayout)
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
      const releaseTimer = window.setTimeout(() => {
        if (pendingContextReleases.get(canvas) !== releaseTimer) return
        pendingContextReleases.delete(canvas)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
        canvas.width = 1
        canvas.height = 1
      }, 0)
      pendingContextReleases.set(canvas, releaseTimer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
