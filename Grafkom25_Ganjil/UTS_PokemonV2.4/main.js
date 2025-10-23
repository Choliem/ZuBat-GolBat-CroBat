// 1. IMPORT MODULES UTAMA
import { Node } from "./models/Node.js";
import { SceneObject } from "./models/SceneObject.js";
import { Shaders } from "./models/Shaders.js";
import { Skybox } from "./models/Skybox.js";
import { Island } from "./models/Island.js";
import { Water } from "./models/Water.js";
import { Trees } from "./models/Trees.js";
import { Spiders } from "./models/Spiders.js";
import { PokemonBase } from "./models/PokemonBase.js";
import { Volcano } from "./models/Volcano.js";
import { SmokeParticles } from "./models/SmokeParticles.js";
import { Clouds } from "./models/Clouds2.js";

// 2. IMPORT SONIC WAVES (Masih dibutuhkan untuk spawn)
import { ZubatSonicWave } from "./models/Zubat/ZubatSonicWave.js";
import { GolbatSonicWave } from "./models/Golbat/GolbatSonicWave.js";
import { CrobatSonicWave } from "./models/Crobat/CrobatSonicWave.js";

// 3. IMPORT SCENE GRAPH FACTORIES
// (Impor bagian-bagian Pokémon individu seperti CrobatBody, dll. dihapus)
import { createCrobatSceneGraph } from "./models/Crobat/CrobatFactory.js"; // Path 'crobat' huruf kecil sesuai aslinya
import { createGolbatSceneGraph } from "./models/Golbat/GolbatFactory.js";
import { createZubatSceneGraph } from "./models/Zubat/ZubatFactory.js";

// 4. IMPORT UTILS
import { compile_shader, load_texture, createWaterTexture } from "./utils/webglUtils.js";

// --- FUNGSI createCrobatSceneGraph, createGolbatSceneGraph, createZubatSceneGraph DIHAPUS DARI SINI ---
// --- Mereka sekarang ada di file Factory masing-masing ---

