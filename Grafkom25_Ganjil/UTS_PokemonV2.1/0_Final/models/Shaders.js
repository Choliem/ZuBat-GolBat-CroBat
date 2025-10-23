export const Shaders = {
  vertex_source: `
        attribute vec3 position;
        attribute vec3 color;
        attribute vec3 normal;
        attribute vec2 uv;
        
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;

        varying vec3 vColor;
        varying vec2 vUV;
        varying vec3 vNormal;
        varying vec3 vView;

        uniform bool u_isWeb;
        uniform bool u_isSkybox; // <-- TAMBAHKAN BARIS INI

        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);

            // --- TAMBAHKAN BLOK IF INI ---
            // Trik ini memaksa Z skybox ke jarak terjauh (1.0)
            // sehingga tidak akan pernah menutupi objek lain.
            if (u_isSkybox) {
                gl_Position.z = gl_Position.w;
            }
            // --- AKHIR TAMBAHAN ---

            vNormal = normalize(mat3(Mmatrix) * normal);
            vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
            vColor = color;
            vUV = uv;
    }`,
  fragment_source: `
    precision mediump float;
    
    varying vec3 vColor;
    varying vec2 vUV;
    varying vec3 vNormal;
    varying vec3 vView;

    uniform sampler2D sampler;
    uniform bool u_useTexture;
    uniform bool u_isWeb;
    uniform bool u_isSkybox;
    uniform bool u_isUnlit; // Untuk Golbat

    uniform bool u_useLighting; // Untuk Crobat
    uniform vec3 ambientColor;
    uniform vec3 lightDirection;
    uniform vec3 lightColor;
    uniform vec3 u_moonLightDirection; // Untuk Env

    void main(void) {
        vec4 color;

        // 1. Dapatkan warna dasar
        if (u_isWeb) {
            color = vec4(vColor, 1.0);
        }
        else if (u_useTexture) {
            color = texture2D(sampler, vUV);
        } else {
            color = vec4(vColor, 1.0); 
        }

        // 2. Buang piksel transparan
        if (color.a < 0.1 && u_useTexture) { 
            discard; 
        }

        // 3. Terapkan jalur rendering yang benar
        if (u_isUnlit) {
            // --- JALUR 1: GOLBAT (FLAT/UNLIT) ---
            gl_FragColor = vec4(vColor, 1.0); 

        } else if (u_isSkybox) {
            // --- JALUR 2: SKYBOX ---
            gl_FragColor = color; 

        } else if (u_useLighting) {
            // --- JALUR 3: CROBAT (3D LIT) ---
            vec3 N = normalize(vNormal);
            vec3 L = normalize(lightDirection);
            vec3 V = normalize(-vView);
            vec3 R = reflect(-L, N);
            float diffuse = max(dot(N, L), 0.0);
            float specular = pow(max(dot(V, R), 0.0), 100.0);
            vec3 finalLight = ambientColor + (diffuse * lightColor) + (specular * lightColor);
            gl_FragColor = vec4(color.rgb * finalLight, color.a);

        } else {
            // --- JALUR 4: ENVIRONMENT (FAKED LIT) ---
            vec3 litColor = color.rgb * ambientColor; 
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
    }`,
};
