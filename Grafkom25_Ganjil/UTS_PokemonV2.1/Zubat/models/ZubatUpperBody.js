/*
 * ===================================================================
 * KRITERIA 1: Badan Atas Zubat (dengan Mulut)
 * ===================================================================
 *
 * KRITERIA 2 & 5: JENIS OBJEK (DEFORMED SPHERE)
 *
 * ALGORITMA:
 * 1. Membuat mesh bola (sphere) resolusi tinggi.
 * 2. Vertex yang berada di area "mulut" (z > 0.3) akan
 * dideformasi/ditarik posisinya menuju 'pullTarget'.
 * 3. KRITERIA 3 & 5 (ANTI-ALIASING):
 * Di tepi mulut, warna di-blend menggunakan _smoothstep
 * antara 'bodyColor' dan 'mouthColor' untuk
 * menghasilkan pinggiran yang mulus (tidak bergerigi).
 * 4. KRITERIA 5 (HIERARKI):
 * Otomatis membuat 4 'ZubatTooth' dan menambahkannya sebagai 'child'.
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";
import { ZubatTooth } from "./ZubatTooth.js";

export class ZubatUpperBody extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatUpperBody.DEFAULT_OPTIONS, ...options };
    const bodyData = this._generateBodyGeometry(opts);
    const sceneObj = new SceneObject(
      GL,
      bodyData.vertices,
      bodyData.faces,
      attribs
    );
    this.setGeometry(sceneObj);
    this._applyBodyTransformation(opts);

    // Otomatis pasang gigi sebagai 'child'
    if (opts.attachTeeth) {
      this._attachTeeth(GL, attribs, opts);
    }
  }

  /**
   * Helper untuk interpolasi smooth (mirip GLSL smoothstep)
   * KRITERIA 4: t=0 -> kembali 0, t=1 -> kembali 1. Transisi mulus.
   */
  _smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    scaleFactor: 2.5,
    radius: 1.0,
    latBands: 1000, // Resolusi Vertikal (makin tinggi makin mulus)
    longBands: 1000, // Resolusi Horizontal (makin tinggi makin mulus)

    // KRITERIA 3: Parameter Warna
    bodyColor: [0.35, 0.55, 0.95], // Biru
    mouthColor: [0.1, 0.1, 0.2], // Hitam/Gelap

    // KRITERIA 3 & 4: Parameter Deformasi
    mouthSurfaceCenter: { y: -0.1, x: 0.0 },
    mouthDepth: 0.4, // Seberapa dalam mulut ditarik (0=rata, 1=full)
    mouthSharpness: 1.1, // Tepi tarikan (1=linear, >1=lebih tajam)

    // KRITERIA 3: Titik target (pullTarget) untuk deformasi mulut
    mouthControlPoints: [
      { angle: 45, radii: { x: 0.6, y: 0.5 }, pullTarget: [1.5, 1.5, -0.1] },
      { angle: 135, radii: { x: 0.6, y: 0.5 }, pullTarget: [-1.6, 1.5, -0.1] },
      { angle: 225, radii: { x: 0.6, y: 0.7 }, pullTarget: [-0.6, -1.7, 0.0] },
      { angle: 315, radii: { x: 0.6, y: 0.7 }, pullTarget: [0.6, -1.7, 0.0] },
      { angle: 0, radii: { x: 0.6, y: 0.8 }, pullTarget: [1.6, -0.8, -0.05] },
      { angle: 90, radii: { x: 0.5, y: 0.5 }, pullTarget: [1.5, 1.5, -0.15] },
      {
        angle: 180,
        radii: { x: 0.6, y: 0.8 },
        pullTarget: [-1.6, -0.8, -0.05],
      },
      { angle: 270, radii: { x: 0.5, y: 0.35 }, pullTarget: [0, -1, 0.05] },
    ],

    attachTeeth: true,
    teethOptions: {
      upper: { height: 0.35, bluntness: 0.0, curvature: 0.15 },
      lower: { height: 0.35, bluntness: 0.0, curvature: 0.15 },
    },
  };

  /**
   * ALGORITMA: Generate body geometry (Deformed Sphere + Anti-Aliasing)
   */
  _generateBodyGeometry(opts) {
    const vertices = [];
    const faces = [];
    const {
      radius,
      latBands,
      longBands,
      bodyColor,
      mouthColor,
      mouthSurfaceCenter,
      mouthDepth,
      mouthSharpness,
      mouthControlPoints,
    } = opts;

    // (Preprocess control points - tidak perlu komentar detail)
    const processedPoints = mouthControlPoints
      .map((p) => ({ ...p, angleRad: p.angle * (Math.PI / 180) }))
      .sort((a, b) => a.angleRad - b.angleRad);
    const TWO_PI = 2 * Math.PI;

    // --- VERTEX GENERATION ---
    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        // 1. Hitung Posisi Sphere (Bola)
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        let final_x = x,
          final_y = y,
          final_z = z;
        let final_nx = x,
          final_ny = y,
          final_nz = z; // Normal awal = posisi sphere
        let finalColor = bodyColor; // Default warna biru

        // 2. Deformasi jika di area Mulut
        if (z > 0.3) {
          // (Kalkulasi interpolasi target - tidak perlu komentar detail)
          const distX = x - mouthSurfaceCenter.x;
          const distY = y - mouthSurfaceCenter.y;
          let vertexAngle = Math.atan2(distY, distX);
          if (vertexAngle < 0) vertexAngle += TWO_PI;
          let prevPoint = processedPoints[processedPoints.length - 1];
          let nextPoint = processedPoints[0];
          for (let i = 0; i < processedPoints.length; i++) {
            if (vertexAngle >= processedPoints[i].angleRad) {
              prevPoint = processedPoints[i];
              nextPoint = processedPoints[(i + 1) % processedPoints.length];
            }
          }
          let angleDiff = nextPoint.angleRad - prevPoint.angleRad;
          if (angleDiff < 0) angleDiff += TWO_PI;
          let t = (vertexAngle - prevPoint.angleRad) / angleDiff;
          if (t < 0 || t > 1) t = 0;
          const targetRadiusX =
            prevPoint.radii.x * (1 - t) + nextPoint.radii.x * t;
          const targetRadiusY =
            prevPoint.radii.y * (1 - t) + nextPoint.radii.y * t;
          const insideFactor =
            Math.pow(distX / targetRadiusX, 2) +
            Math.pow(distY / targetRadiusY, 2);

          // 3. Anti-Aliasing (Blending)
          // KRITERIA 3 & 4: Parameter Ketajaman Tepi Mulut
          // 'blendEdgeStart' = 0.6 -> 60% ke dalam, warna 100% hitam
          // 'blendEdgeEnd' = 1.0 -> 100% (tepi), warna 100% biru
          // Di antara 0.6 dan 1.0 akan menjadi gradasi.
          const blendEdgeStart = 0.6;
          const blendEdgeEnd = 1.0;

          if (insideFactor < blendEdgeEnd) {
            // Deformasi Posisi Vertex
            const targetPullX =
              prevPoint.pullTarget[0] * (1 - t) + nextPoint.pullTarget[0] * t;
            const targetPullY =
              prevPoint.pullTarget[1] * (1 - t) + nextPoint.pullTarget[1] * t;
            const targetPullZ =
              prevPoint.pullTarget[2] * (1 - t) + nextPoint.pullTarget[2] * t;
            let indentFactor = 1.0 - Math.sqrt(Math.min(insideFactor, 1.0));
            indentFactor = Math.pow(indentFactor, mouthSharpness);
            const pullAmount = mouthDepth * indentFactor;
            final_x = x * (1.0 - pullAmount) + targetPullX * pullAmount;
            final_y = y * (1.0 - pullAmount) + targetPullY * pullAmount;
            final_z = z * (1.0 - pullAmount) + targetPullZ * pullAmount;
            final_nx = final_x - targetPullX;
            final_ny = final_y - targetPullY;
            final_nz = final_z - targetPullZ;

            // Hitung 'blendAmount' menggunakan smoothstep
            const blendAmount = this._smoothstep(
              blendEdgeEnd,
              blendEdgeStart,
              insideFactor
            );

            // Blend warna dari biru ke hitam
            finalColor = [
              bodyColor[0] * (1.0 - blendAmount) + mouthColor[0] * blendAmount,
              bodyColor[1] * (1.0 - blendAmount) + mouthColor[1] * blendAmount,
              bodyColor[2] * (1.0 - blendAmount) + mouthColor[2] * blendAmount,
            ];
          }
        }

        // Normalisasi normal
        const len =
          Math.sqrt(
            final_nx * final_nx + final_ny * final_ny + final_nz * final_nz
          ) || 1;

        vertices.push(radius * final_x, radius * final_y, radius * final_z);
        vertices.push(...finalColor);
        vertices.push(final_nx / len, final_ny / len, final_nz / len);
      }
    }

    // --- FACE GENERATION (Standard Sphere) ---
    for (let i = 0; i < latBands; i++) {
      for (let j = 0; j < longBands; j++) {
        const first = i * (longBands + 1) + j;
        const second = first + longBands + 1;
        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
      }
    }
    return { vertices, faces };
  }

  /**
   * Terapkan transformasi lokal ke badan atas (skala, rotasi, posisi)
   */
  _applyBodyTransformation(opts) {
    const { scaleFactor } = opts;
    const scaleMatrix = LIBS.get_I4();
    LIBS.scale(
      scaleMatrix,
      0.7 * scaleFactor,
      0.6 * scaleFactor,
      0.7 * scaleFactor
    );
    const rotationMatrix = LIBS.get_I4();
    LIBS.rotateX(rotationMatrix, -0.15);
    const translationMatrix = LIBS.get_I4();
    LIBS.translateY(translationMatrix, 0.5 * scaleFactor);
    LIBS.translateZ(translationMatrix, 0.2 * scaleFactor);

    // Matriks akhir: T * R * S
    this.localMatrix = LIBS.multiply(
      translationMatrix,
      LIBS.multiply(rotationMatrix, scaleMatrix)
    );
  }

  /**
   * KRITERIA 1 & 5: Pasang Gigi (Parent-Child)
   * Membuat 4 instance ZubatTooth dan menambahkannya sebagai 'child'
   * dari Node ZubatUpperBody ini.
   */
  _attachTeeth(GL, attribs, opts) {
    const { teethOptions } = opts;

    // --- Gigi Atas Kiri ---
    const toothUpperLeft = new ZubatTooth(GL, attribs, teethOptions.upper);
    // KRITERIA 3: Parameter Koordinat Gigi
    LIBS.translateY(toothUpperLeft.localMatrix, 0.45);
    LIBS.translateX(toothUpperLeft.localMatrix, -0.2);
    LIBS.translateZ(toothUpperLeft.localMatrix, 0.6);
    LIBS.rotateX(toothUpperLeft.localMatrix, Math.PI); // Balik ke bawah
    this.add(toothUpperLeft); // Tambahkan sebagai child

    // --- Gigi Atas Kanan ---
    const toothUpperRight = new ZubatTooth(GL, attribs, teethOptions.upper);
    LIBS.translateY(toothUpperRight.localMatrix, 0.45);
    LIBS.translateX(toothUpperRight.localMatrix, 0.2);
    LIBS.translateZ(toothUpperRight.localMatrix, 0.6);
    LIBS.rotateX(toothUpperRight.localMatrix, Math.PI);
    this.add(toothUpperRight);

    // --- Gigi Bawah Kiri ---
    const toothLowerLeft = new ZubatTooth(GL, attribs, teethOptions.lower);
    LIBS.translateY(toothLowerLeft.localMatrix, -0.45);
    LIBS.translateX(toothLowerLeft.localMatrix, -0.3);
    LIBS.translateZ(toothLowerLeft.localMatrix, 0.55);
    LIBS.rotateZ(toothLowerLeft.localMatrix, -0.2);
    this.add(toothLowerLeft);

    // --- Gigi Bawah Kanan ---
    const toothLowerRight = new ZubatTooth(GL, attribs, teethOptions.lower);
    LIBS.translateY(toothLowerRight.localMatrix, -0.45);
    LIBS.translateX(toothLowerRight.localMatrix, 0.3);
    LIBS.translateZ(toothLowerRight.localMatrix, 0.55);
    LIBS.rotateZ(toothLowerRight.localMatrix, 0.2);
    this.add(toothLowerRight);
  }
}