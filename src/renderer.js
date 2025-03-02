/**
 * Creates and configures the WebGL renderer
 * @returns {THREE.WebGLRenderer} The configured renderer
 */
function createRenderer() {
    // Create a new WebGL renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    
    // Set the size to match the window
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Enable shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set pixel ratio for better display on high DPI devices
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Set tone mapping for better color reproduction
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    return renderer;
} 