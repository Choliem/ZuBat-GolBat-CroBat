/*
 * GolbatEar.js
 * Model telinga dua sisi (pink di dalam, biru di luar)
 * dengan busur 75% (sisi terpotong 25%).
 *
 * PERBAIKAN: Menghapus insetFactor agar pink dan biru sama besar.
 */
import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js"; // <-- Impor Node

function generateEllipticParaboloid(a, b, stack, step, colorInside, colorOutside) {
  var vertices = [];
  var faces = [];

  var r_in = colorInside[0],
    g_in = colorInside[1],
    b_in = colorInside[2];
  var r_out = colorOutside[0],
    g_out = colorOutside[1],
    b_out = colorOutside[2];

  // Busur 75% (kopong 25% di depan)
  var totalVRange = 1.5 * Math.PI; // 75%
  var startV = 0.75 * Math.PI; // Mulai dari 135 derajat

  // --- LOOP 1: Buat semua vertex bagian DALAM (Pink) ---
  for (var i = 0; i <= stack; i++) {
    var u = i / stack;
    for (var j = 0; j <= step; j++) {
      var v = (j / step) * totalVRange + startV;

      // Ukuran penuh (insetFactor dihapus)
      var x = a * u * Math.cos(v);
      var y = b * u * Math.sin(v);
      var z = u * u;

      // Normal menghadap ke DALAM RONGGA
      var nx = -2 * u * Math.cos(v);
      var ny = -2 * u * Math.sin(v);
      var nz = a * b * u; // <-- Inset dihapus
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len == 0) len = 1;

      vertices.push(x, y, z, r_in, g_in, b_in, nx / len, ny / len, nz / len);
    }
  }

  var offset = (stack + 1) * (step + 1);

  // --- LOOP 2: Buat semua vertex bagian LUAR (Biru) ---
  for (var i = 0; i <= stack; i++) {
    var u = i / stack;
    for (var j = 0; j <= step; j++) {
      var v = (j / step) * totalVRange + startV;

      // Ukuran penuh
      var x = a * u * Math.cos(v);
      var y = b * u * Math.sin(v);
      var z = u * u;

      // Normal menghadap ke LUAR
      var nx = 2 * u * Math.cos(v);
      var ny = 2 * u * Math.sin(v);
      var nz = -a * b * u;
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len == 0) len = 1;

      vertices.push(x, y, z, r_out, g_out, b_out, nx / len, ny / len, nz / len);
    }
  }

  // --- Buat FACES (Urutan sudah diperbaiki untuk CCW) ---

  // 1. Faces untuk LENGKUNGAN TELINGA (75%)
  for (var i = 0; i < stack; i++) {
    for (var j = 0; j < step; j++) {
      var first = i * (step + 1) + j;
      var second = first + 1;
      var third = first + (step + 1);
      var fourth = third + 1;

      // Faces bagian DALAM (Pink) - CCW
      faces.push(first, second, fourth);
      faces.push(first, fourth, third);

      // Faces bagian LUAR (Biru) - CCW
      faces.push(offset + first, offset + fourth, offset + second);
      faces.push(offset + first, offset + third, offset + fourth);
    }
  }

  // 2. LOOP BARU: Buat FACES untuk MEMBRAN PENUTUP (Pink) - CCW
  for (var i = 0; i < stack; i++) {
    var p1_in = i * (step + 1) + 0;
    var p2_in = i * (step + 1) + step;
    var p3_in = (i + 1) * (step + 1) + 0;
    var p4_in = (i + 1) * (step + 1) + step;

    faces.push(p1_in, p4_in, p2_in);
    faces.push(p1_in, p3_in, p4_in);
  }

  return { vertices, faces };
}

export class GolbatEar extends Node {
  constructor(GL, attribs) {
    super(); // Panggil konstruktor Node

    var earColorOutside = [60 / 255, 60 / 255, 124 / 255]; // Biru/Ungu
    var earColorInside = [255 / 255, 184 / 255, 203 / 255]; // Pink

    var earShape = generateEllipticParaboloid(
      1.0, // a
      0.5, // b
      20, // stack
      20, // step
      earColorInside, // Warna dalam
      earColorOutside // Warna luar
    );

    var sceneObj = new SceneObject(GL, earShape.vertices, earShape.faces, attribs);
    this.setGeometry(sceneObj);
  }
}
