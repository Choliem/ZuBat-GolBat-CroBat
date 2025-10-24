// main.js

// Import yang kita gunakan
import { Axes } from "./models/Axes.js";
import { CrobatEar } from "./models/CrobatEar.js"; // <-- BARU
import { ZubatWing } from "./models/ZubatWing.js";
import { CrobatBody } from "./models/CrobatBody.js";

// Hapus import ZubatEar
// import { ZubatEar } from "./models/ZubatEar.js";

function main() {
  const CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  let GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL tidak didukung!");
    return false;
  }

  GL.getExtension("OES_element_index_uint");

  // --- SHADERS ---
  // ... (Shader source code tidak berubah, salin dari kode Anda sebelumnya)
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
            vec3 L = normalize(vec3(0.0, 0.0, 1.0)); // Headlight
            vec3 V = normalize(-vView); 
            vec3 R = reflect(-L, N);

            float diffuse = max(dot(N, L), 0.0);
            float specular = pow(max(dot(V, R), 0.0), 32.0);
            vec3 finalColor = ambientColor + (diffuse * lightColor) + (specular * lightColor);

            gl_FragColor = vec4(vColor * finalColor, 1.0);
        }`;

  // --- SHADER COMPILATION ---
  // ... (Kode kompilasi shader tidak berubah)
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
  // ... (Kode uniforms/attributes tidak berubah)
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

  // =========================================================
  // --- IMPROVEMENT: Palet Warna Terpusat ---
  const COLOR_PALETTE = {
    BODY: [0.45, 0.35, 0.75], // Ungu utama
    MOUTH: [0.1, 0.1, 0.2], // Dalam mulut
    WING_INNER: [0.5, 0.75, 0.8], // Membran sayap (biru muda)
    WING_BONE: [0.35, 0.25, 0.6], // Tulang sayap (ungu lebih gelap)
  };
  // (Anda bisa update warna di ZubatWing.js untuk menggunakan ini juga)
  // =========================================================

  // --- OBJECT INSTANTIATION ---
  const axes = new Axes(GL, _position, _color, _normal);

  // Body Utama (Parent)
  const crobatBody = new CrobatBody(
    GL,
    _position,
    _color,
    _normal,
    2.5, // scaleFactor
    COLOR_PALETTE.BODY, // <-- Berikan warna body
    COLOR_PALETTE.MOUTH // <-- Berikan warna mulut
  );

  // Telinga (Children)
  const ear_L = new CrobatEar(
    GL,
    _position,
    _color,
    _normal,
    COLOR_PALETTE.BODY // <-- Berikan warna yang sama
  );
  const ear_R = new CrobatEar(
    GL,
    _position,
    _color,
    _normal,
    COLOR_PALETTE.BODY // <-- Berikan warna yang sama
  );

  // 4 Sayap (Children)
  const wing_Upper_L = new ZubatWing(GL, _position, _color, _normal);
  const wing_Upper_R = new ZubatWing(GL, _position, _color, _normal);
  const wing_Lower_L = new ZubatWing(GL, _position, _color, _normal);
  const wing_Lower_R = new ZubatWing(GL, _position, _color, _normal);

  // --- HIERARCHY & STATIC TRANSFORM SETUP ---

  // =========================================================
  // --- IMPROVEMENT: Penyesuaian Proporsi Telinga Baru ---
  // Telinga Kiri
  LIBS.scale(ear_L.modelMatrix, 0.7, 0.7, 0.7); // Skala sedikit
  LIBS.translateY(ear_L.modelMatrix, 2.0); // Naik
  LIBS.translateX(ear_L.modelMatrix, -0.7); // Kiri
  LIBS.translateZ(ear_L.modelMatrix, 0.3); // Agak ke depan
  LIBS.rotateZ(ear_L.modelMatrix, 0.3); // Miring keluar
  LIBS.rotateY(ear_L.modelMatrix, -0.3); // Putar sedikit ke belakang

  // Telinga Kanan
  LIBS.scale(ear_R.modelMatrix, 0.7, 0.7, 0.7); // Skala sedikit
  LIBS.translateY(ear_R.modelMatrix, 2.0); // Naik
  LIBS.translateX(ear_R.modelMatrix, 0.7); // Kanan
  LIBS.translateZ(ear_R.modelMatrix, 0.3); // Agak ke depan
  LIBS.rotateZ(ear_R.modelMatrix, -0.3); // Miring keluar
  LIBS.rotateY(ear_R.modelMatrix, 0.3); // Putar sedikit ke belakang
  // =========================================================

  // Sayap (Transformasi tidak berubah)
  // Sayap Kiri Atas
  LIBS.translateY(wing_Upper_L.modelMatrix, 1.0);
  LIBS.translateX(wing_Upper_L.modelMatrix, -1.0);
  LIBS.rotateZ(wing_Upper_L.modelMatrix, 0.7);
  LIBS.rotateY(wing_Upper_L.modelMatrix, 0.3);

  // Sayap Kanan Atas (mirror)
  LIBS.scale(wing_Upper_R.modelMatrix, -1, 1, 1);
  LIBS.translateY(wing_Upper_R.modelMatrix, 1.0);
  LIBS.translateX(wing_Upper_R.modelMatrix, 1.0);
  LIBS.rotateZ(wing_Upper_R.modelMatrix, -0.7);
  LIBS.rotateY(wing_Upper_R.modelMatrix, -0.3);

  // Sayap Kiri Bawah
  LIBS.translateY(wing_Lower_L.modelMatrix, -0.5);
  LIBS.translateX(wing_Lower_L.modelMatrix, -0.8);
  LIBS.rotateZ(wing_Lower_L.modelMatrix, 0.4);
  LIBS.rotateY(wing_Lower_L.modelMatrix, 0.2);
  LIBS.scale(wing_Lower_L.modelMatrix, 0.8, 0.8, 0.8);

  // Sayap Kanan Bawah (mirror)
  LIBS.scale(wing_Lower_R.modelMatrix, -1, 1, 1);
  LIBS.translateY(wing_Lower_R.modelMatrix, -0.5);
  LIBS.translateX(wing_Lower_R.modelMatrix, 0.8);
  LIBS.rotateZ(wing_Lower_R.modelMatrix, -0.4);
  LIBS.rotateY(wing_Lower_R.modelMatrix, -0.2);
  LIBS.scale(wing_Lower_R.modelMatrix, 0.8, 0.8, 0.8);

  // Susun Hirarki (Parenting)
  crobatBody.addChild(ear_L);
  crobatBody.addChild(ear_R);
  // crobatBody.addChild(wing_Upper_L);
  // crobatBody.addChild(wing_Upper_R);
  // crobatBody.addChild(wing_Lower_L);
  // crobatBody.addChild(wing_Lower_R);

  // --- MATRICES AND CAMERA ---
  // ... (Kode matriks & kamera tidak berubah)
  const PROJMATRIX = LIBS.get_projection(
    40,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  const VIEWMATRIX = LIBS.get_I4();

  // --- INTERACTION VARIABLES ---
  // ... (Kode interaksi tidak berubah)
  let THETA = 0,
    PHI = 0;
  let drag = false,
    x_prev = 0,
    y_prev = 0,
    dX = 0,
    dY = 0;
  let cameraZ = -15;
  const FRICTION = 0.95;

  // --- EVENT LISTENERS ---
  // ... (Kode event listener tidak berubah)
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
    cameraZ = Math.max(-30, Math.min(-5, cameraZ));
  });

  // --- RENDER SETUP ---
  // ... (Kode render setup tidak berubah)
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.1, 0.1, 0.1, 1.0);
  GL.clearDepth(1.0);

  // --- ANIMATION LOOP ---
  const animate = (time) => {
    // ... (Kode loop animasi tidak berubah)
    if (!drag) {
      dX *= FRICTION;
      dY *= FRICTION;
      THETA += dX;
      PHI += dY;
    }

    const modelMatrix = LIBS.get_I4();

    LIBS.set_I4(VIEWMATRIX);
    LIBS.translateZ(VIEWMATRIX, cameraZ);
    LIBS.rotateY(VIEWMATRIX, THETA);
    LIBS.rotateX(VIEWMATRIX, PHI);

    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    GL.uniform3fv(_lightDirection, [0.0, 0.0, 1.0]);
    GL.uniform3fv(_lightColor, [1.0, 1.0, 1.0]);
    GL.uniform3fv(_ambientColor, [0.3, 0.3, 0.3]);

    // HANYA SATU PANGGILAN RENDER
    crobatBody.render(GL, _Mmatrix, modelMatrix);

    axes.render(GL, _Mmatrix, modelMatrix);

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0);
}

main();
