/**
 * Creates and configures the Three.js scene
 * @returns {THREE.Scene} The configured scene
 */
function createScene() {
    // Create a new scene
    const scene = new THREE.Scene();
    
    // Set background color (sky blue)
    scene.background = new THREE.Color(0x87CEEB);
    
    // Add fog for distance fading
    scene.fog = new THREE.FogExp2(0xCCCCFF, 0.002);
    
    return scene;
} 