function main() {
  var CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  var GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
    GL.getExtension("OES_element_index_uint");
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }

  /*========================= SHADERS ========================= */
  var shader_vertex_source = Shaders.vertex_source;
  var shader_fragment_source = Shaders.fragment_source;

  // --- FUNGSI compile_shader DIHAPUS DARI SINI ---
  // Sekarang diimpor dari webglUtils.js

  // Pemanggilan diupdate untuk menyertakan GL
  var shader_vertex = compile_shader(GL, shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment = compile_shader(GL, shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

  var SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  GL.linkProgram(SHADER_PROGRAM);
  if (!GL.getProgramParameter(SHADER_PROGRAM, GL.LINK_STATUS)) {
    alert("Could not initialise shaders. See console for details.");
    console.error("Shader Linker Error: " + GL.getProgramInfoLog(SHADER_PROGRAM));
    return;
  }

  /*===================== KUMPULKAN ATTRIBUTES & UNIFORMS ===================== */
  var attribs = {
    _position: GL.getAttribLocation(SHADER_PROGRAM, "position"),
    _uv: GL.getAttribLocation(SHADER_PROGRAM, "uv"),
    _color: GL.getAttribLocation(SHADER_PROGRAM, "color"),
    _normal: GL.getAttribLocation(SHADER_PROGRAM, "normal"),
  };
  var uniforms = {
    _Pmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix"),
    _Vmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix"),
    _Mmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix"),
    _sampler: GL.getUniformLocation(SHADER_PROGRAM, "sampler"),
    _isSkybox: GL.getUniformLocation(SHADER_PROGRAM, "u_isSkybox"),
    _useTexture: GL.getUniformLocation(SHADER_PROGRAM, "u_useTexture"),
    _isWeb: GL.getUniformLocation(SHADER_PROGRAM, "u_isWeb"),
    _ambientColor: GL.getUniformLocation(SHADER_PROGRAM, "ambientColor"),
    _moonLightDirection: GL.getUniformLocation(SHADER_PROGRAM, "u_moonLightDirection"),
    _lightDirection: GL.getUniformLocation(SHADER_PROGRAM, "lightDirection"),
    _lightColor: GL.getUniformLocation(SHADER_PROGRAM, "lightColor"),
    _useLighting: GL.getUniformLocation(SHADER_PROGRAM, "u_useLighting"),
    _isUnlit: GL.getUniformLocation(SHADER_PROGRAM, "u_isUnlit"),
  };
  GL.useProgram(SHADER_PROGRAM);

  /*========================= TEXTURES =========================*/
  // --- FUNGSI load_texture & createWaterTexture DIHAPUS DARI SINI ---
  // Sekarang diimpor dari webglUtils.js

  // Pemanggilan diupdate untuk menyertakan GL
  var cube_texture = load_texture(GL, "night.png", GL.CLAMP_TO_EDGE, false);
  var ground_texture = load_texture(GL, "grass1.png", GL.REPEAT, true);
  var water_texture = createWaterTexture(GL);

  /*======================== MEMBUAT SCENE OBJECTS ======================== */
  const scale = 3000;
  const gridSize = 80;
  const islandRadius = scale * 0.7;
  const texture_repeat = 20;
  var skyboxObj = Skybox.createSceneObject(GL, attribs, cube_texture, scale);
  var islandData = Island.createSceneObject(GL, attribs, ground_texture, scale, gridSize, islandRadius, texture_repeat);
  var waterData = Water.createSceneObject(GL, attribs, water_texture, scale);
  var treeData = Trees.createSceneObject(GL, attribs, islandRadius, islandData.getIslandHeight_func, waterData.waterLevel);
  var spiderData = Spiders.createSceneObjects(GL, attribs, treeData.validTreePositions);

  // -- CLOUD --
  const numClouds = 45;
  const skyRadius = scale * 2.5;
  const skyHeight = 500;
  var cloudData = Clouds.createSceneObjects(GL, attribs, numClouds, skyRadius, skyHeight);

  // -- POKEMON BASE --
  const pokemonBaseRadius = 300;
  const pokemonBaseHeight = 50;
  const pokemonSpikeHeight = 200;
  const pokemonNumSpikes = 10;
  const pokemonBaseColor = [0.4, 0.4, 0.4];
  const pokemonSpikeColor = [0.2, 0.2, 0.2];
  const pokemonBaseYPosition = waterData.waterLevel + 300;
  var pokemonBaseObj = PokemonBase.createSceneObject(GL, attribs, pokemonBaseRadius, pokemonBaseHeight, pokemonSpikeHeight, pokemonNumSpikes, pokemonBaseColor, pokemonSpikeColor, pokemonBaseYPosition);

  // --- MEMBUAT GUNUNG BERAPI ---
  const volcanoBaseRadius = 1500; // Radius alas
  const volcanoHeight = 2000; // Ketinggian
  const volcanoSegments = 20; // Segi-20 (cukup low-poly untuk latar)
  var volcanoObj = Volcano.createSceneObject(GL, attribs, volcanoBaseRadius, volcanoHeight, volcanoSegments);

  // --- GUNUNG BERAPI 2 (Kiri) ---
  const volcanoBaseRadius2 = 1800; // Radius alas (sedikit lebih besar)
  const volcanoHeight2 = 2300; // Ketinggian (sedikit lebih tinggi)
  var volcanoObj2 = Volcano.createSceneObject(
    GL,
    attribs,
    volcanoBaseRadius2,
    volcanoHeight2,
    volcanoSegments // Segments bisa sama
  );

  /*======================== MEMBANGUN SCENE GRAPH ======================== */
  var islandNode = new Node();
  islandNode.setGeometry(islandData.sceneObject);
  var treeNode = new Node();
  treeNode.setGeometry(treeData.sceneObject);
  var spiderNode = new Node();
  spiderNode.setGeometry(spiderData.spiderObj);
  var waterNode = new Node();
  waterNode.setGeometry(waterData.sceneObject);
  var webNode = new Node();
  webNode.setGeometry(spiderData.webObj);
  var globalCloudRootNode = new Node(); // Node induk untuk semua awan
  // Tambahkan semua 90 node awan sebagai anak dari induk
  for (const node of cloudData.cloudNodes) {
    globalCloudRootNode.add(node);
  }
  // --- GUNUNG BERAPI 1 (Kanan) ---
  var volcanoNodeRight = new Node();
  volcanoNodeRight.setGeometry(volcanoObj);
  // Posisikan gunung berapi:
  LIBS.translateY(volcanoNodeRight.localMatrix, -2100);
  LIBS.translateX(volcanoNodeRight.localMatrix, 1000);
  LIBS.translateZ(volcanoNodeRight.localMatrix, -3300);

  // --- GUNUNG BERAPI 2 (Kiri) ---
  var volcanoNodeLeft = new Node();
  volcanoNodeLeft.setGeometry(volcanoObj2);
  // Posisikan gunung berapi:
  LIBS.translateY(volcanoNodeLeft.localMatrix, -2500);
  LIBS.translateX(volcanoNodeLeft.localMatrix, -1450);
  LIBS.translateZ(volcanoNodeLeft.localMatrix, -3800);
  // --- AKHIR TAMBAHAN ---

  // --- NODE POKEMON BASE 1 (CROBAT) ---
  var pokemonBaseNode1 = new Node();
  pokemonBaseNode1.setGeometry(pokemonBaseObj);
  LIBS.translateY(pokemonBaseNode1.localMatrix, 350);

  var crobatAnimatorNode = new Node();
  pokemonBaseNode1.add(crobatAnimatorNode);

  var crobatData = createCrobatSceneGraph(GL, attribs); // Pemanggilan fungsi yang diimpor
  var crobatRootNode = crobatData.root;
  LIBS.scale(crobatRootNode.localMatrix, 60, 60, 60);
  crobatAnimatorNode.add(crobatRootNode);

  // --- BARU: Manager Serangan Crobat ---
  const crobatSonicAttackManager = new Node();
  crobatAnimatorNode.add(crobatSonicAttackManager);

  // --- NODE POKEMON BASE 2 (GOLBAT) ---
  var pokemonBaseNode2 = new Node();
  pokemonBaseNode2.setGeometry(pokemonBaseObj);
  LIBS.translateX(pokemonBaseNode2.localMatrix, 800);
  LIBS.translateY(pokemonBaseNode2.localMatrix, 350);

  var golbatAnimatorNode = new Node();
  pokemonBaseNode2.add(golbatAnimatorNode);

  var golbatData = createGolbatSceneGraph(GL, attribs); // Pemanggilan fungsi yang diimpor
  var golbatRootNode = golbatData.root;
  LIBS.scale(golbatRootNode.localMatrix, 45, 45, 45); // Scale Golbat
  golbatAnimatorNode.add(golbatRootNode);

  // --- BARU: Manager Serangan Golbat ---
  const golbatSonicAttackManager = new Node();
  golbatAnimatorNode.add(golbatSonicAttackManager);

  // --- NODE POKEMON BASE 3 (ZUBAT) ---
  var pokemonBaseNode3 = new Node();
  pokemonBaseNode3.setGeometry(pokemonBaseObj);
  LIBS.translateX(pokemonBaseNode3.localMatrix, -800);
  LIBS.translateY(pokemonBaseNode3.localMatrix, 350);

  var zubatAnimatorNode = new Node();
  pokemonBaseNode3.add(zubatAnimatorNode);

  var zubatData = createZubatSceneGraph(GL, attribs); // Pemanggilan fungsi yang diimpor
  var zubatRootNode = zubatData.root;
  LIBS.scale(zubatRootNode.localMatrix, 20, 20, 20); // Scale Zubat
  zubatAnimatorNode.add(zubatRootNode);

  // --- Manager Serangan Zubat ---
  const zubatSonicAttackManager = new Node();
  zubatAnimatorNode.add(zubatSonicAttackManager);

  /*================= INISIALISASI SISTEM ASAP =================*/
  const craterInfos = [
    {
      pos: { x: 1000, y: -2100 + 2000 / 2, z: -3300 },
      radius: 1500 * 0.4,
      count: 50,
    },
    {
      pos: { x: -1400, y: -2550 + 2300 / 2, z: -3600 },
      radius: 1800 * 0.4,
      count: 30,
    },
  ];
  var globalSmokeRootNode = SmokeParticles.init(GL, attribs, craterInfos);
  /*================= AKHIR INISIALISASI ASAP =================*/

  /*================= MATRIKS & KONTROL KAMERA =================*/
  var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 10, 12000);
  var MOVEMATRIX = LIBS.get_I4();
  var VIEWMATRIX = LIBS.get_I4();
  var SKYBOX_VMATRIX = LIBS.get_I4();
  var camX = 0,
    camZ = 2000,
    camY = -2000;
  var keys = {};
  var THETA = 0,
    PHI = 0;
  var drag = false;
  var x_prev, y_prev;
  var FRICTION = 0.05;
  var dX = 0,
    dY = 0;

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
  var mouseOut = function (e) {
    drag = false;
  };
  var mouseMove = function (e) {
    if (!drag) return false;
    dX = ((-(e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width) * 0.3;
    dY = ((-(e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height) * 0.3;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  };
  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseOut, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);

  /*================= VARIABEL & FUNGSI ANIMASI =================*/

  // --- Variabel State untuk Animasi Sonic Wave (Zubat) ---
  let zubatActiveWaves = [];
  let zubatLastWaveSpawnTime = 0;
  const zubatWaveSpawnInterval = 400;
  const zubatWaveLifespan = 2000;
  const zubatWaveMaxScale = 5.0;
  const zubatWaveSpeed = 8.0;
  const zubatWaveOptions = {
    numRings: 1,
    ringSpacing: 0,
    baseRadius: 10.5,
    radiusGrowth: 0,
    tubeThickness: 0.5,
    mainSegments: 32,
    tubeSegments: 8,
  };
  let isZubatAutoAttacking = false;
  let isKeyZPressed = false; // Tombol 'Z' untuk Zubat

  // ---Variabel State untuk Animasi Sonic Wave (Golbat) ---
  let golbatActiveWaves = [];
  let golbatLastWaveSpawnTime = 0;
  const golbatWaveSpawnInterval = 350; // Sedikit lebih cepat dari Zubat
  const golbatWaveLifespan = 2200;
  const golbatWaveMaxScale = 6.0;
  const golbatWaveSpeed = 10.0;
  const golbatWaveOptions = {
    // Bisa disesuaikan
    numRings: 1,
    ringSpacing: 0,
    baseRadius: 20.0,
    radiusGrowth: 0, // Lebih besar
    tubeThickness: 0.5,
    mainSegments: 32,
    tubeSegments: 8,
    color: [0.6, 0.7, 1.0], // Warna sedikit beda
  };
  let isGolbatAutoAttacking = false;
  let isKeyGPressed = false;

  // --- Variabel State untuk Animasi Sonic Wave (Crobat) ---
  let crobatActiveWaves = [];
  let crobatLastWaveSpawnTime = 0;
  const crobatWaveSpawnInterval = 300; // Paling cepat
  const crobatWaveLifespan = 2500;
  const crobatWaveMaxScale = 7.0;
  const crobatWaveSpeed = 12.0;
  const crobatWaveOptions = {
    // Bisa disesuaikan
    numRings: 1,
    ringSpacing: 0,
    baseRadius: 30.0,
    radiusGrowth: 0, // Paling besar
    tubeThickness: 0.5,
    mainSegments: 32,
    tubeSegments: 8,
    color: [0.7, 0.6, 1.0], // Warna sedikit beda lagi
  };
  let isCrobatAutoAttacking = false;
  let isKeyCPressed = false;

  // --- Fungsi Helper untuk Spawn Gelombang (Zubat) ---
  function spawnNewZubatWave(spawnTime) {
    const wave = new ZubatSonicWave(GL, attribs, zubatWaveOptions);
    wave.spawnTime = spawnTime;
    wave.lifespan = zubatWaveLifespan;
    zubatSonicAttackManager.add(wave);
    zubatActiveWaves.push(wave);
    zubatLastWaveSpawnTime = spawnTime;
  }
  // --- Fungsi Helper untuk Spawn Gelombang (Golbat) ---
  function spawnNewGolbatWave(spawnTime) {
    const wave = new GolbatSonicWave(GL, attribs, golbatWaveOptions); // Gunakan class Golbat
    wave.spawnTime = spawnTime;
    wave.lifespan = golbatWaveLifespan;
    golbatSonicAttackManager.add(wave);
    golbatActiveWaves.push(wave); // Gunakan manager & array Golbat
    golbatLastWaveSpawnTime = spawnTime;
  }
  // --- Fungsi Helper untuk Spawn Gelombang (Crobat) ---
  function spawnNewCrobatWave(spawnTime) {
    const wave = new CrobatSonicWave(GL, attribs, crobatWaveOptions); // Gunakan class Crobat
    wave.spawnTime = spawnTime;
    wave.lifespan = crobatWaveLifespan;
    crobatSonicAttackManager.add(wave);
    crobatActiveWaves.push(wave); // Gunakan manager & array Crobat
    crobatLastWaveSpawnTime = spawnTime;
  }

  // --- Event Listeners untuk Keyboard (Trigger + Kamera) ---
  var keyDown = function (e) {
    keys[e.key] = true; // Hanya simpan status tombol
    const keyLower = e.key.toLowerCase(); // Handle Caps Lock

    // --- LOGIKA UNTUK TRIGGER SERANGAN ---

    // Zubat ('Z' / '1')
    if (keyLower === "z") {
      if (isKeyZPressed) return; // Hindari key repeat
      isKeyZPressed = true;
      isZubatAutoAttacking = false; // Matikan auto jika aktif
      spawnNewZubatWave(performance.now()); // Langsung spawn saat klik
    }
    if (keyLower === "1") {
      // Toggle Auto Zubat
      if (!keys["1Processed"]) {
        // Hindari key repeat
        isZubatAutoAttacking = !isZubatAutoAttacking;
        keys["1Processed"] = true; // Tandai sudah diproses
      }
    }

    // Golbat ('G' / '2')
    if (keyLower === "g") {
      if (isKeyGPressed) return;
      isKeyGPressed = true;
      isGolbatAutoAttacking = false;
      spawnNewGolbatWave(performance.now());
    }
    if (keyLower === "2") {
      // Toggle Auto Golbat
      if (!keys["2Processed"]) {
        isGolbatAutoAttacking = !isGolbatAutoAttacking;
        keys["2Processed"] = true;
      }
    }

    // Crobat ('C' / '3')
    if (keyLower === "c") {
      if (isKeyCPressed) return;
      isKeyCPressed = true;
      isCrobatAutoAttacking = false;
      spawnNewCrobatWave(performance.now());
    }
    if (keyLower === "3") {
      // Toggle Auto Crobat
      if (!keys["3Processed"]) {
        isCrobatAutoAttacking = !isCrobatAutoAttacking;
        keys["3Processed"] = true;
      }
    }
  };

  var keyUp = function (e) {
    keys[e.key] = false; // Reset status umum tombol
    const keyLower = e.key.toLowerCase();

    // Reset flag "hold" untuk serangan manual
    if (keyLower === "z") {
      isKeyZPressed = false;
    }
    if (keyLower === "g") {
      isKeyGPressed = false;
    }
    if (keyLower === "c") {
      isKeyCPressed = false;
    }

    // Reset flag "processed" untuk toggle auto attack
    if (keyLower === "1") {
      keys["1Processed"] = false;
    }
    if (keyLower === "2") {
      keys["2Processed"] = false;
    }
    if (keyLower === "3") {
      keys["3Processed"] = false;
    }
  };

  window.addEventListener("keydown", keyDown, false);
  window.addEventListener("keyup", keyUp, false);

  /*========================= DRAWING ========================= */
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
  GL.clearColor(0.0, 0.0, 0.0, 1.0);
  GL.clearDepth(1.0);

  var time_prev = 0;

  // ========================================================
  // === AWAL BLOK ANIMASI (FSM Transisi Smooth) ===
  // ========================================================
  const idleFlipState = [
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 },
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 },
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 },
  ];
  const flipIntervals = [15000, 18000, 13000];
  const flipDurations = [1000, 1100, 900];
  const idleFlipAngles = [0, 0, 0];
  const idleFloats = [0, 0, 0];
  let activePokemonIndex = 0;
  let animationStage = "IDLE";
  let stageStartTime = 0;
  let currentPokemonYRotation = [0, 0, 0];
  let targetPokemonYRotation = [0, 0, 0];
  const baseNodes = [pokemonBaseNode3, pokemonBaseNode2, pokemonBaseNode1];
  const animatorNodes = [zubatAnimatorNode, golbatAnimatorNode, crobatAnimatorNode];
  const idleFlapData = [zubatData.wings, golbatData.wings, crobatData.wings];
  const IDLE_Y_OFFSET = -2250;
  const LIFT_Y_OFFSET = -1500;
  const ORBIT_RADIUS = 600;
  const ORBIT_X_ROTATION = 0.5;
  const DURATION_IDLE = 5000;
  const DURATION_LIFT_OFF = 2000;
  const DURATION_SMOOTH_TURN = 800;
  const DURATION_MOVE_TO_CENTER = 3000;
  const DURATION_MOVE_TO_ORBIT = 1500;
  const DURATION_TURN = 1000;
  const DURATION_CIRCLING = 15000;
  const DURATION_RETURN_TURN_1 = 1000;
  const DURATION_RETURN_MOVE = 1500;
  const DURATION_RETURN_TURN_2 = 1000;
  const DURATION_RETURN = 3000;
  const LERP = (a, b, t) => a + (b - a) * t;
  const calculateAngle = (fromX, fromZ, toX, toZ) => Math.atan2(toX - fromX, toZ - fromZ);

  // ========================================================
  // === LOOP ANIMASI UTAMA ===
  // ========================================================
  var animate = function (time) {
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    var dt = time - time_prev;
    if (dt === 0) dt = 16.67;
    time_prev = time;
    var moveSpeed = 10.0;
    var currentSpeed = moveSpeed * (dt / 16.67);
    var forward_X = Math.sin(THETA) * Math.cos(PHI);
    var forward_Y = -Math.sin(PHI);
    var forward_Z = Math.cos(THETA) * Math.cos(PHI);
    var right_X = Math.cos(THETA);
    var right_Z = -Math.sin(THETA);

    // --- Update Kamera ---
    if (keys["s"]) {
      camX += forward_X * currentSpeed;
      camY += forward_Y * currentSpeed;
      camZ += forward_Z * currentSpeed;
    }
    if (keys["w"]) {
      camX -= forward_X * currentSpeed;
      camY -= forward_Y * currentSpeed;
      camZ -= forward_Z * currentSpeed;
    }
    if (keys["a"]) {
      camX -= right_X * currentSpeed;
      camZ -= right_Z * currentSpeed;
    }
    if (keys["d"]) {
      camX += right_X * currentSpeed;
      camZ += right_Z * currentSpeed;
    }
    if (keys["e"]) {
      camY += currentSpeed;
    }
    if (keys["q"]) {
      camY -= currentSpeed;
    }
    if (!drag) {
      dX *= 1 - FRICTION;
      dY *= 1 - FRICTION;
      THETA += dX;
      PHI += dY;
    }

    var genericTime = time / 100.0;

    // --- 1. Animasi Idle Wing Flap ---
    // Zubat
    var floatSpeedZ = 1.5;
    var floatAmplitudeZ = 0.2 * 30;
    idleFloats[0] = Math.sin(genericTime * floatSpeedZ) * floatAmplitudeZ;
    var flapSpeedZ = 1.0;
    var flapAmplitudeZ = 0.15;
    var flapAngleZ = Math.sin(genericTime * flapSpeedZ) * flapAmplitudeZ;
    var zubatWings = idleFlapData[0];
    LIBS.set_I4(zubatWings.left.localMatrix);
    LIBS.translateY(zubatWings.left.localMatrix, 0.0);
    LIBS.translateX(zubatWings.left.localMatrix, 1.1);
    LIBS.rotateZ(zubatWings.left.localMatrix, 0.4 + flapAngleZ);
    LIBS.rotateY(zubatWings.left.localMatrix, 0.2);
    LIBS.set_I4(zubatWings.right.localMatrix);
    LIBS.scale(zubatWings.right.localMatrix, -1, 1, 1);
    LIBS.translateY(zubatWings.right.localMatrix, 0.0);
    LIBS.translateX(zubatWings.right.localMatrix, 1.2);
    LIBS.rotateZ(zubatWings.right.localMatrix, -0.4 - flapAngleZ);
    LIBS.rotateY(zubatWings.right.localMatrix, -0.2);
    // Golbat
    var floatSpeedG = 1.5;
    var floatAmplitudeG_idle = 0.2 * 80;
    idleFloats[1] = Math.sin(genericTime * floatSpeedG) * floatAmplitudeG_idle;
    var flapSpeedG = 1.0;
    var flapAmplitudeG = Math.PI / 4;
    var flapAngleG = Math.sin(genericTime * flapSpeedG) * flapAmplitudeG;
    var golbatWings = idleFlapData[1];
    LIBS.set_I4(golbatWings.left.localMatrix);
    LIBS.translateX(golbatWings.left.localMatrix, 0.5);
    LIBS.translateY(golbatWings.left.localMatrix, 0.1);
    LIBS.rotateZ(golbatWings.left.localMatrix, 0.3);
    LIBS.rotateY(golbatWings.left.localMatrix, 0.2 + flapAngleG);
    LIBS.rotateX(golbatWings.left.localMatrix, 0.7);
    LIBS.set_I4(golbatWings.right.localMatrix);
    LIBS.scale(golbatWings.right.localMatrix, -1, 1, 1);
    LIBS.translateX(golbatWings.right.localMatrix, 0.5);
    LIBS.translateY(golbatWings.right.localMatrix, 0.1);
    LIBS.rotateZ(golbatWings.right.localMatrix, -0.3);
    LIBS.rotateY(golbatWings.right.localMatrix, -0.2 - flapAngleG);
    LIBS.rotateX(golbatWings.right.localMatrix, 0.7);
    // Crobat
    var floatAmplitudeC = 20;
    idleFloats[2] = Math.sin(genericTime * 0.6) * floatAmplitudeC;
    var flapSpeedC = 0.6;
    var flapAmplitudeC = Math.PI / 12;
    var flapAngleC = Math.sin(genericTime * flapSpeedC) * flapAmplitudeC;
    var crobatWings = idleFlapData[2];
    LIBS.set_I4(crobatWings.upperLeft.localMatrix);
    LIBS.scale(crobatWings.upperLeft.localMatrix, 1.0, 1.0, 1.0);
    LIBS.rotateY(crobatWings.upperLeft.localMatrix, -0.25 + flapAngleC);
    LIBS.rotateZ(crobatWings.upperLeft.localMatrix, 0.0);
    LIBS.translateX(crobatWings.upperLeft.localMatrix, 2);
    LIBS.translateY(crobatWings.upperLeft.localMatrix, 1.0);
    LIBS.translateZ(crobatWings.upperLeft.localMatrix, -0.3);
    LIBS.set_I4(crobatWings.upperRight.localMatrix);
    LIBS.scale(crobatWings.upperRight.localMatrix, -1.0, 1.0, 1.0);
    LIBS.rotateY(crobatWings.upperRight.localMatrix, 0.25 - flapAngleC);
    LIBS.rotateZ(crobatWings.upperRight.localMatrix, 0);
    LIBS.translateX(crobatWings.upperRight.localMatrix, 2);
    LIBS.translateY(crobatWings.upperRight.localMatrix, 1.0);
    LIBS.translateZ(crobatWings.upperRight.localMatrix, -0.3);
    LIBS.set_I4(crobatWings.lowerLeft.localMatrix);
    LIBS.scale(crobatWings.lowerLeft.localMatrix, 0.5, 0.25, 0.25);
    LIBS.rotateY(crobatWings.lowerLeft.localMatrix, 3.2 + flapAngleC);
    LIBS.rotateZ(crobatWings.lowerLeft.localMatrix, 3.25);
    LIBS.translateY(crobatWings.lowerLeft.localMatrix, 3.5);
    LIBS.set_I4(crobatWings.lowerRight.localMatrix);
    LIBS.scale(crobatWings.lowerRight.localMatrix, -0.5, 0.25, 0.25);
    LIBS.rotateY(crobatWings.lowerRight.localMatrix, 3.0 - flapAngleC);
    LIBS.rotateZ(crobatWings.lowerRight.localMatrix, 3.0);
    LIBS.translateY(crobatWings.lowerRight.localMatrix, 3.5);

    // --- 2. Logika Idle Flip ---
    const currentTime = time;
    for (let i = 0; i < 3; i++) {
      let state = idleFlipState[i],
        interval = flipIntervals[i],
        duration = flipDurations[i],
        flipAngle = 0.0;
      if (!state.isFlipping && currentTime - state.lastFlipTime > interval) {
        state.isFlipping = true;
        state.flipStartTime = currentTime;
        state.lastFlipTime = currentTime;
      }
      if (state.isFlipping) {
        let flipProgress = (currentTime - state.flipStartTime) / duration;
        if (flipProgress >= 1.0) {
          flipProgress = 1.0;
          state.isFlipping = false;
        }
        flipAngle = flipProgress * -Math.PI * 2.0;
      }
      idleFlipAngles[i] = flipAngle;
    }

    // --- 3. Logika FSM Pokemon AKTIF ---
    let activeNode = animatorNodes[activePokemonIndex];
    let activeBase = baseNodes[activePokemonIndex];
    let activeBasePos = [activeBase.localMatrix[12], activeBase.localMatrix[13], activeBase.localMatrix[14]];
    let centerPos = [baseNodes[2].localMatrix[12], baseNodes[2].localMatrix[13], baseNodes[2].localMatrix[14]];
    let timeInStage = time - stageStartTime;
    LIBS.set_I4(activeNode.localMatrix);
    let currentX = 0,
      currentY = IDLE_Y_OFFSET,
      currentZ = 0;
    let currentRotationY = 0,
      currentRotationX = 0;
    let progress, startAngle, endAngle, targetLocalX, targetLocalZ, centerToBaseAngle;

    switch (animationStage) {
      case "IDLE": {
        let floatY = idleFloats[activePokemonIndex],
          flipAngle = idleFlipAngles[activePokemonIndex];
        currentRotationY = currentPokemonYRotation[activePokemonIndex];
        LIBS.translateY(activeNode.localMatrix, IDLE_Y_OFFSET + floatY);
        LIBS.rotateX(activeNode.localMatrix, flipAngle);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        if (timeInStage > DURATION_IDLE) {
          animationStage = "LIFT_OFF";
          stageStartTime = time;
        }
        break;
      }
      case "LIFT_OFF": {
        progress = Math.min(1.0, timeInStage / DURATION_LIFT_OFF);
        currentY = LERP(IDLE_Y_OFFSET, LIFT_Y_OFFSET, progress);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.rotateY(activeNode.localMatrix, currentPokemonYRotation[activePokemonIndex]);
        if (progress >= 1.0) {
          targetLocalX = centerPos[0] - activeBasePos[0];
          targetLocalZ = centerPos[2] - activeBasePos[2];
          targetPokemonYRotation[activePokemonIndex] = calculateAngle(0, 0, targetLocalX, targetLocalZ);
          animationStage = "TURN_TO_CENTER";
          stageStartTime = time;
        }
        break;
      }
      case "TURN_TO_CENTER": {
        progress = Math.min(1.0, timeInStage / DURATION_SMOOTH_TURN);
        startAngle = currentPokemonYRotation[activePokemonIndex];
        endAngle = targetPokemonYRotation[activePokemonIndex];
        currentRotationY = LERP(startAngle, endAngle, progress);
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        if (progress >= 1.0) {
          currentPokemonYRotation[activePokemonIndex] = endAngle;
          animationStage = "MOVE_TO_CENTER";
          stageStartTime = time;
        }
        break;
      }
      case "MOVE_TO_CENTER": {
        progress = Math.min(1.0, timeInStage / DURATION_MOVE_TO_CENTER);
        targetLocalX = centerPos[0] - activeBasePos[0];
        targetLocalZ = centerPos[2] - activeBasePos[2];
        currentX = LERP(0, targetLocalX, progress);
        currentZ = LERP(0, targetLocalZ, progress);
        currentY = LIFT_Y_OFFSET;
        currentRotationY = currentPokemonYRotation[activePokemonIndex];
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        if (progress >= 1.0) {
          targetPokemonYRotation[activePokemonIndex] = 0;
          animationStage = "TURN_TO_ORBIT";
          stageStartTime = time;
        }
        break;
      }
      case "TURN_TO_ORBIT": {
        progress = Math.min(1.0, timeInStage / DURATION_SMOOTH_TURN);
        startAngle = currentPokemonYRotation[activePokemonIndex];
        endAngle = targetPokemonYRotation[activePokemonIndex];
        currentRotationY = LERP(startAngle, endAngle, progress);
        currentX = centerPos[0] - activeBasePos[0];
        currentZ = centerPos[2] - activeBasePos[2];
        currentY = LIFT_Y_OFFSET;
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        if (progress >= 1.0) {
          currentPokemonYRotation[activePokemonIndex] = endAngle;
          animationStage = "MOVE_TO_ORBIT";
          stageStartTime = time;
        }
        break;
      }
      case "MOVE_TO_ORBIT": {
        progress = Math.min(1.0, timeInStage / DURATION_MOVE_TO_ORBIT);
        let startX = centerPos[0] - activeBasePos[0],
          startZ = centerPos[2] - activeBasePos[2],
          targetZ = startZ + ORBIT_RADIUS;
        currentX = startX;
        currentY = LIFT_Y_OFFSET;
        currentZ = LERP(startZ, targetZ, progress);
        currentRotationY = currentPokemonYRotation[activePokemonIndex];
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        if (progress >= 1.0) {
          animationStage = "TURN_AND_BEND";
          stageStartTime = time;
        }
        break;
      }
      case "TURN_AND_BEND": {
        progress = Math.min(1.0, timeInStage / DURATION_TURN);
        currentX = centerPos[0] - activeBasePos[0];
        currentY = LIFT_Y_OFFSET;
        currentZ = centerPos[2] - activeBasePos[2] + ORBIT_RADIUS;
        startAngle = currentPokemonYRotation[activePokemonIndex];
        endAngle = Math.PI / 2;
        currentRotationY = LERP(startAngle, endAngle, progress);
        currentRotationX = LERP(0, ORBIT_X_ROTATION, progress);
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        LIBS.rotateX(activeNode.localMatrix, currentRotationX);
        if (progress >= 1.0) {
          currentPokemonYRotation[activePokemonIndex] = endAngle;
          animationStage = "CIRCLING";
          stageStartTime = time;
        }
        break;
      }
      case "CIRCLING": {
        progress = (timeInStage % DURATION_CIRCLING) / DURATION_CIRCLING;
        let angle = progress * Math.PI * 2,
          circleX = Math.sin(angle) * ORBIT_RADIUS,
          circleZ = Math.cos(angle) * ORBIT_RADIUS;
        currentX = centerPos[0] - activeBasePos[0] + circleX;
        currentY = LIFT_Y_OFFSET;
        currentZ = centerPos[2] - activeBasePos[2] + circleZ;
        let nextAngle = angle + 0.1,
          nextX = Math.sin(nextAngle) * ORBIT_RADIUS,
          nextZ = Math.cos(nextAngle) * ORBIT_RADIUS;
        currentRotationY = calculateAngle(circleX, circleZ, nextX, nextZ);
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        LIBS.rotateX(activeNode.localMatrix, ORBIT_X_ROTATION);
        if (timeInStage > DURATION_CIRCLING) {
          currentPokemonYRotation[activePokemonIndex] = Math.PI / 2;
          animationStage = "PRE_RETURN_TURN";
          stageStartTime = time;
        }
        break;
      }
      case "PRE_RETURN_TURN": {
        progress = Math.min(1.0, timeInStage / DURATION_RETURN_TURN_1);
        currentX = centerPos[0] - activeBasePos[0];
        currentY = LIFT_Y_OFFSET;
        currentZ = centerPos[2] - activeBasePos[2] + ORBIT_RADIUS;
        startAngle = currentPokemonYRotation[activePokemonIndex];
        endAngle = Math.PI;
        currentRotationY = LERP(startAngle, endAngle, progress);
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        LIBS.rotateX(activeNode.localMatrix, ORBIT_X_ROTATION);
        if (progress >= 1.0) {
          currentPokemonYRotation[activePokemonIndex] = endAngle;
          animationStage = "PRE_RETURN_MOVE";
          stageStartTime = time;
        }
        break;
      }
      case "PRE_RETURN_MOVE": {
        progress = Math.min(1.0, timeInStage / DURATION_RETURN_MOVE);
        let startZ = centerPos[2] - activeBasePos[2] + ORBIT_RADIUS,
          endZ = centerPos[2] - activeBasePos[2];
        currentX = centerPos[0] - activeBasePos[0];
        currentY = LIFT_Y_OFFSET;
        currentZ = LERP(startZ, endZ, progress);
        currentRotationY = currentPokemonYRotation[activePokemonIndex];
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        LIBS.rotateX(activeNode.localMatrix, ORBIT_X_ROTATION);
        if (progress >= 1.0) {
          animationStage = "PRE_RETURN_TURN_FINAL";
          stageStartTime = time;
        }
        break;
      }
      case "PRE_RETURN_TURN_FINAL": {
        progress = Math.min(1.0, timeInStage / DURATION_RETURN_TURN_2);
        currentX = centerPos[0] - activeBasePos[0];
        currentY = LIFT_Y_OFFSET;
        currentZ = centerPos[2] - activeBasePos[2];
        startAngle = currentPokemonYRotation[activePokemonIndex];
        centerToBaseAngle = calculateAngle(currentX, currentZ, 0, 0);
        endAngle = centerToBaseAngle;
        currentRotationY = LERP(startAngle, endAngle, progress);
        currentRotationX = LERP(ORBIT_X_ROTATION, 0, progress);
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        LIBS.rotateX(activeNode.localMatrix, currentRotationX);
        if (progress >= 1.0) {
          currentPokemonYRotation[activePokemonIndex] = endAngle;
          animationStage = "RETURN_TO_BASE";
          stageStartTime = time;
        }
        break;
      }
      case "RETURN_TO_BASE": {
        progress = Math.min(1.0, timeInStage / DURATION_RETURN);
        let startX = centerPos[0] - activeBasePos[0],
          startZ = centerPos[2] - activeBasePos[2];
        currentX = LERP(startX, 0, progress);
        currentY = LERP(LIFT_Y_OFFSET, IDLE_Y_OFFSET, progress);
        currentZ = LERP(startZ, 0, progress);
        currentRotationY = currentPokemonYRotation[activePokemonIndex];
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, currentY);
        LIBS.translateZ(activeNode.localMatrix, currentZ);
        LIBS.rotateY(activeNode.localMatrix, currentRotationY);
        if (progress >= 1.0) {
          currentPokemonYRotation[activePokemonIndex] = 0;
          animationStage = "IDLE";
          stageStartTime = time;
          activePokemonIndex = (activePokemonIndex + 1) % 3;
        }
        break;
      }
    }

    // --- ANIMASI SONIC WAVE (Semua Pokemon) ---
    const currentTimeForWave = time; // Gunakan 'time' dari animate
    // --- ZUBAT ('Z' / '1') ---
    let timeSinceLastSpawn = currentTimeForWave - zubatLastWaveSpawnTime;
    // Cek trigger spawn Zubat
    if (isZubatAutoAttacking && timeSinceLastSpawn > zubatWaveSpawnInterval) {
      spawnNewZubatWave(currentTimeForWave);
    } else if (isKeyZPressed && timeSinceLastSpawn > zubatWaveSpawnInterval) {
      // Untuk 'Z' hold
      spawnNewZubatWave(currentTimeForWave);
    }
    // Update & Hapus gelombang Zubat (Logic sama seperti sebelumnya)
    let wavesToRemove = [];
    for (let wave of zubatActiveWaves) {
      /* ... Kode update & cek lifespan Zubat ... */
      const age = currentTimeForWave - wave.spawnTime;
      if (age > zubatWaveLifespan) {
        wavesToRemove.push(wave);
      } else {
        const progress = age / zubatWaveLifespan;
        const currentScale = 1.0 + progress * (zubatWaveMaxScale - 1.0);
        const currentZ_anim = progress * zubatWaveSpeed;
        const zubatWorldMatrix = animatorNodes[0].worldMatrix;
        const spawnOffsetY = 2 * 20;
        const spawnOffsetZ = 3 * 20;
        const M_scale = LIBS.get_I4();
        LIBS.scale(M_scale, currentScale, 1.0, currentScale);
        const M_rotate = LIBS.get_I4();
        LIBS.rotateX(M_rotate, Math.PI * 2); // Arahkan depan
        const M_translate_local = LIBS.get_I4();
        LIBS.translateY(M_translate_local, spawnOffsetY);
        LIBS.translateZ(M_translate_local, spawnOffsetZ + currentZ_anim);
        const M_LocalTransform = LIBS.multiply(M_translate_local, LIBS.multiply(M_rotate, M_scale));
        wave.localMatrix = LIBS.multiply(zubatWorldMatrix, M_LocalTransform); // Menggunakan multiply
      }
    }
    if (wavesToRemove.length > 0) {
      zubatSonicAttackManager.childs = zubatActiveWaves.filter((w) => !wavesToRemove.includes(w));
      zubatActiveWaves = zubatSonicAttackManager.childs;
    }

    // --- GOLBAT ('G' / '2') ---
    timeSinceLastSpawn = currentTimeForWave - golbatLastWaveSpawnTime;
    // Cek trigger spawn Golbat
    if (isGolbatAutoAttacking && timeSinceLastSpawn > golbatWaveSpawnInterval) {
      spawnNewGolbatWave(currentTimeForWave);
    } else if (isKeyGPressed && timeSinceLastSpawn > golbatWaveSpawnInterval) {
      // Untuk 'G' hold
      spawnNewGolbatWave(currentTimeForWave);
    }
    // Update & Hapus gelombang Golbat (Logic sama, variabel berbeda)
    wavesToRemove = [];
    for (let wave of golbatActiveWaves) {
      /* ... Kode update & cek lifespan Golbat ... */
      const age = currentTimeForWave - wave.spawnTime;
      if (age > golbatWaveLifespan) {
        wavesToRemove.push(wave);
      } else {
        const progress = age / golbatWaveLifespan;
        const currentScale = 1.0 + progress * (golbatWaveMaxScale - 1.0);
        const currentZ_anim = progress * golbatWaveSpeed;
        const golbatWorldMatrix = animatorNodes[1].worldMatrix;
        const spawnOffsetY = -0.1 * 45;
        const spawnOffsetZ = 0.7 * 45;
        const M_scale = LIBS.get_I4();
        LIBS.scale(M_scale, currentScale, 1.0, currentScale);
        const M_rotate = LIBS.get_I4();
        LIBS.rotateX(M_rotate, Math.PI * 2); // Arahkan depan
        const M_translate_local = LIBS.get_I4();
        LIBS.translateY(M_translate_local, spawnOffsetY);
        LIBS.translateZ(M_translate_local, spawnOffsetZ + currentZ_anim);
        const M_LocalTransform = LIBS.multiply(M_translate_local, LIBS.multiply(M_rotate, M_scale));
        wave.localMatrix = LIBS.multiply(golbatWorldMatrix, M_LocalTransform); // Menggunakan multiply
      }
    }
    if (wavesToRemove.length > 0) {
      golbatSonicAttackManager.childs = golbatActiveWaves.filter((w) => !wavesToRemove.includes(w));
      golbatActiveWaves = golbatSonicAttackManager.childs;
    }

    // --- CROBAT ('C' / '3') ---
    timeSinceLastSpawn = currentTimeForWave - crobatLastWaveSpawnTime;
    // Cek trigger spawn Crobat
    if (isCrobatAutoAttacking && timeSinceLastSpawn > crobatWaveSpawnInterval) {
      spawnNewCrobatWave(currentTimeForWave);
    } else if (isKeyCPressed && timeSinceLastSpawn > crobatWaveSpawnInterval) {
      // Untuk 'C' hold
      spawnNewCrobatWave(currentTimeForWave);
    }
    // Update & Hapus gelombang Crobat (Logic sama, variabel berbeda)
    wavesToRemove = [];
    for (let wave of crobatActiveWaves) {
      /* ... Kode update & cek lifespan Crobat ... */
      const age = currentTimeForWave - wave.spawnTime;
      if (age > crobatWaveLifespan) {
        wavesToRemove.push(wave);
      } else {
        const progress = age / crobatWaveLifespan;
        const currentScale = 1.0 + progress * (crobatWaveMaxScale - 1.0);
        const currentZ_anim = progress * crobatWaveSpeed;
        const crobatWorldMatrix = animatorNodes[2].worldMatrix;
        const spawnOffsetY = -0.3 * 60;
        const spawnOffsetZ = 1.3 * 60;
        const M_scale = LIBS.get_I4();
        LIBS.scale(M_scale, currentScale, 1.0, currentScale);
        const M_rotate = LIBS.get_I4();
        LIBS.rotateX(M_rotate, Math.PI * 2); // Arahkan depan
        const M_translate_local = LIBS.get_I4();
        LIBS.translateY(M_translate_local, spawnOffsetY);
        LIBS.translateZ(M_translate_local, spawnOffsetZ + currentZ_anim);
        const M_LocalTransform = LIBS.multiply(M_translate_local, LIBS.multiply(M_rotate, M_scale));
        wave.localMatrix = LIBS.multiply(crobatWorldMatrix, M_LocalTransform); // Menggunakan multiply
      }
    }

    if (wavesToRemove.length > 0) {
      crobatSonicAttackManager.childs = crobatActiveWaves.filter((w) => !wavesToRemove.includes(w));
      crobatActiveWaves = crobatSonicAttackManager.childs;
    }

    // --- 4. Terapkan Animasi Idle ke Pokemon NON-AKTIF ---
    for (let i = 0; i < animatorNodes.length; i++) {
      if (i !== activePokemonIndex) {
        let inactiveNode = animatorNodes[i],
          floatY = idleFloats[i],
          flipAngle = idleFlipAngles[i];
        currentPokemonYRotation[i] = 0;
        LIBS.set_I4(inactiveNode.localMatrix);
        LIBS.translateY(inactiveNode.localMatrix, IDLE_Y_OFFSET + floatY);
        LIBS.rotateX(inactiveNode.localMatrix, flipAngle);
        LIBS.rotateY(inactiveNode.localMatrix, 0);
      }
    }

    // --- 5. Update World Matrix ---
    pokemonBaseNode1.updateWorldMatrix(MOVEMATRIX);
    pokemonBaseNode2.updateWorldMatrix(MOVEMATRIX);
    pokemonBaseNode3.updateWorldMatrix(MOVEMATRIX);
    // Update world matrix untuk manager (meskipun kosong, ini best practice)
    globalCloudRootNode.updateWorldMatrix(MOVEMATRIX);
    globalSmokeRootNode.updateWorldMatrix(MOVEMATRIX);
    islandNode.updateWorldMatrix(MOVEMATRIX);
    treeNode.updateWorldMatrix(MOVEMATRIX);
    spiderNode.updateWorldMatrix(MOVEMATRIX);
    waterNode.updateWorldMatrix(MOVEMATRIX);
    webNode.updateWorldMatrix(MOVEMATRIX);
    volcanoNodeRight.updateWorldMatrix(MOVEMATRIX);
    volcanoNodeLeft.updateWorldMatrix(MOVEMATRIX);

    // --- 6. Set Uniforms Global ---
    LIBS.set_I4(VIEWMATRIX);
    LIBS.rotateX(VIEWMATRIX, -PHI);
    LIBS.rotateY(VIEWMATRIX, -THETA);
    LIBS.translateX(VIEWMATRIX, -camX);
    LIBS.translateY(VIEWMATRIX, -camY);
    LIBS.translateZ(VIEWMATRIX, -camZ);
    LIBS.set_I4(SKYBOX_VMATRIX);
    LIBS.rotateX(SKYBOX_VMATRIX, -PHI);
    LIBS.rotateY(SKYBOX_VMATRIX, -THETA);
    GL.uniformMatrix4fv(uniforms._Pmatrix, false, PROJMATRIX);
    GL.uniform3f(uniforms._ambientColor, 0.5, 0.5, 0.5);
    GL.uniform3f(uniforms._lightColor, 1.0, 1.0, 1.0);
    GL.uniform3f(uniforms._lightDirection, 0.5, 1.0, 0.5);
    GL.uniform3f(uniforms._moonLightDirection, 0.0, -1.2, -0.7);

    // --- 7. Render Scene ---
    GL.disable(GL.BLEND);
    GL.uniformMatrix4fv(uniforms._Vmatrix, false, SKYBOX_VMATRIX);
    GL.uniform1i(uniforms._isSkybox, true);
    skyboxObj.draw(MOVEMATRIX, uniforms);
    GL.uniform1i(uniforms._isSkybox, false);

    GL.uniformMatrix4fv(uniforms._Vmatrix, false, VIEWMATRIX);
    islandNode.draw(MOVEMATRIX, uniforms);
    treeNode.draw(MOVEMATRIX, uniforms);
    volcanoNodeRight.draw(MOVEMATRIX, uniforms);
    volcanoNodeLeft.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode1.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode2.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode3.draw(MOVEMATRIX, uniforms); // Ini akan menggambar Zubat + Sonic Waves

    // CLOUD ANIMATION
    const cloudDriftAmount = 2000; // Seberapa jauh mereka bergerak dari basis
    // Loop melalui data animasi untuk setiap awan
    for (const anim of cloudData.cloudAnimData) {
      // Hitung pergerakan sinus berdasarkan waktu, offset, dan kecepatan
      let timeWithOffset = time + anim.startOffset;
      let drift = Math.sin(timeWithOffset * anim.speed * 0.001) * cloudDriftAmount;
      // Hitung posisi X baru
      let newX = anim.baseX + drift * anim.direction;
      // Perbarui posisi X di matriks lokal node secara langsung
      // (Matriks translasi menyimpan X, Y, Z di index 12, 13, 14)
      anim.node.localMatrix[12] = newX;
      // Y dan Z (13, 14) tetap sama seperti saat dibuat
    }

    // ---Update Animasi Partikel Asap ---
    SmokeParticles.update(dt, THETA, PHI);
    // --- Akhir Update Asap ---
    globalCloudRootNode.draw(MOVEMATRIX, uniforms);

    GL.enable(GL.BLEND);
    SmokeParticles.update(dt, THETA, PHI);
    GL.depthMask(false);
    globalSmokeRootNode.draw(MOVEMATRIX, uniforms);
    GL.depthMask(true);
    webNode.draw(MOVEMATRIX, uniforms);
    waterNode.draw(MOVEMATRIX, uniforms);

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0); // Mulai loop animasi
}

main();
