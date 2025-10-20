// models/CrobatBody.js

import { SceneObject } from "./SceneObject.js";

export class CrobatBody extends SceneObject {
  constructor(
    GL,
    _position,
    _color,
    _normal,
    scaleFactor,
    bodyColor,
    mouthColor
  ) {
    super(GL, _position, _color, _normal);

    const latBands = 64;
    const longBands = 64;
    const radius = 1.0;

    // --- Parameter Mulut (dari ZubatUpperBody) ---
    const mouthSurfaceCenter = { y: -0.1, x: 0.0 };
    const mouthDepth = 0.4;

    // =========================================================
    // --- IMPROVEMENT: Tajamkan Lekukan Mulut ---
    // Nilai yang lebih tinggi membuat lipatan di tepi mulut lebih tajam,
    // sesuai dengan referensi wireframe (image_2ecadf.png).
    const mouthSharpness = 1.5; // <-- NAIKKAN DARI 1.1
    // =========================================================

    // =========================================================
    // --- IMPROVEMENT: Titik Kontrol "Boomerang" ---
    // Titik-titik ini didesain ulang sepenuhnya untuk mencocokkan
    // bentuk "senyum" boomerang dari gambar referensi (image_2eca44.png).
    const controlPoints = [
      // Titik 1: Sudut atas-kiri (tarik ke atas & belakang)
      {
        angle: 135,
        radii: { x: 0.7, y: 0.6 },
        pullTarget: [-1.8, 1.5, -0.2], // y=1.5 menarik sudut ke atas
      },
      // Titik 2: Sudut atas-kanan (tarik ke atas & belakang)
      {
        angle: 45,
        radii: { x: 0.7, y: 0.6 },
        pullTarget: [1.8, 1.5, -0.2], // y=1.5 menarik sudut ke atas
      },
      // Titik 3: Tengah atas (lekukan 'V' di antara mata)
      {
        angle: 90,
        radii: { x: 0.4, y: 0.3 },
        pullTarget: [0.0, 1.2, -0.2], // y=1.2 sedikit lebih rendah dari sudut
      },
      // Titik 4: Samping kiri
      {
        angle: 180,
        radii: { x: 0.8, y: 0.5 },
        pullTarget: [-1.8, -0.5, -0.1],
      },
      // Titik 5: Samping kanan
      {
        angle: 0,
        radii: { x: 0.8, y: 0.5 },
        pullTarget: [1.8, -0.5, -0.1],
      },
      // Titik 6: Bawah kiri
      {
        angle: 225,
        radii: { x: 0.6, y: 0.7 },
        pullTarget: [-0.8, -1.8, 0.0], // y=-1.8 membentuk rahang bawah
      },
      // Titik 7: Bawah kanan
      {
        angle: 315,
        radii: { x: 0.6, y: 0.7 },
        pullTarget: [0.8, -1.8, 0.0], // y=-1.8 membentuk rahang bawah
      },
      // Titik 8: Tengah bawah (dagu)
      {
        angle: 270,
        radii: { x: 0.4, y: 0.8 },
        pullTarget: [0.0, -2.0, 0.0], // y=-2.0 titik terdalam rahang
      },
    ];
    // =========================================================

    const mouthProcessedPoints = controlPoints
      .map((p) => ({ ...p, angleRad: p.angle * (Math.PI / 180) }))
      .sort((a, b) => a.angleRad - b.angleRad);
    const TWO_PI = 2 * Math.PI;

    // --- Parameter Deformasi Kaki & Pangkal Sayap ---
    // (Tidak berubah)
    const deformers = [
      {
        base: { x: -0.25, y: -0.4, z: -0.8 },
        target: [-0.4, -1.5, -1.3],
        radius: 0.2,
        sharpness: 3.0,
      },
      {
        base: { x: 0.25, y: -0.4, z: -0.8 },
        target: [0.4, -1.5, -1.3],
        radius: 0.2,
        sharpness: 3.0,
      },
      {
        base: { x: -0.5, y: 0.3, z: -0.6 },
        target: [-1.5, 0.4, -1.0],
        radius: 0.35,
        sharpness: 2.5,
      },
      {
        base: { x: 0.5, y: 0.3, z: -0.6 },
        target: [1.5, 0.4, -1.0],
        radius: 0.35,
        sharpness: 2.5,
      },
      {
        base: { x: -0.4, y: -0.1, z: -0.7 },
        target: [-1.4, -0.2, -1.0],
        radius: 0.3,
        sharpness: 2.5,
      },
      {
        base: { x: 0.4, y: -0.1, z: -0.7 },
        target: [1.4, -0.2, -1.0],
        radius: 0.3,
        sharpness: 2.5,
      },
    ];

    // --- VERTEX GENERATION ---
    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        let x = cosPhi * sinTheta;
        let y = cosTheta;
        let z = sinPhi * sinTheta;

        let final_x = x,
          final_y = y,
          final_z = z;
        let final_nx = x,
          final_ny = y,
          final_nz = z;
        let finalColor = bodyColor;
        let deformed = false;

        // --- 1. Logika Mulut (Prioritas) ---
        // (Logika ini tidak berubah, tapi akan menggunakan controlPoints baru)
        if (z > 0.3) {
          const distX = x - mouthSurfaceCenter.x;
          const distY = y - mouthSurfaceCenter.y;
          let vertexAngle = Math.atan2(distY, distX);
          if (vertexAngle < 0) vertexAngle += TWO_PI;
          let prevPoint = mouthProcessedPoints[mouthProcessedPoints.length - 1];
          let nextPoint = mouthProcessedPoints[0];
          for (let i = 0; i < mouthProcessedPoints.length; i++) {
            if (vertexAngle >= mouthProcessedPoints[i].angleRad) {
              prevPoint = mouthProcessedPoints[i];
              nextPoint =
                mouthProcessedPoints[(i + 1) % mouthProcessedPoints.length];
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

          if (insideFactor < 1.0) {
            const targetPullX =
              prevPoint.pullTarget[0] * (1 - t) + nextPoint.pullTarget[0] * t;
            const targetPullY =
              prevPoint.pullTarget[1] * (1 - t) + nextPoint.pullTarget[1] * t;
            const targetPullZ =
              prevPoint.pullTarget[2] * (1 - t) + nextPoint.pullTarget[2] * t;

            // Perhitungan indentFactor menggunakan mouthSharpness baru
            let indentFactor = 1.0 - Math.sqrt(insideFactor);
            indentFactor = Math.pow(indentFactor, mouthSharpness); // <-- Menggunakan sharpness baru

            const pullAmount = mouthDepth * indentFactor;
            final_x = x * (1.0 - pullAmount) + targetPullX * pullAmount;
            final_y = y * (1.0 - pullAmount) + targetPullY * pullAmount;
            final_z = z * (1.0 - pullAmount) + targetPullZ * pullAmount;
            final_nx = final_x - targetPullX;
            final_ny = final_y - targetPullY;
            final_nz = final_z - targetPullZ;
            finalColor = mouthColor;
            deformed = true;
          }
        }

        // --- 2. Logika Kaki & Pangkal Sayap (jika tidak di area mulut) ---
        // (Tidak berubah)
        if (!deformed) {
          let totalPull = 0;
          let finalTarget = [0, 0, 0];
          let weightedPull = 0;

          for (const deform of deformers) {
            let dist = Math.sqrt(
              Math.pow(x - deform.base.x, 2) +
                Math.pow(y - deform.base.y, 2) +
                Math.pow(z - deform.base.z, 2)
            );
            if (dist < deform.radius) {
              let pull = 1.0 - dist / deform.radius;
              pull = Math.pow(pull, deform.sharpness);

              finalTarget[0] += deform.target[0] * pull;
              finalTarget[1] += deform.target[1] * pull;
              finalTarget[2] += deform.target[2] * pull;
              weightedPull += pull;
            }
          }

          if (weightedPull > 0) {
            finalTarget[0] /= weightedPull;
            finalTarget[1] /= weightedPull;
            finalTarget[2] /= weightedPull;

            totalPull = Math.min(weightedPull, 1.0);

            final_x = x * (1.0 - totalPull) + finalTarget[0] * totalPull;
            final_y = y * (1.0 - totalPull) + finalTarget[1] * totalPull;
            final_z = z * (1.0 - totalPull) + finalTarget[2] * totalPull;

            final_nx = final_x - finalTarget[0] * 0.5;
            final_ny = final_y - finalTarget[1] * 0.5;
            final_nz = final_z - finalTarget[2] * 0.5;
          }
        }

        const len =
          Math.sqrt(final_nx ** 2 + final_ny ** 2 + final_nz ** 2) || 1;
        this.vertices.push(
          radius * final_x,
          radius * final_y,
          radius * final_z
        );
        this.vertices.push(...finalColor);
        this.vertices.push(final_nx / len, final_ny / len, final_nz / len);
      }
    }

    // --- FACE GENERATION ---
    // (Tidak berubah)
    for (let i = 0; i < latBands; i++) {
      for (let j = 0; j < longBands; j++) {
        const first = i * (longBands + 1) + j;
        const second = first + longBands + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }

    // --- SETUP AND TRANSFORMATION ---
    // (Tidak berubah)
    this.setup();

    const scaleMatrix = LIBS.get_I4();
    const newScale = [0.9 * scaleFactor, 1.1 * scaleFactor, 0.9 * scaleFactor];
    LIBS.scale(scaleMatrix, newScale[0], newScale[1], newScale[2]);

    const translationMatrix = LIBS.get_I4();
    LIBS.translateY(translationMatrix, 0.2 * scaleFactor);

    this.modelMatrix = LIBS.multiply(translationMatrix, scaleMatrix);
  }
}
