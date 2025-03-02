/**
 * Creates and configures the camera
 * @returns {THREE.PerspectiveCamera} The configured camera
 */
function createCamera() {
    // Create a perspective camera
    // Parameters: FOV, aspect ratio, near plane, far plane
    const camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        1, 
        2000
    );
    
    // Position the camera above the scene looking down
    camera.position.set(0, 100, 100);
    camera.lookAt(0, 0, 0);
    
    return camera;
} 