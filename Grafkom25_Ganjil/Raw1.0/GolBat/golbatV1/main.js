/*
 * ===================================================================
 * main.js - Sutradara Proyek Golbat (IMPROVED CAMERA & FULLSCREEN)
 * ===================================================================
 *
 * IMPROVEMENT:
 * 1. ✅ Mengadopsi sistem Kamera Orbit + Zoom + Friction dari Zubat/Crobat.
 * 2. ✅ Implementasi Hi-DPI Handling (`resizeCanvasToDisplaySize`) untuk visual tajam.
 * 3. ✅ Model TIDAK LAGI berputar mengikuti mouse (kamera yang berputar).
 * 4. ✅ Mempertahankan shader dasar Golbat dan libs.js Golbat yang lama.
 * 5. ✅ KANVAS FULLSCREEN: Pengaturan width/height manual sudah dihapus.
 */

// Impor model Golbat
import { Node } from "./models/Node.js";
import { Axes } from "./models/Axes.js";
import { GolbatUpperBody } from "./models/GolbatUpperBody.js";
import { GolbatLowerBody } from "./models/GolbatLowerBody.js";
import { GolbatEar } from "./models/GolbatEar.js";
import { GolbatTooth } from "./models/GolbatTooth.js";
import { GolbatWing } from "./models/GolbatWing.js";
import { GolbatEye } from "./models/GolbatEye.js";

