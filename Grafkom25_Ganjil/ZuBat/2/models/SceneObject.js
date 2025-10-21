/*
 * SceneObject.js
 * Kelas untuk menyimpan dan me-render geometri 3D.
 *
 * PERUBAHAN DARI VERSI LAMA:
 * - TIDAK LAGI abstract class yang harus di-extend
 * - MENERIMA data vertices & faces dari luar (separation of concerns)
 * - Fokus HANYA pada: buffer management & rendering
 *
 * FILOSOFI:
 * - SceneObject = "Geometry Data + WebGL Buffers"
 * - Node = "Transformation + Hierarchy"
 * - Part Classes (e.g., ZubatTooth) = "Geometry Generator"
 */
export class SceneObject {
  /**
   * Constructor - Menerima geometry data yang sudah jadi.
   *
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Array} verticesData - Array of vertices [x,y,z,r,g,b,nx,ny,nz, ...]
   * @param {Array} facesData - Array of face indices [i1,i2,i3, ...]
   * @param {Object} attribs - Attribute locations { _position, _color, _normal }
   */
  constructor(GL, verticesData, facesData, attribs) {
    this.GL = GL;
    this.attribs = attribs;
    this.vertices = verticesData; // Data mentah dari generator
    this.faces = facesData; // Data mentah dari generator

    this.vertexBuffer = null; // WebGL buffer untuk vertices
    this.facesBuffer = null; // WebGL buffer untuk indices
    this.modelMatrix = LIBS.get_I4(); // Legacy (tidak dipakai lagi dengan Node system)

    this.setup(); // Langsung buat WebGL buffers
  }

  /**
   * Setup WebGL buffers dari data vertices & faces.
   * Dipanggil otomatis di constructor.
   */
  setup() {
    // Create & fill vertex buffer
    this.vertexBuffer = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);
    this.GL.bufferData(
      this.GL.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      this.GL.STATIC_DRAW
    );

    // Create & fill index buffer (if faces exist)
    if (this.faces && this.faces.length > 0) {
      this.facesBuffer = this.GL.createBuffer();
      this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      this.GL.bufferData(
        this.GL.ELEMENT_ARRAY_BUFFER,
        new Uint32Array(this.faces), // ← PENTING: Uint32Array untuk index > 65535
        this.GL.STATIC_DRAW
      );
      this.faceCount = this.faces.length;
    } else {
      // Fallback untuk non-indexed drawing
      this.vertexCount = this.vertices.length / 9; // 9 floats per vertex (pos+color+normal)
    }
  }

  /**
   * Render geometri dengan transformasi yang diberikan.
   * Dipanggil oleh Node.draw() dengan finalMatrix.
   *
   * @param {Array} combinedMatrix - Final transformation matrix (4x4)
   * @param {WebGLUniformLocation} _Mmatrix - Uniform location untuk model matrix
   */
  draw(combinedMatrix, _Mmatrix) {
    // Set model matrix uniform
    this.GL.uniformMatrix4fv(_Mmatrix, false, combinedMatrix);

    // Bind vertex buffer
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);

    // Setup vertex attributes
    const stride = 9 * 4; // 9 floats × 4 bytes = 36 bytes per vertex

    // Position attribute (3 floats, offset 0)
    this.GL.vertexAttribPointer(
      this.attribs._position,
      3,
      this.GL.FLOAT,
      false,
      stride,
      0
    );

    // Color attribute (3 floats, offset 12 bytes)
    this.GL.vertexAttribPointer(
      this.attribs._color,
      3,
      this.GL.FLOAT,
      false,
      stride,
      3 * 4
    );

    // Normal attribute (3 floats, offset 24 bytes)
    this.GL.vertexAttribPointer(
      this.attribs._normal,
      3,
      this.GL.FLOAT,
      false,
      stride,
      6 * 4
    );

    // Enable attributes
    this.GL.enableVertexAttribArray(this.attribs._position);
    this.GL.enableVertexAttribArray(this.attribs._color);
    this.GL.enableVertexAttribArray(this.attribs._normal);

    // Draw with indexed or non-indexed method
    if (this.facesBuffer) {
      // Indexed drawing (lebih efisien)
      this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      this.GL.drawElements(
        this.GL.TRIANGLES,
        this.faceCount,
        this.GL.UNSIGNED_INT, // ← PENTING: Sesuai dengan Uint32Array di setup()
        0
      );
    } else {
      // Non-indexed drawing (fallback)
      this.GL.drawArrays(this.GL.TRIANGLES, 0, this.vertexCount);
    }
  }

  /**
   * Render sebagai garis (untuk Axes atau wireframe).
   * Method khusus, tidak dipakai oleh Node system.
   *
   * @param {Array} parentMatrix - Transformation matrix
   * @param {WebGLUniformLocation} _Mmatrix - Uniform location
   */
  drawLines(parentMatrix, _Mmatrix) {
    this.GL.uniformMatrix4fv(_Mmatrix, false, parentMatrix);
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);

    const stride = 6 * 4; // 6 floats untuk axes (pos + color, tanpa normal)

    this.GL.vertexAttribPointer(
      this.attribs._position,
      3,
      this.GL.FLOAT,
      false,
      stride,
      0
    );
    this.GL.vertexAttribPointer(
      this.attribs._color,
      3,
      this.GL.FLOAT,
      false,
      stride,
      3 * 4
    );

    this.GL.disableVertexAttribArray(this.attribs._normal);

    const lineVertexCount = this.vertices.length / 6;
    this.GL.drawArrays(this.GL.LINES, 0, lineVertexCount);

    this.GL.enableVertexAttribArray(this.attribs._normal);
  }
}
