// File: main.js
import { Node } from "./models/Node.js";
import { Axes } from "./models/Axes.js";
import { CrobatBody } from "./models/CrobatBody.js";
import { CrobatEar } from "./models/CrobatEar.js";
import { CrobatMouthAndTeeth } from "./models/CrobatMouthAndTeeth.js";
import { CrobatWing } from "./models/CrobatWing.js";
import { CrobatEyelid } from "./models/CrobatEyelid.js";
import { CrobatSclera } from "./models/CrobatSclera.js";
import { CrobatPupil } from "./models/CrobatPupil.js";
import { CrobatFoot } from "./models/CrobatFoot.js";

// === MAIN FUNCTION ===
function main() {
  const CANVAS = document.getElementById("mycanvas");
  // ... (Kode setup CANVAS dan GL Anda tidak berubah) ...
  const dpr = window.devicePixelRatio || 1;
  CANVAS.width = window.innerWidth * dpr;
  CANVAS.height = window.innerHeight * dpr;
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

  // ... (Kode compile_shader dan setup SHADER_PROGRAM tidak berubah) ...
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
  GL.attachShader(SHADER_PROGRAM, compile_shader(shader_vertex_source, GL.VERTEX_SHADER));
  GL.attachShader(SHADER_PROGRAM, compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER));
  GL.linkProgram(SHADER_PROGRAM);

  const _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  const _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  const _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
  const _lightDirection = GL.getUniformLocation(SHADER_PROGRAM, "lightDirection");
  const _lightColor = GL.getUniformLocation(SHADER_PROGRAM, "lightColor");
  const _ambientColor = GL.getUniformLocation(SHADER_PROGRAM, "ambientColor");
  const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  const _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");
  
  const attribs = { _position, _color, _normal };

  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_normal);
  GL.useProgram(SHADER_PROGRAM);

  // --- MATRICES AND CAMERA ---
  const PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
  const VIEWMATRIX = LIBS.get_I4();

  // =========================================================================
  // === PEMBANGUNAN SCENE GRAPH (DILAKUKAN SEKALI) ===
  // =========================================================================

  // 1. Buat semua node
  const rootNode = new Node();
  
  const bodyNode = new Node();
  rootNode.add(bodyNode);
  
  const leftEyeNode = new Node();
  const leftEyelidNode = new Node();
  const leftScleraNode = new Node();
  const leftPupilNode = new Node();
  bodyNode.add(leftEyeNode);
  leftEyeNode.add(leftEyelidNode);
  leftEyeNode.add(leftScleraNode);
  leftEyeNode.add(leftPupilNode);

  const rightEyeNode = new Node();
  const rightEyelidNode = new Node();
  const rightScleraNode = new Node();
  const rightPupilNode = new Node();
  bodyNode.add(rightEyeNode);
  rightEyeNode.add(rightEyelidNode);
  rightEyeNode.add(rightScleraNode);
  rightEyeNode.add(rightPupilNode);

  const leftEarNode = new Node();
  const rightEarNode = new Node();
  bodyNode.add(leftEarNode);
  bodyNode.add(rightEarNode);

  const mouthNode = new Node();
  bodyNode.add(mouthNode);
  
  const upperLeftWingNode = new Node();
  const upperRightWingNode = new Node();
  const lowerLeftWingNode = new Node();
  const lowerRightWingNode = new Node();
  bodyNode.add(upperLeftWingNode);
  bodyNode.add(upperRightWingNode);
  bodyNode.add(lowerLeftWingNode);
  bodyNode.add(lowerRightWingNode);

  const leftFootNode = new Node();
  const rightFootNode = new Node();
  bodyNode.add(leftFootNode);
  bodyNode.add(rightFootNode);

  // 2. Pasang Geometri ke Node
  bodyNode.setGeometry(new CrobatBody(GL, attribs, 1.5, 100, 100));
  
  leftEyelidNode.setGeometry(new CrobatEyelid(GL, attribs));
  leftScleraNode.setGeometry(new CrobatSclera(GL, attribs));
  leftPupilNode.setGeometry(new CrobatPupil(GL, attribs));
  
  rightEyelidNode.setGeometry(new CrobatEyelid(GL, attribs));
  rightScleraNode.setGeometry(new CrobatSclera(GL, attribs));
  rightPupilNode.setGeometry(new CrobatPupil(GL, attribs));
  
  leftEarNode.setGeometry(new CrobatEar(GL, attribs));
  rightEarNode.setGeometry(new CrobatEar(GL, attribs));
  
  mouthNode.setGeometry(new CrobatMouthAndTeeth(GL, attribs));
  
  upperLeftWingNode.setGeometry(new CrobatWing(GL, attribs));
  upperRightWingNode.setGeometry(new CrobatWing(GL, attribs));
  lowerLeftWingNode.setGeometry(new CrobatWing(GL, attribs));
  lowerRightWingNode.setGeometry(new CrobatWing(GL, attribs));

  leftFootNode.setGeometry(new CrobatFoot(GL, attribs));
  rightFootNode.setGeometry(new CrobatFoot(GL, attribs));

  // 3. Atur Transformasi LOKAL untuk node yang STATIS
  
  LIBS.scale(bodyNode.localMatrix, 0.84, 0.93, 0.8);
  LIBS.rotateX(bodyNode.localMatrix, 0.3);

  // --- MATA KIRI (Grup) ---
  LIBS.translateX(leftEyeNode.localMatrix, -0.55);
  LIBS.translateY(leftEyeNode.localMatrix, 0.55);
  LIBS.translateZ(leftEyeNode.localMatrix, 1.2825);
  LIBS.rotateX(leftEyeNode.localMatrix, -0.2);
  LIBS.rotateY(leftEyeNode.localMatrix, -0.5);
  LIBS.rotateZ(leftEyeNode.localMatrix, -0.35);
  LIBS.scale(leftEyelidNode.localMatrix, -1.3, 1.3, 1.0);
  LIBS.rotateZ(leftEyelidNode.localMatrix, 0);
  LIBS.translateZ(leftEyelidNode.localMatrix, 0);
  LIBS.scale(leftScleraNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.scale(leftPupilNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.translateZ(leftPupilNode.localMatrix, 0.02);

  // --- MATA KANAN (Grup) ---
  LIBS.translateX(rightEyeNode.localMatrix, 0.55);
  LIBS.translateY(rightEyeNode.localMatrix, 0.55);
  LIBS.translateZ(rightEyeNode.localMatrix, 1.2825);
  LIBS.rotateX(rightEyeNode.localMatrix, -0.2);
  LIBS.rotateY(rightEyeNode.localMatrix, 0.5);
  LIBS.rotateZ(rightEyeNode.localMatrix, 0.35);
  LIBS.scale(rightEyelidNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.rotateZ(rightEyelidNode.localMatrix, 0);
  LIBS.translateZ(rightEyelidNode.localMatrix, 0.01);
  LIBS.scale(rightScleraNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.scale(rightPupilNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.translateZ(rightPupilNode.localMatrix, 0.02);

  // --- TELINGA KIRI ---
  LIBS.scale(leftEarNode.localMatrix, 0.4, 0.8, 0.4);
  LIBS.rotateX(leftEarNode.localMatrix, -0.3);
  LIBS.rotateZ(leftEarNode.localMatrix, 0.25);
  LIBS.translateX(leftEarNode.localMatrix, -0.45);
  LIBS.translateY(leftEarNode.localMatrix, 0.75);

  // --- TELINGA KANAN ---
  LIBS.scale(rightEarNode.localMatrix, 0.4, 0.8, 0.4);
  LIBS.rotateX(rightEarNode.localMatrix, -0.3);
  LIBS.rotateZ(rightEarNode.localMatrix, -0.25);
  LIBS.translateX(rightEarNode.localMatrix, 0.45);
  LIBS.translateY(rightEarNode.localMatrix, 0.75);
  
  // --- MULUT DAN GIGI ---
  LIBS.rotateX(mouthNode.localMatrix, -0.275);
  LIBS.translateY(mouthNode.localMatrix, -0.05);
  LIBS.translateZ(mouthNode.localMatrix, 1.2953); 
  
  // --- KAKI KIRI ---
  LIBS.scale(leftFootNode.localMatrix, 0.96, 0.96, 0.96); 
  LIBS.rotateX(leftFootNode.localMatrix, 3.9); 
  LIBS.rotateY(leftFootNode.localMatrix, 0.3); 
  LIBS.translateX(leftFootNode.localMatrix, -0.55); 
  LIBS.translateY(leftFootNode.localMatrix, -1.3); 
  LIBS.translateZ(leftFootNode.localMatrix, -0.53);

  // --- KAKI KANAN ---
  LIBS.scale(rightFootNode.localMatrix, 0.96, 0.96, 0.96); 
  LIBS.rotateX(rightFootNode.localMatrix, 3.9); 
  LIBS.rotateY(rightFootNode.localMatrix, -0.3); 
  LIBS.translateX(rightFootNode.localMatrix, 0.55); 
  LIBS.translateY(rightFootNode.localMatrix, -1.3); 
  LIBS.translateZ(rightFootNode.localMatrix, -0.53); 
  
  // =========================================================================
  // === AKHIR DARI SCENE GRAPH SETUP ===
  // =========================================================================

  // --- INTERACTION & ANIMATION VARIABLES ---
  let THETA = 0, PHI = 0;
  let drag = false, x_prev = 0, y_prev = 0, dX = 0, dY = 0;
  let cameraZ = -10;
  const FRICTION = 0.95;

  let time = 0; 
  let lastFlipTime = performance.now();
  let flipStartTime = 0;
  let isFlipping = false;
  const flipInterval = 15000;
  const flipDuration = 1000;

  // --- EVENT LISTENERS (Sama seperti sebelumnya) ---
  CANVAS.addEventListener("mousedown", (e) => { drag = true; x_prev = e.pageX; y_prev = e.pageY; });
  CANVAS.addEventListener("mouseup", () => { drag = false; });
  CANVAS.addEventListener("mouseout", () => { drag = false; });
  CANVAS.addEventListener("mousemove", (e) => {
    if (!drag) return;
    dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX; PHI += dY;
    x_prev = e.pageX; y_prev = e.pageY;
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

  // --- RENDER LOOP (DIMODIFIKASI UNTUK ANIMASI) ---
  const render = () => {
    const currentTime = performance.now();
    time += 0.05; 

    if (!drag) {
      dX *= FRICTION; dY *= FRICTION;
      THETA += dX; PHI += dY;
    }

    // 1. Atur Kamera (VIEWMATRIX)
    LIBS.set_I4(VIEWMATRIX);
    LIBS.translateZ(VIEWMATRIX, cameraZ);
    LIBS.rotateY(VIEWMATRIX, THETA); 
    LIBS.rotateX(VIEWMATRIX, PHI); 

    const cameraDirection = [-VIEWMATRIX[2], -VIEWMATRIX[6], -VIEWMATRIX[10]];

    // 2. Bersihkan layar
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // 3. Atur Uniform Global (P, V, dan Cahaya)
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniform3fv(_lightDirection, cameraDirection);
    GL.uniform3fv(_lightColor, [1.0, 1.0, 1.0]);
    GL.uniform3fv(_ambientColor, [0.5, 0.5, 0.5]);

    // 4. Tentukan Matriks Dunia (M_SCENE) dengan Animasi
    const M_SCENE = LIBS.get_I4();
    
    // --- ANIMASI FLOAT NAIK-TURUN ---
    var floatSpeed = 0.6;
    var floatAmplitude = 0.2;
    var floatY = Math.sin(time * floatSpeed) * floatAmplitude;
    LIBS.translateY(M_SCENE, floatY);

    // --- ANIMASI SALTO (FLIP) ---
    let flipAngle = 0.0;
    if (!isFlipping && currentTime - lastFlipTime > flipInterval) {
      isFlipping = true;
      flipStartTime = currentTime;
      lastFlipTime = currentTime; 
    }
    if (isFlipping) {
      let flipProgress = (currentTime - flipStartTime) / flipDuration;
      if (flipProgress >= 1.0) {
        flipProgress = 1.0;
        isFlipping = false; 
      }
      flipAngle = flipProgress * -Math.PI * 2.0;
    }
    LIBS.rotateX(M_SCENE, flipAngle);
    
    
    // =================================================================
    // === PERBAIKAN ANIMASI SAYAP DI SINI ===
    // =================================================================
    
    var flapSpeed = 0.6; 
    var flapAmplitude = Math.PI / 12; // 45 derajat
    var flapAngle = Math.sin(time * flapSpeed) * flapAmplitude;

    // --- SAYAP ATAS KIRI (dibangun ulang setiap frame) ---
    LIBS.set_I4(upperLeftWingNode.localMatrix); // Reset
    LIBS.scale(upperLeftWingNode.localMatrix, 1.0, 1.0, 1.0);
    LIBS.rotateY(upperLeftWingNode.localMatrix, -0.25 + flapAngle); // <-- PERBAIKAN: Animasi di Y
    LIBS.rotateZ(upperLeftWingNode.localMatrix, 0.0); // <-- Rotasi Z statis
    LIBS.translateX(upperLeftWingNode.localMatrix, 2);
    LIBS.translateY(upperLeftWingNode.localMatrix, 1.0);

    // --- SAYAP ATAS KANAN (dibangun ulang setiap frame) ---
    LIBS.set_I4(upperRightWingNode.localMatrix); // Reset
    LIBS.scale(upperRightWingNode.localMatrix, -1.0, 1.0, 1.0); // Balik
    LIBS.rotateY(upperRightWingNode.localMatrix, 0.25 - flapAngle); // <-- PERBAIKAN: Animasi di Y (dibalik)
    LIBS.rotateZ(upperRightWingNode.localMatrix, 0); // <-- Rotasi Z statis
    LIBS.translateX(upperRightWingNode.localMatrix, -2);
    LIBS.translateY(upperRightWingNode.localMatrix, 1.0);

    // --- SAYAP BAWAH KIRI (dibangun ulang setiap frame) ---
    LIBS.set_I4(lowerLeftWingNode.localMatrix); // Reset
    LIBS.scale(lowerLeftWingNode.localMatrix, 0.5, 0.25, 0.25);
    LIBS.rotateY(lowerLeftWingNode.localMatrix, 3.2 + flapAngle); // <-- PERBAIKAN: Animasi di Y
    LIBS.rotateZ(lowerLeftWingNode.localMatrix, 3.25); // <-- Rotasi Z statis
    LIBS.translateY(lowerLeftWingNode.localMatrix, -1.0);
    
    // --- SAYAP BAWAH KANAN (dibangun ulang setiap frame) ---
    LIBS.set_I4(lowerRightWingNode.localMatrix); // Reset
    LIBS.scale(lowerRightWingNode.localMatrix, -0.5, 0.25, 0.25); // Balik
    LIBS.rotateY(lowerRightWingNode.localMatrix, 3.0 - flapAngle); // <-- PERBAIKAN: Animasi di Y (dibalik)
    LIBS.rotateZ(lowerRightWingNode.localMatrix, 3.0); // <-- Rotasi Z statis
    LIBS.translateY(lowerRightWingNode.localMatrix, -1.0);

    // =================================================================
    // === AKHIR PERBAIKAN ===
    // =================================================================

    // 6. GAMBAR SEMUANYA DENGAN SATU PANGGILAN!
    rootNode.draw(M_SCENE, _Mmatrix);

    // 7. Selesai
    GL.flush();
    window.requestAnimationFrame(render);
  };

  render();
}

main();