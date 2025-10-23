/*
 * GolbatEye.js
 * Bentuk mata Golbat: Setengah elips dengan bagian atas MIRING (MARAH).
 * PERBAIKAN: Iris hitam sampai ke bawah.
 */
import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js";

// Fungsi untuk menghasilkan bentuk mata (tidak berubah)
function generateGolbatEyeShape(width, height, tilt, segments, color) {
  var vertices = [];
  var faces = [];
  var r = color[0],
    g = color[1],
    b_color = color[2];

  var numPoints = segments + 1;
  var normal = [0, 0, 1];

  // Baris bawah (busur elips)
  for (var i = 0; i <= segments; i++) {
    var angle = (i / segments) * Math.PI;
    var x = width * Math.cos(angle);
    var y = -height * Math.sin(angle);
    vertices.push(x, y, 0, r, g, b_color, normal[0], normal[1], normal[2]);
  }

  // Baris atas (garis lurus MIRING)
  for (var i = 0; i <= segments; i++) {
    var t = i / segments;
    var x = width - t * (2 * width);
    var y = t * tilt;
    vertices.push(x, y, 0, r, g, b_color, normal[0], normal[1], normal[2]);
  }

  // Faces (CCW)
  for (var i = 0; i < segments; i++) {
    var p1_bottom = i;
    var p2_bottom = i + 1;
    var p1_top = numPoints + i;
    var p2_top = numPoints + i + 1;
    faces.push(p1_bottom, p1_top, p2_top);
    faces.push(p1_bottom, p2_top, p2_bottom);
  }

  return { vertices, faces };
}

// --- FUNGSI IRIS DIPERBARUI ---
// Sekarang menerima eyeWidth dan eyeHeight
function generateIrisShape(x_offset, y_offset_top, size, color, eyeWidth, eyeHeight) {
  var vertices = [];
  var faces = [];
  var r = color[0],
    g = color[1],
    b_color = color[2];
  var z = 0.01;
  var normal = [0, 0, 1];

  // Hitung sudut pada busur bawah yang sesuai dengan x_offset
  // x = eyeWidth * cos(angle) => angle = acos(x / eyeWidth)
  // Pastikan x_offset tidak melebihi eyeWidth
  var clamped_x = Math.max(-eyeWidth * 0.99, Math.min(eyeWidth * 0.99, x_offset));
  var bottom_angle = Math.acos(clamped_x / eyeWidth);

  // Hitung y_bottom
  var y_bottom = -eyeHeight * Math.sin(bottom_angle);

  // Titik atas iris
  var top_y = y_offset_top + size;
  vertices.push(x_offset, top_y, z, r, g, b_color, normal[0], normal[1], normal[2]);

  // Titik kiri bawah (gunakan y_bottom)
  vertices.push(x_offset - size / 2, y_bottom, z, r, g, b_color, normal[0], normal[1], normal[2]);

  // Titik kanan bawah (gunakan y_bottom)
  vertices.push(x_offset + size / 2, y_bottom, z, r, g, b_color, normal[0], normal[1], normal[2]);

  faces.push(0, 1, 2); // (CCW)

  return { vertices, faces };
}

export class GolbatEye extends Node {
  constructor(GL, attribs) {
    super(); // Panggil konstruktor Node

    // --- Bagian Putih Mata ---
    var eyeWidth = 1.0;
    var eyeHeight = 0.5;
    var eyeTilt = 0.4;
    var eyeSegments = 20;
    var eyeColor = [1.0, 1.0, 1.0]; // Putih
    var eyeShape = generateGolbatEyeShape(eyeWidth, eyeHeight, eyeTilt, eyeSegments, eyeColor);
    var eyeSceneObj = new SceneObject(GL, eyeShape.vertices, eyeShape.faces, attribs);
    this.setGeometry(eyeSceneObj);

    // --- Iris/Pupil Hitam ---
    var iris_x_offset = 0.3;
    var iris_y_offset_top = 0.0; // Posisi Y titik atas iris
    var iris_size = 0.2; // Ukuran (lebar dasar segitiga)
    var irisColor = [0.0, 0.0, 0.0]; // Hitam

    // Panggil generateIrisShape dengan parameter baru
    var irisShape = generateIrisShape(
      iris_x_offset,
      iris_y_offset_top,
      iris_size,
      irisColor,
      eyeWidth, // <-- Kirim lebar mata
      eyeHeight // <-- Kirim tinggi mata
    );
    var irisSceneObj = new SceneObject(GL, irisShape.vertices, irisShape.faces, attribs);

    var irisNode = new Node();
    irisNode.setGeometry(irisSceneObj);
    this.add(irisNode);
  }
}
