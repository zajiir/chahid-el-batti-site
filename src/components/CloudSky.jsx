import { useEffect, useRef, useState } from "react";

// Ciel "time-lapse" calculé par la carte graphique (WebGL) : les nuages ne
// glissent pas, ils se forment, gonflent et se défont en dérivant avec le
// vent — inspiré des time-lapses de la Cloud Appreciation Society. Trois
// étages : voiles de cirrus en haut, cumulus au milieu, brume qui roule en bas.
//
// Rendu à basse résolution (les nuages sont flous, ça ne se voit pas), 30
// images/s au plus, en pause quand `active` est faux (page qui le recouvre).
// Renvoie onUnsupported() si WebGL n'est pas disponible.

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

// Hachage sans sinus : stable même quand le temps (et donc les coordonnées)
// grandit — pas de motifs en blocs.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Bruit lissé (interpolation quintique : pas de plis aux bords des cellules)
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p, int octaves) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    v += a * noise(p);
    p = ROT * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float y01 = frag.y / uRes.y;   // 0 en bas, 1 en haut
  vec2 uv = frag / uRes.y;        // unités = hauteur d'écran
  float t = uTime;

  // Ciel : un peu plus soutenu en haut, presque blanc vers l'horizon
  vec3 col = mix(vec3(0.992, 0.99, 1.0), vec3(0.95, 0.943, 1.0), y01);

  // --- Cirrus : voiles étirés, en haut
  vec2 c = vec2(uv.x * 0.8 - t * 0.016, uv.y * 5.0) + uMouse * 0.01;
  float ci = fbm(c + vec2(fbm(c * 0.4 + t * 0.01, 3) * 1.2, 0.0), 4);
  ci = smoothstep(0.55, 0.8, ci) * smoothstep(0.5, 0.95, y01);
  col = mix(col, vec3(1.0), ci * 0.8);

  // --- Cumulus : masses qui dérivent et se déforment (time-lapse), bords
  // bouillonnants, sommets éclairés, dessous lavande
  vec2 p = uv * 1.35 + vec2(t * 0.011, 0.0) + uMouse * 0.035;
  vec2 q = vec2(fbm(p * 0.8 + vec2(0.0, t * 0.02), 3), fbm(p * 0.8 + vec2(5.2, 1.3) - t * 0.017, 3));
  vec2 w = p + 0.55 * q;
  float base = fbm(w, 4);
  float billow = 0.0;
  float ba = 0.5;
  vec2 bp = w * 3.2 + vec2(t * 0.035, -t * 0.01);
  for (int i = 0; i < 3; i++) {
    billow += ba * abs(noise(bp) * 2.0 - 1.0);
    bp = ROT * bp;
    ba *= 0.5;
  }
  float mass = smoothstep(0.40, 0.60, base);
  float cover = smoothstep(0.05, 0.6, clamp(mass * 1.25 - billow * 0.55, 0.0, 1.0));
  float baseAbove = fbm(w + vec2(0.0, 0.12), 4);
  float lit = clamp(0.62 + (base - baseAbove) * 5.0 + (0.5 - billow) * 0.5, 0.0, 1.0);
  vec3 cloud = mix(vec3(0.76, 0.72, 0.95), vec3(1.0), lit);
  col = mix(col, cloud, cover * 0.92);

  // --- Brume qui roule au ras du bas de l'écran
  float m = fbm(vec2(uv.x * 1.3 - t * 0.024, uv.y * 2.6 - t * 0.008) + uMouse * 0.05, 4);
  float mist = smoothstep(0.4, 0.7, m) * smoothstep(0.34, 0.0, y01);
  col = mix(col, vec3(0.975, 0.97, 1.0), mist * 0.85);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  // Commentaires retirés : certains pilotes refusent les caractères accentués.
  gl.shaderSource(shader, source.replace(/\/\/[^\n]*/g, ""));
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function CloudSky({ active = true, className = "", onUnsupported }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const [failed, setFailed] = useState(false);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      }) || null;
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!gl || !vs || !fs) {
      setFailed(true);
      onUnsupported?.();
      return;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      onUnsupported?.();
      return;
    }
    gl.useProgram(program);

    // Un triangle qui couvre tout l'écran
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");

    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const scale = mobile ? 0.35 : 0.5; // résolution de calcul (le flou des nuages le permet)
    function resize() {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    }
    resize();
    window.addEventListener("resize", resize);

    // Souris : léger effet de profondeur (lissé)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = 0.5 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Le ciel démarre à un moment différent à chaque visite.
    const t0 = performance.now() - Math.random() * 600000;
    const draw = (now) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    draw(performance.now());

    let raf = 0;
    let lost = false;
    const onLost = (e) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let last = 0;
      const frame = (now) => {
        raf = requestAnimationFrame(frame);
        if (lost || !activeRef.current || now - last < 33) return; // ~30 i/s
        last = now;
        draw(now);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return null;
  return <canvas ref={canvasRef} className={"cloud-sky " + className} aria-hidden="true" />;
}
