/*
 * main.js - Complete Scene Graph Implementation for Zubat
 * VERSI PERBAIKAN:
 * - Menggunakan arsitektur Scene Graph
 * - Menerapkan kamera orbit (Model diam, kamera berputar)
 * - [PERBAIKAN VISUAL] Ditambahkan Hi-DPI / devicePixelRatio handling
 * - [PERBAIKAN ANIMASI] Ditambahkan animasi float
 * - [PERBAIKAN ANIMASI] Ditambahkan animasi flip (salto)
 */
import { Node } from "./models/Node.js";
import { Axes } from "./models/Axes.js";
import { ZubatLowerBody } from "./models/ZubatLowerBody.js";
import { ZubatUpperBody } from "./models/ZubatUpperBody.js";
import { ZubatEar } from "./models/ZubatEar.js";
import { ZubatWing } from "./models/ZubatWing.js";

function main() {
  const CANVAS = document.getElementById("mycanvas");

  let GL;

  // --- FUNGSI RESIZE HANDLER Hi-DPI ---
  function resizeCanvasToDisplaySize(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.round(canvas.clientWidth * dpr);
    const displayHeight = Math.round(canvas.clientHeight * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      if (GL) {
        GL.viewport(0, 0, canvas.width, canvas.height);
      }
      return true;
    }
    return false;
  }

  resizeCanvasToDisplaySize(CANVAS);

  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL tidak didukung!");
    return false;
  }

  GL.viewport(0, 0, GL.canvas.width, GL.canvas.height);
  GL.getExtension("OES_element_index_uint");

  // --- SHADERS ---
  const shader_vertex_source = `
    attribute vec3 position;
    attribute vec3 color;
    attribute vec3 normal;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vView;
    void main(void) {
      gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
      vNormal = normalize(mat3(Mmatrix) * normal); 
      vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
      vColor = color;
    }`;

  const shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vView;
    uniform vec3 lightDirection;
    uniform vec3 lightColor;
    uniform vec3 ambientColor;
    void main(void) {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(lightDirection);
      vec3 V = normalize(-vView);
      vec3 R = reflect(-L, N);
      float diffuse = max(dot(N, L), 0.0);
      float specular = pow(max(dot(V, R), 0.0), 100.0);
      vec3 finalColor = ambientColor + (diffuse * lightColor) + (specular * lightColor);
      gl_FragColor = vec4(vColor * finalColor, 1.0);
    }`;

  // --- SHADER COMPILATION ---
  const compile_shader = (source, type) => {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      console.error(GL.getShaderInfoLog(shader));
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

  // --- SHADER UNIFORMS AND ATTRIBUTES ---
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

  // Create attribs object
  const attribs = {
    _position: _position,
    _color: _color,
    _normal: _normal,
  };

  /*========================= BUILD SCENE GRAPH ========================= */
  // (Fondasi paten, tidak diubah)

  const zubatModel = new Node();
  const axes = new Axes(GL, attribs);
  // zubatModel.add(axes);

  // --- BODY (Upper & Lower) ---
  const zubatUpperBody = new ZubatUpperBody(GL, attribs, {
    scaleFactor: 2.5,
    latBands: 50,
    longBands: 50,
    attachTeeth: true,
    teethOptions: {
      segments: 160,
      rings: 1,
      bluntness: 0.2,
    },
  });

  const zubatLowerBody = new ZubatLowerBody(GL, attribs, {
    scaleFactor: 2.5,
    latBands: 50,
    longBands: 50,
  });

  zubatModel.add(zubatUpperBody);
  zubatModel.add(zubatLowerBody);

  // --- EARS ---
  const leftEar = new ZubatEar(GL, attribs, {
    segments: 20,
    rings: 10,
    bluntness: 0.3,
  });
  LIBS.translateY(leftEar.localMatrix, 4.3);
  LIBS.translateX(leftEar.localMatrix, -1.5);
  LIBS.translateZ(leftEar.localMatrix, 1.1);
  LIBS.rotateZ(leftEar.localMatrix, 3.5);
  LIBS.rotateY(leftEar.localMatrix, -0.2);

  const rightEar = new ZubatEar(GL, attribs, {
    segments: 20,
    rings: 10,
    bluntness: 0.3,
  });
  LIBS.translateY(rightEar.localMatrix, 4.3);
  LIBS.translateX(rightEar.localMatrix, 1.5);
  LIBS.translateZ(rightEar.localMatrix, 1.1);
  LIBS.rotateZ(rightEar.localMatrix, -3.5);
  LIBS.rotateY(rightEar.localMatrix, 0.2);

  zubatModel.add(leftEar);
  zubatModel.add(rightEar);

  // --- WINGS ---
  const leftWing = new ZubatWing(GL, attribs);
  const rightWing = new ZubatWing(GL, attribs);

  LIBS.translateY(leftWing.localMatrix, 0.0);
  LIBS.translateX(leftWing.localMatrix, 0.5);
  LIBS.rotateZ(leftWing.localMatrix, 0.4);
  LIBS.rotateY(leftWing.localMatrix, 0.2);

  LIBS.scale(rightWing.localMatrix, -1, 1, 1);
  LIBS.translateY(rightWing.localMatrix, 0.0);
  LIBS.translateX(rightWing.localMatrix, -0.5);
  LIBS.rotateZ(rightWing.localMatrix, -0.4);
  LIBS.rotateY(rightWing.localMatrix, -0.2);

  zubatModel.add(leftWing);
  zubatModel.add(rightWing);

  /*========================= MATRICES AND INTERACTION ========================= */

  let PROJMATRIX = LIBS.get_I4();
  const MOVEMATRIX = LIBS.get_I4();
  const VIEWMATRIX = LIBS.get_I4();

  function updateProjectionMatrix() {
    PROJMATRIX = LIBS.get_projection(
      40,
      CANVAS.width / CANVAS.height, // Gunakan rasio aspek yang benar
      1,
      100
    );
  }
  updateProjectionMatrix();

  let THETA = 0,
    PHI = 0,
    time = 0;
  let drag = false,
    x_prev = 0,
    y_prev = 0,
    dX = 0,
    dY = 0;
  let cameraZ = -10;
  const FRICTION = 0.95;

  // --- PERBAIKAN: Variabel state untuk Flip Animation ---
  //
  let lastFlipTime = performance.now(); // Catat waktu kapan animasi dimulai
  let flipStartTime = 0;
  let isFlipping = false;
  const flipInterval = 5000; // Interval 5 detik (sesuai kode Golbat)
  const flipDuration = 1000; // Salto berlangsung selama 1 detik
  // ----------------------------------------------------

  // --- EVENT LISTENERS (Paten) ---
  CANVAS.addEventListener("mousedown", (e) => {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
  });
  // ... (listener mouseup, mouseout, mousemove tidak berubah) ...
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

  // --- Listener untuk window resize (Paten) ---
  window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(CANVAS);
    updateProjectionMatrix();
  });

  // --- RENDER SETUP ---
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.1, 0.1, 0.1, 1.0);
  GL.clearDepth(1.0);

  /*========================= ANIMATION LOOP ========================= */
  const animate = () => {
    // --- PERBAIKAN: Dapatkan 'currentTime' untuk flip ---
    const currentTime = performance.now(); //
    time += 0.05; // (untuk float dan flap)

    // --- Logika Interaksi (Kamera Orbit Paten) ---
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

    // --- Setup Pencahayaan ---
    const cameraDirection = [-VIEWMATRIX[2], -VIEWMATRIX[6], -VIEWMATRIX[10]];

    // --- Clear Screen ---
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // --- Set Uniforms ---
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniform3fv(_lightDirection, cameraDirection);
    GL.uniform3fv(_lightColor, [1.0, 1.0, 1.0]);
    GL.uniform3fv(_ambientColor, [0.5, 0.5, 0.5]);

    /*================= WING FLAPPING ANIMATION (Paten) =================*/
    const flapSpeed = 1.0;
    const flapAmplitude = 0.15;
    const flapAngle = Math.sin(time * flapSpeed) * flapAmplitude;

    LIBS.set_I4(leftWing.localMatrix);
    LIBS.translateY(leftWing.localMatrix, 0.0);
    LIBS.translateX(leftWing.localMatrix, 0.5);
    LIBS.rotateZ(leftWing.localMatrix, 0.4 + flapAngle);
    LIBS.rotateY(leftWing.localMatrix, 0.2);

    LIBS.set_I4(rightWing.localMatrix);
    LIBS.scale(rightWing.localMatrix, -1, 1, 1);
    LIBS.translateY(rightWing.localMatrix, 0.0);
    LIBS.translateX(rightWing.localMatrix, -0.5);
    LIBS.rotateZ(rightWing.localMatrix, -0.4 - flapAngle);
    LIBS.rotateY(rightWing.localMatrix, -0.2);

    /*================= SET GLOBAL ROTATION =================*/
    // Reset matriks model global
    LIBS.set_I4(MOVEMATRIX);

    /*================= ANIMASI FLOAT NAIK-TURUN (Paten) =================*/
    var floatSpeed = 1.5;
    var floatAmplitude = 0.2;
    var floatY = Math.sin(time * floatSpeed) * floatAmplitude;
    LIBS.translateY(MOVEMATRIX, floatY);
    /*================= AKHIR ANIMASI FLOAT =================*/

    // --- PERBAIKAN: Tambahkan animasi flip dari file Golbat ---
    /*================= ANIMASI SALTO (FLIP) (BARU) =================*/
    //
    let flipAngle = 0.0; // Sudut salto default (0 = tidak salto)

    // 1. Cek apakah sudah waktunya salto lagi
    if (!isFlipping && currentTime - lastFlipTime > flipInterval) {
      isFlipping = true;
      flipStartTime = currentTime;
      lastFlipTime = currentTime; // Setel ulang timer
    }

    // 2. Jika sedang dalam proses salto
    if (isFlipping) {
      // Hitung progres salto (nilai dari 0.0 sampai 1.0)
      let flipProgress = (currentTime - flipStartTime) / flipDuration;

      if (flipProgress >= 1.0) {
        flipProgress = 1.0;
        isFlipping = false; // Selesai salto
      }

      // Hitung sudut dari 0 sampai -2*PI (salto ke BELAKANG)
      flipAngle = flipProgress * -Math.PI * 2.0;
    }

    // 3. Terapkan rotasi salto DENGAN PIVOT
    //    (Kita gunakan pivot Z=2.0 dari Golbat agar terlihat lebih dinamis)
    LIBS.translateZ(MOVEMATRIX, 2.0); // 1. Bawa pivot ke origin
    LIBS.rotateX(MOVEMATRIX, flipAngle); // 2. Lakukan rotasi (salto)
    LIBS.translateZ(MOVEMATRIX, -2.0); // 3. Kembalikan pivot
    /*================= AKHIR ANIMASI SALTO =================*/
    // -----------------------------------------------------------

    /*================= DRAW ENTIRE SCENE GRAPH =================*/
    zubatModel.draw(MOVEMATRIX, _Mmatrix);

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate();
}

main();
