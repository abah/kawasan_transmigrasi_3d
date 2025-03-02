/**
 * Creates and configures the camera controls
 * @param {THREE.Camera} camera - The camera to control
 * @param {HTMLElement} domElement - The DOM element for event listeners
 * @returns {THREE.OrbitControls} The configured controls
 */
function createControls(camera, domElement) {
    // Create orbit controls
    const controls = new THREE.OrbitControls(camera, domElement);
    
    // Configure controls
    controls.enableDamping = true; // Add smooth damping effect
    controls.dampingFactor = 0.05;
    
    controls.screenSpacePanning = false;
    
    // Set minimum and maximum distance
    controls.minDistance = 20;
    controls.maxDistance = 500;
    
    // Limit vertical rotation to avoid going below ground
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    
    // Set initial target to center of scene
    controls.target.set(0, 0, 0);
    
    return controls;
} 