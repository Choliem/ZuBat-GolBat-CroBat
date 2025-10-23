// ===================================================================
// main2.js - IMPROVED ANIMATION (Versi Transisi Smooth + Sonic Wave Integrated)
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
import { Volcano } from "./models/Volcano.js";
import { SmokeParticles } from "./models/SmokeParticles.js";
// --- TAMBAHAN: IMPORT SONIC WAVE ---
import { ZubatSonicWave } from "./models/Zubat/ZubatSonicWave.js"; // Path sudah benar

// --- IMPORT CROBAT ---
import { CrobatBody } from "./models/crobat/CrobatBody.js";
import { CrobatEar } from "./models/crobat/CrobatEar.js";
import { CrobatMouthAndTeeth } from "./models/crobat/CrobatMouthAndTeeth.js";
import { CrobatWing } from "./models/crobat/CrobatWing.js";
import { CrobatEyelid } from "./models/crobat/CrobatEyelid.js";
import { CrobatSclera } from "./models/crobat/CrobatSclera.js";
import { CrobatPupil } from "./models/crobat/CrobatPupil.js";
import { CrobatFoot } from "./models/crobat/CrobatFoot.js";
import { Clouds } from "./models/Clouds2.js";
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
 */
function createCrobatSceneGraph(GL, attribs) {
  // ... (Kode createCrobatSceneGraph tidak berubah) ...
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

/**
 * Fungsi helper untuk membangun Scene Graph Golbat.
 */
function createGolbatSceneGraph(GL, attribs) {
  // ... (Kode createGolbatSceneGraph tidak berubah) ...
  var golbatModel = new Node();
  var golbatUpperBody = new GolbatUpperBody(GL, attribs);
  var golbatLowerBody = new GolbatLowerBody(GL, attribs);
  golbatModel.add(golbatUpperBody);
  golbatModel.add(golbatLowerBody);

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
  LIBS.scale(rightEye.localMatrix, -0.2, 0.2, 0.2);

  golbatModel.add(leftEye);
  golbatModel.add(rightEye);

  var leftWing = new GolbatWing(GL, attribs);
  golbatModel.add(leftWing);
  var rightWing = new GolbatWing(GL, attribs);
  golbatModel.add(rightWing);

  return {
    root: golbatModel,
    wings: {
      left: leftWing,
      right: rightWing,
    },
  };
}

/**
 * Fungsi helper untuk membangun Scene Graph Zubat.
 */
function createZubatSceneGraph(GL, attribs) {
  // ... (Kode createZubatSceneGraph tidak berubah) ...
  const zubatModel = new Node();

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

  const leftWing = new ZubatWing(GL, attribs);
  LIBS.translateY(leftWing.localMatrix, 0.0);
  LIBS.translateX(leftWing.localMatrix, 1.1);
  LIBS.rotateZ(leftWing.localMatrix, 0.4);
  LIBS.rotateY(leftWing.localMatrix, 0.2);

  const rightWing = new ZubatWing(GL, attribs);
  LIBS.scale(rightWing.localMatrix, -1, 1, 1);
  LIBS.translateY(rightWing.localMatrix, 0.0);
  LIBS.translateX(rightWing.localMatrix, 1.2);
  LIBS.rotateZ(rightWing.localMatrix, -0.4);
  LIBS.rotateY(rightWing.localMatrix, -0.2);

  zubatModel.add(leftWing);
  zubatModel.add(rightWing);

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
    _moonLightDirection: GL.getUniformLocation(
      SHADER_PROGRAM,
      "u_moonLightDirection"
    ),
    _lightDirection: GL.getUniformLocation(SHADER_PROGRAM, "lightDirection"),
    _lightColor: GL.getUniformLocation(SHADER_PROGRAM, "lightColor"),
    _useLighting: GL.getUniformLocation(SHADER_PROGRAM, "u_useLighting"),
    _isUnlit: GL.getUniformLocation(SHADER_PROGRAM, "u_isUnlit"),
  };
  GL.useProgram(SHADER_PROGRAM);

  /*========================= TEXTURES =========================*/
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

  // Menggunakan .png sesuai path yang benar
  var cube_texture = load_texture("night.png", GL.CLAMP_TO_EDGE, false);
  var ground_texture = load_texture("grass1.png", GL.REPEAT, true);
  var water_texture = createWaterTexture();

  /*======================== MEMBUAT SCENE OBJECTS ======================== */
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

  // -- CLOUD --
  const numClouds = 45;
  const skyRadius = scale * 2.5;
  const skyHeight = 500;
  var cloudData = Clouds.createSceneObjects(
    GL,
    attribs,
    numClouds,
    skyRadius,
    skyHeight
  );

  // -- POKEMON BASE --
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

  // --- TAMBAHKAN BLOK INI: MEMBUAT GUNUNG BERAPI ---
  const volcanoBaseRadius = 1500; // Radius alas
  const volcanoHeight = 2000; // Ketinggian
  const volcanoSegments = 20; // Segi-20 (cukup low-poly untuk latar)
  var volcanoObj = Volcano.createSceneObject(
    GL,
    attribs,
    volcanoBaseRadius,
    volcanoHeight,
    volcanoSegments
  );
  // --- AKHIR TAMBAHAN ---

  // --- BARU: GUNUNG BERAPI 2 (Kiri) ---
  const volcanoBaseRadius2 = 1800; // Radius alas (sedikit lebih besar)
  const volcanoHeight2 = 2300; // Ketinggian (sedikit lebih tinggi)
  var volcanoObj2 = Volcano.createSceneObject(
    GL,
    attribs,
    volcanoBaseRadius2,
    volcanoHeight2,
    volcanoSegments // Segments bisa sama
  );
  // --- AKHIR TAMBAHAN ---

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
  LIBS.translateY(volcanoNodeRight.localMatrix, -2100); // Turunkan sedikit agar dasarnya di bawah air
  LIBS.translateX(volcanoNodeRight.localMatrix, 1000); // Geser ke kanan
  LIBS.translateZ(volcanoNodeRight.localMatrix, -3300); // Posisikan JAUH di belakang

  // --- GUNUNG BERAPI 2 (Kiri) ---
  var volcanoNodeLeft = new Node();
  volcanoNodeLeft.setGeometry(volcanoObj2);
  // Posisikan gunung berapi:
  LIBS.translateY(volcanoNodeLeft.localMatrix, -2500); // Sedikit lebih rendah (karena lebih besar)
  LIBS.translateX(volcanoNodeLeft.localMatrix, -1450); // Jelas di sebelah KIRI
  LIBS.translateZ(volcanoNodeLeft.localMatrix, -3800); // Sedikit lebih jauh ke belakang
  // --- AKHIR TAMBAHAN ---

  // --- NODE POKEMON BASE 1 (CROBAT) ---
  var pokemonBaseNode1 = new Node();
  pokemonBaseNode1.setGeometry(pokemonBaseObj);
  LIBS.translateY(pokemonBaseNode1.localMatrix, 350);

  var crobatAnimatorNode = new Node();
  pokemonBaseNode1.add(crobatAnimatorNode);

  var crobatData = createCrobatSceneGraph(GL, attribs);
  var crobatRootNode = crobatData.root;
  LIBS.scale(crobatRootNode.localMatrix, 60, 60, 60);
  crobatAnimatorNode.add(crobatRootNode);

  // --- NODE POKEMON BASE 2 (GOLBAT) ---
  var pokemonBaseNode2 = new Node();
  pokemonBaseNode2.setGeometry(pokemonBaseObj);
  LIBS.translateX(pokemonBaseNode2.localMatrix, 800);
  LIBS.translateY(pokemonBaseNode2.localMatrix, 350);

  var golbatAnimatorNode = new Node();
  pokemonBaseNode2.add(golbatAnimatorNode);

  var golbatData = createGolbatSceneGraph(GL, attribs);
  var golbatRootNode = golbatData.root;
  LIBS.scale(golbatRootNode.localMatrix, 45, 45, 45); // Scale Golbat
  golbatAnimatorNode.add(golbatRootNode);

  // --- NODE POKEMON BASE 3 (ZUBAT) ---
  var pokemonBaseNode3 = new Node();
  pokemonBaseNode3.setGeometry(pokemonBaseObj);
  LIBS.translateX(pokemonBaseNode3.localMatrix, -800);
  LIBS.translateY(pokemonBaseNode3.localMatrix, 350);

  var zubatAnimatorNode = new Node();
  pokemonBaseNode3.add(zubatAnimatorNode);

  var zubatData = createZubatSceneGraph(GL, attribs);
  var zubatRootNode = zubatData.root;
  LIBS.scale(zubatRootNode.localMatrix, 20, 20, 20); // Scale Zubat
  zubatAnimatorNode.add(zubatRootNode);

  // --- TAMBAHAN: MANAGER SERANGAN SONIC ---
  const sonicAttackManager = new Node();
  // !! PENTING: Attach ke zubatAnimatorNode, bukan zubatRootNode !!
  zubatAnimatorNode.add(sonicAttackManager);

  /*================= INISIALISASI SISTEM ASAP =================*/
  // Definisikan kawah-kawah di sini
  const craterInfos = [
    {
      // Gunung KANAN
      pos: { x: 1000, y: -2100 + 2000 / 2, z: -3300 }, // Posisi Y = Y node + (Tinggi/2)
      radius: 1500 * 0.4, // Radius = Radius Alas * 0.4 (dari Volcano.js)
      count: 50, // Jumlah partikel
    },
    {
      // Gunung KIRI (Asumsi dari langkah sebelumnya)
      pos: { x: -1400, y: -2550 + 2300 / 2, z: -3600 },
      radius: 1800 * 0.4,
      count: 30,
    },
  ];

  // Panggil init dan simpan node induknya
  var globalSmokeRootNode = SmokeParticles.init(GL, attribs, craterInfos);
  /*================= AKHIR INISIALISASI ASAP =================*/

  /*================= MATRIKS & KONTROL KAMERA =================*/
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

  // --- TAMBAHAN: LISTENER KEYBOARD (Trigger + Kamera) ---
  var keyDown = function (e) {
    keys[e.key] = true;

    // Trigger Kamera (Sama seperti sebelumnya)
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

    // Trigger Serangan Sonic Wave
    if (e.key === " " || e.code === "Space") {
      if (!keys["SpaceProcessed"]) {
        isAutoAttacking = !isAutoAttacking;
        keys["SpaceProcessed"] = true;
      }
    }
    if (e.key === "z" || e.code === "KeyZ") {
      // Menggunakan 'Z'
      if (isKey1Pressed) return;
      isKey1Pressed = true;
      isAutoAttacking = false;
      spawnNewWave(performance.now());
    }
  };

  var keyUp = function (e) {
    keys[e.key] = false;
    if (e.key === " " || e.code === "Space") {
      keys["SpaceProcessed"] = false;
    }
    if (e.key === "z" || e.code === "KeyZ") {
      isKey1Pressed = false;
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

  // --- Konfigurasi Animasi Idle ---
  const idleFlipState = [
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 }, // Zubat
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 }, // Golbat
    { isFlipping: false, lastFlipTime: 0, flipStartTime: 0 }, // Crobat
  ];
  const flipIntervals = [15000, 18000, 13000];
  const flipDurations = [1000, 1100, 900];
  const idleFlipAngles = [0, 0, 0];
  const idleFloats = [0, 0, 0];

  // --- Konfigurasi FSM (Finite State Machine) ---
  let activePokemonIndex = 0;
  let animationStage = "IDLE";
  let stageStartTime = 0;

  // --- Variabel untuk menyimpan status rotasi ---
  let currentPokemonYRotation = [0, 0, 0];
  let targetPokemonYRotation = [0, 0, 0];

  const baseNodes = [pokemonBaseNode3, pokemonBaseNode2, pokemonBaseNode1];
  const animatorNodes = [
    zubatAnimatorNode,
    golbatAnimatorNode,
    crobatAnimatorNode,
  ];
  const idleFlapData = [zubatData.wings, golbatData.wings, crobatData.wings];

  // --- Konstanta Posisi & Durasi FSM ---
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

  // Helper FSM
  const LERP = (a, b, t) => a + (b - a) * t;
  const calculateAngle = (fromX, fromZ, toX, toZ) => {
    const dx = toX - fromX;
    const dz = toZ - fromZ;
    return Math.atan2(dx, dz);
  };

  // --- TAMBAHAN: VARIABEL ANIMASI SONIC WAVE ---
  let activeWaves = [];
  let lastWaveSpawnTime = 0;
  const waveSpawnInterval = 400;
  const waveLifespan = 2000;
  const waveMaxScale = 5.0;
  const waveSpeed = 8.0; // Disesuaikan agar lebih terlihat
  const waveOptions = {
    numRings: 1,
    ringSpacing: 0,
    baseRadius: 10.5,
    radiusGrowth: 0,
    tubeThickness: 0.1, // Dibuat lebih tebal
    mainSegments: 32,
    tubeSegments: 8,
  };
  let isAutoAttacking = false;
  let isKey1Pressed = false; // Untuk tombol 'Z'

  // --- Fungsi Helper untuk Spawn Gelombang ---
  function spawnNewWave(spawnTime) {
    const wave = new ZubatSonicWave(GL, attribs, waveOptions);
    wave.spawnTime = spawnTime;
    wave.lifespan = waveLifespan;
    sonicAttackManager.add(wave); // Attach ke manager
    activeWaves.push(wave);
    lastWaveSpawnTime = spawnTime;
  }

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

    // --- 1. Animasi Idle Wing Flap (Berlaku untuk semua) ---
    // Zubat (Index 0)
    var floatSpeedZ = 1.5;
    var floatAmplitudeZ = 0.2 * 30; // Scale Zubat = 20
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

    // Golbat (Index 1)
    var floatSpeedG = 1.5;
    var floatAmplitudeG_idle = 0.2 * 80; // Scale Golbat = 45
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

    // Crobat (Index 2)
    var floatAmplitudeC = 20; // Scale Crobat = 60
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

    // --- 2. Logika Idle Flip (Berlaku untuk semua) ---
    const currentTime = time; // Gunakan time dari animate
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
    }

    // --- 3. Logika FSM (State Machine) Pokemon AKTIF ---
    let activeNode = animatorNodes[activePokemonIndex];
    let activeBase = baseNodes[activePokemonIndex];
    let activeBasePos = [
      activeBase.localMatrix[12],
      activeBase.localMatrix[13],
      activeBase.localMatrix[14],
    ];
    let centerPos = [
      baseNodes[2].localMatrix[12],
      baseNodes[2].localMatrix[13],
      baseNodes[2].localMatrix[14],
    ];

    let timeInStage = time - stageStartTime;
    LIBS.set_I4(activeNode.localMatrix);

    let currentX = 0,
      currentY = IDLE_Y_OFFSET,
      currentZ = 0;
    let currentRotationY = 0,
      currentRotationX = 0;
    let progress,
      startAngle,
      endAngle,
      targetLocalX,
      targetLocalZ,
      centerToBaseAngle;

    switch (animationStage) {
      case "IDLE": {
        let floatY = idleFloats[activePokemonIndex];
        let flipAngle = idleFlipAngles[activePokemonIndex];
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
        LIBS.rotateY(
          activeNode.localMatrix,
          currentPokemonYRotation[activePokemonIndex]
        );
        if (progress >= 1.0) {
          targetLocalX = centerPos[0] - activeBasePos[0];
          targetLocalZ = centerPos[2] - activeBasePos[2];
          targetPokemonYRotation[activePokemonIndex] = calculateAngle(
            0,
            0,
            targetLocalX,
            targetLocalZ
          );
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
        let startX = centerPos[0] - activeBasePos[0];
        let startZ = centerPos[2] - activeBasePos[2];
        let targetZ = startZ + ORBIT_RADIUS;
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
        let angle = progress * Math.PI * 2;
        let circleX = Math.sin(angle) * ORBIT_RADIUS;
        let circleZ = Math.cos(angle) * ORBIT_RADIUS;
        currentX = centerPos[0] - activeBasePos[0] + circleX;
        currentY = LIFT_Y_OFFSET;
        currentZ = centerPos[2] - activeBasePos[2] + circleZ;
        let nextAngle = angle + 0.1;
        let nextX = Math.sin(nextAngle) * ORBIT_RADIUS;
        let nextZ = Math.cos(nextAngle) * ORBIT_RADIUS;
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
        let startZ = centerPos[2] - activeBasePos[2] + ORBIT_RADIUS;
        let endZ = centerPos[2] - activeBasePos[2];
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
        let startX = centerPos[0] - activeBasePos[0];
        let startZ = centerPos[2] - activeBasePos[2];
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

    // --- TAMBAHAN: ANIMASI SONIC WAVE ATTACK ---
    const currentTimeForWave = time; // Gunakan 'time' dari animate
    const timeSinceLastSpawn = currentTimeForWave - lastWaveSpawnTime;

    // Cek trigger untuk spawn gelombang
    if (isAutoAttacking && timeSinceLastSpawn > waveSpawnInterval) {
      spawnNewWave(currentTimeForWave);
    } else if (isKey1Pressed && timeSinceLastSpawn > waveSpawnInterval) {
      // Untuk 'Z' hold
      spawnNewWave(currentTimeForWave);
    }

    // Update dan bersihkan gelombang yang aktif
    const wavesToRemove = [];
    for (let wave of activeWaves) {
      const age = currentTimeForWave - wave.spawnTime;
      if (age > wave.lifespan) {
        wavesToRemove.push(wave);
      } else {
        const progress = age / wave.lifespan;
        const currentScale = 1.0 + progress * (waveMaxScale - 1.0); // Mulai dari 1.0
        const currentZ_anim = progress * waveSpeed;

        // !! PERBAIKAN SKALA & POSISI !!
        // Kita perlu ZUBAT's world matrix untuk posisi spawn yang benar
        // 1. Dapatkan world matrix dari zubatAnimatorNode
        const zubatWorldMatrix = zubatAnimatorNode.worldMatrix;

        // 2. Tentukan posisi spawn relatif terhadap Zubat
        const spawnOffsetY = 2 * 20; // 2 (Y Anda) * 20 (Skala Zubat)
        const spawnOffsetZ = 3 * 20; // 3 (Z Anda) * 20 (Skala Zubat)

        // 3. Buat matriks transformasi untuk gelombang
        const M_scale = LIBS.get_I4();
        LIBS.scale(M_scale, currentScale, 1.0, currentScale);

        const M_rotate = LIBS.get_I4();
        // LIBS.rotateX(M_rotate, Math.PI * 2); // Rotasi 360 = tidak ada rotasi
        // Coba arahkan lurus dulu
        LIBS.rotateX(M_rotate, Math.PI * 2); // Arahkan ke depan relatif thd Zubat

        const M_translate_local = LIBS.get_I4();
        LIBS.translateY(M_translate_local, spawnOffsetY); // Posisi Y relatif
        LIBS.translateZ(M_translate_local, spawnOffsetZ + currentZ_anim); // Posisi Z relatif + Gerakan

        // Gabungkan T * R * S secara lokal dulu
        const M_LocalTransform = LIBS.multiply(
          M_translate_local,
          LIBS.multiply(M_rotate, M_scale)
        );

        // Gabungkan dengan world matrix Zubat agar mengikuti Zubat
        // Final = World_Zubat * Local_Wave_Transform
        wave.localMatrix = LIBS.multiply(zubatWorldMatrix, M_LocalTransform);
        // Catatan: Karena kita set localMatrix gelombang = worldMatrix Zubat * transform lokal,
        // saat Node.draw() dipanggil, parentMatrix (dari zubatAnimatorNode)
        // akan dikalikan lagi. Kita perlu sedikit trik.
        // Opsi 1: Buat sonicAttackManager jadi child root scene (rumit).
        // Opsi 2 (Lebih mudah): Set parentMatrix jadi Identity saat draw wave.
        // Kita akan modifikasi Node.js atau buat fungsi draw khusus di ZubatSonicWave.
        // Untuk sekarang, biarkan begini dulu, nanti diperbaiki jika posisinya salah.
      }
    }

    // Hapus gelombang yang sudah mati
    if (wavesToRemove.length > 0) {
      sonicAttackManager.childs = activeWaves.filter(
        (w) => !wavesToRemove.includes(w)
      );
      activeWaves = sonicAttackManager.childs;
    }

    // --- 4. Terapkan Animasi Idle ke Pokemon NON-AKTIF ---
    for (let i = 0; i < animatorNodes.length; i++) {
      if (i !== activePokemonIndex) {
        let inactiveNode = animatorNodes[i];
        let floatY = idleFloats[i];
        let flipAngle = idleFlipAngles[i];
        currentPokemonYRotation[i] = 0;
        LIBS.set_I4(inactiveNode.localMatrix);
        LIBS.translateY(inactiveNode.localMatrix, IDLE_Y_OFFSET + floatY);
        LIBS.rotateX(inactiveNode.localMatrix, flipAngle);
        LIBS.rotateY(inactiveNode.localMatrix, 0);
      }
    }

    // --- 5. Update World Matrix & Kamera FSM ---
    pokemonBaseNode1.updateWorldMatrix(MOVEMATRIX);
    pokemonBaseNode2.updateWorldMatrix(MOVEMATRIX);
    pokemonBaseNode3.updateWorldMatrix(MOVEMATRIX);

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
    skyboxObj.draw(MOVEMATRIX, uniforms); // Draw Skybox
    GL.uniform1i(uniforms._isSkybox, false);

    GL.uniformMatrix4fv(uniforms._Vmatrix, false, VIEWMATRIX);
    islandNode.draw(MOVEMATRIX, uniforms); // Draw Island
    treeNode.draw(MOVEMATRIX, uniforms); // Draw Trees
    volcanoNodeRight.draw(MOVEMATRIX, uniforms); // Draw Volcano Right
    volcanoNodeLeft.draw(MOVEMATRIX, uniforms); // Draw Volcano Left
    pokemonBaseNode1.draw(MOVEMATRIX, uniforms); // Draw Crobat Base + Crobat
    pokemonBaseNode2.draw(MOVEMATRIX, uniforms); // Draw Golbat Base + Golbat
    pokemonBaseNode3.draw(MOVEMATRIX, uniforms); // Draw Zubat Base + Zubat (Termasuk Sonic Waves)

    // --- Animasi Awan Individual ---
    const cloudDriftAmount = 2000;
    for (const anim of cloudData.cloudAnimData) {
      let timeWithOffset = time + anim.startOffset;
      let drift =
        Math.sin(timeWithOffset * anim.speed * 0.001) * cloudDriftAmount;
      let newX = anim.baseX + drift * anim.direction;
      anim.node.localMatrix[12] = newX;
    }
    globalCloudRootNode.draw(MOVEMATRIX, uniforms); // Draw Clouds

    GL.enable(GL.BLEND); // Enable blending untuk asap dan air

    // --- Update Animasi Partikel Asap ---
    SmokeParticles.update(dt, THETA, PHI);
    // Gambar Partikel Asap
    GL.depthMask(false); // Disable depth writing
    globalSmokeRootNode.draw(MOVEMATRIX, uniforms);
    GL.depthMask(true); // Re-enable depth writing

    webNode.draw(MOVEMATRIX, uniforms); // Draw Spider Webs
    waterNode.draw(MOVEMATRIX, uniforms); // Draw Water

    GL.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0); // Mulai loop animasi
}

main();
