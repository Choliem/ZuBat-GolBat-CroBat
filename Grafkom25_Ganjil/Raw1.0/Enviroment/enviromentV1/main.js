// ===================================================================
// main.js - Environment V1 (IMPROVED CAMERA MOVEMENT)
// ===================================================================

// 1. IMPORT SEMUA MODULES
import { Node } from "./models/Node.js";
import { SceneObject } from "./models/SceneObject.js";
import { Shaders } from "./models/Shaders.js";
import { Skybox } from "./models/Skybox.js";
import { Island } from "./models/Island.js";
import { Water } from "./models/Water.js";
import { Trees } from "./models/Trees.js";
// import { Spiders } from "./models/Spiders.js"; // (Tetap dikomentari)
import { PokemonBase } from "./models/PokemonBase.js";

function main() {
  /** @type {HTMLCanvasElement} */
  var CANVAS = document.getElementById("mycanvas");

  // --- IMPROVEMENT: Hapus width/height manual (Sudah dihapus sebelumnya) ---

  /*===================== GET WEBGL CONTEXT & Hi-DPI Setup ===================== */
  var GL;

  // Fungsi resize Hi-DPI (Sudah benar)
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
  resizeCanvasToDisplaySize(CANVAS); // Panggil sebelum getContext

  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
    resizeCanvasToDisplaySize(CANVAS); // Panggil lagi untuk set viewport awal
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }

  /*========================= SHADERS (Tetap Sama) ========================= */
  var shader_vertex_source = Shaders.vertex_source; //
  var shader_fragment_source = Shaders.fragment_source; //

  var compile_shader = function (source, type, typeString) {
    var shader = GL.createShader(type); //
    GL.shaderSource(shader, source); //
    GL.compileShader(shader); //
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      //
      alert(
        "ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader)
      ); //
      return false;
    }
    return shader;
  };
  var shader_vertex = compile_shader(
    shader_vertex_source,
    GL.VERTEX_SHADER,
    "VERTEX"
  ); //
  var shader_fragment = compile_shader(
    shader_fragment_source,
    GL.FRAGMENT_SHADER,
    "FRAGMENT"
  ); //

  var SHADER_PROGRAM = GL.createProgram(); //
  GL.attachShader(SHADER_PROGRAM, shader_vertex); //
  GL.attachShader(SHADER_PROGRAM, shader_fragment); //
  GL.linkProgram(SHADER_PROGRAM); //
  if (!GL.getProgramParameter(SHADER_PROGRAM, GL.LINK_STATUS)) {
    //
    alert("Could not initialise shaders. See console for details."); //
    console.error(
      "Shader Linker Error: " + GL.getProgramInfoLog(SHADER_PROGRAM)
    ); //
    return;
  }

  /*===================== ATTRIBUTES & UNIFORMS (Tetap Sama) ===================== */
  var attribs = {
    _position: GL.getAttribLocation(SHADER_PROGRAM, "position"), //
    _uv: GL.getAttribLocation(SHADER_PROGRAM, "uv"), //
    _color: GL.getAttribLocation(SHADER_PROGRAM, "color"), //
  }; //
  var uniforms = {
    _Pmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix"), //
    _Vmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix"), //
    _Mmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix"), //
    _sampler: GL.getUniformLocation(SHADER_PROGRAM, "sampler"), //
    _ambientLight: GL.getUniformLocation(SHADER_PROGRAM, "u_ambientLight"), //
    _isSkybox: GL.getUniformLocation(SHADER_PROGRAM, "u_isSkybox"), //
    _moonLightDirection: GL.getUniformLocation(
      SHADER_PROGRAM,
      "u_moonLightDirection"
    ), //
    _useTexture: GL.getUniformLocation(SHADER_PROGRAM, "u_useTexture"), //
    _isWeb: GL.getUniformLocation(SHADER_PROGRAM, "u_isWeb"), //
  }; //
  GL.useProgram(SHADER_PROGRAM); //

  /*========================= TEXTURES (Tetap Sama) =========================*/
  var load_texture = function (image_URL, wrapping, use_mipmaps) {
    var texture = GL.createTexture(); //
    var image = new Image(); //
    image.src = image_URL; //
    image.onload = function () {
      //
      GL.bindTexture(GL.TEXTURE_2D, texture); //
      GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true); //
      GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        image
      ); //
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR); //
      if (use_mipmaps) {
        //
        GL.texParameteri(
          GL.TEXTURE_2D,
          GL.TEXTURE_MIN_FILTER,
          GL.LINEAR_MIPMAP_LINEAR
        ); //
        GL.generateMipmap(GL.TEXTURE_2D); //
      } else {
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR); //
      }
      var wrap_mode = wrapping || GL.CLAMP_TO_EDGE; //
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap_mode); //
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap_mode); //
      GL.bindTexture(GL.TEXTURE_2D, null); //
    };
    return texture; //
  }; //
  var createWaterTexture = function () {
    var texture = GL.createTexture(); //
    GL.bindTexture(GL.TEXTURE_2D, texture); //
    var pixel = new Uint8Array([20, 40, 80, 200]); // RGBA: Warna biru transparan
    GL.texImage2D(
      GL.TEXTURE_2D,
      0,
      GL.RGBA,
      1,
      1,
      0,
      GL.RGBA,
      GL.UNSIGNED_BYTE,
      pixel
    ); //
    return texture; //
  }; //

  var cube_texture = load_texture("night.png", GL.CLAMP_TO_EDGE, false); //
  var ground_texture = load_texture("grass1.png", GL.REPEAT, true); //
  var water_texture = createWaterTexture(); //

  /*======================== MEMBUAT SCENE OBJECTS (Tetap Sama) ======================== */

  const scale = 3000; //
  const gridSize = 80; //
  const islandRadius = scale * 0.7; //
  const texture_repeat = 20; //

  var skyboxObj = Skybox.createSceneObject(GL, attribs, cube_texture, scale); //
  var islandData = Island.createSceneObject(
    GL,
    attribs,
    ground_texture,
    scale,
    gridSize,
    islandRadius,
    texture_repeat
  ); //
  var waterData = Water.createSceneObject(GL, attribs, water_texture, scale); //
  var treeData = Trees.createSceneObject(
    GL,
    attribs,
    islandRadius,
    islandData.getIslandHeight_func,
    waterData.waterLevel
  ); //
  // var spiderData = Spiders.createSceneObjects(GL, attribs, treeData.validTreePositions); // Tetap dikomentari

  // Pokemon Base (Tetap Sama)
  const pokemonBaseRadius = 300; //
  const pokemonBaseHeight = 50; //
  const pokemonSpikeHeight = 200; //
  const pokemonNumSpikes = 10; //
  const pokemonBaseColor = [0.4, 0.4, 0.4]; //
  const pokemonSpikeColor = [0.2, 0.2, 0.2]; //
  const pokemonBaseYPosition = waterData.waterLevel + 300; //

  var pokemonBaseObj = PokemonBase.createSceneObject(
    GL,
    attribs,
    pokemonBaseRadius,
    pokemonBaseHeight,
    pokemonSpikeHeight,
    pokemonNumSpikes,
    pokemonBaseColor,
    pokemonSpikeColor,
    pokemonBaseYPosition
  ); //

  /*======================== MEMBANGUN SCENE GRAPH (Tetap Sama) ======================== */

  var islandNode = new Node(); //
  islandNode.setGeometry(islandData.sceneObject); //

  var treeNode = new Node(); //
  treeNode.setGeometry(treeData.sceneObject); //

  // var spiderNode = new Node(); // Tetap dikomentari
  // spiderNode.setGeometry(spiderData.spiderObj);

  var waterNode = new Node(); //
  waterNode.setGeometry(waterData.sceneObject); //

  var webNode = new Node(); //
  // webNode.setGeometry(spiderData.webObj); // Tetap dikomentari

  // Pokemon Base Node (Tetap Sama)
  var pokemonBaseNode1 = new Node(); //
  pokemonBaseNode1.setGeometry(pokemonBaseObj); //
  LIBS.translateY(pokemonBaseNode1.localMatrix, 350); //

  /*================= MATRIKS & KONTROL KAMERA (IMPROVED) =================*/
  // --- IMPROVEMENT: Update Proyeksi saat resize (dari Zubat) ---
  let PROJMATRIX = LIBS.get_I4(); // Deklarasi ulang
  const MOVEMATRIX = LIBS.get_I4(); // Matriks global objek (tidak diputar kamera)
  const VIEWMATRIX = LIBS.get_I4(); // Matriks kamera
  var SKYBOX_VMATRIX = LIBS.get_I4(); // Matriks khusus skybox

  function updateProjectionMatrix() {
    PROJMATRIX = LIBS.get_projection(
      40,
      CANVAS.width / CANVAS.height,
      10,
      12000
    ); // Near/Far disesuaikan dengan environment
  }
  updateProjectionMatrix();

  // Posisi awal kamera (disesuaikan agar pas dengan environment)
  var camX = 0,
    camY = waterData.waterLevel + 200,
    camZ = islandRadius + 500; // (Y di atas air, Z di luar pulau)

  // Variabel interaksi (sama seperti sebelumnya, tapi friction diubah)
  var keys = {}; //
  var THETA = 0,
    PHI = 0; //
  var drag = false; //
  var x_prev, y_prev; //
  // --- IMPROVEMENT: Friction disesuaikan agar lebih halus ---
  var FRICTION = 0.1; // (Sebelumnya 0.05)
  var dX = 0,
    dY = 0; //

  // Event Listeners Mouse (Sensitivity disesuaikan)
  var mouseDown = function (e) {
    drag = true; //
    (x_prev = e.pageX), (y_prev = e.pageY); //
    e.preventDefault(); //
    return false;
  }; //
  var mouseUp = function (e) {
    drag = false; //
  }; //
  var mouseOut = function (e) {
    drag = false; //
  }; //
  var mouseMove = function (e) {
    if (!drag) return false; //
    // --- IMPROVEMENT: Sensitivitas mouse dikurangi ---
    var sensitivity = 0.15; // (Sebelumnya 0.3)
    dX = ((-(e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width) * sensitivity; //
    dY = ((-(e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height) * sensitivity; //
    THETA += dX; //
    PHI += dY; //
    // Batasi sudut Phi agar tidak terbalik
    PHI = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, PHI));
    (x_prev = e.pageX), (y_prev = e.pageY); //
    e.preventDefault(); //
  }; //
  CANVAS.addEventListener("mousedown", mouseDown, false); //
  CANVAS.addEventListener("mouseup", mouseUp, false); //
  CANVAS.addEventListener("mouseout", mouseOut, false); //
  CANVAS.addEventListener("mousemove", mouseMove, false); //

  // Event Listeners Keyboard (Tetap Sama)
  var keyDown = function (e) {
    keys[e.key.toLowerCase()] = true; // Konversi ke lowercase
  }; //
  var keyUp = function (e) {
    keys[e.key.toLowerCase()] = false; // Konversi ke lowercase
  }; //
  window.addEventListener("keydown", keyDown, false); //
  window.addEventListener("keyup", keyUp, false); //

  // --- IMPROVEMENT: Listener Resize (dari Zubat) ---
  window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(CANVAS);
    updateProjectionMatrix(); // Update proyeksi saat resize
  });

  /*========================= DRAWING SETUP ========================= */
  GL.enable(GL.DEPTH_TEST); //
  GL.depthFunc(GL.LEQUAL); //
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MIN_SRC_ALPHA); //
  GL.clearColor(0.0, 0.0, 0.0, 1.0); //
  GL.clearDepth(1.0); //

  var time_prev = 0; //

  /*========================= ANIMATION LOOP (IMPROVED MOVEMENT) ========================= */
  var animate = function (time) {
    // --- IMPROVEMENT: Hapus viewport dari loop ---
    // GL.viewport(0, 0, CANVAS.width, CANVAS.height); // <-- DIHAPUS
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT); //

    // --- Update Kamera ---
    var dt = time - time_prev; //
    if (!dt || dt === 0) dt = 16.67; // Handle frame pertama atau jeda
    time_prev = time; //
    var moveSpeed = 10.0; //
    var currentSpeed = moveSpeed * (dt / 16.67); //

    // Hitung vektor arah (sama seperti sebelumnya)
    var forward_X = Math.sin(THETA) * Math.cos(PHI); //
    var forward_Y = -Math.sin(PHI); //
    var forward_Z = Math.cos(THETA) * Math.cos(PHI); //
    var right_X = Math.cos(THETA); //
    // --- IMPROVEMENT: Perbaiki perhitungan right_Z ---
    var right_Z = Math.sin(THETA); // (Sebelumnya -Math.sin(THETA))

    // --- IMPROVEMENT: Balik logika W/S dan perbaiki A/D ---
    if (keys["s"]) {
      // Maju
      camX += forward_X * currentSpeed; //
      camY += forward_Y * currentSpeed; //
      camZ += forward_Z * currentSpeed; //
    }
    if (keys["w"]) {
      // Mundur
      camX -= forward_X * currentSpeed; //
      camY -= forward_Y * currentSpeed; //
      camZ -= forward_Z * currentSpeed; //
    }
    if (keys["a"]) {
      // Geser Kiri
      camX -= right_X * currentSpeed; //
      camZ -= right_Z * currentSpeed; //
    }
    if (keys["d"]) {
      // Geser Kanan
      camX += right_X * currentSpeed; //
      camZ += right_Z * currentSpeed; //
    }
    // Naik/Turun (Q/E) tetap sama
    if (keys["e"]) {
      camY += currentSpeed; //
    }
    if (keys["q"]) {
      camY -= currentSpeed; //
    }

    // Terapkan friction pada rotasi mouse (sama seperti sebelumnya)
    if (!drag) {
      //
      dX *= 1 - FRICTION; //
      dY *= 1 - FRICTION; //
      THETA += dX; //
      PHI += dY; //
      // Batasi Phi lagi setelah friction
      PHI = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, PHI));
    }

    // Hitung View Matrix (FPS Style - sama seperti sebelumnya)
    LIBS.set_I4(VIEWMATRIX); //
    LIBS.rotateX(VIEWMATRIX, -PHI); //
    LIBS.rotateY(VIEWMATRIX, -THETA); //
    LIBS.translateX(VIEWMATRIX, -camX); //
    LIBS.translateY(VIEWMATRIX, -camY); //
    LIBS.translateZ(VIEWMATRIX, -camZ); //

    // Hitung View Matrix Skybox (hanya rotasi)
    LIBS.set_I4(SKYBOX_VMATRIX); //
    LIBS.rotateX(SKYBOX_VMATRIX, -PHI); //
    LIBS.rotateY(SKYBOX_VMATRIX, -THETA); //

    // --- Set Uniforms Global ---
    GL.uniformMatrix4fv(uniforms._Pmatrix, false, PROJMATRIX); //
    GL.uniform3f(uniforms._ambientLight, 0.25, 0.25, 0.4); //
    GL.uniform3f(uniforms._moonLightDirection, 0.0, -1.2, -0.7); //

    // --- URUTAN RENDER (Tetap Sama) ---

    // 1. SKYBOX
    GL.disable(GL.BLEND); //
    GL.uniformMatrix4fv(uniforms._Vmatrix, false, SKYBOX_VMATRIX); //
    GL.uniform1i(uniforms._isSkybox, true); //
    skyboxObj.draw(MOVEMATRIX, uniforms); // Menggunakan MOVEMATRIX (identitas)
    GL.uniform1i(uniforms._isSkybox, false); //

    // 2. Obyek Opaque
    GL.uniformMatrix4fv(uniforms._Vmatrix, false, VIEWMATRIX); // Ganti ke VIEWMATRIX normal
    islandNode.draw(MOVEMATRIX, uniforms); //
    treeNode.draw(MOVEMATRIX, uniforms); //
    pokemonBaseNode1.draw(MOVEMATRIX, uniforms); //

    // 3. Obyek Transparan
    GL.enable(GL.BLEND); //
    // webNode.draw(MOVEMATRIX, uniforms); // Tetap dikomentari
    waterNode.draw(MOVEMATRIX, uniforms); //

    GL.flush(); //
    window.requestAnimationFrame(animate); //
  }; //

  animate(0); //
} //

main(); //
