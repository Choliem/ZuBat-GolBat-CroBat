/*
 * ===================================================================
 * libs.js - Pustaka Helper untuk Matematika Matriks 3D
 * ===================================================================
 *
 * Menyediakan fungsi-fungsi dasar untuk manipulasi matriks 4x4
 * yang diperlukan oleh WebGL.
 */
var LIBS = {
  /**
   * Konversi Derajat ke Radian
   */
  degToRad: function (angle) {
    return (angle * Math.PI) / 180;
  },

  /**
   * Membuat Matriks Proyeksi Perspektif
   * @param {float} angle - Field of View (FOV) dalam derajat
   * @param {float} a - Aspect Ratio (width / height)
   * @param {float} zMin - Jarak Near Plane
   * @param {float} zMax - Jarak Far Plane
   */
  get_projection: function (angle, a, zMin, zMax) {
    var tan = Math.tan(LIBS.degToRad(0.5 * angle)),
      A = -(zMax + zMin) / (zMax - zMin),
      B = (-2 * zMax * zMin) / (zMax - zMin);

    return [
      0.5 / tan,
      0,
      0,
      0,
      0,
      (0.5 * a) / tan,
      0,
      0,
      0,
      0,
      A,
      -1,
      0,
      0,
      B,
      0,
    ];
  },

  /**
   * Membuat Matriks Identitas 4x4 baru
   */
  get_I4: function () {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  /**
   * Mengatur ulang matriks yang ada menjadi Matriks Identitas
   */
  set_I4: function (m) {
    (m[0] = 1),
      (m[1] = 0),
      (m[2] = 0),
      (m[3] = 0),
      (m[4] = 0),
      (m[5] = 1),
      (m[6] = 0),
      (m[7] = 0),
      (m[8] = 0),
      (m[9] = 0),
      (m[10] = 1),
      (m[11] = 0),
      (m[12] = 0),
      (m[13] = 0),
      (m[14] = 0),
      (m[15] = 1);
  },

  /**
   * Rotasi matriks 'm' mengelilingi sumbu X
   */
  rotateX: function (m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1],
      mv5 = m[5],
      mv9 = m[9];
    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;
    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
  },

  /**
   * Rotasi matriks 'm' mengelilingi sumbu Y
   */
  rotateY: function (m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
      mv4 = m[4],
      mv8 = m[8];
    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];
    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
  },

  /**
   * Rotasi matriks 'm' mengelilingi sumbu Z
   */
  rotateZ: function (m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
      mv4 = m[4],
      mv8 = m[8];
    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];
    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
  },

  /**
   * Translasi matriks 'm' sepanjang sumbu Z
   */
  translateZ: function (m, t) {
    m[14] += t;
  },
  /**
   * Translasi matriks 'm' sepanjang sumbu X
   */
  translateX: function (m, t) {
    m[12] += t;
  },
  /**
   * Translasi matriks 'm' sepanjang sumbu Y
   */
  translateY: function (m, t) {
    m[13] += t;
  },

  /**
   * Skala matriks 'm'
   */
  scale: function (m, x, y, z) {
    m[0] *= x;
    m[5] *= y;
    m[10] *= z;
  },

  /**
   * Mengalikan dua matriks 4x4 (m1 * m2)
   */
  multiply: function (m1, m2) {
    var rm = this.get_I4();
    var N = 4;
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < N; j++) {
        rm[i * N + j] = 0;
        for (var k = 0; k < N; k++) {
          rm[i * N + j] += m1[i * N + k] * m2[k * N + j];
        }
      }
    }
    return rm;
  },
};