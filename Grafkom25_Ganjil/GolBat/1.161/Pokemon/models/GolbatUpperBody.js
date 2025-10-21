/*
 * GolbatUpperBody.js
 */
import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js"; // <-- Impor Node

/**
 * Fungsi helper untuk signed power: sign(base) * abs(base)^exp
 */
function signedPow(base, exp) {
  return Math.sign(base) * Math.pow(Math.abs(base), exp);
}

/**
 * Membuat bentuk superellipsoid (kotak bulat).
 */
function generateRoundedBox(a, b_axis, c, stack, step, color, params) {
  var vertices = [];
  var faces = [];
  var body_r = color[0],
    body_g = color[1],
    body_b = color[2];
  var mouth_r = 0.0,
    mouth_g = 0.0,
    mouth_b = 0.0;

  var exp = params.boxiness || 1.0;

  for (var i = 0; i <= stack; i++) {
    var u = (i / stack) * Math.PI - Math.PI / 2;
    for (var j = 0; j <= step; j++) {
      var v = (j / step) * 2 * Math.PI - Math.PI;

      var cos_u = Math.cos(u);
      var sin_u = Math.sin(u);
      var cos_v = Math.cos(v);
      var sin_v = Math.sin(v);

      // Rumus Superellipsoid
      var x = a * signedPow(cos_v, exp) * cos_u;
      var y = b_axis * sin_u;
      var z = c * signedPow(sin_v, exp) * cos_u;

      let r = body_r,
        g = body_g,
        b_comp = body_b;

      // --- LOGIKA MULUT (DIPERBAIKI) ---
      // Kita cek di sekitar v = Math.PI / 2 (DEPAN)
      if (
        params &&
        u > params.bottom &&
        u < params.top &&
        Math.abs(v - Math.PI / 2) < params.width // <-- INI PERBAIKANNYA
      ) {
        z *= params.indent; // Terapkan lekukan
        r = mouth_r;
        g = mouth_g;
        b_comp = mouth_b;
      }
      // -------------------------------

      // --- NORMAL UNTUK SUPERELLIPSOID ---
      var nx = (1 / a) * signedPow(cos_v, 2 - exp) * cos_u;
      var ny = (1 / b_axis) * sin_u;
      var nz = (1 / c) * signedPow(sin_v, 2 - exp) * cos_u;
      // -----------------------------------

      var normal_len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (normal_len == 0) normal_len = 1;

      nx /= normal_len;
      ny /= normal_len;
      nz /= normal_len;

      vertices.push(x, y, z, r, g, b_comp, nx, ny, nz);
    }
  }
  for (var i = 0; i < stack; i++) {
    for (var j = 0; j < step; j++) {
      var first = i * (step + 1) + j;
      var second = first + 1;
      var third = first + (step + 1);
      var fourth = third + 1;
      faces.push(first, second, fourth, first, fourth, third);
    }
  }
  return { vertices, faces };
}

export class GolbatUpperBody extends Node {
  constructor(GL, attribs) {
    super(); // Panggil konstruktor Node

    var bodyColor = [60 / 255, 60 / 255, 124 / 255];

    var bodyParams = {
      top: Math.PI / 8,
      bottom: -Math.PI / 5,
      width: Math.PI / 4, // Lebar mulut
      indent: 0.4,
      boxiness: 0.85, // 1.0 = telur, 0.5 = kotak bulat
    };

    var bodyShape = generateRoundedBox(
      1, // a (lebar)
      1.5, // b (tinggi)
      0.8, // c (tebal)
      50,
      50,
      bodyColor,
      bodyParams
    );

    // Buat SceneObject dan tetapkan ke Node ini
    var sceneObj = new SceneObject(GL, bodyShape.vertices, bodyShape.faces, attribs);
    this.setGeometry(sceneObj);
  }
}
