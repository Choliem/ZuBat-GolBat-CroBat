/*
 * ZubatUpperBody.js - Ultimate Edition
 *
 * IMPROVEMENTS:
 * 1. ✅ Extends Node (scene graph compatible)
 * 2. ✅ Automatically attaches teeth as children
 * 3. ✅ Separated geometry generation from hierarchy building
 * 4. ✅ Configurable mouth deformation
 * 5. ✅ Better color management (body vs mouth)
 * 6. ✅ Smooth normal calculation for sphere deformation
 * 7. ✅ Options pattern for flexibility
 *
 * ARCHITECTURE:
 *   ZubatUpperBody (Node)
 *   ├─ Body Geometry (SceneObject)
 *   ├─ Tooth Upper Left (Node + SceneObject)  ← AUTO-ATTACHED
 *   ├─ Tooth Upper Right (Node + SceneObject) ← AUTO-ATTACHED
 *   ├─ Tooth Lower Left (Node + SceneObject)  ← AUTO-ATTACHED
 *   └─ Tooth Lower Right (Node + SceneObject) ← AUTO-ATTACHED
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";
import { ZubatTooth } from "./ZubatTooth.js";

export class ZubatUpperBody extends Node {
  /**
   * Constructor - Buat body dengan mouth deformation + auto-attach teeth.
   *
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Object} attribs - Attribute locations
   * @param {Object} options - Body shape parameters
   */
  constructor(GL, attribs, options = {}) {
    super();

    // Merge dengan defaults
    const opts = { ...ZubatUpperBody.DEFAULT_OPTIONS, ...options };

    // 1. Generate body geometry (sphere dengan mouth deformation)
    const bodyData = this._generateBodyGeometry(opts);

    // 2. Buat SceneObject untuk body
    const sceneObj = new SceneObject(
      GL,
      bodyData.vertices,
      bodyData.faces,
      attribs
    );
    this.setGeometry(sceneObj);

    // 3. Apply transformation ke body
    this._applyBodyTransformation(opts);

    // 4. AUTO-ATTACH teeth sebagai children (IMPROVEMENT!)
    if (opts.attachTeeth) {
      this._attachTeeth(GL, attribs, opts);
    }
  }

  /**
   * Default options untuk body shape.
   */
  static DEFAULT_OPTIONS = {
    // Body size
    scaleFactor: 2.5,
    radius: 1.0,

    // Mesh resolution
    latBands: 50, // Reduced dari 1000 (overkill) ke 50 (cukup smooth)
    longBands: 50, // Reduced dari 1000

    // Colors
    bodyColor: [0.35, 0.55, 0.95], // Blue body
    mouthColor: [0.1, 0.1, 0.2], // Dark mouth

    // Mouth deformation parameters
    mouthSurfaceCenter: { y: -0.1, x: 0.0 },
    mouthDepth: 0.4,
    mouthSharpness: 1.1,

    // Mouth shape control points (elliptical regions)
    mouthControlPoints: [
      { angle: 45, radii: { x: 0.6, y: 0.5 }, pullTarget: [1.5, 1.5, -0.8] },
      { angle: 135, radii: { x: 0.6, y: 0.5 }, pullTarget: [-1.6, 1.5, -0.8] },
      { angle: 225, radii: { x: 0.6, y: 0.7 }, pullTarget: [-0.6, -1.7, 0.0] },
      { angle: 315, radii: { x: 0.6, y: 0.7 }, pullTarget: [0.6, -1.7, 0.0] },
      { angle: 0, radii: { x: 0.6, y: 0.8 }, pullTarget: [1.6, -0.8, -0.08] },
      { angle: 90, radii: { x: 0.5, y: 0.5 }, pullTarget: [1.5, 1.5, -0.3] },
      {
        angle: 180,
        radii: { x: 0.6, y: 0.8 },
        pullTarget: [-1.6, -0.8, -0.05],
      },
      { angle: 270, radii: { x: 0.5, y: 0.35 }, pullTarget: [0, -1, 0.05] },
    ],

    // Teeth configuration
    attachTeeth: true,
    teethOptions: {
      upper: { height: 0.35, bluntness: 0.0, curvature: 0.15 },
      lower: { height: 0.35, bluntness: 0.0, curvature: 0.15 },
    },
  };

  /**
   * Generate body geometry dengan mouth deformation.
   * Menggunakan sphere deformation dengan elliptical pull regions.
   *
   * @param {Object} opts - Shape parameters
   * @returns {Object} { vertices: Array, faces: Array }
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

    // Preprocess control points (convert angles to radians & sort)
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

        // Base sphere position
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        let final_x = x;
        let final_y = y;
        let final_z = z;
        let final_nx = x; // Normal = sphere position (unit sphere)
        let final_ny = y;
        let final_nz = z;
        let finalColor = bodyColor;

        // --- MOUTH DEFORMATION LOGIC ---
        // Only deform vertices on front face (z > 0.3)
        if (z > 0.3) {
          const distX = x - mouthSurfaceCenter.x;
          const distY = y - mouthSurfaceCenter.y;

          // Calculate angle dari mouth center
          let vertexAngle = Math.atan2(distY, distX);
          if (vertexAngle < 0) vertexAngle += TWO_PI;

          // Find surrounding control points untuk interpolation
          let prevPoint = processedPoints[processedPoints.length - 1];
          let nextPoint = processedPoints[0];

          for (let i = 0; i < processedPoints.length; i++) {
            if (vertexAngle >= processedPoints[i].angleRad) {
              prevPoint = processedPoints[i];
              nextPoint = processedPoints[(i + 1) % processedPoints.length];
            }
          }

          // Interpolate between control points
          let angleDiff = nextPoint.angleRad - prevPoint.angleRad;
          if (angleDiff < 0) angleDiff += TWO_PI;

          let t = (vertexAngle - prevPoint.angleRad) / angleDiff;
          if (t < 0 || t > 1) t = 0;

          const targetRadiusX =
            prevPoint.radii.x * (1 - t) + nextPoint.radii.x * t;
          const targetRadiusY =
            prevPoint.radii.y * (1 - t) + nextPoint.radii.y * t;

          // Check if inside elliptical region
          const insideFactor =
            Math.pow(distX / targetRadiusX, 2) +
            Math.pow(distY / targetRadiusY, 2);

          if (insideFactor < 1.0) {
            // Interpolate pull target
            const targetPullX =
              prevPoint.pullTarget[0] * (1 - t) + nextPoint.pullTarget[0] * t;
            const targetPullY =
              prevPoint.pullTarget[1] * (1 - t) + nextPoint.pullTarget[1] * t;
            const targetPullZ =
              prevPoint.pullTarget[2] * (1 - t) + nextPoint.pullTarget[2] * t;

            // Calculate pull amount (smooth falloff)
            let indentFactor = 1.0 - Math.sqrt(insideFactor);
            indentFactor = Math.pow(indentFactor, mouthSharpness);
            const pullAmount = mouthDepth * indentFactor;

            // Deform position
            final_x = x * (1.0 - pullAmount) + targetPullX * pullAmount;
            final_y = y * (1.0 - pullAmount) + targetPullY * pullAmount;
            final_z = z * (1.0 - pullAmount) + targetPullZ * pullAmount;

            // Recalculate normal (point from pull target)
            final_nx = final_x - targetPullX;
            final_ny = final_y - targetPullY;
            final_nz = final_z - targetPullZ;

            finalColor = mouthColor;
          }
        }

        // Normalize normal
        const len =
          Math.sqrt(
            final_nx * final_nx + final_ny * final_ny + final_nz * final_nz
          ) || 1;

        vertices.push(radius * final_x, radius * final_y, radius * final_z);
        vertices.push(...finalColor);
        vertices.push(final_nx / len, final_ny / len, final_nz / len);
      }
    }

    // --- FACE GENERATION ---
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
   * Apply scaling, rotation, dan translation ke body.
   */
  _applyBodyTransformation(opts) {
    const { scaleFactor } = opts;

    // Scale
    const scaleMatrix = LIBS.get_I4();
    LIBS.scale(
      scaleMatrix,
      0.7 * scaleFactor,
      0.6 * scaleFactor,
      0.7 * scaleFactor
    );

    // Rotation (slight tilt)
    const rotationMatrix = LIBS.get_I4();
    LIBS.rotateX(rotationMatrix, -0.15);

    // Translation
    const translationMatrix = LIBS.get_I4();
    LIBS.translateY(translationMatrix, 0.5 * scaleFactor);
    LIBS.translateZ(translationMatrix, 0.2 * scaleFactor);

    // Combine: Translation × Rotation × Scale
    this.localMatrix = LIBS.multiply(
      translationMatrix,
      LIBS.multiply(rotationMatrix, scaleMatrix)
    );
  }

  /**
   * AUTO-ATTACH teeth sebagai children.
   * Ini adalah IMPROVEMENT BESAR: Gigi jadi bagian dari body hierarchy!
   */
  _attachTeeth(GL, attribs, opts) {
    const { teethOptions } = opts;

    // --- UPPER TEETH (Gigi Atas) ---
    const toothUpperLeft = new ZubatTooth(GL, attribs, teethOptions.upper);
    LIBS.translateY(toothUpperLeft.localMatrix, 1.25);
    LIBS.translateX(toothUpperLeft.localMatrix, -0.5);
    LIBS.translateZ(toothUpperLeft.localMatrix, 1.7);
    LIBS.rotateZ(toothUpperLeft.localMatrix, 0.2);
    this.add(toothUpperLeft); // ← PARENT-CHILD!

    const toothUpperRight = new ZubatTooth(GL, attribs, teethOptions.upper);
    LIBS.translateY(toothUpperRight.localMatrix, 1.25);
    LIBS.translateX(toothUpperRight.localMatrix, 0.5);
    LIBS.translateZ(toothUpperRight.localMatrix, 1.7);
    LIBS.rotateZ(toothUpperRight.localMatrix, -0.2);
    this.add(toothUpperRight);

    // --- LOWER TEETH (Gigi Bawah) ---
    const toothLowerLeft = new ZubatTooth(GL, attribs, teethOptions.lower);
    LIBS.translateY(toothLowerLeft.localMatrix, 2.73);
    LIBS.translateX(toothLowerLeft.localMatrix, -0.3);
    LIBS.translateZ(toothLowerLeft.localMatrix, 1.8);
    LIBS.rotateX(toothLowerLeft.localMatrix, Math.PI); // Flip downward
    this.add(toothLowerLeft);

    const toothLowerRight = new ZubatTooth(GL, attribs, teethOptions.lower);
    LIBS.translateY(toothLowerRight.localMatrix, 2.73);
    LIBS.translateX(toothLowerRight.localMatrix, 0.3);
    LIBS.translateZ(toothLowerRight.localMatrix, 1.8);
    LIBS.rotateX(toothLowerRight.localMatrix, Math.PI);
    this.add(toothLowerRight);
  }

  /**
   * HELPER: Create body with different mouth styles.
   */
  static createVariant(GL, attribs, variant = "default") {
    const variants = {
      default: {},

      wide_mouth: {
        mouthDepth: 0.5,
        mouthSharpness: 0.8,
        mouthControlPoints:
          ZubatUpperBody.DEFAULT_OPTIONS.mouthControlPoints.map((p) => ({
            ...p,
            radii: { x: p.radii.x * 1.2, y: p.radii.y * 1.2 },
          })),
      },

      narrow_mouth: {
        mouthDepth: 0.3,
        mouthSharpness: 1.5,
        mouthControlPoints:
          ZubatUpperBody.DEFAULT_OPTIONS.mouthControlPoints.map((p) => ({
            ...p,
            radii: { x: p.radii.x * 0.7, y: p.radii.y * 0.7 },
          })),
      },
    };

    const options = variants[variant] || variants["default"];
    return new ZubatUpperBody(GL, attribs, options);
  }
}