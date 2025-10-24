// models/CrobatEye.js

import { SceneObject } from "./SceneObject.js";

class EyePart extends SceneObject {
  constructor(GL, _position, _color, _normal, vertices, faces) {
    super(GL, _position, _color, _normal);
    this.vertices = vertices;
    this.faces = faces;
    this.setup();
  }
}

export class CrobatEye {
  constructor(GL, _position, _color, _normal) {
    this.outlinePart = this.createEyelid(GL, _position, _color, _normal);
    this.yellowPart = this.createSclera(GL, _position, _color, _normal);
    this.redPart = this.createPupil(GL, _position, _color, _normal);

    // Atur posisi Z agar tidak tumpang tindih
    LIBS.translateZ(this.outlinePart.modelMatrix, 0.01);
    LIBS.translateZ(this.redPart.modelMatrix, 0.02);

    // Matriks untuk mengontrol posisi & skala KESELURUHAN mata
    this.modelMatrix = LIBS.get_I4(); 
  }

  // Fungsi untuk merotasi dan membalik alis
  rotateEyelid(angle, isFlipped = false) {
    LIBS.set_I4(this.outlinePart.modelMatrix); // Reset matriks

    // Jika 'isFlipped' true, balik alis secara horizontal
    if (isFlipped) {
      LIBS.scale(this.outlinePart.modelMatrix, -1, 1, 1);
    }

    // Terapkan rotasi
    LIBS.rotateZ(this.outlinePart.modelMatrix, angle);
    
    // Kembalikan posisi Z-nya
    LIBS.translateZ(this.outlinePart.modelMatrix, 0.01);
  }

  // --- Fungsi Geometri untuk Sklera Kuning (Setengah Lingkaran) ---
  createSclera(GL, _position, _color, _normal) {
    const YELLOW = [1.0, 1.0, 0.0];
    const RADIUS = 0.16;
    const SEGMENTS = 16;
    let vertices = [], faces = [];

    vertices.push(0, 0, 0, ...YELLOW, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = Math.PI + (i * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      vertices.push(x, y, 0, ...YELLOW, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      faces.push(0, i + 1, i + 2);
    }
    
    return new EyePart(GL, _position, _color, _normal, vertices, faces);
  }

  // --- Fungsi Geometri untuk Alis Hitam (Garis Lurus & Tajam) ---
  createEyelid(GL, _position, _color, _normal) {
    const BLACK = [0.0, 0.0, 0.0];
    
    const WIDTH = 0.17;
    const THICKNESS = 0.02;
    const ANGLE_HEIGHT = 0.04;

    let vertices = [], faces = [];

    const p1 = [-WIDTH, 0, 0];
    const p2 = [WIDTH, 0, 0];
    const p3 = [WIDTH, THICKNESS + ANGLE_HEIGHT, 0];
    const p4 = [-WIDTH, THICKNESS, 0];

    vertices.push(...p1, ...BLACK, 0, 0, 1);
    vertices.push(...p2, ...BLACK, 0, 0, 1);
    vertices.push(...p3, ...BLACK, 0, 0, 1);
    vertices.push(...p4, ...BLACK, 0, 0, 1);

    faces.push(0, 1, 2);
    faces.push(0, 2, 3);

    return new EyePart(GL, _position, _color, _normal, vertices, faces);
  }
  
  // --- Fungsi Geometri untuk Pupil Merah (Lingkaran) ---
  createPupil(GL, _position, _color, _normal) {
    const RED = [1.0, 0.0, 0.0];
    const RADIUS = 0.04;
    const SEGMENTS = 16;
    let vertices = [], faces = [];
    
    vertices.push(0, 0, 0, ...RED, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i * 2 * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      vertices.push(x, y, 0, ...RED, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      faces.push(0, i + 1, i + 2);
    }
    
    return new EyePart(GL, _position, _color, _normal, vertices, faces);
  }
  
  // --- Fungsi Render ---
  render(GL, _Mmatrix, parentMatrix) {
    const combinedParentMatrix = LIBS.multiply(parentMatrix, this.modelMatrix);

    this.outlinePart.render(GL, _Mmatrix, combinedParentMatrix);
    this.yellowPart.render(GL, _Mmatrix, combinedParentMatrix);
    this.redPart.render(GL, _Mmatrix, combinedParentMatrix);
  }
}