/*
 * main.js - Complete Scene Graph Implementation for Zubat
 * VERSI PERBAIKAN:
 * - Menggunakan arsitektur Scene Graph
 * - Menerapkan kamera orbit (Model diam, kamera berputar)
 * - [PERBAIKAN VISUAL] Ditambahkan Hi-DPI / devicePixelRatio handling
 * - [PERBAIKAN ANIMASI] Ditambahkan animasi float naik-turun
 */
import { Node } from "./models/Node.js";
import { Axes } from "./models/Axes.js";
import { ZubatLowerBody } from "./models/ZubatLowerBody.js";
import { ZubatUpperBody } from "./models/ZubatUpperBody.js";
import { ZubatEar } from "./models/ZubatEar.js";
import { ZubatWing } from "./models/ZubatWing.js";

function main() {
  const CANVAS = document.getElementById("mycanvas");

  // --- PERBAIKAN 1: Hapus pengaturan width/height yang lama ---
  // (Sudah ada di file 1)

  let GL;

  // --- PERBAIKAN 2: Tambahkan fungsi resize handler Hi-DPI ---
  /**
   * Mengatur ukuran buffer gambar kanvas agar sesuai dengan resolusi fisik
   * perangkat untuk rendering yang tajam (Hi-DPI aware).
   */
  function resizeCanvasToDisplaySize(canvas) {
    const dpr = window.devicePixelRatio || 1;
    // Hitung ukuran piksel fisik yang diperlukan
    const displayWidth = Math.round(canvas.clientWidth * dpr);
    const displayHeight = Math.round(canvas.clientHeight * dpr);

    // Cek jika ukuran buffer kanvas sudah berbeda
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      // Jadikan kanvas berukuran sama dengan piksel fisiknya
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Atur viewport WebGL agar sesuai (HANYA JIKA GL SUDAH ADA)
      if (GL) {
        GL.viewport(0, 0, canvas.width, canvas.height);
      }
      return true; // Ukuran berubah
    }
    return false; // Ukuran tetap sama
  }

  // Panggil sekali saat startup untuk mengatur ukuran awal
  resizeCanvasToDisplaySize(CANVAS);

  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL tidak didukung!");
    return false;
  }

  // Atur viewport awal setelah GL context didapat
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
  // (Tidak ada perubahan di bagian ini, posisi tetap paten)

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

  // --- PERBAIKAN 3: Ubah PROJMATRIX menjadi 'let' dan buat fungsi update ---
  let PROJMATRIX = LIBS.get_I4(); // Deklarasikan dengan let
  const MOVEMATRIX = LIBS.get_I4();
  const VIEWMATRIX = LIBS.get_I4();

  /**
   * Fungsi baru untuk meng-update matriks proyeksi
   * berdasarkan rasio aspek kanvas saat ini.
   */
  function updateProjectionMatrix() {
    PROJMATRIX = LIBS.get_projection(
      40,
      CANVAS.width / CANVAS.height, // Gunakan rasio aspek yang benar
      1,
      100
    );
  }

  // Panggil sekali untuk inisialisasi
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

  // --- PERBAIKAN 4: Tambahkan listener untuk window resize ---
  window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(CANVAS);
    // Penting: Update matriks proyeksi saat aspect ratio berubah
    updateProjectionMatrix();
  });

  // --- RENDER SETUP ---
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.1, 0.1, 0.1, 1.0);
  GL.clearDepth(1.0);

  /*========================= ANIMATION LOOP ========================= */
  const animate = () => {
    time += 0.05; //

    // --- Logika Interaksi (Kamera) ---
    if (!drag) {
      dX *= FRICTION;
      dY *= FRICTION;
      THETA += dX;
      PHI += dY;
    }

    // --- Setup View Matrix (Kamera) ---
    LIBS.set_I4(VIEWMATRIX);
    LIBS.translateZ(VIEWMATRIX, cameraZ);
    LIBS.rotateY(VIEWMATRIX, THETA);
    LIBS.rotateX(VIEWMATRIX, PHI);

    // --- Setup Pencahayaan ---
    const cameraDirection = [-VIEWMATRIX[2], -VIEWMATRIX[6], -VIEWMATRIX[10]];

    // --- Clear Screen ---
    // --- PERBAIKAN 5: Hapus panggilan GL.viewport() dari loop ---
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // --- Set Uniforms ---
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniform3fv(_lightDirection, cameraDirection);
    GL.uniform3fv(_lightColor, [1.0, 1.0, 1.0]);
    GL.uniform3fv(_ambientColor, [0.5, 0.5, 0.5]);

    /*================= WING FLAPPING ANIMATION =================*/
    const flapSpeed = 1.0;
    const flapAmplitude = 0.15;
    const flapAngle = Math.sin(time * flapSpeed) * flapAmplitude;

    // Rebuild left wing local matrix with animation
    LIBS.set_I4(leftWing.localMatrix);
    LIBS.translateY(leftWing.localMatrix, 0.0);
    LIBS.translateX(leftWing.localMatrix, 0.5);
    LIBS.rotateZ(leftWing.localMatrix, 0.4 + flapAngle);
    LIBS.rotateY(leftWing.localMatrix, 0.2);

    // Rebuild right wing local matrix with opposite animation
    LIBS.set_I4(rightWing.localMatrix);
    LIBS.scale(rightWing.localMatrix, -1, 1, 1);
    LIBS.translateY(rightWing.localMatrix, 0.0);
    LIBS.translateX(rightWing.localMatrix, -0.5);
    LIBS.rotateZ(rightWing.localMatrix, -0.4 - flapAngle);
    LIBS.rotateY(rightWing.localMatrix, -0.2);

    /*================= SET GLOBAL ROTATION =================*/
    // Model tetap di (0,0,0) relatif terhadap world
    LIBS.set_I4(MOVEMATRIX); //

    // --- PERBAIKAN: Tambahkan animasi float dari file Golbat ---
    /*================= ANIMASI FLOAT NAIK-TURUN (BARU) =================*/
    // Parameter untuk gerakan naik-turun
    var floatSpeed = 1.5; // Seberapa cepat naik-turun
    var floatAmplitude = 0.2; // Seberapa jauh naik-turunnya

    // Hitung posisi Y baru menggunakan sinus (berdasarkan 'time')
    var floatY = Math.sin(time * floatSpeed) * floatAmplitude;

    // Terapkan translasi Y ke MATRIKS GLOBAL (MOVEMATRIX)
    LIBS.translateY(MOVEMATRIX, floatY);
    /*================= AKHIR ANIMASI FLOAT =================*/
    // -----------------------------------------------------------

    /*================= DRAW ENTIRE SCENE GRAPH =================*/
    zubatModel.draw(MOVEMATRIX, _Mmatrix); //

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate();
}

main();
