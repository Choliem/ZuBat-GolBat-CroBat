// ===================================================================
// main.js - GABUNGAN
// ===================================================================

// 1. IMPORT SEMUA MODULES
import { Node } from "./models/Node.js";
import { SceneObject } from "./models/SceneObject.js";
import { Shaders } from "./models/Shaders.js";
import { Skybox } from "./models/Skybox.js";
import { Island } from "./models/Island.js";
import { Water } from "./models/Water.js";
import { Trees } from "./models/Trees.js";
import { Spiders } from "./models/Spiders.js";
import { PokemonBase } from "./models/PokemonBase.js";

// --- IMPORT CROBAT ---
import { CrobatBody } from "./models/crobat/CrobatBody.js";
import { CrobatEar } from "./models/crobat/CrobatEar.js";
import { CrobatMouthAndTeeth } from "./models/crobat/CrobatMouthAndTeeth.js";
import { CrobatWing } from "./models/crobat/CrobatWing.js";
import { CrobatEyelid } from "./models/crobat/CrobatEyelid.js";
import { CrobatSclera } from "./models/crobat/CrobatSclera.js";
import { CrobatPupil } from "./models/crobat/CrobatPupil.js";
import { CrobatFoot } from "./models/crobat/CrobatFoot.js";
// --- AKHIR IMPORT CROBAT ---

import { GolbatUpperBody } from "./models/Golbat/GolbatUpperBody.js";
import { GolbatLowerBody } from "./models/Golbat/GolbatLowerBody.js";
import { GolbatEar } from "./models/Golbat/GolbatEar.js";
import { GolbatTooth } from "./models/Golbat/GolbatTooth.js";
import { GolbatWing } from "./models/Golbat/GolbatWing.js";
import { GolbatEye } from "./models/Golbat/GolbatEye.js";

import { ZubatLowerBody } from "./models/Zubat/ZubatLowerBody.js";
import { ZubatUpperBody } from "./models/Zubat/ZubatUpperBody.js";
import { ZubatEar } from "./models/Zubat/ZubatEar.js";
import { ZubatWing } from "./models/Zubat/ZubatWing.js";

/**
 * Fungsi helper untuk membangun Scene Graph Crobat.
 * Disalin dari main.js Crobat.
 */
function createCrobatSceneGraph(GL, attribs) {
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
  // (Ini akan otomatis menggunakan SceneObject baru karena file modelnya sudah diedit)
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
  LIBS.scale(leftEarNode.localMatrix, 0.4, 0.8, 0.4);
  LIBS.rotateX(leftEarNode.localMatrix, -0.3);
  LIBS.rotateZ(leftEarNode.localMatrix, 0.25);
  LIBS.translateX(leftEarNode.localMatrix, -0.45);
  LIBS.translateY(leftEarNode.localMatrix, 0.75);
  LIBS.scale(rightEarNode.localMatrix, 0.4, 0.8, 0.4);
  LIBS.rotateX(rightEarNode.localMatrix, -0.3);
  LIBS.rotateZ(rightEarNode.localMatrix, -0.25);
  LIBS.translateX(rightEarNode.localMatrix, 0.45);
  LIBS.translateY(rightEarNode.localMatrix, 0.75);
  LIBS.rotateX(mouthNode.localMatrix, -0.275);
  LIBS.translateY(mouthNode.localMatrix, -0.5);
  LIBS.translateZ(mouthNode.localMatrix, 1.2953);
  LIBS.scale(leftFootNode.localMatrix, 0.96, 0.96, 0.96);
  LIBS.rotateX(leftFootNode.localMatrix, 3.9);
  LIBS.rotateY(leftFootNode.localMatrix, 0.3);
  LIBS.translateX(leftFootNode.localMatrix, -0.4);
  LIBS.translateY(leftFootNode.localMatrix, 1.5);
  LIBS.translateZ(leftFootNode.localMatrix, -0.53);
  LIBS.scale(rightFootNode.localMatrix, 0.96, 0.96, 0.96);
  LIBS.rotateX(rightFootNode.localMatrix, 3.9);
  LIBS.rotateY(rightFootNode.localMatrix, -0.3);
  LIBS.translateX(rightFootNode.localMatrix, 0.4);
  LIBS.translateY(rightFootNode.localMatrix, 1.5);
  LIBS.translateZ(rightFootNode.localMatrix, -0.53);

  // 4. KEMBALIKAN NODE PENTING
  return {
    root: rootNode,
    wings: {
      upperLeft: upperLeftWingNode,
      upperRight: upperRightWingNode,
      lowerLeft: lowerLeftWingNode,
      lowerRight: lowerRightWingNode,
    },
  };
}

