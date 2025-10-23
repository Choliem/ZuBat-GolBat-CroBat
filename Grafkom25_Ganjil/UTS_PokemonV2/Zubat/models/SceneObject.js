/*
 * ===================================================================
 * SceneObject.js - Pekerja Rendering WebGL
 * ===================================================================
 *
 * KRITERIA 5: PEMISAHAN TANGGUNG JAWAB
 *
 * FILOSOFI:
 * - SceneObject = Hanya mengurus Data Geometri + WebGL Buffers.
 * - TIDAK tahu apa-apa tentang hierarki atau animasi.
 * - Tugasnya: Mengambil data, membuat buffer, dan menggambar.
 */
export class SceneObject {
  /**
   * Constructor - Menerima geometry data yang sudah jadi.
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Array} verticesData - Array [x,y,z, r,g,b, nx,ny,nz, ...]
   * @param {Array} facesData - Array [i1,i2,i3, ...]
   * @param {Object} attribs - Lokasi attribute shader
   */
  constructor(GL, verticesData, facesData, attribs) {
    this.GL = GL;
    this.attribs = attribs;
    this.vertices = verticesData;
    this.faces = facesData;

    this.vertexBuffer = null;
    this.facesBuffer = null;
    this.faceCount = 0;
    this.vertexCount = 0;

    this.setup(); // Langsung buat WebGL buffers
  }

  /**
   * Setup WebGL buffers dari data vertices & faces.
   */
  setup() {
    const GL = this.GL;

    // --- Vertex Buffer Object (VBO) ---
    this.vertexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bufferData(
      GL.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      GL.STATIC_DRAW
    );

    // --- Element Buffer Object (EBO) / Index Buffer ---
    if (this.faces && this.faces.length > 0) {
      this.facesBuffer = GL.createBuffer();
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint32Array(this.faces), // WAJIB Uint32Array untuk model > 65k vertices
        GL.STATIC_DRAW
      );
      this.faceCount = this.faces.length;
    } else {
      // Fallback jika tidak ada faces (misal: Axes)
      this.vertexCount = this.vertices.length / 9; // 9 floats (pos,col,norm)
    }
  }

  /**
   * KRITERIA 5: Proses DRAWING (Dipanggil oleh Node)
   * ALGORITMA:
   * 1. Set matriks model (Mmatrix)
   * 2. Bind VBO
   * 3. Set up Attribute Pointers (Stride & Offset)
   * 4. Bind EBO (jika ada)
   * 5. Panggil drawElements (jika ada EBO) atau drawArrays
   *
   * @param {Array} combinedMatrix - Matriks transformasi final
   * @param {WebGLUniformLocation} _Mmatrix - Lokasi uniform Mmatrix
   */
  draw(combinedMatrix, _Mmatrix) {
    const GL = this.GL;

    // 1. Set matriks
    GL.uniformMatrix4fv(_Mmatrix, false, combinedMatrix);

    // 2. Bind VBO
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);

    // 3. Setup Attribute Pointers
    // KRITERIA 3: Penjelasan Stride & Offset
    // Stride = Total byte per vertex.
    // (3 Pos + 3 Col + 3 Norm) * 4 bytes/float = 36 bytes
    const stride = 9 * 4;

    // Position: 3 floats, offset 0 bytes
    GL.vertexAttribPointer(
      this.attribs._position,
      3,
      GL.FLOAT,
      false,
      stride,
      0
    );

    // Color: 3 floats, offset 12 bytes (setelah 3 float Posisi)
    GL.vertexAttribPointer(
      this.attribs._color,
      3,
      GL.FLOAT,
      false,
      stride,
      3 * 4
    );

    // Normal: 3 floats, offset 24 bytes (setelah 3 Pos + 3 Col)
    GL.vertexAttribPointer(
      this.attribs._normal,
      3,
      GL.FLOAT,
      false,
      stride,
      6 * 4
    );

    // Aktifkan attributes
    GL.enableVertexAttribArray(this.attribs._position);
    GL.enableVertexAttribArray(this.attribs._color);
    GL.enableVertexAttribArray(this.attribs._normal);

    // 4. & 5. Panggil Draw Call
    if (this.facesBuffer) {
      // Menggambar menggunakan index (EBO)
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      GL.drawElements(
        GL.TRIANGLES,
        this.faceCount,
        GL.UNSIGNED_INT, // Sesuai dengan Uint32Array
        0
      );
    } else {
      // Menggambar langsung (VBO)
      GL.drawArrays(GL.TRIANGLES, 0, this.vertexCount);
    }
  }

  /**
   * Render sebagai garis (khusus untuk Axes).
   */
  drawLines(parentMatrix, _Mmatrix) {
    const GL = this.GL;
    GL.uniformMatrix4fv(_Mmatrix, false, parentMatrix);
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);

    // Stride untuk Axes: (3 Pos + 3 Col) * 4 bytes = 24 bytes
    const stride = 6 * 4;

    GL.vertexAttribPointer(
      this.attribs._position,
      3,
      GL.FLOAT,
      false,
      stride,
      0
    );
    GL.vertexAttribPointer(
      this.attribs._color,
      3,
      GL.FLOAT,
      false,
      stride,
      3 * 4
    );

    GL.disableVertexAttribArray(this.attribs._normal); // Axes tidak punya normal

    const lineVertexCount = this.vertices.length / 6;
    GL.drawArrays(GL.LINES, 0, lineVertexCount);

    GL.enableVertexAttribArray(this.attribs._normal);
  }
}