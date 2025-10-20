/*
 * main.js
 * Konduktor utama: Mengimpor semua model, mengatur WebGL, dan menjalankan loop.
 */

// Impor semua kelas model yang kita butuhkan
import { Node } from "./models/Node.js"; // <-- IMPOR NODE BARU
import { Axes } from "./models/Axes.js";
import { GolbatUpperBody } from "./models/GolbatUpperBody.js";
import { GolbatLowerBody } from "./models/GolbatLowerBody.js";
import { GolbatEar } from "./models/GolbatEar.js";
import { GolbatTooth } from "./models/GolbatTooth.js";
import { GolbatWing } from "./models/GolbatWing.js";
import { GolbatEye } from "./models/GolbatEye.js";

function main() {
  var CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  /*========================= SHADERS (PHONG SHADING) ========================= */
  // (Shader source tidak berubah)
  var vertex_shader_source = `
    attribute vec3 position; attribute vec3 color; attribute vec3 normal;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    varying vec3 vColor; varying vec3 vNormal; varying vec3 vView;
    void main(void) {
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
        vNormal = vec3(Mmatrix * vec4(normal, 0.));
        vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
        vColor = color;
    }`;
  var fragment_shader_source = `
precision mediump float;
  varying vec3 vColor;

  void main(void) {
    gl_FragColor = vec4(vColor, 1.0); // Tampilkan warna asli
  }`;

  /*========================= WEBGL CONTEXT & SHADER PROGRAM ========================= */
  // (Bagian ini tidak berubah)
  var GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
    var uintIndexExtension = GL.getExtension("OES_element_index_uint");
    if (!uintIndexExtension) {
      console.error("WebGL extension OES_element_index_uint is not supported!");
      // You might want to display an alert here too if it's crucial
      alert("Browser/GPU does not support required WebGL extension (OES_element_index_uint). Complex models may not render.");
    }
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }
  var compile_shader = function (source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert(`ERROR IN ${typeString} SHADER: ${GL.getShaderInfoLog(shader)}`);
      return false;
    }
    return shader;
  };
  var shader_vertex = compile_shader(vertex_shader_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment = compile_shader(fragment_shader_source, GL.FRAGMENT_SHADER, "FRAGMENT");
  var SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  GL.linkProgram(SHADER_PROGRAM);
  var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");
  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_normal);
  GL.useProgram(SHADER_PROGRAM);
  var attribs = {
    _position: _position,
    _color: _color,
    _normal: _normal,
  };

  /*========================= MEMBANGUN SCENE GRAPH ========================= */

  // Buat "akar" dari model Golbat kita
  var golbatModel = new Node();

  // Buat sumbu (terpisah dari model)
  var axes = new Axes(GL, attribs);

  // --- Badan & Kaki ---
  var golbatUpperBody = new GolbatUpperBody(GL, attribs);
  var golbatLowerBody = new GolbatLowerBody(GL, attribs);
  // Masukkan badan dan kaki ke akar model
  golbatModel.add(golbatUpperBody);
  golbatModel.add(golbatLowerBody);

  // --- Telinga ---
  var leftEar = new GolbatEar(GL, attribs);
  // Atur posisi LOKAL telinga (relatif ke golbatModel)
  LIBS.translateX(leftEar.localMatrix, -0.45);
  LIBS.translateY(leftEar.localMatrix, 1.5);
  LIBS.rotateX(leftEar.localMatrix, Math.PI / 2);
  LIBS.rotateZ(leftEar.localMatrix, Math.PI / 10);
  LIBS.scale(leftEar.localMatrix, 0.2, 0.2, 0.4);

  var rightEar = new GolbatEar(GL, attribs);
  LIBS.translateX(rightEar.localMatrix, 0.45);
  LIBS.translateY(rightEar.localMatrix, 1.5);
  LIBS.rotateX(rightEar.localMatrix, Math.PI / 2);
  LIBS.rotateZ(rightEar.localMatrix, -Math.PI / 10);
  LIBS.scale(rightEar.localMatrix, 0.2, 0.2, 0.4);

  // Masukkan telinga ke akar model
  golbatModel.add(leftEar);
  golbatModel.add(rightEar);

  // --- Gigi ---
  // Kita akan masukkan gigi sebagai ANAK dari golbatUpperBody
  var toothTopLeft = new GolbatTooth(GL, attribs);
  LIBS.translateY(toothTopLeft.localMatrix, 0.65);
  LIBS.translateZ(toothTopLeft.localMatrix, 0.4);
  LIBS.translateX(toothTopLeft.localMatrix, -0.5);
  LIBS.rotateZ(toothTopLeft.localMatrix, Math.PI);
  LIBS.rotateY(toothTopLeft.localMatrix, 60);
  LIBS.rotateX(toothTopLeft.localMatrix, -0.5);
  LIBS.scale(toothTopLeft.localMatrix, 0.35, 0.35, 0.35);

  var toothTopRight = new GolbatTooth(GL, attribs);
  LIBS.translateY(toothTopRight.localMatrix, 0.65);
  LIBS.translateZ(toothTopRight.localMatrix, 0.36);
  LIBS.translateX(toothTopRight.localMatrix, 0.55);
  LIBS.rotateZ(toothTopRight.localMatrix, Math.PI);
  LIBS.rotateY(toothTopRight.localMatrix, 60);
  LIBS.rotateX(toothTopRight.localMatrix, -0.5);
  LIBS.scale(toothTopRight.localMatrix, 0.35, 0.35, 0.35);

  var toothBottomLeft = new GolbatTooth(GL, attribs);
  LIBS.translateY(toothBottomLeft.localMatrix, -0.85);
  LIBS.translateZ(toothBottomLeft.localMatrix, 0.35);
  LIBS.translateX(toothBottomLeft.localMatrix, -0.5);
  LIBS.rotateY(toothBottomLeft.localMatrix, 60);
  LIBS.rotateX(toothBottomLeft.localMatrix, 0.5);
  LIBS.scale(toothBottomLeft.localMatrix, 0.35, 0.35, 0.35);

  var toothBottomRight = new GolbatTooth(GL, attribs);
  LIBS.translateY(toothBottomRight.localMatrix, -0.85);
  LIBS.translateZ(toothBottomRight.localMatrix, 0.35);
  LIBS.translateX(toothBottomRight.localMatrix, 0.5);
  LIBS.rotateY(toothBottomRight.localMatrix, 60);
  LIBS.rotateX(toothBottomRight.localMatrix, 0.5);
  LIBS.scale(toothBottomRight.localMatrix, 0.35, 0.35, 0.35);

  // Masukkan gigi ke BADAN ATAS, bukan ke akar
  golbatUpperBody.add(toothTopLeft);
  golbatUpperBody.add(toothTopRight);
  golbatUpperBody.add(toothBottomLeft);
  golbatUpperBody.add(toothBottomRight);

  var leftEye = new GolbatEye(GL, attribs);
  LIBS.translateY(leftEye.localMatrix, 0.9);
  LIBS.translateX(leftEye.localMatrix, -0.3);
  LIBS.translateZ(leftEye.localMatrix, 0.65);
  LIBS.rotateX(leftEye.localMatrix, -0.5);
  LIBS.scale(leftEye.localMatrix, 0.2, 0.2, 0.2); // Skala mata kiri (normal)

  var rightEye = new GolbatEye(GL, attribs);
  LIBS.translateY(rightEye.localMatrix, 0.9);
  LIBS.translateX(rightEye.localMatrix, 0.3);
  LIBS.translateZ(rightEye.localMatrix, 0.65);
  LIBS.rotateX(rightEye.localMatrix, -0.5);

  // --- PERBAIKAN DI SINI ---
  // Skala X negatif akan mencerminkan geometri secara horizontal
  LIBS.scale(rightEye.localMatrix, -0.2, 0.2, 0.2); // <-- Tambahkan tanda minus

  golbatModel.add(leftEye);
  golbatModel.add(rightEye);

  // Golbat Wing

  // --- SAYAP KIRI ---
  var leftWing = new GolbatWing(GL, attribs);
  // Posisikan sayap kiri relatif terhadap badan
  LIBS.translateX(leftWing.localMatrix, 0.5); // Geser ke bahu kiri
  LIBS.translateY(leftWing.localMatrix, 0.1);
  LIBS.rotateZ(leftWing.localMatrix, 0.3); // Miringkan sedikit
  LIBS.rotateY(leftWing.localMatrix, -0.2);
  // Tambahkan sayap kiri sebagai anak dari model utama
  golbatModel.add(leftWing);

  // --- SAYAP KANAN (Dicerminkan) ---
  var rightWing = new GolbatWing(GL, attribs);
  // Gunakan trik skala negatif untuk mencerminkan geometri
  LIBS.scale(rightWing.localMatrix, -1, 1, 1);
  // Terapkan transformasi yang sama dengan kiri
  LIBS.translateX(rightWing.localMatrix, 0.5);
  LIBS.translateY(rightWing.localMatrix, 0.1);
  LIBS.rotateZ(rightWing.localMatrix, -0.3);
  LIBS.rotateY(rightWing.localMatrix, -0.2);
  // Tambahkan sayap kanan
  golbatModel.add(rightWing);

  /*================ MATRICES & INTERACTION =================*/
  // (Tidak berubah)
  var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
  var MOVEMATRIX = LIBS.get_I4();
  var VIEWMATRIX = LIBS.get_I4();
  LIBS.translateZ(VIEWMATRIX, -12);
  var THETA = 0,
    PHI = 0;
  var drag = false;
  var x_prev, y_prev;
  var mouseDown = function (e) {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
    return false;
  };
  var mouseUp = function (e) {
    drag = false;
  };
  var mouseMove = function (e) {
    if (!drag) return false;
    var dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    var dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  };
  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseUp, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);

  /*========================= DRAWING ========================= */
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GL.clearDepth(1.0);

  var animate = function () {
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // Set matriks global
    LIBS.set_I4(MOVEMATRIX);
    LIBS.rotateY(MOVEMATRIX, THETA);
    LIBS.rotateX(MOVEMATRIX, PHI);
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    // --- GAMBAR SEMUANYA ---
    // Hanya DUA panggilan draw!
    axes.draw(MOVEMATRIX, _Mmatrix);
    golbatModel.draw(MOVEMATRIX, _Mmatrix); // <-- Ini akan menggambar seluruh Golbat secara rekursif

    GL.flush();
    window.requestAnimationFrame(animate);
  };
  animate();
}

window.addEventListener("load", main);