function createGolbatSceneGraph(GL, attribs) {
  // Buat "akar" dari model Golbat kita
  var golbatModel = new Node();

  // --- Badan & Kaki ---
  var golbatUpperBody = new GolbatUpperBody(GL, attribs);
  var golbatLowerBody = new GolbatLowerBody(GL, attribs);
  golbatModel.add(golbatUpperBody);
  golbatModel.add(golbatLowerBody);

  // --- Telinga ---
  var leftEar = new GolbatEar(GL, attribs);
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

  golbatModel.add(leftEar);
  golbatModel.add(rightEar);

  // --- Gigi (anak dari badan atas) ---
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

  golbatUpperBody.add(toothTopLeft);
  golbatUpperBody.add(toothTopRight);
  golbatUpperBody.add(toothBottomLeft);
  golbatUpperBody.add(toothBottomRight);

  // --- Mata ---
  var leftEye = new GolbatEye(GL, attribs);
  LIBS.translateY(leftEye.localMatrix, 0.9);
  LIBS.translateX(leftEye.localMatrix, -0.3);
  LIBS.translateZ(leftEye.localMatrix, 0.65);
  LIBS.rotateX(leftEye.localMatrix, -0.5);
  LIBS.scale(leftEye.localMatrix, 0.2, 0.2, 0.2);

  var rightEye = new GolbatEye(GL, attribs);
  LIBS.translateY(rightEye.localMatrix, 0.9);
  LIBS.translateX(rightEye.localMatrix, 0.3);
  LIBS.translateZ(rightEye.localMatrix, 0.65);
  LIBS.rotateX(rightEye.localMatrix, -0.5);
  LIBS.scale(rightEye.localMatrix, -0.2, 0.2, 0.2); // Dicerminkan

  golbatModel.add(leftEye);
  golbatModel.add(rightEye);

  // --- Sayap ---
  var leftWing = new GolbatWing(GL, attribs);
  golbatModel.add(leftWing);
  var rightWing = new GolbatWing(GL, attribs);
  golbatModel.add(rightWing);

  // 4. KEMBALIKAN NODE PENTING
  return {
    root: golbatModel,
    wings: {
      left: leftWing,
      right: rightWing,
    },
  };
}
function createZubatSceneGraph(GL, attribs) {
  const zubatModel = new Node();

  // --- Badan ---
  const zubatUpperBody = new ZubatUpperBody(GL, attribs, {
    scaleFactor: 2.5,
    latBands: 50,
    longBands: 50,
    attachTeeth: true,
    teethOptions: { segments: 160, rings: 1, bluntness: 0.2 },
  });
  const zubatLowerBody = new ZubatLowerBody(GL, attribs, {
    scaleFactor: 2.5,
    latBands: 50,
    longBands: 50,
  });
  zubatModel.add(zubatUpperBody);
  zubatModel.add(zubatLowerBody);

  // --- Telinga ---
  const leftEar = new ZubatEar(GL, attribs, { segments: 20, rings: 10, bluntness: 0.3 });
  LIBS.translateY(leftEar.localMatrix, 4.3);
  LIBS.translateX(leftEar.localMatrix, -1.5);
  LIBS.translateZ(leftEar.localMatrix, 1.1);
  LIBS.rotateZ(leftEar.localMatrix, 3.5);
  LIBS.rotateY(leftEar.localMatrix, -0.2);

  const rightEar = new ZubatEar(GL, attribs, { segments: 20, rings: 10, bluntness: 0.3 });
  LIBS.translateY(rightEar.localMatrix, 4.3);
  LIBS.translateX(rightEar.localMatrix, 1.5);
  LIBS.translateZ(rightEar.localMatrix, 1.1);
  LIBS.rotateZ(rightEar.localMatrix, -3.5);
  LIBS.rotateY(rightEar.localMatrix, 0.2);

  zubatModel.add(leftEar);
  zubatModel.add(rightEar);

  // --- Sayap ---
  const leftWing = new ZubatWing(GL, attribs);
  LIBS.translateY(leftWing.localMatrix, 0.0);
  LIBS.translateX(leftWing.localMatrix, 0.5);
  LIBS.rotateZ(leftWing.localMatrix, 0.4);
  LIBS.rotateY(leftWing.localMatrix, 0.2);

  const rightWing = new ZubatWing(GL, attribs);
  LIBS.scale(rightWing.localMatrix, -1, 1, 1); // Cerminkan
  LIBS.translateY(rightWing.localMatrix, 0.0);
  LIBS.translateX(rightWing.localMatrix, -0.5);
  LIBS.rotateZ(rightWing.localMatrix, -0.4);
  LIBS.rotateY(rightWing.localMatrix, -0.2);

  zubatModel.add(leftWing);
  zubatModel.add(rightWing);

  // Skala model dasar Zubat (opsional, bisa diatur di luar)
  // LIBS.scale(zubatModel.localMatrix, 0.5, 0.5, 0.5); // Kita atur skala di luar saja

  return {
    root: zubatModel,
    wings: {
      left: leftWing,
      right: rightWing,
    },
  };
}

