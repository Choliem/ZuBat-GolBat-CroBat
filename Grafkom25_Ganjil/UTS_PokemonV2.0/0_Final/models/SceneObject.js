export class SceneObject {
  constructor(
    GL,
    verticesData,
    facesData,
    attribs,
    layout, // <-- Kunci Fleksibilitas
    texture = null,
    drawMode = GL.TRIANGLES
  ) {
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
    this.indexType = GL.UNSIGNED_SHORT; // Default

    this.setup();
  }

  setup() {
    const GL = this.GL;
    this.vertexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);

    if (this.faces && this.faces.length > 0) {
      this.facesBuffer = GL.createBuffer();
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);

      // Cek apakah perlu 32-bit index
      let needs32bit = false;
      if (this.layout === "POS_COL_NORM" || this.layout === "POS_COL_NORM_UNLIT") {
        if (this.vertices.length / 9 > 65535) needs32bit = true;
      } else if (this.layout === "POS_COL_UV" || this.layout === "POS_COL_UV_LINES") {
        if (this.vertices.length / 8 > 65535) needs32bit = true;
      } else if (this.layout === "POS_UV") {
        if (this.vertices.length / 5 > 65535) needs32bit = true;
      }

      if (needs32bit) {
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faces), GL.STATIC_DRAW);
        this.indexType = GL.UNSIGNED_INT;
      } else {
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), GL.STATIC_DRAW);
        this.indexType = GL.UNSIGNED_SHORT;
      }
      this.faceCount = this.faces.length;
    }
  }

  draw(combinedMatrix, uniforms) {
    const GL = this.GL;

    // 1. Set matriks
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
      // --- UNTUK CROBAT ---
      case "POS_COL_NORM":
        var stride = 4 * (3 + 3 + 3); // Stride 36 bytes (Pos, Col, Norm)
        GL.vertexAttribPointer(this.attribs._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this.attribs._color, 3, GL.FLOAT, false, stride, 4 * 3);
        GL.vertexAttribPointer(this.attribs._normal, 3, GL.FLOAT, false, stride, 4 * (3 + 3));

        GL.enableVertexAttribArray(this.attribs._position);
        GL.enableVertexAttribArray(this.attribs._color);
        GL.enableVertexAttribArray(this.attribs._normal);
        GL.disableVertexAttribArray(this.attribs._uv);

        GL.uniform1i(uniforms._useTexture, false);
        GL.uniform1i(uniforms._isWeb, false);
        GL.uniform1i(uniforms._useLighting, true); // <-- NYALAKAN LIGHTING 3D
        GL.uniform1i(uniforms._isUnlit, false); // <-- MATIKAN UNLIT
        break;

      // --- UNTUK GOLBAT (FLAT) ---
      case "POS_COL_NORM_UNLIT":
        var stride = 4 * (3 + 3 + 3); // Stride 36 bytes (Pos, Col, Norm)
        GL.vertexAttribPointer(this.attribs._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this.attribs._color, 3, GL.FLOAT, false, stride, 4 * 3);
        GL.vertexAttribPointer(this.attribs._normal, 3, GL.FLOAT, false, stride, 4 * (3 + 3));

        GL.enableVertexAttribArray(this.attribs._position);
        GL.enableVertexAttribArray(this.attribs._color);
        GL.enableVertexAttribArray(this.attribs._normal);
        GL.disableVertexAttribArray(this.attribs._uv);

        GL.uniform1i(uniforms._useTexture, false);
        GL.uniform1i(uniforms._isWeb, false);
        GL.uniform1i(uniforms._useLighting, false); // <-- MATIKAN LIGHTING 3D
        GL.uniform1i(uniforms._isUnlit, true); // <-- NYALAKAN UNLIT
        break;

      // --- UNTUK ISLAND, SKYBOX, WATER ---
      case "POS_UV":
        var stride = 4 * (3 + 2); // Stride 20 bytes (Pos, UV)
        GL.vertexAttribPointer(this.attribs._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this.attribs._uv, 2, GL.FLOAT, false, stride, 4 * 3);

        GL.enableVertexAttribArray(this.attribs._position);
        GL.enableVertexAttribArray(this.attribs._uv);
        GL.disableVertexAttribArray(this.attribs._color);
        GL.disableVertexAttribArray(this.attribs._normal);

        GL.uniform1i(uniforms._useTexture, true);
        GL.uniform1i(uniforms._isWeb, false);
        GL.uniform1i(uniforms._useLighting, false);
        GL.uniform1i(uniforms._isUnlit, false);
        break;

      // --- UNTUK TREES, SPIDERS, POKEMONBASE ---
      case "POS_COL_UV":
      case "POS_COL_UV_LINES":
        var stride = 4 * (3 + 3 + 2); // Stride 32 bytes (Pos, Col, UV)
        GL.vertexAttribPointer(this.attribs._position, 3, GL.FLOAT, false, stride, 0);
        GL.vertexAttribPointer(this.attribs._color, 3, GL.FLOAT, false, stride, 4 * 3);
        GL.vertexAttribPointer(this.attribs._uv, 2, GL.FLOAT, false, stride, 4 * (3 + 3));

        GL.enableVertexAttribArray(this.attribs._position);
        GL.enableVertexAttribArray(this.attribs._color);
        GL.enableVertexAttribArray(this.attribs._uv);
        GL.disableVertexAttribArray(this.attribs._normal);

        GL.uniform1i(uniforms._useTexture, false);
        GL.uniform1i(uniforms._isWeb, this.layout === "POS_COL_UV_LINES");
        GL.uniform1i(uniforms._useLighting, false);
        GL.uniform1i(uniforms._isUnlit, false);
        break;
    }

    // 5. Panggil Draw Call
    if (this.facesBuffer) {
      GL.drawElements(
        this.drawMode,
        this.faceCount,
        this.indexType, // GL.UNSIGNED_SHORT or GL.UNSIGNED_INT
        0
      );
    }
  }
}
