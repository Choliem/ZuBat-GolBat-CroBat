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
    
    // Shader Vertex (sedikit modifikasi untuk jaring yang tidak butuh UV)
    var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec2 uv;
        attribute vec3 color; 
        
        varying vec2 vUV;
        varying vec3 vColor; 

        uniform bool u_isWeb; // <-- BARU: Untuk jaring, kita bisa mengabaikan UV

        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            if (u_isWeb) {
                vColor = color; // Jaring hanya menggunakan warna
            } else {
                vUV = uv;
                vColor = color; 
            }
        }`;

    // Shader Fragment (sedikit modifikasi untuk jaring)
    var shader_fragment_source = `
        precision mediump float;
        uniform sampler2D sampler;
        varying vec2 vUV;
        varying vec3 vColor; 

        uniform vec3 u_ambientLight;
        uniform bool u_isSkybox;
        uniform vec3 u_moonLightDirection;
        uniform bool u_useTexture; 
        uniform bool u_isWeb; // <-- BARU: Untuk jaring

        void main(void) {
            vec4 color;
            
            if (u_isWeb) { // Jika ini jaring, gunakan warna langsung (putih)
                color = vec4(vColor, 1.0); // Transparan sedikit
            }
            else if (u_useTexture) {
                color = texture2D(sampler, vUV);
            } else {
                color = vec4(vColor, 1.0); 
            }

            if (color.a < 0.1 && u_useTexture) { 
                discard; 
            }

            if (u_isSkybox) {
                gl_FragColor = color; 
            } else {
                vec3 litColor = color.rgb * u_ambientLight; 

                // Untuk objek non-jaring, tambahkan cahaya bulan
                if (!u_isWeb) {
                    vec3 normal = normalize(vec3(0.0, 0.5, 0.0)); 
                    float diff = max(dot(normal, -u_moonLightDirection), 0.0);
                    float moonIntensity = 0.15;
                    if (!u_useTexture) {
                        moonIntensity = 0.25; 
                    }
                    litColor += color.rgb * diff * vec3(0.2, 0.2, 0.3) * moonIntensity; 
                }

                gl_FragColor = vec4(litColor, color.a);
            }
        }`;


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
    var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color"); 

    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_uv);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    
    var _sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
    var _ambientLight = GL.getUniformLocation(SHADER_PROGRAM, "u_ambientLight");
    var _isSkybox = GL.getUniformLocation(SHADER_PROGRAM, "u_isSkybox");
    var _moonLightDirection = GL.getUniformLocation(SHADER_PROGRAM, "u_moonLightDirection");
    var _useTexture = GL.getUniformLocation(SHADER_PROGRAM, "u_useTexture"); 
    var _isWeb = GL.getUniformLocation(SHADER_PROGRAM, "u_isWeb"); // <-- BARU: Uniform untuk jaring

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
        12,13,14,   12,14,15, 16,17,18,   16,18,19, 20,21,22,   20,22,23
    ];
    var CUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);
    var CUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);


    /*======================== PULAU (ISLAND) ======================== */
    function getIslandHeight(x, z, islandRadius) {
        let dist = Math.sqrt(x*x + z*z);
        let normalizedDist = dist / islandRadius;
        if (normalizedDist > 1.0) return -scale;
        let heightFactor = Math.cos(normalizedDist * Math.PI * 0.5);
        heightFactor = Math.pow(heightFactor, 1.5);
        let noise = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.3;
        noise += Math.sin(x * 0.03 + 100) * Math.cos(z * 0.03 + 100) * 0.15;
        let maxHeight = 200;
        let height = -scale + (heightFactor * maxHeight) + (noise * maxHeight * 0.2);
        return height;
    }
    let gridSize = 80;
    let islandRadius = scale * 0.7;
    let texture_repeat = 20;
    var island_vertices = [];
    var island_faces = [];
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
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let topLeft = row * (gridSize + 1) + col;
            let topRight = topLeft + 1;
            let bottomLeft = (row + 1) * (gridSize + 1) + col;
            let bottomRight = bottomLeft + 1;
            island_faces.push(topLeft, bottomLeft, topRight);
            island_faces.push(topRight, bottomLeft, bottomRight);
        }
    }
    var GROUND_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, GROUND_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(island_vertices), GL.STATIC_DRAW);
    var GROUND_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GROUND_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(island_faces), GL.STATIC_DRAW);
    var ground_faces = island_faces;


    /*======================== WATER PLANE ======================== */
    let waterLevel = -scale + 5;
    var water_vertex = [
       -scale*1.5,  waterLevel,  -scale*1.5,   0, 0,
       -scale*1.5,  waterLevel,   scale*1.5,   0, 3,
        scale*1.5,  waterLevel,   scale*1.5,   3, 3,
        scale*1.5,  waterLevel,  -scale*1.5,   3, 0
    ];
    var water_faces = [0, 1, 2,   0, 2, 3];
    var WATER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, WATER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(water_vertex), GL.STATIC_DRAW);
    var WATER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, WATER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(water_faces), GL.STATIC_DRAW);


    // --- FUNGSI GEOMETRI 3D (CYLINDER, CONE, SPHERE) ---
    /**
     * Membuat data geometri untuk tabung.
     * Stride: [pos(3), color(3), uv(2)]
     */
    function createCylinderGeometry(radius, height, segments, color, yOffset = 0) {
        let vertices = [];
        let faces = [];
        let angleStep = (Math.PI * 2) / segments;
        let halfHeight = height / 2;

        let topCenterIndex = 0;
        let bottomCenterIndex = 1;
        vertices.push(0, halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Top center
        vertices.push(0, -halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Bottom center

        let currentVertex = 2;

        for (let i = 0; i <= segments; i++) {
            let angle = i * angleStep;
            let x = Math.cos(angle) * radius;
            let z = Math.sin(angle) * radius;

            vertices.push(x, halfHeight + yOffset, z, ...color, 0, 0); 
            vertices.push(x, -halfHeight + yOffset, z, ...color, 0, 0); 

            if (i > 0) {
                let topIdx = currentVertex;
                let bottomIdx = currentVertex + 1;
                let prevTopIdx = currentVertex - 2;
                let prevBottomIdx = currentVertex - 1;

                faces.push(prevTopIdx, prevBottomIdx, bottomIdx);
                faces.push(prevTopIdx, bottomIdx, topIdx);
                faces.push(topCenterIndex, prevTopIdx, topIdx);
                faces.push(bottomCenterIndex, bottomIdx, prevBottomIdx);
            }
            currentVertex += 2;
        }
        return { vertices, faces };
    }

    /**
     * Membuat data geometri untuk kerucut.
     * Stride: [pos(3), color(3), uv(2)]
     */
    function createConeGeometry(radius, height, segments, color, yOffset = 0) {
        let vertices = [];
        let faces = [];
        let angleStep = (Math.PI * 2) / segments;
        let halfHeight = height / 2;

        let apexIndex = 0;
        let bottomCenterIndex = 1;
        vertices.push(0, halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Apex
        vertices.push(0, -halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Bottom center

        let currentVertex = 2;

        for (let i = 0; i <= segments; i++) {
            let angle = i * angleStep;
            let x = Math.cos(angle) * radius;
            let z = Math.sin(angle) * radius;

            vertices.push(x, -halfHeight + yOffset, z, ...color, 0, 0); 

            if (i > 0) {
                let bottomIdx = currentVertex;
                let prevBottomIdx = currentVertex - 1;

                faces.push(apexIndex, prevBottomIdx, bottomIdx);
                faces.push(bottomCenterIndex, bottomIdx, prevBottomIdx);
            }
            currentVertex++;
        }
        return { vertices, faces };
    }

    /**
     * Membuat data geometri untuk bola.
     * Stride: [pos(3), color(3), uv(2)]
     */
    function createSphereGeometry(radius, latSegments, longSegments, color, yOffset = 0) {
        let vertices = [];
        let faces = [];

        vertices.push(0, radius + yOffset, 0, ...color, 0.5, 1.0); // Top pole
        vertices.push(0, -radius + yOffset, 0, ...color, 0.5, 0.0); // Bottom pole

        const PI = Math.PI;
        const TWO_PI = Math.PI * 2;

        for (let i = 1; i < latSegments; i++) {
            const theta = PI * (i / latSegments); 
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let j = 0; j <= longSegments; j++) {
                const phi = TWO_PI * (j / longSegments); 
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = radius * sinTheta * cosPhi;
                const y = radius * cosTheta;
                const z = radius * sinTheta * sinPhi;
                const u = j / longSegments;
                const v = 1 - (i / latSegments); 
                
                vertices.push(x, y + yOffset, z, ...color, u, v);
            }
        }

        let vertexIndexOffset = 2; 

        for (let j = 0; j < longSegments; j++) {
            faces.push(0, vertexIndexOffset + j + 1, vertexIndexOffset + j);
        }

        for (let i = 0; i < latSegments - 2; i++) {
            for (let j = 0; j < longSegments; j++) {
                const a = vertexIndexOffset + i * (longSegments + 1) + j;
                const b = vertexIndexOffset + i * (longSegments + 1) + j + 1;
                const c = vertexIndexOffset + (i + 1) * (longSegments + 1) + j + 1;
                const d = vertexIndexOffset + (i + 1) * (longSegments + 1) + j;

                faces.push(a, d, c);
                faces.push(a, c, b);
            }
        }

        const lastRingStart = vertexIndexOffset + (latSegments - 1 -1) * (longSegments + 1);
        const bottomPoleIndex = 1;

        for (let j = 0; j < longSegments; j++) {
            faces.push(bottomPoleIndex, lastRingStart + j, lastRingStart + j + 1);
        }

        return { vertices, faces };
    }
    // --- AKHIR FUNGSI GEOMETRI ---


    /*======================== TREES (3D OBJECTS) ======================== */
    var tree_vertices = [];
    var tree_faces = [];

    const TRUNK_COLOR = [0.25, 0.15, 0.05];
    const LEAF_COLOR = [0.0, 0.2, 0.05];
    const SEGMENTS = 8; 

    let treeCount = 0;
    
    // Simpan posisi pohon yang valid untuk laba-laba
    let validTreePositions = [];

    for (let i = 0; i < 200; i++) { 
        let angle = Math.random() * Math.PI * 2;
        let radius = Math.sqrt(Math.random()) * islandRadius * 0.95;
        let treeX = Math.cos(angle) * radius;
        let treeZ = Math.sin(angle) * radius;
        let treeY = getIslandHeight(treeX, treeZ, islandRadius);
        
        if (treeY > waterLevel + 10) {
            let trunkHeight = 90 + Math.random() * 60; 
            let trunkRadius = 12 + Math.random() * 6;  
            
            let base_y = treeY;
            let current_offset = tree_vertices.length / 8; 

            // Simpan data pohon ini, termasuk ketinggian dedaunan
            validTreePositions.push({
                x: treeX,
                z: treeZ,
                baseY: base_y,
                trunkHeight: trunkHeight,
                trunkRadius: trunkRadius,
                // Tambahan: Perkiraan Y paling rendah dari kumpulan daun
                leafBottomY: base_y + trunkHeight + (Math.random() * 75 * 0.4) - (75 / 2) // Rough estimate
            });

            // 1. Buat Batang (Cylinder)
            let trunkGeom = createCylinderGeometry(trunkRadius, trunkHeight, SEGMENTS, TRUNK_COLOR);
            for (let v = 0; v < trunkGeom.vertices.length; v += 8) {
                trunkGeom.vertices[v + 0] += treeX;
                trunkGeom.vertices[v + 1] += base_y + (trunkHeight / 2); 
                trunkGeom.vertices[v + 2] += treeZ;
            }
            tree_vertices.push(...trunkGeom.vertices);
            trunkGeom.faces.forEach(face => tree_faces.push(face + current_offset));
            
            base_y += trunkHeight; 
            current_offset = tree_vertices.length / 8;

            // 2. Buat Daun (Cones)
            let stackCount = Math.random() < 0.5 ? 2 : 3;
            let leafRadius = 60 + Math.random() * 30; 
            let leafHeight = 75 + Math.random() * 30; 

            for (let s = 0; s < stackCount; s++) {
                let currentRadius = leafRadius * (1.0 - (s / stackCount) * 0.5);
                let currentHeight = leafHeight * (1.0 - (s / stackCount) * 0.3);
                let y_pos = base_y + (s * leafHeight * 0.4) - (currentHeight / 2); 

                let coneGeom = createConeGeometry(currentRadius, currentHeight, SEGMENTS, LEAF_COLOR);
                for (let v = 0; v < coneGeom.vertices.length; v += 8) {
                    coneGeom.vertices[v + 0] += treeX;
                    coneGeom.vertices[v + 1] += y_pos + (currentHeight / 2);
                    coneGeom.vertices[v + 2] += treeZ;
                }
                tree_vertices.push(...coneGeom.vertices);
                coneGeom.faces.forEach(face => tree_faces.push(face + current_offset));
                current_offset = tree_vertices.length / 8;
            }
            
            treeCount++;
        }
    }
    console.log("Generated " + treeCount + " 3D trees.");

    var TREE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TREE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tree_vertices), GL.STATIC_DRAW);
    
    var TREE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TREE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tree_faces), GL.STATIC_DRAW);
    
    // --- AKHIR BAGIAN POHON 3D ---


    /*======================== LABA-LABA & JARING (3D OBJECTS) ======================== */
    var spider_vertices = [];
    var spider_faces = [];
    var spider_web_vertices = []; // <-- BARU: Untuk jaring
    var spider_web_faces = [];    // <-- BARU: Untuk jaring

    const SPIDER_COLOR = [0.9, 0.95, 1.0]; 
    const WEB_COLOR = [0.8, 0.8, 0.8]; // Warna jaring (putih keabu-abuan)
    const SPIDER_SEGMENTS = 8; 
    const PI = Math.PI;

    // --- FUNGSI createSpiderGeometry YANG DIUBAH UNTUK BERGELANTUNG ---
    function createSpiderGeometry(headRadius, bodyRadius, legLength, legRadius, color, translationX, translationY, translationZ) {
        let current_offset = spider_vertices.length / 8; 

        // 1. Badan (Sphere)
        // Posisinya sekarang akan menjadi "atas" laba-laba
        let bodyGeom = createSphereGeometry(bodyRadius, SPIDER_SEGMENTS, SPIDER_SEGMENTS, color, 0); 
        for (let v = 0; v < bodyGeom.vertices.length; v += 8) {
            bodyGeom.vertices[v + 0] += translationX;
            bodyGeom.vertices[v + 1] += translationY; 
            bodyGeom.vertices[v + 2] += translationZ;
        }
        spider_vertices.push(...bodyGeom.vertices);
        bodyGeom.faces.forEach(face => spider_faces.push(face + current_offset));
        current_offset = spider_vertices.length / 8;

        // 2. Kepala (Sphere)
        // Kepala sekarang di "bawah" badan
        let headGeom = createSphereGeometry(headRadius, SPIDER_SEGMENTS, SPIDER_SEGMENTS, color, 0); 
        for (let v = 0; v < headGeom.vertices.length; v += 8) {
            headGeom.vertices[v + 0] += translationX;
            headGeom.vertices[v + 1] += translationY - bodyRadius * 0.9 - headRadius * 0.5; // Mundur ke bawah dari badan
            headGeom.vertices[v + 2] += translationZ; 
        }
        spider_vertices.push(...headGeom.vertices);
        headGeom.faces.forEach(face => spider_faces.push(face + current_offset));
        current_offset = spider_vertices.length / 8;

        // 3. Kaki (8 Silinder)
        const legPositions = [
            // Kaki Depan (menuju Z positif, mengarah keluar)
            { x: bodyRadius * 0.6, side: 1, zOffset: 0.5 }, // Kanan depan
            { x: bodyRadius * 0.2, side: 1, zOffset: 0.2 }, // Kanan tengah depan
            { x: -bodyRadius * 0.2, side: 1, zOffset: -0.2 }, // Kanan tengah belakang
            { x: -bodyRadius * 0.6, side: 1, zOffset: -0.5 }, // Kanan belakang
            // Kaki Belakang (menuju Z negatif, mengarah keluar)
            { x: bodyRadius * 0.6, side: -1, zOffset: 0.5 }, // Kiri depan
            { x: bodyRadius * 0.2, side: -1, zOffset: 0.2 }, // Kiri tengah depan
            { x: -bodyRadius * 0.2, side: -1, zOffset: -0.2 }, // Kiri tengah belakang
            { x: -bodyRadius * 0.6, side: -1, zOffset: -0.5 } // Kiri belakang
        ];

        for (let leg of legPositions) {
            let side = leg.side; // 1 untuk depan, -1 untuk belakang
            
            // Posisi awal kaki (di sisi badan)
            let legStartX = translationX + leg.x; 
            let legStartY = translationY + bodyRadius * 0.1; // Sedikit di atas tengah badan (tempat menggantung)
            let legStartZ = translationZ + (bodyRadius * 0.8) * side; // Keluar dari badan di sumbu Z

            let legGeom = createCylinderGeometry(legRadius, legLength, SPIDER_SEGMENTS / 2, color, legLength / 2); 

            for (let v = 0; v < legGeom.vertices.length; v += 8) {
                let lx = legGeom.vertices[v + 0]; 
                let ly = legGeom.vertices[v + 1] - (legLength / 2); 
                let lz = legGeom.vertices[v + 2]; 

                // 1. Orientasi default silinder adalah Y-axis.
                // Rotasi Z agar kaki keluar secara horizontal (pada Y=0, X=jari-jari)
                let rotAngleZ_out = (PI / 2) * -side; // -PI/2 jika side=1 (depan), PI/2 jika side=-1 (belakang)
                let r1x = lx * Math.cos(rotAngleZ_out) - ly * Math.sin(rotAngleZ_out);
                let r1y = lx * Math.sin(rotAngleZ_out) + ly * Math.cos(rotAngleZ_out);
                let r1z = lz;

                // 2. Rotasi X agar kaki miring ke bawah
                let rotAngleX_down = PI / 4; // Miringkan ke bawah 45 derajat
                let r2x = r1x;
                let r2y = r1y * Math.cos(rotAngleX_down) - r1z * Math.sin(rotAngleX_down);
                let r2z = r1y * Math.sin(rotAngleX_down) + r1z * Math.cos(rotAngleX_down);

                // 3. Sebarkan kaki (Rotasi Y sedikit, agar tidak lurus)
                let spreadAngle = (leg.x / bodyRadius) * (PI / 6); // +/- 30 derajat
                let r3x = r2x * Math.cos(spreadAngle) + r2z * Math.sin(spreadAngle);
                let r3y = r2y;
                let r3z = -r2x * Math.sin(spreadAngle) + r2z * Math.cos(spreadAngle);
                
                legGeom.vertices[v + 0] = r3x + legStartX;
                legGeom.vertices[v + 1] = r3y + legStartY;
                legGeom.vertices[v + 2] = r3z + legStartZ;
            }

            spider_vertices.push(...legGeom.vertices);
            legGeom.faces.forEach(face => spider_faces.push(face + current_offset));
            current_offset = spider_vertices.length / 8;
        }
    }

    // --- MENEMPATKAN LABA-LABA BERGELANTUNG DAN JARING Sederhana ---
    const smallHeadRadius = 5;  
    const smallBodyRadius = 8;  
    const smallLegLength = 20;  
    const smallLegRadius = 1;   

    let spiderCount = 0;
    const spidersToCreate = 50; 
    const webLengthFactor = 0.5; // Jaring sepanjang 50% dari ketinggian daun

    for (let i = 0; i < spidersToCreate; i++) {
        if (validTreePositions.length === 0) break; 
        
        let treeIndex = Math.floor(Math.random() * validTreePositions.length);
        let tree = validTreePositions[treeIndex];

        // Posisi di mana jaring menempel di pohon (di sekitar dedaunan)
        let webAttachX = tree.x + (Math.random() - 0.5) * tree.trunkRadius * 3; // Lebih lebar di dedaunan
        let webAttachZ = tree.z + (Math.random() - 0.5) * tree.trunkRadius * 3;
        let webAttachY = tree.baseY + tree.trunkHeight + (Math.random() * 50); // Di bagian atas batang/awal daun

        // Ketinggian laba-laba
        let hangDepth = (Math.random() * 60) + 30; // Bergelantungan 30-90 unit dari tempat menempel
        let spiderY = webAttachY - hangDepth; 

        // Offset horizontal laba-laba dari benang jaring (agar tidak persis di bawah)
        let spiderOffsetX = (Math.random() - 0.5) * 10; 
        let spiderOffsetZ = (Math.random() - 0.5) * 10;

        // Buat laba-laba
        createSpiderGeometry(
            smallHeadRadius,    
            smallBodyRadius,    
            smallLegLength,   
            smallLegRadius,     
            SPIDER_COLOR,
            webAttachX + spiderOffsetX, 
            spiderY,       
            webAttachZ + spiderOffsetZ  
        );
        spiderCount++;

        // Buat jaring laba-laba sederhana (garis dari pohon ke laba-laba)
        let web_current_offset = spider_web_vertices.length / 8; // Stride: pos(3), color(3), uv(2)

        // Titik atas (di pohon)
        spider_web_vertices.push(webAttachX, webAttachY, webAttachZ, ...WEB_COLOR, 0, 0); 
        // Titik bawah (di laba-laba)
        spider_web_vertices.push(webAttachX + spiderOffsetX, spiderY, webAttachZ + spiderOffsetZ, ...WEB_COLOR, 0, 0);

        spider_web_faces.push(web_current_offset, web_current_offset + 1); // Garis antara 2 titik
    }
    console.log("Generated " + spiderCount + " small spiders hanging from trees.");

    var SPIDER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SPIDER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(spider_vertices), GL.STATIC_DRAW);
    
    var SPIDER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPIDER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(spider_faces), GL.STATIC_DRAW);

    // --- BARU: BUFFER UNTUK JARING LABA-LABA ---
    var SPIDER_WEB_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SPIDER_WEB_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(spider_web_vertices), GL.STATIC_DRAW);
    
    var SPIDER_WEB_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPIDER_WEB_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(spider_web_faces), GL.STATIC_DRAW);
    // --- AKHIR BAGIAN LABA-LABA & JARING ---


    /*================= MATRIKS & KONTROL KAMERA =================*/
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 10, 12000);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();
    var camX = 0, camZ = 0;
    var camY = -2800; 
    var keys = {}; 
    LIBS.translateZ(VIEWMATRIX, 0); 
    var THETA = 0, PHI = 0;
    var drag = false;
    var x_prev, y_prev;
    var FRICTION = 0.05;
    var dX = 0, dY = 0;
    var mouseDown = function (e) { drag = true; x_prev = e.pageX, y_prev = e.pageY; e.preventDefault(); return false; };
    var mouseUp = function (e) { drag = false; };
    var mouseOut = function (e) { drag = false; }; 
    var mouseMove = function (e) {
        if (!drag) return false;
        dX = -(e.pageX - x_prev) * 2 * Math.PI / CANVAS.width * 0.3;
        dY = -(e.pageY - y_prev) * 2 * Math.PI / CANVAS.height * 0.3;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseOut, false); 
    CANVAS.addEventListener("mousemove", mouseMove, false);
    var keyDown = function (e) { keys[e.key] = true; };
    var keyUp = function (e) { keys[e.key] = false; };
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);


    /*========================= TEXTURES =========================*/
    var load_texture = function (image_URL, wrapping, use_mipmaps) {
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
    
    var cube_texture = load_texture("night.png", GL.CLAMP_TO_EDGE, false); 
    var ground_texture = load_texture("grass1.png", GL.REPEAT, true);
    
    var createWaterTexture = function() {
        var texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, texture); // Corrected line
        var pixel = new Uint8Array([20, 40, 80, 200]); 
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, pixel);
        return texture;
    };
    var water_texture = createWaterTexture();


    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clearDepth(1.0);

    var SKYBOX_VMATRIX = LIBS.get_I4();
    var time_prev = 0;
    
    const stride_pos_uv = 4 * (3 + 2); 
    const stride_pos_col_uv = 4 * (3 + 3 + 2); 

    var animate = function (time) {
        
        GL.uniform3f(_ambientLight, 0.25, 0.25, 0.4); 
        GL.uniform3f(_moonLightDirection, 0.0, -1.2, -0.7); 

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT); 

        var dt = time - time_prev;
        if (dt === 0) dt = 16.67; 
        time_prev = time;
        
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
        
        LIBS.set_I4(VIEWMATRIX);
        LIBS.rotateX(VIEWMATRIX, -PHI); LIBS.rotateY(VIEWMATRIX, -THETA);
        LIBS.translateX(VIEWMATRIX, -camX); LIBS.translateY(VIEWMATRIX, -camY); LIBS.translateZ(VIEWMATRIX, -camZ);
        LIBS.set_I4(SKYBOX_VMATRIX);
        LIBS.rotateX(SKYBOX_VMATRIX, -PHI); LIBS.rotateY(SKYBOX_VMATRIX, -THETA);
        LIBS.set_I4(MOVEMATRIX);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        
        // --- URUTAN RENDER ---
        // Atur _isWeb ke false untuk objek 3D biasa
        GL.uniform1i(_isWeb, false); 

        // 1. SKYBOX (Opaque)
        GL.disable(GL.BLEND); 
        GL.uniform1i(_isSkybox, true); 
        GL.uniform1i(_useTexture, true); 
        GL.disableVertexAttribArray(_color); 

        GL.uniformMatrix4fv(_Vmatrix, false, SKYBOX_VMATRIX); 
        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride_pos_uv, 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, stride_pos_uv, 4 * 3);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, cube_texture);
        GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);


        // 2. PULAU (Opaque)
        GL.uniform1i(_isSkybox, false);
        GL.uniform1i(_useTexture, true); 
        GL.disableVertexAttribArray(_color); 

        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, GROUND_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride_pos_uv, 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, stride_pos_uv, 4 * 3);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GROUND_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, ground_texture);
        GL.drawElements(GL.TRIANGLES, ground_faces.length, GL.UNSIGNED_SHORT, 0);
        
        
        // 3. POHON (3D) (Opaque)
        GL.uniform1i(_isSkybox, false);
        GL.uniform1i(_useTexture, false); 
        GL.enableVertexAttribArray(_color); 

        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, TREE_VERTEX);
        
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride_pos_col_uv, 0);
        GL.vertexAttribPointer(_color,    3, GL.FLOAT, false, stride_pos_col_uv, 4 * 3); 
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, stride_pos_col_uv, 4 * (3 + 3)); 

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TREE_FACES);
        GL.drawElements(GL.TRIANGLES, tree_faces.length, GL.UNSIGNED_SHORT, 0);

        // 4. LABA-LABA (Opaque)
        GL.uniform1i(_isSkybox, false);
        GL.uniform1i(_useTexture, false); 
        GL.enableVertexAttribArray(_color); 

        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, SPIDER_VERTEX);
        
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride_pos_col_uv, 0);
        GL.vertexAttribPointer(_color,    3, GL.FLOAT, false, stride_pos_col_uv, 4 * 3); 
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, stride_pos_col_uv, 4 * (3 + 3)); 

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPIDER_FACES);
        GL.drawElements(GL.TRIANGLES, spider_faces.length, GL.UNSIGNED_SHORT, 0);

        // --- BARU: 5. JARING LABA-LABA (Menggambar Garis) ---
        GL.uniform1i(_isWeb, true); // Aktifkan mode jaring di shader
        GL.uniform1i(_isSkybox, false);
        GL.uniform1i(_useTexture, false); 
        GL.enableVertexAttribArray(_color); 
        GL.disableVertexAttribArray(_uv); // Jaring tidak pakai UV

        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, SPIDER_WEB_VERTEX);
        
        // Stride hanya pos(3) dan color(3) untuk jaring
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3 + 2), 0); // Tetap gunakan stride_pos_col_uv jika itu formatnya
        GL.vertexAttribPointer(_color,    3, GL.FLOAT, false, 4 * (3 + 3 + 2), 4 * 3); 

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPIDER_WEB_FACES);
        GL.drawElements(GL.LINES, spider_web_faces.length, GL.UNSIGNED_SHORT, 0); // Menggambar GARIS
        GL.enableVertexAttribArray(_uv); // Aktifkan lagi UV untuk objek selanjutnya


        // 6. AIR (Transparan - Digambar terakhir)
        GL.uniform1i(_isWeb, false); // Matikan mode jaring
        GL.enable(GL.BLEND); 
        GL.uniform1i(_isSkybox, false);
        GL.uniform1i(_useTexture, true); 
        GL.disableVertexAttribArray(_color); 

        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.bindBuffer(GL.ARRAY_BUFFER, WATER_VERTEX);
        
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, stride_pos_uv, 0);
        GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, stride_pos_uv, 4 * 3);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, WATER_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, water_texture);
        GL.drawElements(GL.TRIANGLES, water_faces.length, GL.UNSIGNED_SHORT, 0);

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    
    animate(0);
}
window.addEventListener('load', main);