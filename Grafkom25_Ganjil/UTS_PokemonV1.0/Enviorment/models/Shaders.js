export const Shaders = {
  vertex_source: `
    attribute vec3 position;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    attribute vec2 uv;
    attribute vec3 color; 
    
    varying vec2 vUV;
    varying vec3 vColor; 

    uniform bool u_isWeb;

    void main(void) {
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
        if (u_isWeb) {
            vColor = color;
        } else {
            vUV = uv;
            vColor = color; 
        }
    }`,

  fragment_source: `
    precision mediump float;
    uniform sampler2D sampler;
    varying vec2 vUV;
    varying vec3 vColor; 

    uniform vec3 u_ambientLight;
    uniform bool u_isSkybox;
    uniform vec3 u_moonLightDirection;
    uniform bool u_useTexture; 
    uniform bool u_isWeb;

    void main(void) {
        vec4 color;
        
        if (u_isWeb) {
            color = vec4(vColor, 1.0);
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