function main() {
  var CANVAS = document.getElementById("mycanvas"); //

  // Pengaturan width/height manual sudah dihapus (sudah benar)

  var GL;

  // Fungsi resize Hi-DPI (Sudah benar)
  function resizeCanvasToDisplaySize(canvas) {
    const dpr = window.devicePixelRatio || 1; //
    const displayWidth = Math.round(canvas.clientWidth * dpr); //
    const displayHeight = Math.round(canvas.clientHeight * dpr); //

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      //
      canvas.width = displayWidth; //
      canvas.height = displayHeight; //
      if (GL) {
        GL.viewport(0, 0, canvas.width, canvas.height); //
      }
      return true;
    }
    return false;
  }
  // Panggil resize SEBELUM getContext agar ukuran CSS terbaca
  resizeCanvasToDisplaySize(CANVAS); //

  /*========================= WEBGL CONTEXT & SHADER PROGRAM ========================= */
  try {
    GL = CANVAS.getContext("webgl", { antialias: true }); //
    // Panggil resize lagi SETELAH GL ada untuk set viewport awal
    resizeCanvasToDisplaySize(CANVAS); //

    var uintIndexExtension = GL.getExtension("OES_element_index_uint"); //
    if (!uintIndexExtension) {
      //
      console.warn("WebGL extension OES_element_index_uint not supported!"); //
      alert(
        "Browser/GPU may not support OES_element_index_uint. Complex models might have issues."
      ); //
    }
  } catch (e) {
    alert("WebGL context cannot be initialized"); //
    return false;
  }

  // --- SHADERS (Tetap menggunakan shader dasar Golbat) ---
  var vertex_shader_source = `
    attribute vec3 position; attribute vec3 color; attribute vec3 normal;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    varying vec3 vColor; varying vec3 vNormal; varying vec3 vView;
    void main(void) {
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
        vNormal = vec3(Mmatrix * vec4(normal, 0.));
        vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
        vColor = color;
    }`; //
  var fragment_shader_source = `
    precision mediump float;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor, 1.0); // Tampilkan warna asli
    }`; //

  // --- Kompilasi Shader ---
  var compile_shader = function (source, type, typeString) {
    var shader = GL.createShader(type); //
    GL.shaderSource(shader, source); //
    GL.compileShader(shader); //
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      //
      alert(`ERROR IN ${typeString} SHADER: ${GL.getShaderInfoLog(shader)}`); //
      return false;
    }
    return shader;
  }; //
  var shader_vertex = compile_shader(
    vertex_shader_source,
    GL.VERTEX_SHADER,
    "VERTEX"
  ); //
  var shader_fragment = compile_shader(
    fragment_shader_source,
    GL.FRAGMENT_SHADER,
    "FRAGMENT"
  ); //
  var SHADER_PROGRAM = GL.createProgram(); //
  GL.attachShader(SHADER_PROGRAM, shader_vertex); //
  GL.attachShader(SHADER_PROGRAM, shader_fragment); //
  GL.linkProgram(SHADER_PROGRAM); //

  // --- Lokasi Uniform & Attribute ---
  var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix"); //
  var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix"); //
  var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix"); //
  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position"); //
  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color"); //
  var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal"); //
  GL.enableVertexAttribArray(_position); //
  GL.enableVertexAttribArray(_color); //
  GL.enableVertexAttribArray(_normal); //
  GL.useProgram(SHADER_PROGRAM); //
  var attribs = {
    _position: _position,
    _color: _color,
    _normal: _normal,
  }; //

  /*========================= MEMBANGUN SCENE GRAPH GOLBAT ========================= */
  // (Logika perakitan model Golbat tidak diubah)

  var golbatModel = new Node(); //
  var axes = new Axes(GL, attribs); //

  // --- Badan & Kaki ---
  var golbatUpperBody = new GolbatUpperBody(GL, attribs); //
  var golbatLowerBody = new GolbatLowerBody(GL, attribs); //
  golbatModel.add(golbatUpperBody); //
  golbatModel.add(golbatLowerBody); //

  // --- Telinga ---
  var leftEar = new GolbatEar(GL, attribs); //
  LIBS.translateX(leftEar.localMatrix, -0.45); //
  LIBS.translateY(leftEar.localMatrix, 1.5); //
  LIBS.rotateX(leftEar.localMatrix, Math.PI / 2); //
  LIBS.rotateZ(leftEar.localMatrix, Math.PI / 10); //
  LIBS.scale(leftEar.localMatrix, 0.2, 0.2, 0.4); //

  var rightEar = new GolbatEar(GL, attribs); //
  LIBS.translateX(rightEar.localMatrix, 0.45); //
  LIBS.translateY(rightEar.localMatrix, 1.5); //
  LIBS.rotateX(rightEar.localMatrix, Math.PI / 2); //
  LIBS.rotateZ(rightEar.localMatrix, -Math.PI / 10); //
  LIBS.scale(rightEar.localMatrix, 0.2, 0.2, 0.4); //

  golbatModel.add(leftEar); //
  golbatModel.add(rightEar); //

  // --- Gigi (sebagai child dari Upper Body) ---
  var toothTopLeft = new GolbatTooth(GL, attribs); //
  LIBS.translateY(toothTopLeft.localMatrix, 0.65); //
  LIBS.translateZ(toothTopLeft.localMatrix, 0.4); //
  LIBS.translateX(toothTopLeft.localMatrix, -0.5); //
  LIBS.rotateZ(toothTopLeft.localMatrix, Math.PI); //
  LIBS.rotateY(toothTopLeft.localMatrix, 60); //
  LIBS.rotateX(toothTopLeft.localMatrix, -0.5); //
  LIBS.scale(toothTopLeft.localMatrix, 0.35, 0.35, 0.35); //

  var toothTopRight = new GolbatTooth(GL, attribs); //
  LIBS.translateY(toothTopRight.localMatrix, 0.65); //
  LIBS.translateZ(toothTopRight.localMatrix, 0.36); //
  LIBS.translateX(toothTopRight.localMatrix, 0.55); //
  LIBS.rotateZ(toothTopRight.localMatrix, Math.PI); //
  LIBS.rotateY(toothTopRight.localMatrix, 60); //
  LIBS.rotateX(toothTopRight.localMatrix, -0.5); //
  LIBS.scale(toothTopRight.localMatrix, 0.35, 0.35, 0.35); //

  var toothBottomLeft = new GolbatTooth(GL, attribs); //
  LIBS.translateY(toothBottomLeft.localMatrix, -0.85); //
  LIBS.translateZ(toothBottomLeft.localMatrix, 0.35); //
  LIBS.translateX(toothBottomLeft.localMatrix, -0.5); //
  LIBS.rotateY(toothBottomLeft.localMatrix, 60); //
  LIBS.rotateX(toothBottomLeft.localMatrix, 0.5); //
  LIBS.scale(toothBottomLeft.localMatrix, 0.35, 0.35, 0.35); //

  var toothBottomRight = new GolbatTooth(GL, attribs); //
  LIBS.translateY(toothBottomRight.localMatrix, -0.85); //
  LIBS.translateZ(toothBottomRight.localMatrix, 0.35); //
  LIBS.translateX(toothBottomRight.localMatrix, 0.5); //
  LIBS.rotateY(toothBottomRight.localMatrix, 60); //
  LIBS.rotateX(toothBottomRight.localMatrix, 0.5); //
  LIBS.scale(toothBottomRight.localMatrix, 0.35, 0.35, 0.35); //

  golbatUpperBody.add(toothTopLeft); //
  golbatUpperBody.add(toothTopRight); //
  golbatUpperBody.add(toothBottomLeft); //
  golbatUpperBody.add(toothBottomRight); //

  // --- Mata ---
  var leftEye = new GolbatEye(GL, attribs); //
  LIBS.translateY(leftEye.localMatrix, 0.9); //
  LIBS.translateX(leftEye.localMatrix, -0.3); //
  LIBS.translateZ(leftEye.localMatrix, 0.65); //
  LIBS.rotateX(leftEye.localMatrix, -0.5); //
  LIBS.scale(leftEye.localMatrix, 0.2, 0.2, 0.2); //

  var rightEye = new GolbatEye(GL, attribs); //
  LIBS.translateY(rightEye.localMatrix, 0.9); //
  LIBS.translateX(rightEye.localMatrix, 0.3); //
  LIBS.translateZ(rightEye.localMatrix, 0.65); //
  LIBS.rotateX(rightEye.localMatrix, -0.5); //
  LIBS.scale(rightEye.localMatrix, -0.2, 0.2, 0.2); //

  golbatModel.add(leftEye); //
  golbatModel.add(rightEye); //

  // --- Sayap ---
  var leftWing = new GolbatWing(GL, attribs); //
  golbatModel.add(leftWing); //
  var rightWing = new GolbatWing(GL, attribs); //
  golbatModel.add(rightWing); //

  /*================ MATRICES & INTERACTION (IMPROVED) =================*/

  let PROJMATRIX = LIBS.get_I4(); //
  const MOVEMATRIX = LIBS.get_I4(); //
  const VIEWMATRIX = LIBS.get_I4(); //

  function updateProjectionMatrix() {
    PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100); //
  } //
  updateProjectionMatrix(); //

  let THETA = 0,
    PHI = 0,
    time = 0; //
  let drag = false,
    x_prev = 0,
    y_prev = 0,
    dX = 0,
    dY = 0; //
  let cameraZ = -12; //
  const FRICTION = 0.95; //

  var mouseDown = function (e) {
    drag = true; //
    x_prev = e.pageX; //
    y_prev = e.pageY; //
    e.preventDefault(); //
  }; //
  var mouseUp = function (e) {
    drag = false; //
  }; //
  var mouseOut = function (e) {
    drag = false; //
  }; //
  var mouseMove = function (e) {
    if (!drag) return; //
    dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width; //
    dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height; //
    THETA += dX; //
    PHI += dY; //
    x_prev = e.pageX; //
    y_prev = e.pageY; //
    e.preventDefault(); //
  }; //
  CANVAS.addEventListener("mousedown", mouseDown, false); //
  CANVAS.addEventListener("mouseup", mouseUp, false); //
  CANVAS.addEventListener("mouseout", mouseOut, false); //
  CANVAS.addEventListener("mousemove", mouseMove, false); //

  CANVAS.addEventListener("wheel", (e) => {
    //
    e.preventDefault(); //
    const zoomSpeed = 0.01; //
    cameraZ += e.deltaY * zoomSpeed; //
    cameraZ = Math.max(-20, Math.min(-3, cameraZ)); //
  }); //

  window.addEventListener("resize", () => {
    //
    resizeCanvasToDisplaySize(CANVAS); //
    updateProjectionMatrix(); //
  }); //

  /*========================= DRAWING SETUP ========================= */
  GL.enable(GL.DEPTH_TEST); //
  GL.depthFunc(GL.LEQUAL); //
  GL.clearColor(0.1, 0.1, 0.1, 1.0); //
  GL.clearDepth(1.0); //

  /*========================= ANIMATION LOOP (IMPROVED) ========================= */
  var animate = function () {
    time += 0.05; //

    if (!drag) {
      //
      dX *= FRICTION; //
      dY *= FRICTION; //
      THETA += dX; //
      PHI += dY; //
    }

    LIBS.set_I4(VIEWMATRIX); //
    LIBS.translateZ(VIEWMATRIX, cameraZ); //
    LIBS.rotateY(VIEWMATRIX, THETA); //
    LIBS.rotateX(VIEWMATRIX, PHI); //

    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT); //

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX); //
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX); //

    /*================= ANIMASI SAYAP GOLBAT (Tetap Sama) =================*/
    var flapSpeed = 1.0; //
    var flapAmplitude = Math.PI / 4; //
    var flapAngle = Math.sin(time * flapSpeed) * flapAmplitude; //

    LIBS.set_I4(leftWing.localMatrix); //
    LIBS.translateX(leftWing.localMatrix, 0.5); //
    LIBS.translateY(leftWing.localMatrix, 0.1); //
    LIBS.rotateZ(leftWing.localMatrix, 0.3); //
    LIBS.rotateY(leftWing.localMatrix, 0.2 + flapAngle); //
    LIBS.rotateX(leftWing.localMatrix, 0.7); //

    LIBS.set_I4(rightWing.localMatrix); //
    LIBS.scale(rightWing.localMatrix, -1, 1, 1); //
    LIBS.translateX(rightWing.localMatrix, 0.5); //
    LIBS.translateY(rightWing.localMatrix, 0.1); //
    LIBS.rotateZ(rightWing.localMatrix, -0.3); //
    LIBS.rotateY(rightWing.localMatrix, -0.2 - flapAngle); //
    LIBS.rotateX(rightWing.localMatrix, 0.7); //
    /*================= AKHIR ANIMASI SAYAP =================*/

    LIBS.set_I4(MOVEMATRIX); //

    golbatModel.draw(MOVEMATRIX, _Mmatrix); //

    GL.flush(); //
    window.requestAnimationFrame(animate); //
  }; //
  animate(); //
} //

window.addEventListener("load", main); //