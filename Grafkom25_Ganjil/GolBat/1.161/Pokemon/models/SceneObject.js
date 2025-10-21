/*
 * SceneObject.js
 * Kelas dasar generik.
 * Diperbarui untuk menggunakan Uint32Array/UNSIGNED_INT untuk faces.
 */
export class SceneObject {
  constructor(GL, verticesData, facesData, attribs) {
    this.GL = GL;
    this.attribs = attribs;
    this.vertices = verticesData;
    this.faces = facesData;

    this.vertexBuffer = null;
    this.facesBuffer = null;
    this.modelMatrix = LIBS.get_I4();

    this.setup();
  }

  setup() {
    this.vertexBuffer = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);
    this.GL.bufferData(
      this.GL.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      this.GL.STATIC_DRAW
    );

    if (this.faces && this.faces.length > 0) {
      this.facesBuffer = this.GL.createBuffer();
      this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      this.GL.bufferData(
        this.GL.ELEMENT_ARRAY_BUFFER,
        new Uint32Array(this.faces), // <-- Menggunakan Uint32Array
        this.GL.STATIC_DRAW
      );
      this.faceCount = this.faces.length;
    } else {
      this.vertexCount = this.vertices.length / 9;
    }
  }

  draw(combinedMatrix, _Mmatrix) {
    this.GL.uniformMatrix4fv(_Mmatrix, false, combinedMatrix);
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);

    const stride = 9 * 4;
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
    this.GL.vertexAttribPointer(
      this.attribs._normal,
      3,
      this.GL.FLOAT,
      false,
      stride,
      6 * 4
    );

    this.GL.enableVertexAttribArray(this.attribs._position);
    this.GL.enableVertexAttribArray(this.attribs._color);
    this.GL.enableVertexAttribArray(this.attribs._normal);

    if (this.facesBuffer) {
      this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      this.GL.drawElements(
        this.GL.TRIANGLES,
        this.faceCount,
        this.GL.UNSIGNED_INT, // <-- Menggunakan UNSIGNED_INT
        0
      );
    } else {
      this.GL.drawArrays(this.GL.TRIANGLES, 0, this.vertexCount);
    }
  }

  drawLines(parentMatrix, _Mmatrix) {
    this.GL.uniformMatrix4fv(_Mmatrix, false, parentMatrix);
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);
    const stride = 6 * 4;
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