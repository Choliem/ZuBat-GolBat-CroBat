/*
 * ZubatTooth.js - Ultimate Edition
 *
 * IMPROVEMENTS:
 * 1. ✅ Extends Node (scene graph compatible)
 * 2. ✅ Separated geometry generation from rendering
 * 3. ✅ Smooth normals untuk lighting yang lebih bagus
 * 4. ✅ Parameterized shape control (width, curve, sharpness)
 * 5. ✅ Optimized face generation
 * 6. ✅ Better tooth anatomy (fang-like with subtle curve)
 * 7. ✅ Comprehensive documentation
 *
 * USAGE:
 *   const tooth = new ZubatTooth(GL, attribs, {
 *     height: 0.35,
 *     baseRadius: 0.2,
 *     bluntness: 0.0,      // 0.0 = sharp, 1.0 = flat tip
 *     segments: 160,       // Angular resolution
 *     rings: 8,            // Height resolution
 *     widthRatio: 0.7,     // Width compression (< 1.0 = thinner)
 *     curvature: 0.1       // Subtle curve amount
 *   });
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatTooth extends Node {
  /**
   * Constructor - Buat tooth geometry dan attach ke Node.
   *
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Object} attribs - Attribute locations { _position, _color, _normal }
   * @param {Object} options - Tooth shape parameters (see DEFAULT_OPTIONS)
   */
  constructor(GL, attribs, options = {}) {
    super(); // ← Panggil Node constructor (dapat localMatrix & childs[])

    // Merge user options dengan defaults
    const opts = { ...ZubatTooth.DEFAULT_OPTIONS, ...options };

    // 1. Generate geometry data (pure function, no side effects)
    const toothData = this._generateToothGeometry(opts);

    // 2. Buat SceneObject dari data
    const sceneObj = new SceneObject(
      GL,
      toothData.vertices,
      toothData.faces,
      attribs
    );

    // 3. Attach geometri ke Node ini
    this.setGeometry(sceneObj);
  }

  /**
   * Default options untuk tooth shape.
   * Bisa di-override saat instantiation.
   */
  static DEFAULT_OPTIONS = {
    height: 0.35, // Tinggi gigi
    baseRadius: 0.2, // Radius pangkal
    bluntness: 0.0, // 0.0=lancip, 1.0=tumpul
    segments: 160, // Resolusi angular (smoothness)
    rings: 8, // Resolusi vertikal
    widthRatio: 0.7, // Kompresi lebar (< 1.0 = lebih tipis)
    curvature: 0.1, // Kelengkungan subtle (0.0=lurus)
    color: [0.98, 0.9, 0.85], // Warna tulang/gading
  };

  /**
   * Generate tooth geometry dengan smooth normals.
   * Menggunakan parabolic taper untuk bentuk yang lebih organik.
   *
   * @param {Object} opts - Shape parameters
   * @returns {Object} { vertices: Array, faces: Array }
   */
  _generateToothGeometry(opts) {
    const vertices = [];
    const faces = [];
    const {
      height,
      baseRadius,
      bluntness,
      segments,
      rings,
      widthRatio,
      curvature,
      color,
    } = opts;

    // Calculate tip radius dari bluntness
    const tipRadius = baseRadius * bluntness;

    // --- VERTEX GENERATION (Body) ---
    // Loop dari base (y=0) ke tip (y=height)
    for (let j = 0; j <= rings; j++) {
      const y = (j / rings) * height; // Y position dari bottom ke top
      const t = j / rings; // Normalized position [0=base, 1=tip]

      // Parabolic taper: radius grows faster near base
      // Formula: r(t) = tipRadius + (baseRadius - tipRadius) × (1-t)²
      const parabolicCurve = Math.pow(1 - t, 2);
      const currentRadius =
        tipRadius + (baseRadius - tipRadius) * parabolicCurve;

      // Subtle curve: tooth slightly bends forward
      const xOffset = curvature * Math.sin(t * Math.PI);

      // Generate ring of vertices
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;

        // Position with width compression & curvature
        let x = Math.cos(angle) * currentRadius * widthRatio;
        const z = Math.sin(angle) * currentRadius;
        x += xOffset; // Apply curve

        vertices.push(x, y, z); // Position
        vertices.push(...color); // Color

        // Smooth normal calculation
        // Normal points outward from tooth surface
        const tangentY = (baseRadius - currentRadius) * 0.5; // Slope contribution
        const normalX = Math.cos(angle) * widthRatio;
        const normalY = tangentY;
        const normalZ = Math.sin(angle);

        // Normalize
        const len = Math.sqrt(
          normalX * normalX + normalY * normalY + normalZ * normalZ
        );
        vertices.push(normalX / len, normalY / len, normalZ / len);
      }
    }

    // --- FACE GENERATION (Body) ---
    // Connect rings dengan triangles
    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < segments; i++) {
        const idx1 = j * (segments + 1) + i;
        const idx2 = (j + 1) * (segments + 1) + i;
        const idx3 = idx1 + 1;
        const idx4 = idx2 + 1;

        // Two triangles per quad
        faces.push(idx1, idx2, idx3);
        faces.push(idx2, idx4, idx3);
      }
    }

    // --- CAP: BASE (Bottom) ---
    const baseCenterIndex = vertices.length / 9;
    vertices.push(0, 0, 0); // Position at base center
    vertices.push(...color); // Color
    vertices.push(0, -1, 0); // Normal pointing down

    // Triangle fan dari center ke base ring
    const baseRingStartIndex = rings * (segments + 1);
    for (let i = 0; i < segments; i++) {
      faces.push(
        baseRingStartIndex + i + 1, // Next vertex di base ring
        baseRingStartIndex + i, // Current vertex di base ring
        baseCenterIndex // Center point
      );
    }

    // --- CAP: TIP (Top) ---
    // --- CAP: TIP (Top) ---
    const tipCenterIndex = vertices.length / 9;

    // Hitung xOffset khusus untuk tip (di mana t = 1.0)
    const xOffsetAtTip = curvature * Math.sin(1.0 * Math.PI);

    vertices.push(xOffsetAtTip, height, 0); // Position at tip (with curve offset)
    vertices.push(...color);
    vertices.push(0, 1, 0); // Normal pointing up

    // Triangle fan dari center ke tip ring
    for (let i = 0; i < segments; i++) {
      faces.push(
        i, // Current vertex di tip ring
        i + 1, // Next vertex di tip ring
        tipCenterIndex // Center point
      );
    }

    return { vertices, faces };
  }

  /**
   * HELPER: Buat tooth variant dengan preset parameters.
   * Useful untuk quick instantiation dengan style yang berbeda.
   */
  static createVariant(GL, attribs, variant = "default") {
    const variants = {
      default: {}, // Use default options

      sharp: {
        bluntness: 0.0,
        height: 0.4,
        curvature: 0.15,
        widthRatio: 0.6,
      },

      blunt: {
        bluntness: 0.3,
        height: 0.3,
        curvature: 0.05,
        widthRatio: 0.8,
      },

      fang: {
        bluntness: 0.0,
        height: 0.5,
        curvature: 0.2,
        widthRatio: 0.5,
        baseRadius: 0.15,
      },

      molar: {
        bluntness: 0.8,
        height: 0.25,
        curvature: 0.0,
        widthRatio: 1.0,
        baseRadius: 0.25,
      },
    };

    const options = variants[variant] || variants["default"];
    return new ZubatTooth(GL, attribs, options);
  }
}
