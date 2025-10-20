// File: main.js

import { Axes } from "./models/Axes.js";
import { CrobatBody } from "./models/CrobatBody.js";
import { CrobatEye } from "./models/CrobatEye.js";
import { CrobatEar } from "./models/CrobatEar.js";
// import { CrobatMouth } from "./models/CrobatMouth.js";
import { CrobatMouthAndTeeth } from "./models/CrobatMouthAndTeeth.js";
import { CrobatWing } from "./models/CrobatWing.js";

// === MAIN FUNCTION ===
function main() {
  // --- KODE IMPROVEMENT UNTUK RESOLUSI TAJAM ---
  const CANVAS = document.getElementById("mycanvas");

  // 1. Dapatkan rasio piksel perangkat
  const dpr = window.devicePixelRatio || 1;

  // 2. Set ukuran buffer gambar (resolusi asli)
  //    Kalikan ukuran CSS dengan rasio piksel
  CANVAS.width = window.innerWidth * dpr;
  CANVAS.height = window.innerHeight * dpr;

  // 3. Set ukuran tampilan (CSS)
  //    Ini memberitahu browser untuk mengecilkan canvas resolusi tinggi
  //    agar pas di layar, membuatnya super tajam.
  CANVAS.style.width = window.innerWidth + "px";
  CANVAS.style.height = window.innerHeight + "px";

  let GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
    GL.getExtension("OES_element_index_uint");
  } catch (e) {
    alert("WebGL tidak didukung oleh browser Anda!");
    return false;
  }

  // --- SHADER SETUP (Sama seperti sebelumnya) ---
  const shader_vertex_source = `attribute vec3 position; attribute vec3 color; attribute vec3 normal; uniform mat4 Pmatrix, Vmatrix, Mmatrix; varying vec3 vColor; varying vec3 vNormal; varying vec3 vView; void main(void) { gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0); vNormal = normalize(mat3(Mmatrix) * normal); vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.)); vColor = color; }`;
  const shader_fragment_source = `precision mediump float; varying vec3 vColor; varying vec3 vNormal; varying vec3 vView; uniform vec3 lightDirection; uniform vec3 lightColor; uniform vec3 ambientColor; void main(void) { vec3 N = normalize(vNormal); vec3 L = normalize(lightDirection); vec3 V = normalize(-vView); vec3 R = reflect(-L, N); float diffuse = max(dot(N, L), 0.0); float specular = pow(max(dot(V, R), 0.0), 100.0); vec3 finalColor = ambientColor + (diffuse * lightColor) + (specular * lightColor); gl_FragColor = vec4(vColor * finalColor, 1.0); }`;

  const compile_shader = (source, type) => {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      console.error("Shader compilation error:", GL.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(
    SHADER_PROGRAM,
    compile_shader(shader_vertex_source, GL.VERTEX_SHADER)
  );
  GL.attachShader(
    SHADER_PROGRAM,
    compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER)
  );
  GL.linkProgram(SHADER_PROGRAM);

  const _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  const _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  const _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
  const _lightDirection = GL.getUniformLocation(
    SHADER_PROGRAM,
    "lightDirection"
  );
  const _lightColor = GL.getUniformLocation(SHADER_PROGRAM, "lightColor");
  const _ambientColor = GL.getUniformLocation(SHADER_PROGRAM, "ambientColor");
  const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  const _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");

  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_normal);
  GL.useProgram(SHADER_PROGRAM);

  // --- INSTANSIASI OBJEK ---
  const axes = new Axes(GL, _position, _color, _normal);
  const crobatBody = new CrobatBody(
    GL,
    _position,
    _color,
    _normal,
    1.5,
    100,
    100
  );
  const leftEye = new CrobatEye(GL, _position, _color, _normal); // <-- Cukup satu instance per mata
  const rightEye = new CrobatEye(GL, _position, _color, _normal);
  const leftEar = new CrobatEar(GL, _position, _color, _normal); // <-- TAMBAHKAN BARIS INI
  const rightEar = new CrobatEar(GL, _position, _color, _normal); // <-- TAMBAHKAN BARIS INI
  // const mouth = new CrobatMouth(GL, _position, _color, _normal); // <-- TAMBAHKAN
  const mouthAndTeeth = new CrobatMouthAndTeeth(GL, _position, _color, _normal);

  // --- MATRICES AND CAMERA ---
  const PROJMATRIX = LIBS.get_projection(
    40,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  const VIEWMATRIX = LIBS.get_I4();

  // --- INTERACTION VARIABLES ---
  let THETA = 0,
    PHI = 0;
  let drag = false,
    x_prev = 0,
    y_prev = 0,
    dX = 0,
    dY = 0;
  let cameraZ = -10;
  const FRICTION = 0.95;

  // --- EVENT LISTENERS ---
  CANVAS.addEventListener("mousedown", (e) => {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });
  CANVAS.addEventListener("mouseup", () => {
    drag = false;
  });
  CANVAS.addEventListener("mouseout", () => {
    drag = false;
  });
  CANVAS.addEventListener("mousemove", (e) => {
    if (!drag) return;
    dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });
  CANVAS.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomSpeed = 0.01;
    cameraZ += e.deltaY * zoomSpeed;
    cameraZ = Math.max(-20, Math.min(-3, cameraZ));
  });

  // --- RENDER SETUP ---
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.1, 0.1, 0.1, 1.0);
  GL.clearDepth(1.0);

  // --- RENDER LOOP ---
  const render = () => {
    if (!drag) {
      dX *= FRICTION;
      dY *= FRICTION;
      THETA += dX;
      PHI += dY;
    }

    LIBS.set_I4(VIEWMATRIX);
    LIBS.translateZ(VIEWMATRIX, cameraZ);
    LIBS.rotateY(VIEWMATRIX, THETA);
    LIBS.rotateX(VIEWMATRIX, PHI);

    const cameraDirection = [-VIEWMATRIX[2], -VIEWMATRIX[6], -VIEWMATRIX[10]];

    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniform3fv(_lightDirection, cameraDirection);
    GL.uniform3fv(_lightColor, [1.0, 1.0, 1.0]);
    GL.uniform3fv(_ambientColor, [0.5, 0.5, 0.5]);

    const M_SCENE = LIBS.get_I4();
    axes.render(GL, _Mmatrix, M_SCENE);

    // --- BADAN CROBAT (Parent dari semua) ---
    const M_BODY = LIBS.get_I4();
    LIBS.scale(M_BODY, 0.84, 0.93, 0.8);
    LIBS.rotateX(M_BODY, 0.3);
    crobatBody.render(GL, _Mmatrix, LIBS.multiply(M_SCENE, M_BODY));

    // ... di dalam fungsi render() di main.js ...
    // --- MATA KIRI ---
    const M_LEFT_EYE = leftEye.modelMatrix;
    LIBS.set_I4(M_LEFT_EYE); // Reset
    LIBS.scale(M_LEFT_EYE, 1.3, 1.3, 1.0);

    // **** TAMBAHKAN BARIS INI UNTUK MEMBALIK ALIS ****
    LIBS.scale(M_LEFT_EYE, -1, 1, 1); // Balik secara horizontal

    LIBS.rotateZ(M_LEFT_EYE, -0.35); // Gunakan rotasi positif yang sama
    LIBS.translateZ(M_LEFT_EYE, 1.15);
    LIBS.translateX(M_LEFT_EYE, -0.55);
    LIBS.translateY(M_LEFT_EYE, 0.45);
    leftEye.render(GL, _Mmatrix, M_BODY);

    // --- MATA KANAN ---
    const M_RIGHT_EYE = rightEye.modelMatrix;
    LIBS.set_I4(M_RIGHT_EYE); // Reset
    LIBS.scale(M_RIGHT_EYE, 1.3, 1.3, 1.0); // <-- TAMBAHKAN BARIS INI (perbesar 30%)
    LIBS.rotateZ(M_RIGHT_EYE, 0.35);
    LIBS.translateZ(M_RIGHT_EYE, 1.15);
    LIBS.translateX(M_RIGHT_EYE, 0.55);
    LIBS.translateY(M_RIGHT_EYE, 0.45);
    rightEye.render(GL, _Mmatrix, M_BODY);

    // ...

    // ... di dalam fungsi render() di main.js ...

    // --- TELINGA KIRI ---
    const M_LEFT_EAR = leftEar.modelMatrix;
    LIBS.set_I4(M_LEFT_EAR);

    // URUTAN YANG BENAR:
    LIBS.translateX(M_LEFT_EAR, -0.45); // 1. Posisikan dulu di samping
    LIBS.translateY(M_LEFT_EAR, 0.75); // 2. Posisikan di atas

    LIBS.rotateX(M_LEFT_EAR, -0.3); // 3. Miringkan ke belakang
    LIBS.rotateZ(M_LEFT_EAR, 0.25); // 4. Miringkan ke samping
    // LIBS.rotateX(M_LEFT_EAR, Math.PI);   // <-- Kita tidak butuh ini lagi dengan model baru
    LIBS.scale(M_LEFT_EAR, 0.4, 0.8, 0.4); // 5. Atur ukurannya

    leftEar.render(GL, _Mmatrix, M_BODY);

    // --- TELINGA KANAN ---
    const M_RIGHT_EAR = rightEar.modelMatrix;
    LIBS.set_I4(M_RIGHT_EAR);

    // URUTAN YANG BENAR:
    LIBS.translateX(M_RIGHT_EAR, 0.45); // 1. Posisikan dulu di samping
    LIBS.translateY(M_RIGHT_EAR, 0.75); // 2. Posisikan di atas

    LIBS.rotateX(M_RIGHT_EAR, -0.3); // 3. Miringkan ke belakang
    LIBS.rotateZ(M_RIGHT_EAR, -0.25); // 4. Miringkan ke samping
    // LIBS.rotateX(M_RIGHT_EAR, Math.PI);  // <-- Kita tidak butuh ini lagi
    LIBS.scale(M_RIGHT_EAR, 0.4, 0.8, 0.4); // 5. Atur ukurannya

    rightEar.render(GL, _Mmatrix, M_BODY);

    // =========================================================

    // --- MULUT ---
    // const M_MOUTH = mouth.modelMatrix;
    // LIBS.set_I4(M_MOUTH);
    // LIBS.translateZ(M_MOUTH, 1.185);  // Majukan sedikit
    // LIBS.translateY(M_MOUTH, -0.25); // Turunkan
    // LIBS.rotateX(M_MOUTH, -0.18);
    // mouth.render(GL, _Mmatrix, M_BODY);

    // =========================================================
    // GANTI BLOK RENDER MULUT DAN GIGI LAMA DENGAN YANG INI
    // --- MULUT DAN GIGI ---
    const M_MOUTH_TEETH = mouthAndTeeth.modelMatrix;
    LIBS.set_I4(M_MOUTH_TEETH);
    LIBS.translateZ(M_MOUTH_TEETH, 1.21);
    LIBS.translateY(M_MOUTH_TEETH, -0.17);
    LIBS.rotateX(M_MOUTH_TEETH, -0.22);
    mouthAndTeeth.render(GL, _Mmatrix, M_BODY);
    // =========================================================

    // --- INSTANSIASI OBJEK ---
    // ... (setelah mouthAndTeeth)
    const upperLeftWing = new CrobatWing(GL, _position, _color, _normal);
    const upperRightWing = new CrobatWing(GL, _position, _color, _normal);
    const lowerLeftWing = new CrobatWing(GL, _position, _color, _normal);
    const lowerRightWing = new CrobatWing(GL, _position, _color, _normal);

    // ... (setelah render mouthAndTeeth)

    // =========================================================
    // --- SAYAP ATAS ---
    // =========================================================
    const M_UPPER_LEFT_WING = upperLeftWing.modelMatrix;
    LIBS.set_I4(M_UPPER_LEFT_WING);
    LIBS.scale(M_UPPER_LEFT_WING, 1.0, 1.0, 1.0); // Skala normal
    LIBS.rotateY(M_UPPER_LEFT_WING, 0.4); // Sedikit ke belakang
    LIBS.rotateZ(M_UPPER_LEFT_WING, 0); // Miring ke atas
    LIBS.translateX(M_UPPER_LEFT_WING, 2); // Posisikan di "bahu" kiri
    LIBS.translateY(M_UPPER_LEFT_WING, 1.0);
    upperLeftWing.render(GL, _Mmatrix, M_BODY);

    const M_UPPER_RIGHT_WING = upperRightWing.modelMatrix;
    LIBS.set_I4(M_UPPER_RIGHT_WING);
    LIBS.scale(M_UPPER_RIGHT_WING, -1.0, 1.0, 1.0); // Balik untuk sisi kanan
    LIBS.rotateY(M_UPPER_RIGHT_WING, -0.4);
    LIBS.rotateZ(M_UPPER_RIGHT_WING, 0);
    LIBS.translateX(M_UPPER_RIGHT_WING, -2); // X tetap negatif karena sudah dibalik
    LIBS.translateY(M_UPPER_RIGHT_WING, 1.0);
    upperRightWing.render(GL, _Mmatrix, M_BODY);

    // =========================================================
    // --- SAYAP BAWAH ---
    // =========================================================
    const M_LOWER_LEFT_WING = lowerLeftWing.modelMatrix;
    LIBS.set_I4(M_LOWER_LEFT_WING);
    LIBS.scale(M_LOWER_LEFT_WING, 0.5, 0.25, 0.25); // Buat 20% lebih kecil
    LIBS.rotateY(M_LOWER_LEFT_WING, 3.2);
    LIBS.rotateZ(M_LOWER_LEFT_WING, 3.25); // Sedikit lebih miring ke atas
    LIBS.translateX(M_LOWER_LEFT_WING, 0); // Posisikan di "pinggul" kiri
    LIBS.translateY(M_LOWER_LEFT_WING, -1);
    lowerLeftWing.render(GL, _Mmatrix, M_BODY);

    const M_LOWER_RIGHT_WING = lowerRightWing.modelMatrix;
    LIBS.set_I4(M_LOWER_RIGHT_WING);
    LIBS.scale(M_LOWER_RIGHT_WING, -0.5, 0.25, 0.25); // Balik dan kecilkan
    LIBS.rotateY(M_LOWER_RIGHT_WING, 3);
    LIBS.rotateZ(M_LOWER_RIGHT_WING, 3);
    LIBS.translateX(M_LOWER_RIGHT_WING, 0.0);
    LIBS.translateY(M_LOWER_RIGHT_WING, -1);
    lowerRightWing.render(GL, _Mmatrix, M_BODY);

    // =========================================================

    GL.flush();
    window.requestAnimationFrame(render);
  };

  render();
}

main();
