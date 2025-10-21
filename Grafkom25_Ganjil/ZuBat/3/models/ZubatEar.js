/*
 * ZubatEar.js - Ultimate Edition
 *
 * IMPROVEMENTS:
 * 1. ✅ Extends Node (scene graph compatible)
 * 2. ✅ Separated geometry generation
 * 3. ✅ Dual-color ear (outer blue, inner pink)
 * 4. ✅ Organic cavity deformation
 * 5. ✅ Options pattern for flexibility
 * 6. ✅ Better normal calculation
 * 7. ✅ Parameterized shape control
 *
 * FEATURES:
 * - Two-sided geometry (outer & inner different colors)
 * - Cavity "pull" creates realistic ear interior
 * - Smooth bluntness control for tip
 * - Width/height/thickness configurable
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatEar extends Node {
  /**
   * Constructor - Buat ear geometry dengan cavity deformation.
   *
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Object} attribs - Attribute locations
   * @param {Object} options - Ear shape parameters
   */
  constructor(GL, attribs, options = {}) {
    super();

    // Merge dengan defaults
    const opts = { ...ZubatEar.DEFAULT_OPTIONS, ...options };

    // 1. Generate ear geometry
    const earData = this._generateEarGeometry(opts);

    // 2. Buat SceneObject
    const sceneObj = new SceneObject(
      GL,
      earData.vertices,
      earData.faces,
      attribs
    );
    this.setGeometry(sceneObj);
  }

  /**
   * Default options untuk ear shape.
   */
  static DEFAULT_OPTIONS = {
    // Dimensions
    height: 2.0,
    maxWidth: 1.5,
    thickness: 1.0,

    // Shape control
    curveAmount: -0.5, // Negative = curves backward
    bluntness: 0.3, // 0.0=sharp tip, 1.0=flat tip

    // Resolution
    segments: 20,
    rings: 10,

    // Colors
    outerColor: [0.35, 0.55, 0.95], // Blue outer
    innerColor: [0.9, 0.45, 0.6], // Pink inner

    // Cavity parameters
    cavityTarget: [0.0, 1.0, -0.1],
    cavityRimSharpness: 2.0,
  };

  /**
   * Generate ear geometry dengan dual-sided coloring & cavity.
   * Ear berbentuk seperti paraboloid dengan cavity di inner side.
   *
   * @param {Object} opts - Shape parameters
   * @returns {Object} { vertices: Array, faces: Array }
   */
  _generateEarGeometry(opts) {
    const vertices = [];
    const faces = [];
    const {
      height,
      maxWidth,
      thickness,
      curveAmount,
      bluntness,
      segments,
      rings,
      outerColor,
      innerColor,
      cavityTarget,
      cavityRimSharpness,
    } = opts;

    // Calculate tip width dari bluntness
    const tipWidth = maxWidth * bluntness;

    // --- VERTEX GENERATION ---
    for (let j = 0; j <= rings; j++) {
      const t = j / rings; // Normalized height [0=tip, 1=base]
      const y = t * height;

      // Width profile: narrow at tip, wide at middle, controlled at base
      let widthProfile;
      if (t < 0.5) {
        // Bottom half: smooth growth
        widthProfile = Math.sin(t * Math.PI);
      } else {
        // Top half: taper to tip
        const upper_t = (t - 0.5) * 2;
        const targetWidthRatio = tipWidth / maxWidth;
        widthProfile = (1.0 - upper_t) * 1.0 + upper_t * targetWidthRatio;
      }
      const currentWidth = widthProfile * maxWidth;

      // Curve profile: ear bends backward
      const curveProfile = Math.sin(t * (Math.PI / 2));
      const currentCurve = curveProfile * curveAmount;

      // Generate ring of vertices
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;

        // Base position
        let x = (Math.cos(angle) * currentWidth) / 2;
        let z = (Math.sin(angle) * thickness) / 2;
        z += currentCurve; // Apply backward curve

        let final_x = x;
        let final_y = y;
        let final_z = z;
        let finalColor = outerColor;
        let normal;

        // --- CAVITY DEFORMATION (Inner side only) ---
        // Check if on inner side (sin(angle) > 0 = back side)
        if (Math.sin(angle) > 0) {
          // Calculate pull strength based on angle
          let pullAmount = Math.pow(Math.sin(angle), cavityRimSharpness);
          pullAmount *= widthProfile; // Stronger pull near wide parts

          // Switch to inner color if significantly pulled
          if (pullAmount > 0.1) {
            finalColor = innerColor;
          }

          // Interpolate position toward cavity target
          final_x = x * (0.9 - pullAmount) + cavityTarget[0] * pullAmount;
          final_y = y * (0.9 - pullAmount) + cavityTarget[1] * pullAmount;
          final_z = z * (0.0 - pullAmount) + cavityTarget[2] * pullAmount;
        }

        // Calculate normal
        if (finalColor === innerColor) {
          // Inner surface: normal points toward cavity target
          normal = [
            final_x - cavityTarget[0],
            final_y - cavityTarget[1],
            final_z - cavityTarget[2],
          ];
        } else {
          // Outer surface: normal perpendicular to surface
          const tangentY = Math.sin(t * Math.PI) * 0.5;
          normal = [Math.cos(angle) * widthProfile, tangentY, Math.sin(angle)];

          // Adjust for curve
          if (curveAmount > 0) {
            normal[2] -= curveProfile;
          }
        }

        // Push vertex data
        vertices.push(final_x, final_y, final_z);
        vertices.push(...finalColor);

        // Normalize normal
        const len =
          Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2) || 1;
        vertices.push(normal[0] / len, normal[1] / len, normal[2] / len);
      }
    }

    // --- FACE GENERATION ---
    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < segments; i++) {
        const idx1 = j * (segments + 1) + i;
        const idx2 = (j + 1) * (segments + 1) + i;

        faces.push(idx1, idx2, idx1 + 1);
        faces.push(idx2, idx2 + 1, idx1 + 1);
      }
    }

    return { vertices, faces };
  }

  /**
   * HELPER: Create ear variants dengan different shapes.
   */
  static createVariant(GL, attribs, variant = "default") {
    const variants = {
      default: {},

      pointed: {
        bluntness: 0.0,
        height: 2.5,
        maxWidth: 1.2,
      },

      rounded: {
        bluntness: 0.5,
        height: 1.8,
        maxWidth: 1.6,
      },

      bat_wing: {
        bluntness: 0.2,
        height: 2.2,
        maxWidth: 1.8,
        thickness: 0.8,
        curveAmount: -0.7,
      },
    };

    const options = variants[variant] || variants["default"];
    return new ZubatEar(GL, attribs, options);
  }
}