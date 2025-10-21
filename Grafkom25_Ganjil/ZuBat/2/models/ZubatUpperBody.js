/*
 * ZubatUpperBody.js - Complete Edition with Auto-Attached Children
 * IMPROVEMENT: Teeth are now children of UpperBody (like Golbat)
 */
import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";
import { ZubatTooth } from "./ZubatTooth.js";

export class ZubatUpperBody extends Node {
  constructor(GL, attribs, options = {}) {
    super();

    const opts = { ...ZubatUpperBody.DEFAULT_OPTIONS, ...options };

    // 1. Generate body geometry
    const bodyData = this._generateBodyGeometry(opts);

    // 2. Create SceneObject for body
    const sceneObj = new SceneObject(
      GL,
      bodyData.vertices,
      bodyData.faces,
      attribs
    );
    this.setGeometry(sceneObj);

    // 3. Apply transformation
    this._applyBodyTransformation(opts);

    // 4. AUTO-ATTACH teeth as children (LIKE GOLBAT!)
    if (opts.attachTeeth) {
      this._attachTeeth(GL, attribs, opts);
    }
  }

  static DEFAULT_OPTIONS = {
    scaleFactor: 2.5,
    radius: 1.0,
    latBands: 50,
    longBands: 50,
    bodyColor: [0.35, 0.55, 0.95],
    mouthColor: [0.1, 0.1, 0.2],
    mouthSurfaceCenter: { y: -0.1, x: 0.0 },
    mouthDepth: 0.4,
    mouthSharpness: 1.1,
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
      segments: 160,
      rings: 1,
      bluntness: 0.2,
    },
  };

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

    const processedPoints = mouthControlPoints
      .map((p) => ({ ...p, angleRad: p.angle * (Math.PI / 180) }))
      .sort((a, b) => a.angleRad - b.angleRad);

    const TWO_PI = 2 * Math.PI;

    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        let final_x = x;
        let final_y = y;
        let final_z = z;
        let final_nx = x;
        let final_ny = y;
        let final_nz = z;
        let finalColor = bodyColor;

        if (z > 0.3) {
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

          if (insideFactor < 1.0) {
            const targetPullX =
              prevPoint.pullTarget[0] * (1 - t) + nextPoint.pullTarget[0] * t;
            const targetPullY =
              prevPoint.pullTarget[1] * (1 - t) + nextPoint.pullTarget[1] * t;
            const targetPullZ =
              prevPoint.pullTarget[2] * (1 - t) + nextPoint.pullTarget[2] * t;

            let indentFactor = 1.0 - Math.sqrt(insideFactor);
            indentFactor = Math.pow(indentFactor, mouthSharpness);
            const pullAmount = mouthDepth * indentFactor;

            final_x = x * (1.0 - pullAmount) + targetPullX * pullAmount;
            final_y = y * (1.0 - pullAmount) + targetPullY * pullAmount;
            final_z = z * (1.0 - pullAmount) + targetPullZ * pullAmount;

            final_nx = final_x - targetPullX;
            final_ny = final_y - targetPullY;
            final_nz = final_z - targetPullZ;

            finalColor = mouthColor;
          }
        }

        const len =
          Math.sqrt(
            final_nx * final_nx + final_ny * final_ny + final_nz * final_nz
          ) || 1;

        vertices.push(radius * final_x, radius * final_y, radius * final_z);
        vertices.push(...finalColor);
        vertices.push(final_nx / len, final_ny / len, final_nz / len);
      }
    }

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

    this.localMatrix = LIBS.multiply(
      translationMatrix,
      LIBS.multiply(rotationMatrix, scaleMatrix)
    );
  }

  /**
   * AUTO-ATTACH teeth as children (IMPROVEMENT!)
   */
  _attachTeeth(GL, attribs, opts) {
    const { teethOptions } = opts;

    // Upper Left Tooth
    const toothUL = new ZubatTooth(GL, attribs, teethOptions);
    LIBS.translateY(toothUL.localMatrix, 1.25);
    LIBS.translateX(toothUL.localMatrix, -0.5);
    LIBS.translateZ(toothUL.localMatrix, 1.7);
    LIBS.rotateZ(toothUL.localMatrix, 0.2);
    this.add(toothUL);

    // Upper Right Tooth
    const toothUR = new ZubatTooth(GL, attribs, teethOptions);
    LIBS.translateY(toothUR.localMatrix, 1.25);
    LIBS.translateX(toothUR.localMatrix, 0.5);
    LIBS.translateZ(toothUR.localMatrix, 1.7);
    LIBS.rotateZ(toothUR.localMatrix, -0.2);
    this.add(toothUR);

    // Lower Left Tooth
    const toothLL = new ZubatTooth(GL, attribs, teethOptions);
    LIBS.translateY(toothLL.localMatrix, 2.73);
    LIBS.translateX(toothLL.localMatrix, -0.3);
    LIBS.translateZ(toothLL.localMatrix, 1.8);
    LIBS.rotateX(toothLL.localMatrix, Math.PI);
    this.add(toothLL);

    // Lower Right Tooth
    const toothLR = new ZubatTooth(GL, attribs, teethOptions);
    LIBS.translateY(toothLR.localMatrix, 2.73);
    LIBS.translateX(toothLR.localMatrix, 0.3);
    LIBS.translateZ(toothLR.localMatrix, 1.8);
    LIBS.rotateX(toothLR.localMatrix, Math.PI);
    this.add(toothLR);
  }
}