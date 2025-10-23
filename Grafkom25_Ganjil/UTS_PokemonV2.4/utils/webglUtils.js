// utils/webglUtils.js

/**
 * Kompilasi shader WebGL
 * @param {WebGLRenderingContext} GL - Konteks WebGL
 * @param {string} source - Kode sumber shader
 * @param {number} type - Tipe shader (VERTEX_SHADER / FRAGMENT_SHADER)
 * @param {string} typeString - Nama tipe untuk logging error
 * @returns {WebGLShader | boolean} Shader yang dikompilasi atau false jika gagal
 */
export var compile_shader = function (GL, source, type, typeString) {
  var shader = GL.createShader(type);
  GL.shaderSource(shader, source);
  GL.compileShader(shader);
  if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
    alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
    console.error("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
    return false;
  }
  return shader;
};

/**
 * Memuat tekstur dari URL gambar
 * @param {WebGLRenderingContext} GL - Konteks WebGL
 * @param {string} image_URL - URL ke file gambar
 * @param {number} wrapping - Mode wrapping (mis. GL.REPEAT)
 * @param {boolean} use_mipmaps - Apakah akan generate mipmap
 * @returns {WebGLTexture} Objek tekstur
 */
export var load_texture = function (GL, image_URL, wrapping, use_mipmaps) {
  var texture = GL.createTexture();
  var image = new Image();
  image.src = image_URL;
  image.onload = function () {
    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    if (use_mipmaps) {
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
      GL.generateMipmap(GL.TEXTURE_2D);
    } else {
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    }
    var wrap_mode = wrapping || GL.CLAMP_TO_EDGE;
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap_mode);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap_mode);
    GL.bindTexture(GL.TEXTURE_2D, null);
  };
  return texture;
};

/**
 * Membuat tekstur 1x1 pixel untuk air
 * @param {WebGLRenderingContext} GL - Konteks WebGL
 * @returns {WebGLTexture} Objek tekstur
 */
export var createWaterTexture = function (GL) {
  var texture = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, texture);
  var pixel = new Uint8Array([20, 40, 80, 200]); // Warna air
  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, pixel);
  return texture;
};
