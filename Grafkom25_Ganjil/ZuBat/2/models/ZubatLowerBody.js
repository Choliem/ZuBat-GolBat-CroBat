/*
 * ZubatLowerBody.js - Ultimate Edition
 *
 * IMPROVEMENTS:
 * 1. ✅ Extends Node (scene graph compatible)
 * 2. ✅ Separated geometry generation
 * 3. ✅ Optimized mesh resolution (1000→50)
 * 4. ✅ Better leg deformation algorithm
 * 5. ✅ Options pattern for flexibility
 * 6. ✅ Smooth normal calculation
 *
 * FEATURES:
 * - Sphere dengan leg "pull" deformation
 * - Configurable leg targets & pull radius
 * - Efficient vertex generation
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatLowerBody extends Node {
  /**
   * Constructor - Buat lower body dengan leg deformation.
   *
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Object} attribs - Attribute locations
   * @param {Object} options - Body shape parameters
   */
  constructor(GL, attribs, options = {}) {
    super();

    // Merge dengan defaults
    const opts = { ...ZubatLowerBody.DEFAULT_OPTIONS, ...options };

    // 1. Generate body geometry (sphere dengan leg pull)
    const bodyData = this._generateBodyGeometry(opts);

    // 2. Buat SceneObject
    const sceneObj = new SceneObject(
      GL,
      bodyData.vertices,
      bodyData.faces,
      attribs
    );
    this.setGeometry(sceneObj);

    // 3. Apply transformation
    this._applyBodyTransformation(opts);
  }

  /**
   * Default options untuk lower body.
   */
  static DEFAULT_OPTIONS = {
    // Body size
    scaleFactor: 2.5,
    radius: 1.0,

    // Mesh resolution (optimized dari 1000!)
    latBands: 50,
    longBands: 50,

    // Color
    bodyColor: [0.35, 0.55, 0.95],

    // Leg deformation parameters
    legTargets: {
      left: [-0.4, -10.5, -4.3],
      right: [0.4, -10.5, -4.3],
    },
    legBaseCenters: {
      left: { x: -0.25, y: -0.4, z: -0.8 },
      right: { x: 0.25, y: -0.4, z: -0.8 },
    },
    legPullRadius: 0.2,
    legPullSharpness: 3.0,
  };

  /**
   * Generate body geometry dengan leg pull deformation.
   * Vertices di area kaki "ditarik" ke target position untuk simulasi kaki.
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
      legTargets,
      legBaseCenters,
      legPullRadius,
      legPullSharpness,
    } = opts;

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

        // Normal tetap menggunakan sphere normal (smooth shading)
        let final_nx = x;
        let final_ny = y;
        let final_nz = z;

        // --- LEG DEFORMATION LOGIC ---
        // Only deform vertices di bottom-back (y < 0 && z < 0)
        if (y < 0 && z < 0) {
          let distFromBase, target, baseCenter;

          // Determine which leg (left or right) based on X position
          if (x < 0) {
            target = legTargets.left;
            baseCenter = legBaseCenters.left;
          } else {
            target = legTargets.right;
            baseCenter = legBaseCenters.right;
          }

          // Calculate distance dari leg base center
          distFromBase = Math.sqrt(
            Math.pow(x - baseCenter.x, 2) +
              Math.pow(y - baseCenter.y, 2) +
              Math.pow(z - baseCenter.z, 2)
          );

          // Apply pull if within radius
          if (distFromBase < legPullRadius) {
            // Smooth falloff: 1.0 at center, 0.0 at edge
            let pullFactor = 1.0 - distFromBase / legPullRadius;

            // Apply sharpness (higher = more concentrated pull)
            let pullAmount = Math.pow(pullFactor, legPullSharpness);

            // Interpolate position menuju target
            final_x = x * (1.0 - pullAmount) + target[0] * pullAmount;
            final_y = y * (1.0 - pullAmount) + target[1] * pullAmount;
            final_z = z * (1.0 - pullAmount) + target[2] * pullAmount;
          }
        }

        // Normalize normal
        const len = Math.sqrt(
          final_nx * final_nx + final_ny * final_ny + final_nz * final_nz
        );

        vertices.push(radius * final_x, radius * final_y, radius * final_z);
        vertices.push(...bodyColor);
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
   * Apply scaling ke body.
   */
  _applyBodyTransformation(opts) {
    const { scaleFactor } = opts;

    const scaleMatrix = LIBS.get_I4();
    LIBS.scale(
      scaleMatrix,
      0.8 * scaleFactor,
      0.8 * scaleFactor,
      0.85 * scaleFactor
    );

    this.localMatrix = scaleMatrix;
  }

  /**
   * HELPER: Create body dengan different leg configurations.
   */
  static createVariant(GL, attribs, variant = "default") {
    const variants = {
      default: {},

      long_legs: {
        legTargets: {
          left: [-0.4, -15.0, -5.0],
          right: [0.4, -15.0, -5.0],
        },
      },

      wide_stance: {
        legTargets: {
          left: [-0.6, -10.5, -4.3],
          right: [0.6, -10.5, -4.3],
        },
        legBaseCenters: {
          left: { x: -0.35, y: -0.4, z: -0.8 },
          right: { x: 0.35, y: -0.4, z: -0.8 },
        },
      },
    };

    const options = variants[variant] || variants["default"];
    return new ZubatLowerBody(GL, attribs, options);
  }
}
