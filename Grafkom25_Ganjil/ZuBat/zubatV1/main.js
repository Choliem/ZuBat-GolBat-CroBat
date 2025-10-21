/*
 * ===================================================================
 * main.js - Sutradara Proyek (Final)
 * ===================================================================
 *
 * TUGAS UTAMA:
 * 1. Setup WebGL, Shader, dan Viewport.
 * 2. KRITERIA RENDERING: Mengatasi masalah "buram" dengan resize Hi-DPI.
 * 3. KRITERIA PERAKITAN: Merakit semua bagian Zubat dalam satu Scene Graph.
 * 4. KRITERIA INTERAKSI: Mengelola kamera orbit (mouse) dan matriks.
 * 5. KRITERIA ANIMASI: Menjalankan 3 jenis animasi (Flap, Float, Flip).
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

  // ===================================================================
  // KRITERIA 3: PENJELASAN FUNGSI RENDERING (Anti-Buram/Pixelated)
  // ===================================================================
  /**
   * Mengatur ukuran buffer gambar kanvas agar sesuai dengan resolusi fisik
   * perangkat (Hi-DPI aware) untuk rendering yang tajam.
   * @param {HTMLCanvasElement} canvas Kanvas WebGL
   */
  function resizeCanvasToDisplaySize(canvas) {
    // Dapatkan rasio piksel fisik ke piksel CSS (misal: 2.0 di layar Retina)
    const dpr = window.devicePixelRatio || 1;

    // Hitung ukuran piksel fisik yang diperlukan
    const displayWidth = Math.round(canvas.clientWidth * dpr);
    const displayHeight = Math.round(canvas.clientHeight * dpr);

    // Hanya update jika ukurannya benar-benar berubah
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      if (GL) {
        // Update viewport WebGL agar sesuai dengan ukuran buffer baru
        GL.viewport(0, 0, canvas.width, canvas.height);
      }
      return true;
    }
    return false;
  }
  // Panggil sekali saat startup untuk mengatur ukuran awal
  resizeCanvasToDisplaySize(CANVAS);

  // ===================================================================
  // Setup WebGL, Shader, dan Attribute
  // ===================================================================
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL tidak didukung!");
    return false;
  }

  // Atur viewport awal setelah GL context didapat
  GL.viewport(0, 0, GL.canvas.width, GL.canvas.height);
  GL.getExtension("OES_element_index_uint");

  // --- SHADERS (Phong Shading Sederhana) ---
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

  // --- Kompilasi Shader ---
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

  // --- Lokasi Uniform & Attribute ---
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

  // Kumpulkan lokasi attribute ke dalam satu objek untuk di-pass ke constructor
  const attribs = {
    _position: _position,
    _color: _color,
    _normal: _normal,
  };

  // ===================================================================
  // KRITERIA 1 & 5: PERAKITAN SCENE GRAPH
  // ===================================================================
  // ALGORITMA:
  // 1. Buat 'zubatModel' sebagai Node akar (root).
  // 2. Buat setiap bagian tubuh (Badan, Telinga, Sayap) sebagai Node.
  // 3. Atur transformasi LOKAL setiap bagian (posisi, rotasi, skala).
  // 4. Masukkan semua bagian sebagai 'child' dari 'zubatModel'.
  //    (Catatan: Gigi (ZubatTooth) sudah otomatis dimasukkan sebagai child
  //     oleh constructor 'ZubatUpperBody').

  const zubatModel = new Node();

  // --- BAGIAN 1: BADAN (UPPER & LOWER) ---
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

  // --- BAGIAN 2: TELINGA (LEFT & RIGHT) ---
  const leftEar = new ZubatEar(GL, attribs, {
    segments: 20,
    rings: 10,
    bluntness: 0.3,
  });
  // Parameter Koordinat Telinga Kiri
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
  // Parameter Koordinat Telinga Kanan
  LIBS.translateY(rightEar.localMatrix, 4.3);
  LIBS.translateX(rightEar.localMatrix, 1.5);
  LIBS.translateZ(rightEar.localMatrix, 1.1);
  LIBS.rotateZ(rightEar.localMatrix, -3.5);
  LIBS.rotateY(rightEar.localMatrix, 0.2);

  zubatModel.add(leftEar);
  zubatModel.add(rightEar);

  // --- BAGIAN 3: SAYAP (LEFT & RIGHT) ---
  const leftWing = new ZubatWing(GL, attribs);
  const rightWing = new ZubatWing(GL, attribs);

  // Posisi Awal Sayap Kiri
  LIBS.translateY(leftWing.localMatrix, 0.0);
  LIBS.translateX(leftWing.localMatrix, 0.5);
  LIBS.rotateZ(leftWing.localMatrix, 0.4);
  LIBS.rotateY(leftWing.localMatrix, 0.2);

  // Posisi Awal Sayap Kanan (Dicerminkan/Mirrored)
  LIBS.scale(rightWing.localMatrix, -1, 1, 1); // <-- Kunci pencerminan
  LIBS.translateY(rightWing.localMatrix, 0.0);
  LIBS.translateX(rightWing.localMatrix, -0.5);
  LIBS.rotateZ(rightWing.localMatrix, -0.4);
  LIBS.rotateY(rightWing.localMatrix, -0.2);

  zubatModel.add(leftWing);
  zubatModel.add(rightWing);

  // ===================================================================
  // KRITERIA 3 & 4: MATRIKS, INTERAKSI, & PARAMETER ANIMASI
  // ===================================================================

  let PROJMATRIX = LIBS.get_I4();
  const MOVEMATRIX = LIBS.get_I4(); // Matriks GLOBAL untuk model (dipakai untuk Float & Flip)
  const VIEWMATRIX = LIBS.get_I4(); // Matriks KAMERA (dipakai untuk Orbit)

  // Fungsi untuk update Proyeksi saat Jendela di-resize
  function updateProjectionMatrix() {
    PROJMATRIX = LIBS.get_projection(
      40, // angle (Field of View)
      CANVAS.width / CANVAS.height, // aspect ratio
      1, // zMin (near)
      100 // zMax (far)
    );
  }
  updateProjectionMatrix(); // Panggil sekali saat inisialisasi

  // --- Variabel Interaksi Kamera Orbit ---
  let THETA = 0, // Rotasi Y (Kiri/Kanan)
    PHI = 0; // Rotasi X (Atas/Bawah)
  let time = 0; // Timer global untuk animasi
  let drag = false,
    x_prev = 0,
    y_prev = 0,
    dX = 0,
    dY = 0;
  let cameraZ = -10; // Jarak zoom kamera
  const FRICTION = 0.95; // Efek 'licin' saat mouse dilepas

  // --- Variabel State untuk Animasi Flip (Salto) ---
  let lastFlipTime = performance.now();
  let flipStartTime = 0;
  let isFlipping = false;
  const flipInterval = 5000; // Interval 5 detik
  const flipDuration = 1000; // Durasi salto 1 detik

  // --- Event Listeners untuk Mouse (Kamera Orbit) ---
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

  // Listener untuk window resize (memperbaiki aspect ratio & Hi-DPI)
  window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(CANVAS);
    updateProjectionMatrix();
  });

  // --- Render Setup ---
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.1, 0.1, 0.1, 1.0); // KRITERIA 3: Warna background
  GL.clearDepth(1.0);

  // ===================================================================
  // KRITERIA 4 & 5: ANIMATION LOOP
  // ===================================================================
  const animate = () => {
    // Dapatkan 'currentTime' untuk animasi Flip
    const currentTime = performance.now();
    time += 0.05; // Timer untuk animasi Flap dan Float

    // --- Update Kamera Orbit (VIEWMATRIX) ---
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

    // Arah cahaya mengikuti kamera
    const cameraDirection = [-VIEWMATRIX[2], -VIEWMATRIX[6], -VIEWMATRIX[10]];

    // --- Clear Screen ---
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // --- Set Uniforms ---
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniform3fv(_lightDirection, cameraDirection);
    GL.uniform3fv(_lightColor, [1.0, 1.0, 1.0]); // KRITERIA 3: Warna Cahaya
    GL.uniform3fv(_ambientColor, [0.5, 0.5, 0.5]); // KRITERIA 3: Warna Ambient

    // --- ANIMASI 1: Kepak Sayap (Lokal) ---
    // ALGORITMA: Memodifikasi 'localMatrix' sayap setiap frame.
    const flapSpeed = 1.0;
    const flapAmplitude = 0.15;
    const flapAngle = Math.sin(time * flapSpeed) * flapAmplitude;

    // Update matriks LOKAL sayap kiri
    LIBS.set_I4(leftWing.localMatrix);
    LIBS.translateY(leftWing.localMatrix, 0.0);
    LIBS.translateX(leftWing.localMatrix, 0.5);
    LIBS.rotateZ(leftWing.localMatrix, 0.4 + flapAngle); // <-- Animasi
    LIBS.rotateY(leftWing.localMatrix, 0.2);

    // Update matriks LOKAL sayap kanan
    LIBS.set_I4(rightWing.localMatrix);
    LIBS.scale(rightWing.localMatrix, -1, 1, 1);
    LIBS.translateY(rightWing.localMatrix, 0.0);
    LIBS.translateX(rightWing.localMatrix, -0.5);
    LIBS.rotateZ(rightWing.localMatrix, -0.4 - flapAngle); // <-- Animasi
    LIBS.rotateY(rightWing.localMatrix, -0.2);

    // --- Set Matriks Model Global ---
    // Reset matriks model global agar animasi float & flip tidak terakumulasi
    LIBS.set_I4(MOVEMATRIX);

    // --- ANIMASI 2: Mengambang / Float (Global) ---
    // ALGORITMA: Menerapkan translasi Y ke matriks GLOBAL (MOVEMATRIX).
    var floatSpeed = 1.5; // Kecepatan float
    var floatAmplitude = 0.2; // Jarak float
    var floatY = Math.sin(time * floatSpeed) * floatAmplitude;
    LIBS.translateY(MOVEMATRIX, floatY); // Terapkan ke matriks global

    // --- ANIMASI 3: Salto / Flip (Global) ---
    // ALGORITMA: Menerapkan rotasi X ke matriks GLOBAL (MOVEMATRIX)
    //            secara berkala dengan pivot.
    let flipAngle = 0.0;

    // 1. Cek timer
    if (!isFlipping && currentTime - lastFlipTime > flipInterval) {
      isFlipping = true;
      flipStartTime = currentTime;
      lastFlipTime = currentTime;
    }

    // 2. Jika sedang flipping, hitung progres
    if (isFlipping) {
      let flipProgress = (currentTime - flipStartTime) / flipDuration;
      if (flipProgress >= 1.0) {
        flipProgress = 1.0;
        isFlipping = false;
      }
      // Hitung sudut dari 0 s/d 360 derajat (salto ke belakang)
      flipAngle = flipProgress * -Math.PI * 2.0;
    }

    // 3. Terapkan rotasi salto DENGAN PIVOT
    LIBS.translateZ(MOVEMATRIX, 2.0); // 1. Geser pivot ke origin
    LIBS.rotateX(MOVEMATRIX, flipAngle); // 2. Lakukan rotasi (salto)
    LIBS.translateZ(MOVEMATRIX, -2.0); // 3. Kembalikan pivot

    // ===================================================================
    // PROSES DRAWING
    // ===================================================================
    // Hanya satu panggilan draw utama!
    // Scene Graph akan mengurus sisanya secara rekursif.
    zubatModel.draw(MOVEMATRIX, _Mmatrix);

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(); // Mulai loop
}

main();