function main() {
  var CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  var GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
    // Tambahkan ekstensi untuk index 32-bit (dari Crobat)
    GL.getExtension("OES_element_index_uint");
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }

  /*========================= SHADERS ========================= */
  var shader_vertex_source = Shaders.vertex_source;
  var shader_fragment_source = Shaders.fragment_source;

  var compile_shader = function (source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };
  var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

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
    _normal: GL.getAttribLocation(SHADER_PROGRAM, "normal"), // <-- BARU
  };
  var uniforms = {
    _Pmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix"),
    _Vmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix"),
    _Mmatrix: GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix"),
    _sampler: GL.getUniformLocation(SHADER_PROGRAM, "sampler"),
    _isSkybox: GL.getUniformLocation(SHADER_PROGRAM, "u_isSkybox"),
    _useTexture: GL.getUniformLocation(SHADER_PROGRAM, "u_useTexture"),
    _isWeb: GL.getUniformLocation(SHADER_PROGRAM, "u_isWeb"),

    // Uniforms Lighting Gabungan
    _ambientColor: GL.getUniformLocation(SHADER_PROGRAM, "ambientColor"), // <-- Ganti nama
    _moonLightDirection: GL.getUniformLocation(SHADER_PROGRAM, "u_moonLightDirection"),
    _lightDirection: GL.getUniformLocation(SHADER_PROGRAM, "lightDirection"), // <-- BARU
    _lightColor: GL.getUniformLocation(SHADER_PROGRAM, "lightColor"), // <-- BARU
    _useLighting: GL.getUniformLocation(SHADER_PROGRAM, "u_useLighting"), // <-- BARU
    _isUnlit: GL.getUniformLocation(SHADER_PROGRAM, "u_isUnlit"),
  };
  GL.useProgram(SHADER_PROGRAM);

  /*========================= TEXTURES (Sama) =========================*/
  var load_texture = function (image_URL, wrapping, use_mipmaps) {
    var texture = GL.createTexture();
    var image = new Image();
    image.src = image_URL;
    image.onload = function () {
      GL.bindTexture(GL.TEXTURE_2D, texture);
      GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
      if (use_mipmaps) {
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
        GL.generateMipmap(GL.TEXTURE_2D);
      } else {
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
      }
      var wrap_mode = wrapping || GL.CLAMP_TO_EDGE;
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap_mode);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap_mode);
      GL.bindTexture(GL.TEXTURE_2D, null);
    };
    return texture;
  };
  var createWaterTexture = function () {
    var texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, texture);
    var pixel = new Uint8Array([20, 40, 80, 200]);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, pixel);
    return texture;
  };
  var cube_texture = load_texture("night.png", GL.CLAMP_TO_EDGE, false);
  var ground_texture = load_texture("grass1.png", GL.REPEAT, true);
  var water_texture = createWaterTexture();

  /*======================== MEMBUAT SCENE OBJECTS (Sama) ======================== */
  const scale = 3000;
  const gridSize = 80;
  const islandRadius = scale * 0.7;
  const texture_repeat = 20;
  var skyboxObj = Skybox.createSceneObject(GL, attribs, cube_texture, scale);
  var islandData = Island.createSceneObject(GL, attribs, ground_texture, scale, gridSize, islandRadius, texture_repeat);
  var waterData = Water.createSceneObject(GL, attribs, water_texture, scale);
  var treeData = Trees.createSceneObject(GL, attribs, islandRadius, islandData.getIslandHeight_func, waterData.waterLevel);
  var spiderData = Spiders.createSceneObjects(GL, attribs, treeData.validTreePositions);

  const pokemonBaseRadius = 300;
  const pokemonBaseHeight = 50;
  const pokemonSpikeHeight = 200;
  const pokemonNumSpikes = 10;
  const pokemonBaseColor = [0.4, 0.4, 0.4];
  const pokemonSpikeColor = [0.2, 0.2, 0.2];
  const pokemonBaseYPosition = waterData.waterLevel + 300;
  var pokemonBaseObj = PokemonBase.createSceneObject(GL, attribs, pokemonBaseRadius, pokemonBaseHeight, pokemonSpikeHeight, pokemonNumSpikes, pokemonBaseColor, pokemonSpikeColor, pokemonBaseYPosition);

  /*======================== MEMBANGUN SCENE GRAPH (Gabungan) ======================== */
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

  // --- NODE POKEMON BASE ---
  var pokemonBaseNode1 = new Node();
  pokemonBaseNode1.setGeometry(pokemonBaseObj);
  LIBS.translateY(pokemonBaseNode1.localMatrix, 350);

  // --- BUAT DAN TAMBAHKAN CROBAT ---
  // Node ini untuk animasi float + flip
  var crobatAnimatorNode = new Node();
  pokemonBaseNode1.add(crobatAnimatorNode); // Jadikan anak dari base

  // Panggil builder Crobat
  var crobatData = createCrobatSceneGraph(GL, attribs);
  var crobatRootNode = crobatData.root;

  // Atur skala Crobat (cukup besar agar terlihat)
  LIBS.scale(crobatRootNode.localMatrix, 60, 60, 60);

  // Tambahkan Crobat (yang sudah diskala) ke animatornya
  crobatAnimatorNode.add(crobatRootNode);
  // Posisi final animator (crobatAnimatorNode) diatur di render loop
  // --- AKHIR KODE CROBAT ---

  // --- NODE POKEMON BASE 2 (GOLBAT) ---
  var pokemonBaseNode2 = new Node();
  pokemonBaseNode2.setGeometry(pokemonBaseObj); // Pakai geometri base yang sama
  // Posisikan di tempat lain (misal, geser 800 unit di sumbu X)
  LIBS.translateX(pokemonBaseNode2.localMatrix, 800);
  LIBS.translateY(pokemonBaseNode2.localMatrix, 350);

  var golbatAnimatorNode = new Node();
  pokemonBaseNode2.add(golbatAnimatorNode); // Jadikan anak dari base 2

  // Panggil builder Golbat
  var golbatData = createGolbatSceneGraph(GL, attribs);
  var golbatRootNode = golbatData.root;

  // Atur skala Golbat (model aslinya kecil, jadi perlu skala besar)
  LIBS.scale(golbatRootNode.localMatrix, 30, 30, 30); // Coba skala 80

  golbatAnimatorNode.add(golbatRootNode);
  // --- AKHIR KODE GOLBAT ---

  // --- NODE POKEMON BASE 3 (ZUBAT) ---
  var pokemonBaseNode3 = new Node();
  pokemonBaseNode3.setGeometry(pokemonBaseObj); // Pakai geometri base yang sama
  // Posisikan di tempat lain (misal, geser -800 unit di sumbu X dari origin)
  LIBS.translateX(pokemonBaseNode3.localMatrix, -800);
  LIBS.translateY(pokemonBaseNode3.localMatrix, 350); // Gunakan Y base yang sama

  var zubatAnimatorNode = new Node();
  pokemonBaseNode3.add(zubatAnimatorNode); // Jadikan anak dari base 3

  // Panggil builder Zubat
  var zubatData = createZubatSceneGraph(GL, attribs);
  var zubatRootNode = zubatData.root;

  // Atur skala Zubat (model aslinya agak besar, coba skala 30)
  LIBS.scale(zubatRootNode.localMatrix, 15, 15, 15);

  zubatAnimatorNode.add(zubatRootNode);
  // --- AKHIR KODE ZUBAT ---

  /*================= MATRIKS & KONTROL KAMERA (Sama) =================*/
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
    (x_prev = e.pageX), (y_prev = e.pageY);
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
    (x_prev = e.pageX), (y_prev = e.pageY);
    e.preventDefault();
  };
  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseOut, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);
  var keyDown = function (e) {
    keys[e.key] = true;
  };
  var keyUp = function (e) {
    keys[e.key] = false;
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
  // Variabel untuk animasi flip Crobat
  let lastFlipTime = 0;
  let flipStartTime = 0;
  let isFlipping = false;
  const flipInterval = 15000;
  const flipDuration = 1000;

  var animate = function (time) {
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // --- Update Kamera (Sama) ---
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
    LIBS.set_I4(VIEWMATRIX);
    LIBS.rotateX(VIEWMATRIX, -PHI);
    LIBS.rotateY(VIEWMATRIX, -THETA);
    LIBS.translateX(VIEWMATRIX, -camX);
    LIBS.translateY(VIEWMATRIX, -camY);
    LIBS.translateZ(VIEWMATRIX, -camZ);
    LIBS.set_I4(SKYBOX_VMATRIX);
    LIBS.rotateX(SKYBOX_VMATRIX, -PHI);
    LIBS.rotateY(SKYBOX_VMATRIX, -THETA);

    // =================================================================
    // === ANIMASI CROBAT DI-UPDATE DI SINI ===
    // =================================================================
    var crobatTime = time / 100.0; // Gunakan 'time' dari environment
    var wings = crobatData.wings;

    // --- Animasi Float ---
    var floatAmplitude = 20; // Amplitudo lebih besar
    var floatY = Math.sin(crobatTime * 0.6) * floatAmplitude;

    // --- Animasi Flip ---
    const currentTime = time; // 'time' adalah performance.now()
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

    // Terapkan float + flip ke 'crobatAnimatorNode'
    LIBS.set_I4(crobatAnimatorNode.localMatrix);
    LIBS.translateY(crobatAnimatorNode.localMatrix, -2250 + floatY); // Posisi dasar 150 di atas base
    LIBS.rotateX(crobatAnimatorNode.localMatrix, flipAngle);

    // --- Animasi Kepak Sayap ---
    var flapSpeed = 0.6;
    var flapAmplitude = Math.PI / 12;
    var flapAngle = Math.sin(crobatTime * flapSpeed) * flapAmplitude;

    // Update localMatrix sayap (copy-paste dari main.js Crobat)
    LIBS.set_I4(wings.upperLeft.localMatrix);
    LIBS.scale(wings.upperLeft.localMatrix, 1.0, 1.0, 1.0);
    LIBS.rotateY(wings.upperLeft.localMatrix, -0.25 + flapAngle);
    LIBS.rotateZ(wings.upperLeft.localMatrix, 0.0);
    LIBS.translateX(wings.upperLeft.localMatrix, 2);
    LIBS.translateY(wings.upperLeft.localMatrix, 1.0);
    LIBS.translateZ(wings.upperLeft.localMatrix, -0.3);

    LIBS.set_I4(wings.upperRight.localMatrix);
    LIBS.scale(wings.upperRight.localMatrix, -1.0, 1.0, 1.0);
    LIBS.rotateY(wings.upperRight.localMatrix, 0.25 - flapAngle);
    LIBS.rotateZ(wings.upperRight.localMatrix, 0);
    LIBS.translateX(wings.upperRight.localMatrix, 2);
    LIBS.translateY(wings.upperRight.localMatrix, 1.0);
    LIBS.translateZ(wings.upperRight.localMatrix, -0.3);

    LIBS.set_I4(wings.lowerLeft.localMatrix);
    LIBS.scale(wings.lowerLeft.localMatrix, 0.5, 0.25, 0.25);
    LIBS.rotateY(wings.lowerLeft.localMatrix, 3.2 + flapAngle);
    LIBS.rotateZ(wings.lowerLeft.localMatrix, 3.25);
    LIBS.translateY(wings.lowerLeft.localMatrix, 3.5);

    LIBS.set_I4(wings.lowerRight.localMatrix);
    LIBS.scale(wings.lowerRight.localMatrix, -0.5, 0.25, 0.25);
    LIBS.rotateY(wings.lowerRight.localMatrix, 3.0 - flapAngle);
    LIBS.rotateZ(wings.lowerRight.localMatrix, 3.0);
    LIBS.translateY(wings.lowerRight.localMatrix, 3.5);
    // =================================================================
    // === AKHIR ANIMASI CROBAT ===
    // =================================================================

    // =================================================================
    // === ANIMASI GOLBAT DI-UPDATE DI SINI ===
    // =================================================================
    var golbatTime = time / 100.0;
    var golbatWings = golbatData.wings;

    // --- Animasi Float & Flip (dari main.js Golbat) ---
    var floatSpeed = 1.5;
    var floatAmplitude = 0.2 * 80; // Skala amplitudonya juga
    var floatY = Math.sin(golbatTime * floatSpeed) * floatAmplitude;

    // (Kita gunakan logika flip yang sama dari Crobat)
    let golbatFlipAngle = 0.0;
    if (isFlipping) {
      // Pakai variabel 'isFlipping' yang sama
      let flipProgress = (currentTime - flipStartTime) / flipDuration;
      if (flipProgress >= 1.0) flipProgress = 1.0;
      golbatFlipAngle = flipProgress * -Math.PI * 2.0;
    }

    // Terapkan float + flip ke 'golbatAnimatorNode'
    // Model Golbat aslinya kecil, jadi float Y (150) Crobat mungkin terlalu besar
    // Kita buat dia mengambang 150 unit di atas base-nya
    LIBS.set_I4(golbatAnimatorNode.localMatrix);
    LIBS.translateY(golbatAnimatorNode.localMatrix, -2250 + floatY);
    // Pivot Z dari main.js Golbat
    LIBS.translateZ(golbatAnimatorNode.localMatrix, 2.0 * 80); // Skala pivotnya
    LIBS.rotateX(golbatAnimatorNode.localMatrix, golbatFlipAngle);
    LIBS.translateZ(golbatAnimatorNode.localMatrix, -2.0 * 80);

    // --- Animasi Kepak Sayap (dari main.js Golbat) ---
    var flapSpeedG = 1.0;
    var flapAmplitudeG = Math.PI / 4;
    var flapAngleG = Math.sin(golbatTime * flapSpeedG) * flapAmplitudeG;

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
    // =================================================================
    // === AKHIR ANIMASI GOLBAT ===
    // =================================================================

    // =================================================================
    // === ANIMASI ZUBAT DI-UPDATE DI SINI ===
    // =================================================================
    var zubatTime = time / 100.0; // Gunakan timer yang sama
    var zubatWings = zubatData.wings;

    // --- Animasi Float & Flip (dari main.js Zubat) ---
    var floatSpeedZ = 1.5;
    var floatAmplitudeZ = 0.2 * 30; // Sesuaikan skala amplitudo
    var floatYZ = Math.sin(zubatTime * floatSpeedZ) * floatAmplitudeZ;

    let zubatFlipAngle = 0.0;
    if (isFlipping) {
      // Gunakan state flip yang sama
      let flipProgress = (currentTime - flipStartTime) / flipDuration;
      if (flipProgress >= 1.0) flipProgress = 1.0;
      zubatFlipAngle = flipProgress * -Math.PI * 2.0;
    }

    // Terapkan float + flip ke 'zubatAnimatorNode'
    LIBS.set_I4(zubatAnimatorNode.localMatrix);
    LIBS.translateY(zubatAnimatorNode.localMatrix, -2250 + floatYZ); // Gunakan offset Y yang sama (45)
    // Pivot Z dari main.js Zubat (diskalakan)
    LIBS.translateZ(zubatAnimatorNode.localMatrix, 2.0 * 30);
    LIBS.rotateX(zubatAnimatorNode.localMatrix, zubatFlipAngle);
    LIBS.translateZ(zubatAnimatorNode.localMatrix, -2.0 * 30);

    // --- Animasi Kepak Sayap (dari main.js Zubat) ---
    var flapSpeedZ = 1.0; // Mungkin perlu disesuaikan
    var flapAmplitudeZ = 0.15; // Mungkin perlu disesuaikan
    var flapAngleZ = Math.sin(zubatTime * flapSpeedZ) * flapAmplitudeZ;

    LIBS.set_I4(zubatWings.left.localMatrix);
    LIBS.translateY(zubatWings.left.localMatrix, 0.0);
    LIBS.translateX(zubatWings.left.localMatrix, 1.2);
    LIBS.rotateZ(zubatWings.left.localMatrix, 0.4 + flapAngleZ); // <-- Animasi
    LIBS.rotateY(zubatWings.left.localMatrix, 0.2);

    LIBS.set_I4(zubatWings.right.localMatrix);
    LIBS.scale(zubatWings.right.localMatrix, -1, 1, 1);
    LIBS.translateY(zubatWings.right.localMatrix, 0.0);
    LIBS.translateX(zubatWings.right.localMatrix, 1.3);
    LIBS.rotateZ(zubatWings.right.localMatrix, -0.4 - flapAngleZ); // <-- Animasi
    LIBS.rotateY(zubatWings.right.localMatrix, -0.2);
    // =================================================================
    // === AKHIR ANIMASI ZUBAT ===
    // =================================================================

    // --- Set Uniforms Global ---
    GL.uniformMatrix4fv(uniforms._Pmatrix, false, PROJMATRIX);

    // Atur semua uniforms lighting
    GL.uniform3f(uniforms._ambientColor, 0.5, 0.5, 0.5); // Ambient kuat (dari Crobat)
    GL.uniform3f(uniforms._lightColor, 1.0, 1.0, 1.0); // Cahaya putih (dari Crobat)
    GL.uniform3f(uniforms._lightDirection, 0.5, 1.0, 0.5); // Cahaya dari atas-samping
    GL.uniform3f(uniforms._moonLightDirection, 0.0, -1.2, -0.7); // Untuk faked light env

    // --- URUTAN RENDER ---
    // 1. SKYBOX
    GL.disable(GL.BLEND);
    GL.uniformMatrix4fv(uniforms._Vmatrix, false, SKYBOX_VMATRIX);
    GL.uniform1i(uniforms._isSkybox, true);
    skyboxObj.draw(MOVEMATRIX, uniforms); // MOVEMATRIX adalah I4, tidak masalah
    GL.uniform1i(uniforms._isSkybox, false);

    // 2. Obyek Opaque (Pulau, Pohon, Base, dan Crobat)
    GL.uniformMatrix4fv(uniforms._Vmatrix, false, VIEWMATRIX);
    islandNode.draw(MOVEMATRIX, uniforms);
    treeNode.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode1.draw(MOVEMATRIX, uniforms); // <-- Ini akan menggambar Base DAN Crobat
    pokemonBaseNode2.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode3.draw(MOVEMATRIX, uniforms);

    // 3. Obyek Transparan (Jaring laba-laba, Air)
    GL.enable(GL.BLEND);
    webNode.draw(MOVEMATRIX, uniforms);
    waterNode.draw(MOVEMATRIX, uniforms);

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0);
}

main();
