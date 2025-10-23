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

  // --- Sayap ---
  const leftWing = new ZubatWing(GL, attribs);
  LIBS.translateY(leftWing.localMatrix, 0.0);
  LIBS.translateX(leftWing.localMatrix, 1.1);
  LIBS.rotateZ(leftWing.localMatrix, 0.4);
  LIBS.rotateY(leftWing.localMatrix, 0.2);

  const rightWing = new ZubatWing(GL, attribs);
  LIBS.scale(rightWing.localMatrix, -1, 1, 1); // Cerminkan
  LIBS.translateY(rightWing.localMatrix, 0.0);
  LIBS.translateX(rightWing.localMatrix, 1.2);
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
      alert(
        "ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader)
      );
      return false;
    }
    return shader;
  };
  var shader_vertex = compile_shader(
    shader_vertex_source,
    GL.VERTEX_SHADER,
    "VERTEX"
  );
  var shader_fragment = compile_shader(
    shader_fragment_source,
    GL.FRAGMENT_SHADER,
    "FRAGMENT"
  );

  var SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  GL.linkProgram(SHADER_PROGRAM);
  if (!GL.getProgramParameter(SHADER_PROGRAM, GL.LINK_STATUS)) {
    alert("Could not initialise shaders. See console for details.");
    console.error(
      "Shader Linker Error: " + GL.getProgramInfoLog(SHADER_PROGRAM)
    );
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
    _moonLightDirection: GL.getUniformLocation(
      SHADER_PROGRAM,
      "u_moonLightDirection"
    ),
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
      GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        image
      );
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
      if (use_mipmaps) {
        GL.texParameteri(
          GL.TEXTURE_2D,
          GL.TEXTURE_MIN_FILTER,
          GL.LINEAR_MIPMAP_LINEAR
        );
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
    );
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
  var islandData = Island.createSceneObject(
    GL,
    attribs,
    ground_texture,
    scale,
    gridSize,
    islandRadius,
    texture_repeat
  );
  var waterData = Water.createSceneObject(GL, attribs, water_texture, scale);
  var treeData = Trees.createSceneObject(
    GL,
    attribs,
    islandRadius,
    islandData.getIslandHeight_func,
    waterData.waterLevel
  );
  var spiderData = Spiders.createSceneObjects(
    GL,
    attribs,
    treeData.validTreePositions
  );

  const pokemonBaseRadius = 300;
  const pokemonBaseHeight = 50;
  const pokemonSpikeHeight = 200;
  const pokemonNumSpikes = 10;
  const pokemonBaseColor = [0.4, 0.4, 0.4];
  const pokemonSpikeColor = [0.2, 0.2, 0.2];
  const pokemonBaseYPosition = waterData.waterLevel + 300;
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
  );

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
  var PROJMATRIX = LIBS.get_projection(
    40,
    CANVAS.width / CANVAS.height,
    10,
    12000
  );
  var MOVEMATRIX = LIBS.get_I4();
  var VIEWMATRIX = LIBS.get_I4();
  var SKYBOX_VMATRIX = LIBS.get_I4();

  var camX = 0,
    camZ = 2000,
    camY = -2000;

  // --- Variabel Kamera Mode Baru ---
  let cameraMode = "f"; // 'f' (free), 'c' (center), '1', '2', '3'
  const LOCK_ON_OFFSET_Y = 500; // Seberapa tinggi di atas target
  const LOCK_ON_OFFSET_Z = 2000; // Seberapa jauh di depan target // --- Akhir Variabel Kamera ---
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
    // --- Logika Ganti Mode Kamera ---
    if (e.key === "f" || e.key === "F") {
      cameraMode = "f";
    } else if (e.key === "c" || e.key === "C") {
      cameraMode = "c";
    } else if (e.key === "1") {
      cameraMode = "1";
    } else if (e.key === "2") {
      cameraMode = "2";
    } else if (e.key === "3") {
      cameraMode = "3";
    }
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
  const idleFlipState = [
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 }, // Zubat (0)
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 }, // Golbat (1)
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 }, // Crobat (2)
  ];
  // Beri interval dan durasi yang sedikit berbeda agar tidak sinkron
  const flipIntervals = [15000, 18000, 13000]; // Waktu antar flip (ms)
  const flipDurations = [1000, 1100, 900]; // Durasi flip (ms)

  // Array untuk menyimpan hasil kalkulasi flip
  const idleFlipAngles = [0, 0, 0];

  // --- Variabel untuk State Machine Animasi ---
  let activePokemonIndex = 0; // 0 = Zubat, 1 = Golbat, 2 = Crobat
  let animationStage = "IDLE"; // Status animasi saat ini
  let stageStartTime = 0; // Waktu kapan stage saat ini dimulai

  // Ambil node-node penting untuk diakses
  // (Pastikan ini didefinisikan SETELAH Anda membuat scene graph)
  const baseNodes = [pokemonBaseNode3, pokemonBaseNode2, pokemonBaseNode1]; // [Zubat, Golbat, Crobat]
  const animatorNodes = [
    zubatAnimatorNode,
    golbatAnimatorNode,
    crobatAnimatorNode,
  ]; // [Zubat, Golbat, Crobat]
  const idleFlapData = [zubatData.wings, golbatData.wings, crobatData.wings]; // [Zubat, Golbat, Crobat]

  // Array untuk menyimpan nilai float idle
  const idleFloats = [0, 0, 0];

  // --- Konfigurasi Animasi ---
  const IDLE_Y_OFFSET = -2250; // Posisi Y idle (dari kode Anda)
  const LIFT_Y_OFFSET = -1500; // Posisi Y lebih tinggi (750 unit di atas idle)
  const ORBIT_RADIUS = 600; // 'R' Anda
  const ORBIT_Y_ROTATION = Math.PI / 2; // 90 derajat (noleh ke samping)
  const ORBIT_X_ROTATION = 0.5; // 'bungkuk' (sekitar 30 derajat)

  // Durasi untuk setiap stage (dalam milidetik)
  const DURATION_IDLE = 5000; // 5 detik diam di base
  const DURATION_LIFT_OFF = 2000; // 2 detik untuk naik
  const DURATION_MOVE_TO_CENTER = 3000; // 3 detik ke tengah
  const DURATION_MOVE_TO_ORBIT = 1500; // 1.5 detik ke depan (Z)
  const DURATION_TURN = 1000; // 1 detik untuk noleh & bungkuk
  const DURATION_CIRCLING = 15000; // 15 detik untuk satu putaran penuh
  // --- TAMBAHAN BARU ---
  const DURATION_RETURN_TURN_1 = 1000; // Durasi noleh ke center
  const DURATION_RETURN_MOVE = 1500; // Durasi jalan ke center
  const DURATION_RETURN_TURN_2 = 1000; // Durasi noleh ke "depan"
  // --- AKHIR TAMBAHAN ---
  const DURATION_RETURN = 3000; // 3 detik untuk kembali ke base

  // Fungsi helper LERP (Linear Interpolation)
  const LERP = (a, b, t) => a + (b - a) * t;

  var animate = function (time) {
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT); // --- Update Kamera (Sama) ---

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
    if (cameraMode === "f") {
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
    }
    LIBS.set_I4(VIEWMATRIX);
    LIBS.rotateX(VIEWMATRIX, -PHI);
    LIBS.rotateY(VIEWMATRIX, -THETA);
    LIBS.translateX(VIEWMATRIX, -camX);
    LIBS.translateY(VIEWMATRIX, -camY);
    LIBS.translateZ(VIEWMATRIX, -camZ);
    LIBS.set_I4(SKYBOX_VMATRIX);
    LIBS.rotateX(SKYBOX_VMATRIX, -PHI);
    LIBS.rotateY(SKYBOX_VMATRIX, -THETA); // ================================================================= // === UPDATE ANIMASI POKEMON (STATE MACHINE BARU) === // ================================================================= // 1. Hitung semua nilai float/flap dasar (untuk idle) //    Ini akan digunakan oleh Pokémon yang sedang 'IDLE'

    var genericTime = time / 100.0; // --- Zubat (Index 0) ---

    var floatSpeedZ = 1.5;
    var floatAmplitudeZ = 0.2 * 30;
    idleFloats[0] = Math.sin(genericTime * floatSpeedZ) * floatAmplitudeZ;
    var flapSpeedZ = 1.0;
    var flapAmplitudeZ = 0.15;
    var flapAngleZ = Math.sin(genericTime * flapSpeedZ) * flapAmplitudeZ; // Terapkan flap sayap Zubat (diambil dari kode lama Anda)
    var zubatWings = idleFlapData[0]; // zubatData.wings
    LIBS.set_I4(zubatWings.left.localMatrix);
    LIBS.translateY(zubatWings.left.localMatrix, 0.0);
    LIBS.translateX(zubatWings.left.localMatrix, 0.5);
    LIBS.rotateZ(zubatWings.left.localMatrix, 0.4 + flapAngleZ); // <-- Animasi
    LIBS.rotateY(zubatWings.left.localMatrix, 0.2);

    LIBS.set_I4(zubatWings.right.localMatrix);
    LIBS.scale(zubatWings.right.localMatrix, -1, 1, 1);
    LIBS.translateY(zubatWings.right.localMatrix, 0.0);
    LIBS.translateX(zubatWings.right.localMatrix, -0.5);
    LIBS.rotateZ(zubatWings.right.localMatrix, -0.4 - flapAngleZ); // <-- Animasi
    LIBS.rotateY(zubatWings.right.localMatrix, -0.2); // --- Golbat (Index 1) ---

    var floatSpeedG = 1.5;
    var floatAmplitudeG_idle = 0.2 * 80;
    idleFloats[1] = Math.sin(genericTime * floatSpeedG) * floatAmplitudeG_idle;
    var flapSpeedG = 1.0;
    var flapAmplitudeG = Math.PI / 4;
    var flapAngleG = Math.sin(genericTime * flapSpeedG) * flapAmplitudeG; // Terapkan flap sayap Golbat (diambil dari kode lama Anda)
    var golbatWings = idleFlapData[1]; // golbatData.wings
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
    LIBS.rotateX(golbatWings.right.localMatrix, 0.7); // --- Crobat (Index 2) ---
    var floatAmplitudeC = 20;
    idleFloats[2] = Math.sin(genericTime * 0.6) * floatAmplitudeC;
    var flapSpeedC = 0.6;
    var flapAmplitudeC = Math.PI / 12;
    var flapAngleC = Math.sin(genericTime * flapSpeedC) * flapAmplitudeC; // Terapkan flap sayap Crobat (diambil dari kode lama Anda)
    var crobatWings = idleFlapData[2]; // crobatData.wings
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
    LIBS.translateY(crobatWings.lowerRight.localMatrix, 3.5); // --- (Akhir dari perhitungan flap idle) --- // --- Hitung Animasi Flip (Idle) untuk SEMUA Pokémon ---

    const currentTime = time;
    for (let i = 0; i < 3; i++) {
      let state = idleFlipState[i];
      let interval = flipIntervals[i];
      let duration = flipDurations[i];

      let flipAngle = 0.0;
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
    } // 2. Dapatkan data Pokémon yang aktif

    let activeNode = animatorNodes[activePokemonIndex];
    let activeBase = baseNodes[activePokemonIndex]; // Ambil posisi absolut base
    let activeBasePos = [
      activeBase.localMatrix[12],
      activeBase.localMatrix[13],
      activeBase.localMatrix[14],
    ]; // Ambil posisi absolut center (base crobat, index 2)
    let centerPos = [
      baseNodes[2].localMatrix[12],
      baseNodes[2].localMatrix[13],
      baseNodes[2].localMatrix[14],
    ]; // 3. Hitung 'progress' untuk stage saat ini

    let timeInStage = time - stageStartTime; // 4. State Machine Utama
    // 'progress' dideklarasikan di dalam setiap case

    LIBS.set_I4(activeNode.localMatrix); // Reset matriks nodeaktif

    switch (animationStage) {
      case "IDLE": {
        // Diam di base, terapkan float DAN flip
        let floatY = idleFloats[activePokemonIndex];
        let flipAngle = idleFlipAngles[activePokemonIndex];
        LIBS.translateY(activeNode.localMatrix, IDLE_Y_OFFSET + floatY);
        LIBS.rotateX(activeNode.localMatrix, flipAngle); // <-- TAMBAHAN // Ganti state setelah durasi idle selesai
        if (timeInStage > DURATION_IDLE) {
          animationStage = "LIFT_OFF";
          stageStartTime = time;
        }
        break;
      }

      case "LIFT_OFF": {
        let progress = Math.min(1.0, timeInStage / DURATION_LIFT_OFF);
        let currentY = LERP(IDLE_Y_OFFSET, LIFT_Y_OFFSET, progress);
        LIBS.translateY(activeNode.localMatrix, currentY);

        if (progress >= 1.0) {
          animationStage = "MOVE_TO_CENTER";
          stageStartTime = time;
        }
        break;
      }

      case "MOVE_TO_CENTER": {
        let progress = Math.min(1.0, timeInStage / DURATION_MOVE_TO_CENTER);
        let targetLocalX = centerPos[0] - activeBasePos[0];
        let targetLocalZ = centerPos[2] - activeBasePos[2];

        let currentX = LERP(0, targetLocalX, progress);
        let currentZ = LERP(0, targetLocalZ, progress);
        LIBS.translateX(activeNode.localMatrix, currentX);
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET); // Tetap di ketinggian
        LIBS.translateZ(activeNode.localMatrix, currentZ);

        if (progress >= 1.0) {
          animationStage = "MOVE_TO_ORBIT";
          stageStartTime = time;
        }
        break;
      }

      case "MOVE_TO_ORBIT": {
        let progress = Math.min(1.0, timeInStage / DURATION_MOVE_TO_ORBIT);
        let startX = centerPos[0] - activeBasePos[0];
        let startZ = centerPos[2] - activeBasePos[2];
        let targetZ = startZ + ORBIT_RADIUS;

        let orbitZ = LERP(startZ, targetZ, progress);

        LIBS.translateX(activeNode.localMatrix, startX); // X tetap
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET); // Y tetap
        LIBS.translateZ(activeNode.localMatrix, orbitZ); // Z bergerak

        if (progress >= 1.0) {
          animationStage = "TURN_AND_BEND";
          stageStartTime = time;
        }
        break;
      }
      case "TURN_AND_BEND": {
        let progress = Math.min(1.0, timeInStage / DURATION_TURN);

        let rotY = LERP(0, ORBIT_Y_ROTATION, progress);
        let rotX = LERP(0, ORBIT_X_ROTATION, progress); // Terapkan di posisi akhir state sebelumnya (posisi orbit awal)

        LIBS.translateX(
          activeNode.localMatrix,
          centerPos[0] - activeBasePos[0]
        );
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET);
        LIBS.translateZ(
          activeNode.localMatrix,
          centerPos[2] - activeBasePos[2] + ORBIT_RADIUS
        ); // Terapkan rotasi
        LIBS.rotateY(activeNode.localMatrix, rotY);
        LIBS.rotateX(activeNode.localMatrix, rotX);
        if (progress >= 1.0) {
          animationStage = "CIRCLING";
          stageStartTime = time; // Catat waktu *mulai* mengorbit
        }
        break;
      }

      case "CIRCLING": {
        let progress = (timeInStage % DURATION_CIRCLING) / DURATION_CIRCLING; // 0.0 -> 1.0
        let angle = progress * Math.PI * 2; // 0 sampai 360 derajat // Hitung posisi X dan Z di lingkaran (relatif thd center)

        let circleX = Math.sin(angle) * ORBIT_RADIUS;
        let circleZ = Math.cos(angle) * ORBIT_RADIUS; // Hitung rotasi Y (badan noleh ke arah perjalanan)

        let bodyAngleY = -angle + ORBIT_Y_ROTATION; // Terapkan transformasi (Posisi center relatif + Posisi orbit relatif)

        LIBS.translateX(
          activeNode.localMatrix,
          centerPos[0] - activeBasePos[0] + circleX
        );
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET);
        LIBS.translateZ(
          activeNode.localMatrix,
          centerPos[2] - activeBasePos[2] + circleZ
        );
        LIBS.rotateY(activeNode.localMatrix, bodyAngleY);
        LIBS.rotateX(activeNode.localMatrix, ORBIT_X_ROTATION); // Tetap bungkuk // Selesai satu putaran?

        if (timeInStage > DURATION_CIRCLING) {
          animationStage = "PRE_RETURN_TURN"; // <-- DIUBAH
          stageStartTime = time;
        }
        break;
      }

      // --- STATE BARU 1: NOLEH KE CENTER ---
      case "PRE_RETURN_TURN": {
        let progress = Math.min(1.0, timeInStage / DURATION_RETURN_TURN_1); // Posisi tetap di akhir orbit
        LIBS.translateX(
          activeNode.localMatrix,
          centerPos[0] - activeBasePos[0]
        ); // X di center
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET);
        LIBS.translateZ(
          activeNode.localMatrix,
          centerPos[2] - activeBasePos[2] + ORBIT_RADIUS
        ); // Z di edge orbit // Rotasi: dari noleh samping (ORBIT_Y_ROTATION) -> noleh belakang (tambah PI)
        let startAngleY = ORBIT_Y_ROTATION;
        let endAngleY = ORBIT_Y_ROTATION + Math.PI; // Noleh ke belakang
        let currentAngleY = LERP(startAngleY, endAngleY, progress);
        LIBS.rotateY(activeNode.localMatrix, currentAngleY);
        LIBS.rotateX(activeNode.localMatrix, ORBIT_X_ROTATION); // Masih bungkuk
        if (progress >= 1.0) {
          animationStage = "PRE_RETURN_MOVE";
          stageStartTime = time;
        }
        break;
      }

      // --- STATE BARU 2: JALAN MUNDUR KE CENTER ---
      case "PRE_RETURN_MOVE": {
        let progress = Math.min(1.0, timeInStage / DURATION_RETURN_MOVE); // Posisi: LERP dari edge orbit (Z+R) ke center (Z)

        let startZ = centerPos[2] - activeBasePos[2] + ORBIT_RADIUS;
        let endZ = centerPos[2] - activeBasePos[2]; // Z di center
        let currentZ = LERP(startZ, endZ, progress);

        LIBS.translateX(
          activeNode.localMatrix,
          centerPos[0] - activeBasePos[0]
        ); // X tetap di center
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET);
        LIBS.translateZ(activeNode.localMatrix, currentZ); // Rotasi: Tetap noleh ke belakang

        LIBS.rotateY(activeNode.localMatrix, ORBIT_Y_ROTATION + Math.PI);
        LIBS.rotateX(activeNode.localMatrix, ORBIT_X_ROTATION); // Masih bungkuk

        if (progress >= 1.0) {
          animationStage = "PRE_RETURN_TURN_FINAL";
          stageStartTime = time;
        }
        break;
      }

      // --- STATE BARU 3: NOLEH KE DEPAN & TEGAK ---
      case "PRE_RETURN_TURN_FINAL": {
        let progress = Math.min(1.0, timeInStage / DURATION_RETURN_TURN_2); // Posisi: Tetap di center

        LIBS.translateX(
          activeNode.localMatrix,
          centerPos[0] - activeBasePos[0]
        );
        LIBS.translateY(activeNode.localMatrix, LIFT_Y_OFFSET);
        LIBS.translateZ(
          activeNode.localMatrix,
          centerPos[2] - activeBasePos[2]
        ); // Rotasi: LERP dari noleh belakang -> noleh depan (0), dan un-bend (X -> 0)

        let startAngleY = ORBIT_Y_ROTATION + Math.PI;
        let endAngleY = 0; // Noleh ke depan (original)
        let startAngleX = ORBIT_X_ROTATION;
        let endAngleX = 0; // Berdiri tegak
        let currentAngleY = LERP(startAngleY, endAngleY, progress);
        let currentAngleX = LERP(startAngleX, endAngleX, progress);
        LIBS.rotateY(activeNode.localMatrix, currentAngleY);
        LIBS.rotateX(activeNode.localMatrix, currentAngleX);
        if (progress >= 1.0) {
          animationStage = "RETURN_TO_BASE";
          stageStartTime = time;
        }
        break;
      }

      case "RETURN_TO_BASE": {
        let progress = Math.min(1.0, timeInStage / DURATION_RETURN); // Posisi awal (sudah di center, dari state sebelumnya)

        let startX = centerPos[0] - activeBasePos[0];
        let startZ = centerPos[2] - activeBasePos[2]; // Posisi akhir (di base)
        let endX = 0;
        let endZ = 0; // Interpolasi Posisi (HANYA POSISI dan Y)

        let returnX = LERP(startX, endX, progress);
        let returnY = LERP(LIFT_Y_OFFSET, IDLE_Y_OFFSET, progress); // Turun
        let returnZ = LERP(startZ, endZ, progress); // --- Interpolasi Rotasi DIHAPUS --- // (Rotasi sudah 0 dari state PRE_RETURN_TURN_FINAL)
        LIBS.translateX(activeNode.localMatrix, returnX);
        LIBS.translateY(activeNode.localMatrix, returnY);
        LIBS.translateZ(activeNode.localMatrix, returnZ); // LIBS.rotateY(...) dan LIBS.rotateX(...) tidak diperlukan lagi
        if (progress >= 1.0) {
          // Selesai! Ganti Pokémon.
          animationStage = "IDLE";
          stageStartTime = time;
          activePokemonIndex = (activePokemonIndex + 1) % 3; // 0->1, 1->2, 2->0
        }
        break;
      }
    } // Penutup switch // 5. Terapkan animasi IDLE untuk Pokémon yang TIDAK AKTIF

    for (let i = 0; i < animatorNodes.length; i++) {
      if (i !== activePokemonIndex) {
        let inactiveNode = animatorNodes[i];
        let floatY = idleFloats[i];
        let flipAngle = idleFlipAngles[i]; // Ambil dari hasil kalkulasi

        LIBS.set_I4(inactiveNode.localMatrix);
        LIBS.translateY(inactiveNode.localMatrix, IDLE_Y_OFFSET + floatY);
        LIBS.rotateX(inactiveNode.localMatrix, flipAngle); // <-- TAMBAHAN
      }
    } // ================================================================= // === AKHIR ANIMASI POKEMON === // =================================================================// // 1. Update World Matrix untuk semua node // Ini penting agar kita mendapatkan posisi dunia (world position) yang benar

    // ================================================================= // === LOGIKA KAMERA BARU === // =================================================================

    pokemonBaseNode1.updateWorldMatrix(MOVEMATRIX); // Crobat (Base 1, Animator 2)
    pokemonBaseNode2.updateWorldMatrix(MOVEMATRIX); // Golbat (Base 2, Animator 1)
    pokemonBaseNode3.updateWorldMatrix(MOVEMATRIX); // Zubat (Base 3, Animator 0) // 2. Atur posisi camX, camY, camZ jika BUKAN mode free-cam
    if (cameraMode !== "f") {
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;

      switch (cameraMode) {
        case "c": // Center (Base Crobat) // Targetnya adalah base-nya Crobat (baseNodes[2])
          targetX = baseNodes[2].worldMatrix[12];
          targetY = baseNodes[2].worldMatrix[13];
          targetZ = baseNodes[2].worldMatrix[14];
          break;
        case "1": // Zubat (Animator 0) // Targetnya adalah node animator Zubat (animatorNodes[0])
          targetX = animatorNodes[0].worldMatrix[12];
          targetY = animatorNodes[0].worldMatrix[13];
          targetZ = animatorNodes[0].worldMatrix[14];
          break;
        case "2": // Golbat (Animator 1)
          targetX = animatorNodes[1].worldMatrix[12];
          targetY = animatorNodes[1].worldMatrix[13];
          targetZ = animatorNodes[1].worldMatrix[14];
          break;
        case "3": // Crobat (Animator 2)
          targetX = animatorNodes[2].worldMatrix[12];
          targetY = animatorNodes[2].worldMatrix[13];
          targetZ = animatorNodes[2].worldMatrix[14];
          break;
      } // Terapkan posisi baru ke kamera

      camX = targetX;
      camY = targetY + LOCK_ON_OFFSET_Y; // Sedikit di atas target
      camZ = targetZ + LOCK_ON_OFFSET_Z; // Di depan target
    } // ================================================================= // === AKHIR LOGIKA KAMERA BARU === // =================================================================

    LIBS.set_I4(VIEWMATRIX);
    LIBS.rotateX(VIEWMATRIX, -PHI);
    LIBS.rotateY(VIEWMATRIX, -THETA);
    LIBS.translateX(VIEWMATRIX, -camX);
    LIBS.translateY(VIEWMATRIX, -camY);
    LIBS.translateZ(VIEWMATRIX, -camZ);
    LIBS.set_I4(SKYBOX_VMATRIX);

    // --- Set Uniforms Global ---

    GL.uniformMatrix4fv(uniforms._Pmatrix, false, PROJMATRIX); // Atur semua uniforms lighting

    GL.uniform3f(uniforms._ambientColor, 0.5, 0.5, 0.5); // Ambient kuat (dari Crobat)
    GL.uniform3f(uniforms._lightColor, 1.0, 1.0, 1.0); // Cahaya putih (dari Crobat)
    GL.uniform3f(uniforms._lightDirection, 0.5, 1.0, 0.5); // Cahaya dari atas-samping
    GL.uniform3f(uniforms._moonLightDirection, 0.0, -1.2, -0.7); // Untuk faked light env // --- URUTAN RENDER --- // 1. SKYBOX

    GL.disable(GL.BLEND);
    GL.uniformMatrix4fv(uniforms._Vmatrix, false, SKYBOX_VMATRIX);
    GL.uniform1i(uniforms._isSkybox, true);
    skyboxObj.draw(MOVEMATRIX, uniforms); // MOVEMATRIX adalah I4, tidak masalah
    GL.uniform1i(uniforms._isSkybox, false); // 2. Obyek Opaque (Pulau, Pohon, Base, dan Crobat)

    GL.uniformMatrix4fv(uniforms._Vmatrix, false, VIEWMATRIX);
    islandNode.draw(MOVEMATRIX, uniforms);
    treeNode.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode1.draw(MOVEMATRIX, uniforms); // <-- Ini akan menggambar Base DAN Crobat
    pokemonBaseNode2.draw(MOVEMATRIX, uniforms);
    pokemonBaseNode3.draw(MOVEMATRIX, uniforms); // 3. Obyek Transparan (Jaring laba-laba, Air)

    GL.enable(GL.BLEND);
    webNode.draw(MOVEMATRIX, uniforms);
    waterNode.draw(MOVEMATRIX, uniforms);

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0);
}

main();
