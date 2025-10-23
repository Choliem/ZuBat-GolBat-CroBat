/**
 * SceneObject.js - Pekerja Rendering WebGL (Telah Disesuaikan)
 *
 * Mengurus Data Geometri, WebGL Buffers, dan Draw Call.
 * Disesuaikan untuk menangani beberapa layout vertex (pos/uv dan pos/col/uv)
 * yang ada di proyek Anda.
 */

// 'export' ditambahkan agar bisa di-import oleh main.js
export class SceneObject {
  /**
   * Constructor
   * @param {WebGLRenderingContext} GL
   * @param {Array} verticesData - Array [x,y,z, ...]
   * @param {Array} facesData - Array [i1,i2,i3, ...]
   * @param {Object} attribs - Lokasi attribute shader (_position, _color, _uv)
   * @param {String} layout - Tipe data: "POS_UV" atau "POS_COL_UV"
   * @param {WebGLTexture} texture - Tekstur yang akan digunakan (opsional)
   * @param {GLenum} drawMode - GL.TRIANGLES atau GL.LINES
   */
  constructor(GL, verticesData, facesData, attribs, layout, texture = null, drawMode = GL.TRIANGLES) {
    this.GL = GL;
    this.attribs = attribs;
    this.layout = layout;
    this.texture = texture;
    this.drawMode = drawMode;

    this.vertices = verticesData;
    this.faces = facesData;

    this.vertexBuffer = null;
    this.facesBuffer = null;
    this.faceCount = 0;

    this.setup(); // Langsung buat WebGL buffers
  }

  /**
   * Setup WebGL buffers dari data vertices & faces.
   */
  setup() {
    const GL = this.GL;

    this.vertexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);

    if (this.faces && this.faces.length > 0) {
      this.facesBuffer = GL.createBuffer();
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(this.faces), // Menggunakan Uint16, bukan 32
        GL.STATIC_DRAW
      );
      this.faceCount = this.faces.length;
    }
  }

  /**
   * Proses DRAWING (Dipanggil oleh Node)
   * @param {Array} combinedMatrix - Matriks transformasi final
   * @param {Object} uniforms - Kumpulan lokasi uniform shader
   */
  draw(combinedMatrix, uniforms) {
    // <-- PERBAIKAN: Menerima 'uniforms' sebagai object
    const GL = this.GL;

    // 1. Set matriks
    // PERBAIKAN: Mengakses _Mmatrix DARI object uniforms
    GL.uniformMatrix4fv(uniforms._Mmatrix, false, combinedMatrix);

    // 2. Bind VBO dan EBO
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    if (this.facesBuffer) {
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
    }

    // 3. Bind Tekstur (jika ada)
    if (this.texture) {
      GL.activeTexture(GL.TEXTURE0);
      GL.bindTexture(GL.TEXTURE_2D, this.texture);
      GL.uniform1i(uniforms._sampler, 0);
    }

    // 4. Setup Attribute Pointers berdasarkan Layout
    switch (this.layout) {
      case "POS_UV":
        var stride = 4 * (3 + 2); // Stride 20 bytes
        GL.vertexAttribPointer(this.attribs._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this.attribs._uv, 2, GL.FLOAT, false, stride, 4 * 3);
        GL.enableVertexAttribArray(this.attribs._position);
        GL.enableVertexAttribArray(this.attribs._uv);
        GL.disableVertexAttribArray(this.attribs._color); // PENTING
        GL.uniform1i(uniforms._useTexture, true);
        GL.uniform1i(uniforms._isWeb, false);
        break;

      case "POS_COL_UV":
      case "POS_COL_UV_LINES":
        var stride = 4 * (3 + 3 + 2); // Stride 32 bytes
        GL.vertexAttribPointer(this.attribs._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this.attribs._color, 3, GL.FLOAT, false, stride, 4 * 3);
        GL.vertexAttribPointer(this.attribs._uv, 2, GL.FLOAT, false, stride, 4 * (3 + 3));
        GL.enableVertexAttribArray(this.attribs._position);
        GL.enableVertexAttribArray(this.attribs._color); // PENTING
        GL.enableVertexAttribArray(this.attribs._uv);
        GL.uniform1i(uniforms._useTexture, false);
        GL.uniform1i(uniforms._isWeb, this.layout === "POS_COL_UV_LINES");
        break;
    }

    // 5. Panggil Draw Call
    if (this.facesBuffer) {
      GL.drawElements(
        this.drawMode, // GL.TRIANGLES atau GL.LINES
        this.faceCount,
        GL.UNSIGNED_SHORT, // Sesuai dengan Uint16Array
        0
      );
    }
  }
}
