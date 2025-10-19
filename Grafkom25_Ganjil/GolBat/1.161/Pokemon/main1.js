function main() {
  var CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight; /*========================= FUNGSI PEMBUAT GEOMETRI ========================= */

  function generatePyramid(color) {
    var vertices = [];
    var faces = [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2];
    var points = [
      [0.0, 1.0, 0.0], // Puncak (apex)
      [-0.5, 0.0, 0.5], // Dasar kiri depan
      [0.5, 0.0, 0.5], // Dasar kanan depan
      [0.0, 0.0, -0.5], // Dasar belakang
    ];
    var normals = [
      [0.0, 0.447, 0.894],
      [-0.894, 0.447, 0.0],
      [0.894, 0.447, 0.0],
      [0.0, -1.0, 0.0],
    ];
    var face_normals = [normals[0], normals[1], normals[2], normals[3]];
    for (var i = 0; i < faces.length; i++) {
      var point_index = faces[i];
      var point = points[point_index];
      var normal_index = Math.floor(i / 3);
      var normal = face_normals[normal_index];
      vertices.push(point[0], point[1], point[2]);
      vertices.push(color[0], color[1], color[2]);
      vertices.push(normal[0], normal[1], normal[2]);
    }
    return { vertices: vertices, faces: [] };
  }

  function generateEllipsoid(a, b, c, stack, step, color, mouthParams) {
    var vertices = [];
    var faces = [];
    var body_r = color[0],
      body_g = color[1],
      body_b = color[2];
    var mouth_r = 0.0,
      mouth_g = 0.0,
      mouth_b = 0.0; // Warna hitam

    for (var i = 0; i <= stack; i++) {
      var u = (i / stack) * Math.PI - Math.PI / 2;
      for (var j = 0; j <= step; j++) {
        var v = (j / step) * 2 * Math.PI - Math.PI;
        var x = a * Math.cos(v) * Math.cos(u);
        var y = b * Math.sin(u); // <- Sekarang 'b' ini merujuk ke parameter radius dengan benar
        var z = c * Math.sin(v) * Math.cos(u);
        var original_x = x,
          original_y = y,
          original_z = z;

        // Gunakan nama variabel yang berbeda untuk warna
        let r = body_r;
        let g = body_g;
        let b_comp = body_b; // Ganti nama dari 'b' menjadi 'b_comp'

        if (mouthParams && u > mouthParams.bottom && u < mouthParams.top && Math.abs(v - Math.PI / 2) < mouthParams.width) {
          z *= mouthParams.indent;
          r = mouth_r;
          g = mouth_g;
          b_comp = mouth_b; // Gunakan 'b_comp'
        }

        var normal_len = Math.sqrt(original_x * original_x + original_y * original_y + original_z * original_z);
        var nx = original_x / normal_len,
          ny = original_y / normal_len,
          nz = original_z / normal_len;
        // Push dengan variabel warna yang sudah diganti namanya
        vertices.push(x, y, z, r, g, b_comp, nx, ny, nz);
      }
    }
    for (var i = 0; i < stack; i++) {
      for (var j = 0; j < step; j++) {
        var first = i * (step + 1) + j;
        var second = first + 1;
        var third = first + (step + 1);
        var fourth = third + 1;
        faces.push(first, second, fourth, first, fourth, third);
      }
    }
    return { vertices, faces };
  }
  function generateEllipticParaboloid(a, b, stack, step, color) {
    var vertices = [];
    var faces = [];
    var r = color[0],
      g = color[1],
      b_color = color[2];

    for (var i = 0; i <= stack; i++) {
      var u = i / stack; // u dari 0 ke 1
      for (var j = 0; j <= step; j++) {
        var v = (j / step) * 2 * Math.PI; // v dari 0 ke 2*PI

        var x = a * u * Math.cos(v);
        var y = b * u * Math.sin(v);
        var z = u * u; // Bentuk paraboloid di sumbu Z

        // Normal untuk paraboloid (dihitung dari turunan parsial)
        var nx = 2 * u * Math.cos(v);
        var ny = 2 * u * Math.sin(v);
        var nz = -a * b * u;
        var len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        vertices.push(x, y, z, r, g, b_color, nx / len, ny / len, nz / len);
      }
    }

    for (var i = 0; i < stack; i++) {
      for (var j = 0; j < step; j++) {
        var first = i * (step + 1) + j;
        var second = first + 1;
        var third = first + (step + 1);
        var fourth = third + 1;
        faces.push(first, second, fourth, first, fourth, third);
      }
    }
    return { vertices, faces };
  }

  // FUNGSI BARU UNTUK PAHA
  function generateCylinder(radius, height, segments, color) {
    var vertices = [];
    var faces = [];
    var r = color[0],
      g = color[1],
      b = color[2];

    for (var i = 0; i <= segments; i++) {
      var angle = (i / segments) * 2 * Math.PI;
      var x = radius * Math.cos(angle);
      var z = radius * Math.sin(angle);

      // Titik atas
      vertices.push(x, height / 2, z, r, g, b, x / radius, 0, z / radius);
      // Titik bawah
      vertices.push(x, -height / 2, z, r, g, b, x / radius, 0, z / radius);
    }

    for (var i = 0; i < segments; i++) {
      var i0 = i * 2;
      var i1 = i0 + 1;
      var i2 = (i + 1) * 2;
      var i3 = i2 + 1;
      faces.push(i0, i2, i1, i1, i2, i3);
    }

    // Anda bisa menambahkan tutup atas dan bawah di sini jika diperlukan

    return { vertices, faces, height }; // Tambahkan ini
  }

  // FUNGSI BARU UNTUK KAKI (TABUNG MELENGKUNG)
  function generateTube(majorRadius, minorRadius, segments, arc, color) {
    var vertices = [];
    var faces = [];
    var r = color[0],
      g = color[1],
      b = color[2];

    for (var i = 0; i <= segments; i++) {
      var u = (i / segments) * arc; // Arc dari 0 hingga `arc`
      for (var j = 0; j <= segments; j++) {
        var v = (j / segments) * 2 * Math.PI;

        var x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
        var y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
        var z = minorRadius * Math.sin(v);

        var nx = Math.cos(v) * Math.cos(u);
        var ny = Math.cos(v) * Math.sin(u);
        var nz = Math.sin(v);

        vertices.push(x, y, z, r, g, b, nx, ny, nz);
      }
    }

    for (var i = 0; i < segments; i++) {
      for (var j = 0; j < segments; j++) {
        var first = i * (segments + 1) + j;
        var second = first + 1;
        var third = (i + 1) * (segments + 1) + j;
        var fourth = third + 1;
        faces.push(first, second, fourth, first, fourth, third);
      }
    }
    return { vertices, faces, majorRadius, arc };
  }

  /*========================= SHADERS (PHONG SHADING) ========================= */

  var vertex_shader_source = `
  attribute vec3 position; attribute vec3 color; attribute vec3 normal;
  uniform mat4 Pmatrix, Vmatrix, Mmatrix;
  varying vec3 vColor; varying vec3 vNormal; varying vec3 vView;
  void main(void) {
    gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
    vNormal = vec3(Mmatrix * vec4(normal, 0.));
    vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
    vColor = color;
  }`;
  var fragment_shader_source = `
precision mediump float;
varying vec3 vColor; varying vec3 vNormal; varying vec3 vView;
const vec3 source_ambient_color = vec3(0.2, 0.2, 0.2);
const vec3 source_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 source_specular_color = vec3(1.0, 1.0, 1.0);
const vec3 source_direction = vec3(0.5, 0.5, 1.0);
const vec3 mat_ambient_color = vec3(1.0, 1.0, 1.0);
const vec3 mat_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 mat_specular_color = vec3(0.7, 0.7, 0.7);
const float mat_shininess = 20.0;
void main(void) {
  vec3 I_ambient = source_ambient_color * mat_ambient_color;
  vec3 N = normalize(vNormal); vec3 L = normalize(source_direction);
  float lambert = max(0.0, dot(N, L));
  vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * lambert;
  vec3 V = normalize(vView); vec3 R = reflect(-L, N);
  float spec = 0.0;
  if (lambert > 0.0){ spec = pow(max(0.0, dot(R, V)), mat_shininess); }
  vec3 I_specular = source_specular_color * mat_specular_color * spec;
  vec3 final_color = vColor * (I_ambient + I_diffuse) + I_specular;
  gl_FragColor = vec4(final_color, 1.0);
}`; /*========================= WEBGL CONTEXT & SHADER PROGRAM ========================= */

  var GL;
  try {
    GL = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL context cannot be initialized");
    return false;
  }
  var compile_shader = function (source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert(`ERROR IN ${typeString} SHADER: ${GL.getShaderInfoLog(shader)}`);
      return false;
    }
    return shader;
  };
  var shader_vertex = compile_shader(vertex_shader_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment = compile_shader(fragment_shader_source, GL.FRAGMENT_SHADER, "FRAGMENT");
  var SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  GL.linkProgram(SHADER_PROGRAM);
  var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");
  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_normal);
  GL.useProgram(SHADER_PROGRAM);
  /*========================= GEOMETRY ========================= */

  var axes_vertex = [-3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0, 0, 0, -3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0, 0, 0, -3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0];
  var AXES_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, AXES_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(axes_vertex), GL.STATIC_DRAW);

  var bodyColor = [60 / 255, 60 / 255, 124 / 255];
  var mouthParams = { top: Math.PI / 8, bottom: -Math.PI / 5, width: Math.PI / 4, indent: 0.4 };
  var bodyEllipsoid = generateEllipsoid(1, 1.5, 0.8, 50, 50, bodyColor, mouthParams);
  var BODY_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, BODY_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(bodyEllipsoid.vertices), GL.STATIC_DRAW);
  var BODY_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BODY_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(bodyEllipsoid.faces), GL.STATIC_DRAW);

  var toothColor = [1.0, 1.0, 1.0];
  var toothPyramid = generatePyramid(toothColor);
  var TOOTH_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, TOOTH_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(toothPyramid.vertices), GL.STATIC_DRAW);

  var earColor = [60 / 255, 60 / 255, 124 / 255]; // Warna sama dengan badan
  var earShape = generateEllipticParaboloid(1.0, 0.5, 20, 20, earColor);
  var EAR_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, EAR_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(earShape.vertices), GL.STATIC_DRAW);
  var EAR_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, EAR_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(earShape.faces), GL.STATIC_DRAW);

  // --- GEOMETRI KAKI BARU ---
  var legCylinder = generateCylinder(0.1, 1, 20, bodyColor); // radius, height, segments
  var LEG_CYLINDER_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, LEG_CYLINDER_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(legCylinder.vertices), GL.STATIC_DRAW);
  var LEG_CYLINDER_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LEG_CYLINDER_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(legCylinder.faces), GL.STATIC_DRAW);

  var footTube = generateTube(0.3, 0.1, 20, Math.PI, bodyColor); // major, minor, segments, arc
  var FOOT_TUBE_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, FOOT_TUBE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(footTube.vertices), GL.STATIC_DRAW);
  var FOOT_TUBE_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, FOOT_TUBE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(footTube.faces), GL.STATIC_DRAW);

  var FOOT_TUBE_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, FOOT_TUBE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(footTube.faces), GL.STATIC_DRAW);

  // --- GEOMETRI KERANGKA SAYAP ---
  var wingFrameColor = [0.2, 0.2, 0.2]; // Warna gelap untuk kerangka
  var segmentRadius = 0.08; // Radius ketebalan tabung

  // Tabung Lengkung (Bagian dalam sayap)
  // majorRadius: seberapa besar busur lengkungnya
  // minorRadius: ketebalan tabung itu sendiri
  // segments: detail
  // arc: berapa derajat busur lingkaran (Math.PI/2 = 90 derajat)
  var curvedFrame = generateTube(0.5, segmentRadius, 20, Math.PI / 2, wingFrameColor); // Contoh: busur 90 derajat dengan radius besar 0.5
  var CURVED_FRAME_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, CURVED_FRAME_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curvedFrame.vertices), GL.STATIC_DRAW);
  var CURVED_FRAME_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVED_FRAME_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curvedFrame.faces), GL.STATIC_DRAW);

  // Tabung Lurus (Bagian luar sayap)
  // radius: ketebalan tabung
  // height: panjang tabung lurus
  var straightFrame = generateCylinder(segmentRadius, 1.5, 20, wingFrameColor); // Panjang 1.5
  var STRAIGHT_FRAME_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, STRAIGHT_FRAME_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(straightFrame.vertices), GL.STATIC_DRAW);
  var STRAIGHT_FRAME_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, STRAIGHT_FRAME_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(straightFrame.faces), GL.STATIC_DRAW);

  /*========================= MATRICES & INTERACTION ========================= */

  var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
  var MOVEMATRIX = LIBS.get_I4();
  var VIEWMATRIX = LIBS.get_I4();
  LIBS.translateZ(VIEWMATRIX, -12);
  var THETA = 0,
    PHI = 0;
  var drag = false;
  var x_prev, y_prev;
  var mouseDown = function (e) {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
    return false;
  };
  var mouseUp = function (e) {
    drag = false;
  };
  var mouseMove = function (e) {
    if (!drag) return false;
    var dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    var dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  };
  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseUp, false);
  CANVAS.addEventListener("mousemove", mouseMove, false); /*========================= DRAWING ========================= */

  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GL.clearDepth(1.0);

  var animate = function () {
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    LIBS.set_I4(MOVEMATRIX);
    LIBS.rotateY(MOVEMATRIX, THETA);
    LIBS.rotateX(MOVEMATRIX, PHI);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    // Gambar Badan
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, BODY_VERTEX);
    var stride = 9 * 4;
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_normal); // Matriks ini berfungsi sebagai "pangkal" atau "sendi paha" untuk seluruh kaki
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BODY_FACES);
    // GL.drawElements(GL.TRIANGLES, bodyEllipsoid.faces.length, GL.UNSIGNED_SHORT, 0);

    // // Gambar Gigi
    // GL.bindBuffer(GL.ARRAY_BUFFER, TOOTH_VERTEX);
    // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    // GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);

    // // Gigi Atas
    // var toothTopMatrix = LIBS.get_I4();
    // LIBS.translateY(toothTopMatrix, 0.65);
    // LIBS.translateZ(toothTopMatrix, 0.36);
    // LIBS.translateX(toothTopMatrix, 0.55);
    // LIBS.rotateZ(toothTopMatrix, Math.PI);
    // LIBS.rotateY(toothTopMatrix, 60);
    // LIBS.rotateX(toothTopMatrix, -0.5);
    // LIBS.scale(toothTopMatrix, 0.35, 0.35, 0.35); // Menggunakan scale yang diperbaiki
    // var finalToothTopMatrix = LIBS.multiply(toothTopMatrix, MOVEMATRIX); // URUTAN DIPERBAIKI
    // GL.uniformMatrix4fv(_Mmatrix, false, finalToothTopMatrix);
    // GL.drawArrays(GL.TRIANGLES, 0, toothPyramid.vertices.length / 9);

    // var toothTopMatrix = LIBS.get_I4();
    // LIBS.translateY(toothTopMatrix, 0.65);
    // LIBS.translateZ(toothTopMatrix, 0.4);
    // LIBS.translateX(toothTopMatrix, -0.5);
    // LIBS.rotateZ(toothTopMatrix, Math.PI);
    // LIBS.rotateY(toothTopMatrix, 60);
    // LIBS.rotateX(toothTopMatrix, -0.5);
    // LIBS.scale(toothTopMatrix, 0.35, 0.35, 0.35); // Menggunakan scale yang diperbaiki
    // var finalToothTopMatrix = LIBS.multiply(toothTopMatrix, MOVEMATRIX); // URUTAN DIPERBAIKI
    // GL.uniformMatrix4fv(_Mmatrix, false, finalToothTopMatrix);
    // GL.drawArrays(GL.TRIANGLES, 0, toothPyramid.vertices.length / 9);

    // // Gigi Bawah
    // var toothBottomMatrix = LIBS.get_I4();
    // LIBS.translateY(toothBottomMatrix, -0.85);
    // LIBS.translateZ(toothBottomMatrix, 0.35);
    // LIBS.translateX(toothBottomMatrix, -0.5);
    // LIBS.rotateY(toothBottomMatrix, 60);
    // LIBS.rotateX(toothBottomMatrix, 0.5);
    // LIBS.scale(toothBottomMatrix, 0.35, 0.35, 0.35); // Menggunakan scale yang diperbaiki
    // var finalToothBottomMatrix = LIBS.multiply(toothBottomMatrix, MOVEMATRIX); // URUTAN DIPERBAIKI
    // GL.uniformMatrix4fv(_Mmatrix, false, finalToothBottomMatrix);
    // GL.drawArrays(GL.TRIANGLES, 0, toothPyramid.vertices.length / 9);

    // var toothBottomMatrix = LIBS.get_I4();
    // LIBS.translateY(toothBottomMatrix, -0.85);
    // LIBS.translateZ(toothBottomMatrix, 0.35);
    // LIBS.translateX(toothBottomMatrix, 0.5);
    // LIBS.rotateY(toothBottomMatrix, 60);
    // LIBS.rotateX(toothBottomMatrix, 0.5);
    // LIBS.scale(toothBottomMatrix, 0.35, 0.35, 0.35); // Menggunakan scale yang diperbaiki
    // var finalToothBottomMatrix = LIBS.multiply(toothBottomMatrix, MOVEMATRIX); // URUTAN DIPERBAIKI
    // GL.uniformMatrix4fv(_Mmatrix, false, finalToothBottomMatrix);
    // GL.drawArrays(GL.TRIANGLES, 0, toothPyramid.vertices.length / 9);

    // GL.bindBuffer(GL.ARRAY_BUFFER, EAR_VERTEX);
    // var stride = 9 * 4;
    // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    // GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    // GL.enableVertexAttribArray(_normal);
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, EAR_FACES);

    // // Telinga Kiri
    // var earLeftMatrix = LIBS.get_I4();
    // LIBS.translateX(earLeftMatrix, -0.45); // Geser ke kiri
    // LIBS.translateY(earLeftMatrix, 1.5); // Geser ke atas
    // LIBS.rotateX(earLeftMatrix, Math.PI / 2);
    // LIBS.rotateZ(earLeftMatrix, Math.PI / 10);
    // // Putar agar menghadap samping
    // // Miringkan ke belakang
    // LIBS.scale(earLeftMatrix, 0.2, 0.2, 0.4); // Atur skala (lebih panjang di Z)
    // var finalEarLeftMatrix = LIBS.multiply(earLeftMatrix, MOVEMATRIX);
    // GL.uniformMatrix4fv(_Mmatrix, false, finalEarLeftMatrix);
    // GL.drawElements(GL.TRIANGLES, earShape.faces.length, GL.UNSIGNED_SHORT, 0);

    // // Telinga Kanan
    // var earRightMatrix = LIBS.get_I4();
    // LIBS.translateX(earRightMatrix, 0.45); // Geser ke kanan
    // LIBS.translateY(earRightMatrix, 1.5);
    // LIBS.rotateX(earRightMatrix, Math.PI / 2);
    // LIBS.rotateZ(earRightMatrix, -Math.PI / 10);
    // LIBS.scale(earRightMatrix, 0.2, 0.2, 0.4); // Atur skala
    // var finalEarRightMatrix = LIBS.multiply(earRightMatrix, MOVEMATRIX);
    // GL.uniformMatrix4fv(_Mmatrix, false, finalEarRightMatrix);
    // GL.drawElements(GL.TRIANGLES, earShape.faces.length, GL.UNSIGNED_SHORT, 0);

    // // --- MENGGAMBAR KAKI (LOGIKA HIERARKIS) ---
    // // Anda telah mengubah leg_height ke 3, pastikan nilai ini sesuai dengan geometri Anda
    // var leg_height = 3.0; // =================== KAKI KIRI ===================

    // var legBaseMatrix_L = LIBS.get_I4();
    // LIBS.translateX(legBaseMatrix_L, -0.15);
    // LIBS.translateY(legBaseMatrix_L, 0.25);
    // LIBS.rotateZ(legBaseMatrix_L, -0.2);
    // LIBS.rotateY(legBaseMatrix_L, Math.PI / 4);
    // // Gambar Paha Kiri

    // var upperLegMatrix_L = LIBS.get_I4();
    // LIBS.translateY(upperLegMatrix_L, -leg_height / 2);
    // var finalUpperLeft = LIBS.multiply(upperLegMatrix_L, legBaseMatrix_L);
    // finalUpperLeft = LIBS.multiply(finalUpperLeft, MOVEMATRIX);

    // GL.bindBuffer(GL.ARRAY_BUFFER, LEG_CYLINDER_VERTEX);
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LEG_CYLINDER_FACES);
    // // SET POINTER UNTUK PAHA
    // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    // GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    // GL.uniformMatrix4fv(_Mmatrix, false, finalUpperLeft);
    // GL.drawElements(GL.TRIANGLES, legCylinder.faces.length, GL.UNSIGNED_SHORT, 0); // Gambar Telapak Kaki Kiri

    // var lowerLegMatrix_L = LIBS.get_I4();
    // LIBS.translateY(lowerLegMatrix_L, -leg_height);
    // LIBS.translateY(lowerLegMatrix_L, 0.65);
    // var finalLowerLeft = LIBS.multiply(lowerLegMatrix_L, legBaseMatrix_L);
    // finalLowerLeft = LIBS.multiply(finalLowerLeft, MOVEMATRIX);
    // GL.bindBuffer(GL.ARRAY_BUFFER, FOOT_TUBE_VERTEX);
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, FOOT_TUBE_FACES);
    // // SET POINTER UNTUK TELAPAK KAKI
    // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    // GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    // GL.uniformMatrix4fv(_Mmatrix, false, finalLowerLeft);
    // GL.drawElements(GL.TRIANGLES, footTube.faces.length, GL.UNSIGNED_SHORT, 0); // =================== KAKI KANAN ===================

    // var legBaseMatrix_R = LIBS.get_I4();
    // LIBS.translateX(legBaseMatrix_R, 0.15);
    // LIBS.translateY(legBaseMatrix_R, 0.25);
    // LIBS.rotateZ(legBaseMatrix_R, 0.2);
    // LIBS.rotateY(legBaseMatrix_R, -Math.PI / 4);
    // // Gambar Paha Kanan

    // var upperLegMatrix_R = LIBS.get_I4();
    // LIBS.translateY(upperLegMatrix_R, -leg_height / 2);
    // var finalUpperRight = LIBS.multiply(upperLegMatrix_R, legBaseMatrix_R);
    // finalUpperRight = LIBS.multiply(finalUpperRight, MOVEMATRIX);
    // GL.bindBuffer(GL.ARRAY_BUFFER, LEG_CYLINDER_VERTEX);
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LEG_CYLINDER_FACES);
    // // SET POINTER UNTUK PAHA
    // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    // GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    // GL.uniformMatrix4fv(_Mmatrix, false, finalUpperRight);
    // GL.drawElements(GL.TRIANGLES, legCylinder.faces.length, GL.UNSIGNED_SHORT, 0); // Gambar Telapak Kaki Kanan

    // var lowerLegMatrix_R = LIBS.get_I4();
    // LIBS.translateY(lowerLegMatrix_R, -leg_height);
    // LIBS.translateY(lowerLegMatrix_R, 0.65);
    // var finalLowerRight = LIBS.multiply(lowerLegMatrix_R, legBaseMatrix_R);
    // finalLowerRight = LIBS.multiply(finalLowerRight, MOVEMATRIX);
    // GL.bindBuffer(GL.ARRAY_BUFFER, FOOT_TUBE_VERTEX);
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, FOOT_TUBE_FACES);
    // // SET POINTER UNTUK TELAPAK KAKI
    // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    // GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    // GL.uniformMatrix4fv(_Mmatrix, false, finalLowerRight);
    // GL.drawElements(GL.TRIANGLES, footTube.faces.length, GL.UNSIGNED_SHORT, 0);

    // --- MENGGAMBAR KERANGKA SAYAP KIRI ---
    var stride = 9 * 4; // Pastikan stride masih 9*4 untuk objek ini // Matriks Induk untuk SELURUH Kerangka Sayap Kiri

    var wingFrameBaseMatrix_L = LIBS.get_I4();
    LIBS.translateY(wingFrameBaseMatrix_L, 0.8); // Posisi vertikal di punggung
    LIBS.translateZ(wingFrameBaseMatrix_L, -0.4); // Sedikit ke belakang
    LIBS.translateX(wingFrameBaseMatrix_L, -0.7); // Posisi horizontal (kiri)
    LIBS.rotateZ(wingFrameBaseMatrix_L, Math.PI / 6); // Agak miring ke atas
    LIBS.rotateX(wingFrameBaseMatrix_L, -Math.PI / 4); // Agak miring ke belakang // Gambar Tabung Lengkung

    var curvedMatrix = LIBS.get_I4();
    // Tabung `generateTube` dibuat melengkung di bidang XY.
    // Kita perlu memutarnya agar sesuai dengan orientasi sayap yang diinginkan.
    LIBS.rotateX(curvedMatrix, -Math.PI / 2); // Memutar agar "busur"nya menghadap ke bawah
    LIBS.translateY(curvedMatrix, 0.5); // Geser ke atas agar pangkalnya di 0,0,0

    var finalCurvedFrame = LIBS.multiply(curvedMatrix, wingFrameBaseMatrix_L);
    finalCurvedFrame = LIBS.multiply(finalCurvedFrame, MOVEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, CURVED_FRAME_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVED_FRAME_FACES);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    GL.uniformMatrix4fv(_Mmatrix, false, finalCurvedFrame);
    GL.drawElements(GL.TRIANGLES, curvedFrame.faces.length, GL.UNSIGNED_SHORT, 0); // Gambar Tabung Lurus

    var straightMatrix = LIBS.get_I4();
    // Posisi ini relatif terhadap ujung tabung lengkung
    // `majorRadius` dari `curvedFrame` adalah 0.5.
    // Ujung busur 90 derajat (Math.PI/2) ada di (0, -majorRadius, 0) setelah rotasi curvedMatrix.
    // Atau jika tanpa rotasi, ujungnya di (majorRadius, 0, 0)
    var majorR = 0.5; // Sama dengan majorRadius di generateTube
    var arcAngle = Math.PI / 2; // Sama dengan arc di generateTube

    // Perhitungan posisi ujung tabung lengkung
    // Karena kita memutar -Math.PI/2 di X, maka sumbu Y dan Z tertukar.
    // Titik akhir tabung lengkung (sebelum rotasi -Math.PI/2) ada di (majorR * cos(arc), majorR * sin(arc), 0).
    // Setelah rotasi, titik itu akan berada di (majorR * cos(arc), 0, majorR * sin(arc)).
    // Ditambah translateY(0.5) di curvedMatrix, maka menjadi (majorR * cos(arc), 0.5, majorR * sin(arc)).
    // Mari kita sederhanakan: bayangkan titik 0,0,0 kerangka lurus ada di (majorR, 0, 0) dari kerangka lengkung (sebelum rotasi).
    // Setelah rotasi -Math.PI/2 di X, titik itu jadi (majorR, 0, 0).
    // Dan translate 0.5 di Y pada curvedMatrix akan menggeser objek ke (majorR, 0.5, 0).
    // Nah, kita mau ujung kerangka lurus menempel di ujung kerangka lengkung.
    // Ujung kerangka lengkung (dari generateTube) ada di (majorR * cos(arc), majorR * sin(arc), 0).
    // Dengan majorRadius 0.5 dan arc Math.PI/2, itu berarti (0, 0.5, 0).
    // Setelah curvedMatrix diterapkan, ia akan berada di (0, 0.5 + 0.5, 0) = (0, 1, 0)
    // Jadi, kita geser kerangka lurus agar pangkalnya ada di (0, 1, 0) relatif terhadap wingFrameBaseMatrix_L.

    LIBS.translateY(straightMatrix, majorR + curvedFrame.height / 2); // Geser ke ujung tabung lengkung
    LIBS.rotateX(straightMatrix, Math.PI / 2); // Tegakkan silinder (seperti kaki)
    LIBS.translateX(straightMatrix, majorR); // Geser horizontal ke ujung lengkungan

    var finalStraightFrame = LIBS.multiply(straightMatrix, wingFrameBaseMatrix_L);
    finalStraightFrame = LIBS.multiply(finalStraightFrame, MOVEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, STRAIGHT_FRAME_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, STRAIGHT_FRAME_FACES);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, stride, 6 * 4);
    GL.uniformMatrix4fv(_Mmatrix, false, finalStraightFrame);
    GL.drawElements(GL.TRIANGLES, straightFrame.faces.length, GL.UNSIGNED_SHORT, 0);

    // Gambar Sumbu
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
    GL.disableVertexAttribArray(_normal);
    GL.bindBuffer(GL.ARRAY_BUFFER, AXES_VERTEX);
    stride = 6 * 4;
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, stride, 3 * 4);
    GL.drawArrays(GL.LINES, 0, 6);

    //Sayap

    GL.flush();
    window.requestAnimationFrame(animate);
  };
  animate();
}
window.addEventListener("load", main);
