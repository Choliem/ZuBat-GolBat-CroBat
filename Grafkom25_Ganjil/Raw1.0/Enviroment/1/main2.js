function main() {
    /** @type {HTMLCanvasElement} */
    var CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;


    /*===================== GET WEBGL CONTEXT ===================== */
    /** @type {WebGLRenderingContext} */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }


    /*========================= SHADERS ========================= */
    var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec2 uv;
        varying vec2 vUV;

        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vUV = uv;
        }`;

    var shader_fragment_source = `
        precision mediump float;
        uniform sampler2D sampler;
        varying vec2 vUV;

        uniform vec3 u_ambientLight;
        uniform bool u_isSkybox;
        
        // --- TAMBAHAN: Uniform untuk arah cahaya bulan ---
        uniform vec3 u_moonLightDirection;
        // --- AKHIR TAMBAHAN ---

        void main(void) {
            vec4 color = texture2D(sampler, vUV);
            
            if (color.a < 0.1) {
                discard; 
            }

            if (u_isSkybox) {
                gl_FragColor = color; 
            } else {
                // --- MODIFIKASI: Pencahayaan untuk objek (tanah dan pohon) ---
                vec3 litColor = color.rgb * u_ambientLight; 

                // --- TAMBAHAN: Efek cahaya bulan direksional ---
                // Simulasikan arah normal (hanya untuk permukaan, tidak untuk billboard)
                // Ini sangat disederhanakan untuk billboard, tapi bisa memberikan sedikit efek
                // Untuk billboard, kita akan asumsikan normal menghadap ke kamera,
                // tapi kita juga bisa memakai (0,1,0) atau (0,-1,0) untuk base plane.
                // Namun, untuk efek rim lighting, ini lebih baik
                // Normal vektor dummy (menghadap ke atas)
                vec3 normal = vec3(0.0, 1.0, 0.0); 

                // Dot product antara normal dan arah cahaya bulan
                // Clamp agar tidak negatif (cahaya hanya dari satu sisi)
                float diff = max(dot(normal, -u_moonLightDirection), 0.0);

                // Tambahkan sedikit cahaya bulan ke warna
                // Intensitas cahaya bulan diatur di JavaScript
                litColor += color.rgb * diff * vec3(0.2, 0.2, 0.3); // Cahaya bulan biru redup

                gl_FragColor = vec4(litColor, color.a);
                // --- AKHIR MODIFIKASI & TAMBAHAN ---
            }
        }`;
    // --- AKHIR MODIFIKASI ---


    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");


    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);


    GL.linkProgram(SHADER_PROGRAM);


    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    GL.enableVertexAttribArray(_position);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
    GL.enableVertexAttribArray(_uv);

    var _sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
    var _ambientLight = GL.getUniformLocation(SHADER_PROGRAM, "u_ambientLight");
    
    // --- TAMBAHAN: Dapatkan lokasi uniform u_isSkybox ---
    var _isSkybox = GL.getUniformLocation(SHADER_PROGRAM, "u_isSkybox");
    var _moonLightDirection = GL.getUniformLocation(SHADER_PROGRAM, "u_moonLightDirection");
    // --- AKHIR TAMBAHAN ---

    GL.useProgram(SHADER_PROGRAM);
    GL.uniform1i(_sampler, 0); 


    /*======================== GEOMETRI (SKYBOX) ======================== */
    var cube_vertex = [
        -1,-1,-1,    1,1/3, 1,-1,-1,    3/4,1/3, 1, 1,-1,    3/4,2/3, -1, 1,-1,    1,2/3,
        -1,-1, 1,    1/4,1/3, 1,-1, 1,    2/4,1/3, 1, 1, 1,    2/4,2/3, -1, 1, 1,    1/4,2/3,
        -1,-1,-1,    0,1/3, -1, 1,-1,    0,2/3, -1, 1, 1,    1/4,2/3, -1,-1, 1,    1/4,1/3,
        1,-1,-1,    3/4,1/3, 1, 1,-1,    3/4,2/3, 1, 1, 1,    2/4,2/3, 1,-1, 1,    2/4,1/3,
        -1,-1,-1,    1/4,0, -1,-1, 1,    1/4,1/3, 1,-1, 1,    2/4,1/3, 1,-1,-1,    2/4,0,
        -1, 1,-1,    1/4,1, -1, 1, 1,    1/4,2/3, 1, 1, 1,    2/4,2/3, 1, 1,-1,    2/4,1
    ];

    let scale = 3000;
    for (let i = 0; i < cube_vertex.length; i+=5) {
        cube_vertex[i] *= scale;
        cube_vertex[i+1] *= scale;
        cube_vertex[i+2] *= scale;
    }

    var cube_faces = [
        0, 1, 2,   0, 2, 3, 4, 5, 6,   4, 6, 7, 8, 9,10,   8,10,11,
        12,13,14,  12,14,15, 16,17,18,  16,18,19, 20,21,22,  20,22,23
    ];

    var CUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);
    var CUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);


    /*======================== PULAU (ISLAND) ======================== */
    // Fungsi untuk membuat heightmap pulau
    function getIslandHeight(x, z, islandRadius) {
        let dist = Math.sqrt(x*x + z*z);
        let normalizedDist = dist / islandRadius;
        
        // Jika di luar radius pulau, return 0 (air/tanah datar)
        if (normalizedDist > 1.0) return -scale;
        
        // Bentuk pulau dengan profil smooth menggunakan cosine
        let heightFactor = Math.cos(normalizedDist * Math.PI * 0.5);
        heightFactor = Math.pow(heightFactor, 1.5); // Membuat lebih curam di tepi
        
        // Tambahkan variasi menggunakan noise sederhana
        let noise = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.3;
        noise += Math.sin(x * 0.03 + 100) * Math.cos(z * 0.03 + 100) * 0.15;
        
        let maxHeight = 200; // Tinggi maksimal pulau
        let height = -scale + (heightFactor * maxHeight) + (noise * maxHeight * 0.2);
        
        return height;
    }

    // Buat grid untuk pulau
    let gridSize = 80; // Resolusi grid
    let islandRadius = scale * 0.7; // Radius pulau
    let texture_repeat = 20;
    
    var island_vertices = [];
    var island_faces = [];
    
    // Generate vertices
    for (let row = 0; row <= gridSize; row++) {
        for (let col = 0; col <= gridSize; col++) {
            let x = -scale + (col / gridSize) * (2 * scale);
            let z = -scale + (row / gridSize) * (2 * scale);
            let y = getIslandHeight(x, z, islandRadius);
            
            let u = (col / gridSize) * texture_repeat;
            let v = (row / gridSize) * texture_repeat;
            
            island_vertices.push(x, y, z, u, v);
        }
    }
    
    // Generate faces (triangles)
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let topLeft = row * (gridSize + 1) + col;
            let topRight = topLeft + 1;
            let bottomLeft = (row + 1) * (gridSize + 1) + col;
            let bottomRight = bottomLeft + 1;
            
            // Triangle 1
            island_faces.push(topLeft, bottomLeft, topRight);
            // Triangle 2
            island_faces.push(topRight, bottomLeft, bottomRight);
        }
    }

    var GROUND_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, GROUND_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(island_vertices), GL.STATIC_DRAW);
    var GROUND_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GROUND_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(island_faces), GL.STATIC_DRAW);
    
    var ground_faces = island_faces; // Update reference untuk drawing


    /*======================== WATER PLANE ======================== */
    let waterLevel = -scale + 5; // Sedikit di atas dasar
    var water_vertex = [
       -scale*1.5,  waterLevel,  -scale*1.5,   0,              0,
       -scale*1.5,  waterLevel,   scale*1.5,   0,              3,
        scale*1.5,  waterLevel,   scale*1.5,   3,              3,
        scale*1.5,  waterLevel,  -scale*1.5,   3,              0
    ];
    var water_faces = [0, 1, 2,   0, 2, 3];

    var WATER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, WATER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(water_vertex), GL.STATIC_DRAW);
    var WATER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, WATER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(water_faces), GL.STATIC_DRAW);


    /*======================== TREES (BILLBOARDS) ======================== */
    // Fungsi untuk membuat pohon sebagai billboard (2 quad bersilangan)
    function createTreeGeometry(x, y, z, height, width) {
        let halfWidth = width / 2;
        let vertices = [];
        
        // Quad 1 (menghadap X axis) - FIX: UV dibalik untuk Y (1 di bawah, 0 di atas)
        vertices.push(
            x - halfWidth, y, z, 0, 0,          // Bottom left
            x - halfWidth, y + height, z, 0, 1, // Top left
            x + halfWidth, y + height, z, 1, 1, // Top right
            x + halfWidth, y, z, 1, 0           // Bottom right
        );
        
        // Quad 2 (menghadap Z axis, bersilangan 90 derajat)
        vertices.push(
            x, y, z - halfWidth, 0, 0,          // Bottom left
            x, y + height, z - halfWidth, 0, 1, // Top left
            x, y + height, z + halfWidth, 1, 1, // Top right (Y diperbaiki)
            x, y, z + halfWidth, 1, 0           // Bottom right (Perbaikan lengkap)
        );
        
        return vertices;
    }

    // Generate posisi pohon secara random di pulau
    var tree_vertices = [];
    var tree_faces = [];
    var tree_positions = []; // Simpan posisi untuk sorting
    var treeCount = 0;
    
    // Seeding untuk distribusi pohon
    for (let i = 0; i < 450; i++) { // 300 pohon
        // Random position dalam radius pulau
        let angle = Math.random() * Math.PI * 2;
        let radius = Math.sqrt(Math.random()) * islandRadius * 0.95;        
        let treeX = Math.cos(angle) * radius;
        let treeZ = Math.sin(angle) * radius;
        let treeY = getIslandHeight(treeX, treeZ, islandRadius);
        
        // Hanya tempatkan pohon jika di atas permukaan air
        if (treeY > waterLevel + 10) {
            let treeHeight = 120 + Math.random() * 60; // Variasi tinggi 80-140
            let treeWidth = 80 + Math.random() * 30; // Variasi lebar 40-70
            
            // Simpan data pohon untuk sorting nanti
            tree_positions.push({
                x: treeX,
                y: treeY,
                z: treeZ,
                height: treeHeight,
                width: treeWidth,
                index: treeCount
            });
            
            treeCount++;
        }
    }

    var TREE_VERTEX = GL.createBuffer();
    var TREE_FACES = GL.createBuffer();
    
// Fungsi untuk rebuild tree buffers
    function rebuildTreeBuffers(sortedTrees) {
        tree_vertices = [];
        tree_faces = [];
        
        for (let i = 0; i < sortedTrees.length; i++) {
            let tree = sortedTrees[i];
            
            // --- PERBAIKAN: Offset Y dinaikkan agar pohon "tenggelam" ---
            let y_offset = tree.height * 0.15; // Diubah dari 0.07 ke 0.15
            // --- AKHIR PERBAIKAN ---

            let treeVerts = createTreeGeometry(tree.x, tree.y - y_offset, tree.z, tree.height, tree.width);            
            let startIndex = i * 8;
            tree_vertices.push(...treeVerts);
            
            // Quad 1
            tree_faces.push(
                startIndex + 0, startIndex + 1, startIndex + 2,
                startIndex + 0, startIndex + 2, startIndex + 3
            );
            // Quad 2
            tree_faces.push(
                startIndex + 4, startIndex + 5, startIndex + 6,
                startIndex + 4, startIndex + 6, startIndex + 7
            );
        }
        
        // --- PERBAIKAN: Ubah ke STATIC_DRAW untuk performa ---
        GL.bindBuffer(GL.ARRAY_BUFFER, TREE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tree_vertices), GL.STATIC_DRAW);
        
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TREE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tree_faces), GL.STATIC_DRAW);
        // --- AKHIR PERBAIKAN ---
    }
    
    // Initial build (dari belakang ke depan)
    rebuildTreeBuffers(tree_positions);


    /*================= MATRIKS & KONTROL KAMERA =================*/
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 10, 12000);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    var camX = 0, camZ = 0;
    var camY = -2800; // Posisi awal di ketinggian pulau
    var keys = {}; 

    LIBS.translateZ(VIEWMATRIX, 0); // (Baris ini tidak lagi relevan, ditimpa di 'animate')

    var THETA = 0, PHI = 0;
    var drag = false;
    var x_prev, y_prev;
    var FRICTION = 0.05;
    var dX = 0, dY = 0;

    var mouseDown = function (e) { drag = true; x_prev = e.pageX, y_prev = e.pageY; e.preventDefault(); return false; };
    var mouseUp = function (e) { drag = false; };
    var mouseMove = function (e) {
        if (!drag) return false;
        dX = -(e.pageX - x_prev) * 2 * Math.PI / CANVAS.width * 0.3; // sensitivity = 0.3
        dY = -(e.pageY - y_prev) * 2 * Math.PI / CANVAS.height * 0.3;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    var keyDown = function (e) { keys[e.key] = true; };
    var keyUp = function (e) { keys[e.key] = false; };
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);


    /*========================= TEXTURES =========================*/
    
    // --- MODIFIKASI: Fungsi load_texture dengan parameter 'use_mipmaps' ---
    var load_texture = function (image_URL, wrapping, use_mipmaps) {
        var texture = GL.createTexture();
        var image = new Image();

        image.src = image_URL;
        image.onload = function () {
            GL.bindTexture(GL.TEXTURE_2D, texture); 
            GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
            
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

            // Cek apakah kita harus menggunakan mipmap untuk tekstur ini
            if (use_mipmaps) {
                // (Memerlukan gambar power-of-two: 512, 1024, 2048, dll.)
                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
                GL.generateMipmap(GL.TEXTURE_2D);
            } else {
                // Jika tidak, gunakan filter linear biasa
                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            }

            var wrap_mode = wrapping || GL.CLAMP_TO_EDGE;
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap_mode);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap_mode);
            
            GL.bindTexture(GL.TEXTURE_2D, null);
        };
        return texture;
    };
    // --- AKHIR MODIFIKASI ---

    // --- MODIFIKASI: Panggil load_texture dengan parameter mipmap ---
    // false untuk night.png (karena non-POT)
    var cube_texture = load_texture("night.png", GL.CLAMP_TO_EDGE, false); 
    // true untuk grass.jpg (asumsi ukurannya sudah power-of-two)
    var ground_texture = load_texture("grass1.png", GL.REPEAT, true);
    
    // Texture untuk trees - dengan alpha channel untuk transparency
    var tree_texture = load_texture("tree.png", GL.CLAMP_TO_EDGE, false);
    
    // Texture untuk water - kita gunakan warna biru semi-transparan
    // Buat simple texture biru untuk air
    var createWaterTexture = function() {
        var texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, texture);
        var pixel = new Uint8Array([20, 40, 80, 200]); // RGBA - biru gelap semi-transparan
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, pixel);
        return texture;
    };
    var water_texture = createWaterTexture();
    // --- AKHIR MODIFIKASI ---


    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    // GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clearDepth(1.0);

    var SKYBOX_VMATRIX = LIBS.get_I4();
    var time_prev = 0;
var animate = function (time) {
        
        GL.uniform3f(_ambientLight, 0.25, 0.25, 0.4); 
        GL.uniform3f(_moonLightDirection, 0.0, -1.2, -0.7); // Mengarah ke bawah-belakang

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        var dt = time - time_prev;
        if (dt === 0) dt = 16.67; 
        time_prev = time;

        
        // --- Logika Pergerakan Kamera (Tidak Berubah) ---
        var moveSpeed = 10.0;
        var currentSpeed = moveSpeed * (dt / 16.67); 
        var forward_X = Math.sin(THETA) * Math.cos(PHI);
        var forward_Y = -Math.sin(PHI);
        var forward_Z = Math.cos(THETA) * Math.cos(PHI);
        var right_X = Math.cos(THETA);
        var right_Z = -Math.sin(THETA);
        if (keys['w']) { camX += forward_X * currentSpeed; camY += forward_Y * currentSpeed; camZ += forward_Z * currentSpeed; }
        if (keys['s']) { camX -= forward_X * currentSpeed; camY -= forward_Y * currentSpeed; camZ -= forward_Z * currentSpeed; }
        if (keys['a']) { camX -= right_X * currentSpeed; camZ -= right_Z * currentSpeed; }
        if (keys['d']) { camX += right_X * currentSpeed; camZ += right_Z * currentSpeed; }
        if (keys[' ']) { camY += currentSpeed; }
        if (keys['Shift']) { camY -= currentSpeed; }
        if (!drag) { dX *= (1 - FRICTION); dY *= (1 - FRICTION); THETA += dX; PHI += dY; }
        // --- AKHIR LOGIKA GERAK ---


        // --- PENANGANAN MATRIKS (Tidak Berubah) ---
        LIBS.set_I4(VIEWMATRIX);
        LIBS.rotateX(VIEWMATRIX, -PHI); LIBS.rotateY(VIEWMATRIX, -THETA);
        LIBS.translateX(VIEWMATRIX, -camX); LIBS.translateY(VIEWMATRIX, -camY); LIBS.translateZ(VIEWMATRIX, -camZ);
        LIBS.set_I4(SKYBOX_VMATRIX);
        LIBS.rotateX(SKYBOX_VMATRIX, -PHI); LIBS.rotateY(SKYBOX_VMATRIX, -THETA);
        LIBS.set_I4(MOVEMATRIX);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
        // --- AKHIR PENANGANAN MATRIKS ---


        // --- PERBAIKAN: URUTAN RENDER BARU ---

        // --- 1. GAMBAR SKYBOX ---
        GL.disable(GL.BLEND); // <-- MATIKAN Blending
        GL.uniform1i(_isSkybox, true); 
        GL.uniformMatrix4fv(_Vmatrix, false, SKYBOX_VMATRIX); 
        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, 4 * (3 + 2), 4 * 3);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, cube_texture);
        GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);


        // --- 2. GAMBAR PULAU ---
        // Blending masih MATI
        GL.uniform1i(_isSkybox, false);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, GROUND_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, 4 * (3 + 2), 4 * 3);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GROUND_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, ground_texture);
        GL.drawElements(GL.TRIANGLES, ground_faces.length, GL.UNSIGNED_SHORT, 0);

        
        // --- 3. GAMBAR POHON ---
        // Blending masih MATI. Alpha test (discard) di shader akan bekerja
        GL.uniform1i(_isSkybox, false);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, TREE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, 4 * (3 + 2), 4 * 3);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TREE_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, tree_texture);
        GL.drawElements(GL.TRIANGLES, tree_faces.length, GL.UNSIGNED_SHORT, 0);


        // --- 4. GAMBAR AIR ---
        GL.enable(GL.BLEND); // <-- NYALAKAN Blending HANYA untuk air
        GL.uniform1i(_isSkybox, false);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, WATER_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, 4 * (3 + 2), 4 * 3);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, WATER_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, water_texture);
        GL.drawElements(GL.TRIANGLES, water_faces.length, GL.UNSIGNED_SHORT, 0);

        // --- AKHIR URUTAN RENDER BARU ---


        GL.flush();
        window.requestAnimationFrame(animate);
    };
    // --- AKHIR PERBAIKAN FUNGSI ANIMATE ---
    
    animate(0);
}
window.addEventListener('load', main);