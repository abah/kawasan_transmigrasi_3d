/**
 * Creates a sky dome with gradient
 * @returns {THREE.Mesh} The sky dome mesh
 */
function createSky() {
    // Create a large sphere geometry for the sky dome
    const skyGeometry = new THREE.SphereGeometry(900, 32, 32);
    
    // Invert the geometry so we see the inside
    skyGeometry.scale(-1, 1, 1);
    
    // Create a shader material with vertical gradient
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) }, // Blue
            bottomColor: { value: new THREE.Color(0xffffff) }, // White
            offset: { value: 400 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            
            varying vec3 vWorldPosition;
            
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    
    // Create the sky mesh
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    
    return sky;
} 