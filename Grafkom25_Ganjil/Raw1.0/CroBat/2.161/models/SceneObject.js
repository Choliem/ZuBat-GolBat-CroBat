// SceneObject.js

export class SceneObject {
  constructor(GL, _position, _color, _normal) {
    if (this.constructor === SceneObject) {
      throw new Error(
        "SceneObject is an abstract class and cannot be instantiated directly."
      );
    }
    this.GL = GL;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;

    this.vertices = [];
    this.faces = [];
    this.vertexBuffer = null;
    this.facesBuffer = null;

    // Matriks transformasi LOKAL untuk objek ini
    this.modelMatrix = LIBS.get_I4();

    // Daftar anak-anak (children) dari objek ini
    this.children = [];
  }

  /**
   * Menambahkan objek SceneObject lain sebagai anak dari objek ini.
   * @param {SceneObject} childObject Objek anak yang akan ditambahkan.
   */
  addChild(childObject) {
    this.children.push(childObject);
  }

  setup() {
    // Hanya setup buffer jika objek ini punya geometri
    if (this.vertices.length > 0 && this.faces.length > 0) {
      this.vertexBuffer = this.GL.createBuffer();
      this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);
      this.GL.bufferData(
        this.GL.ARRAY_BUFFER,
        new Float32Array(this.vertices),
        this.GL.STATIC_DRAW
      );

      this.facesBuffer = this.GL.createBuffer();
      this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      this.GL.bufferData(
        this.GL.ELEMENT_ARRAY_BUFFER,
        new Uint32Array(this.faces),
        this.GL.STATIC_DRAW
      );
    }
  }

  /**
   * Merender objek ini dan semua anak-anaknya.
   * @param {WebGLRenderingContext} GL Konteks WebGL.
   * @param {WebGLUniformLocation} _Mmatrix Lokasi uniform Mmatrix di shader.
   * @param {Float32Array} parentMatrix Matriks model dari parent.
   */
  render(GL, _Mmatrix, parentMatrix) {
    // Hitung matriks final untuk objek ini: MatriksParent * MatriksLokal
    const combinedMatrix = LIBS.multiply(parentMatrix, this.modelMatrix);

    // Terapkan matriks gabungan ke shader
    GL.uniformMatrix4fv(_Mmatrix, false, combinedMatrix);

    // Render objek INI (jika memiliki geometri)
    if (this.vertices.length > 0 && this.faces.length > 0) {
      GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);

      const stride = 4 * (3 + 3 + 3); // Pos(3) + Color(3) + Normal(3)
      GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, stride, 0);
      GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, stride, 4 * 3);
      GL.vertexAttribPointer(this._normal, 3, GL.FLOAT, false, stride, 4 * 6);

      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
      GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_INT, 0);
    }

    // Render semua ANAK-nya secara rekursif
    // Matriks gabungan (combinedMatrix) dari objek ini menjadi parentMatrix
    // untuk semua anak-anaknya.
    for (let child of this.children) {
      child.render(GL, _Mmatrix, combinedMatrix);
    }
  }
}
