/*
 * GolbatLowerBody.js
 * Node komposit yang membangun hierarki kakinya sendiri.
 */
import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js"; // <-- Impor Node

// --- FUNGSI GENERATOR LOKAL ---

function generateCylinder(radius, height, segments, color) {
  var vertices = [];
  var faces = [];
  var r = color[0],
    g = color[1],
    b = color[2];
  for (var i = 0; i <= segments; i++) {
    var angle = (i / segments) * 2 * Math.PI;
    var x = radius * Math.cos(angle);
    var z = radius * Math.sin(angle);
    vertices.push(x, height / 2, z, r, g, b, x / radius, 0, z / radius); // Top
    vertices.push(x, -height / 2, z, r, g, b, x / radius, 0, z / radius); // Bottom
  }
  for (var i = 0; i < segments; i++) {
    var i0 = i * 2,
      i1 = i0 + 1,
      i2 = (i + 1) * 2,
      i3 = i2 + 1;
    faces.push(i0, i2, i1, i1, i2, i3); // Sisi
  }
  return { vertices, faces, height };
}

function generateTube(majorRadius, minorRadius, segments, arc, color) {
  var vertices = [];
  var faces = [];
  var r = color[0],
    g = color[1],
    b = color[2];
  for (var i = 0; i <= segments; i++) {
    var u = (i / segments) * arc;
    for (var j = 0; j <= segments; j++) {
      var v = (j / segments) * 2 * Math.PI;
      var x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
      var y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
      var z = minorRadius * Math.sin(v);
      var nx = Math.cos(v) * Math.cos(u);
      var ny = Math.cos(v) * Math.sin(u);
      var nz = Math.sin(v);
      vertices.push(x, y, z, r, g, b, nx, ny, nz);
    }
  }
  for (var i = 0; i < segments; i++) {
    for (var j = 0; j < segments; j++) {
      var first = i * (segments + 1) + j;
      var second = first + 1;
      var third = (i + 1) * (segments + 1) + j;
      var fourth = third + 1;
      faces.push(first, second, fourth, first, fourth, third);
    }
  }
  return { vertices, faces, majorRadius, arc };
}

// --- FUNGSI BARU UNTUK KAP/TUTUP ---
function generateSphere(radius, stack, step, color) {
  var vertices = [];
  var faces = [];
  var r = color[0],
    g = color[1],
    b_comp = color[2];

  for (var i = 0; i <= stack; i++) {
    var u = (i / stack) * Math.PI - Math.PI / 2; // -PI/2 ke PI/2
    for (var j = 0; j <= step; j++) {
      var v = (j / step) * 2 * Math.PI - Math.PI; // -PI ke PI

      var x = radius * Math.cos(v) * Math.cos(u);
      var y = radius * Math.sin(u);
      var z = radius * Math.sin(v) * Math.cos(u);

      var nx = x,
        ny = y,
        nz = z; // Normal bola = posisi
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

// --- KELAS UTAMA (DIPERBARUI) ---
export class GolbatLowerBody extends Node {
  constructor(GL, attribs) {
    super(); // Panggil konstruktor Node

    var bodyColor = [60 / 255, 60 / 255, 124 / 255];
    var legHeight = 0.65;
    var footMajorRadius = 0.3;
    var footMinorRadius = 0.1;

    // Buat geometri SATU KALI
    var legCylinder = generateCylinder(0.1, legHeight, 20, bodyColor);
    var footTube = generateTube(footMajorRadius, footMinorRadius, 20, Math.PI, bodyColor);
    var capSphere = generateSphere(footMinorRadius, 10, 10, bodyColor); // Geometri untuk tutup

    // Buat SceneObjects untuk geometri (data mentah)
    var thighSceneObject = new SceneObject(GL, legCylinder.vertices, legCylinder.faces, attribs);
    var footSceneObject = new SceneObject(GL, footTube.vertices, footTube.faces, attribs);
    var capSceneObject = new SceneObject(GL, capSphere.vertices, capSphere.faces, attribs); // <-- SceneObject untuk tutup

    // --- Bangun Hierarki Kaki Kiri ---
    var leftLeg = new Node(); // Ini adalah "sendi" panggul kiri
    LIBS.translateX(leftLeg.localMatrix, -0.15);
    LIBS.translateY(leftLeg.localMatrix, -1.15);
    LIBS.rotateZ(leftLeg.localMatrix, -0.5);
    LIBS.rotateY(leftLeg.localMatrix, Math.PI / 4);

    var leftThigh = new Node(); // Node paha
    leftThigh.setGeometry(thighSceneObject);
    LIBS.translateY(leftThigh.localMatrix, -legHeight / 2);

    var leftFoot = new Node(); // Node telapak kaki (tabung)
    leftFoot.setGeometry(footSceneObject);
    LIBS.translateY(leftFoot.localMatrix, -legHeight - 0.3);

    // Node untuk tutup ujung kaki kiri
    var leftFootCap1 = new Node();
    leftFootCap1.setGeometry(capSceneObject);
    LIBS.copy(leftFootCap1.localMatrix, leftFoot.localMatrix); // Salin posisi leftFoot
    LIBS.translateX(leftFootCap1.localMatrix, footMajorRadius); // Geser ke ujung (x = 0.3)

    var leftFootCap2 = new Node();
    leftFootCap2.setGeometry(capSceneObject);
    LIBS.copy(leftFootCap2.localMatrix, leftFoot.localMatrix); // Salin posisi leftFoot
    LIBS.translateX(leftFootCap2.localMatrix, -footMajorRadius); // Geser ke ujung (x = -0.3)

    // Hubungkan hierarki kiri
    leftLeg.add(leftThigh);
    leftLeg.add(leftFoot);
    leftLeg.add(leftFootCap1); // <-- Tambahkan tutup
    leftLeg.add(leftFootCap2); // <-- Tambahkan tutup
    this.add(leftLeg);

    // --- Bangun Hierarki Kaki Kanan ---
    var rightLeg = new Node(); // "Sendi" panggul kanan
    LIBS.translateX(rightLeg.localMatrix, 0.15);
    LIBS.translateY(rightLeg.localMatrix, -1.15);
    LIBS.rotateZ(rightLeg.localMatrix, 0.5);
    LIBS.rotateY(rightLeg.localMatrix, -Math.PI / 4);

    var rightThigh = new Node();
    rightThigh.setGeometry(thighSceneObject);
    LIBS.translateY(rightThigh.localMatrix, -legHeight / 2);

    var rightFoot = new Node();
    rightFoot.setGeometry(footSceneObject);
    LIBS.translateY(rightFoot.localMatrix, -legHeight - 0.3);

    // Node untuk tutup ujung kaki kanan
    var rightFootCap1 = new Node();
    rightFootCap1.setGeometry(capSceneObject);
    LIBS.copy(rightFootCap1.localMatrix, rightFoot.localMatrix);
    LIBS.translateX(rightFootCap1.localMatrix, footMajorRadius);

    var rightFootCap2 = new Node();
    rightFootCap2.setGeometry(capSceneObject);
    LIBS.copy(rightFootCap2.localMatrix, rightFoot.localMatrix);
    LIBS.translateX(rightFootCap2.localMatrix, -footMajorRadius);

    // Hubungkan hierarki kanan
    rightLeg.add(rightThigh);
    rightLeg.add(rightFoot);
    rightLeg.add(rightFootCap1); // <-- Tambahkan tutup
    rightLeg.add(rightFootCap2); // <-- Tambahkan tutup
    this.add(rightLeg);
  }
}
