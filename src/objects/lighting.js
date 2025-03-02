/**
 * Creates lighting for the scene
 * @returns {THREE.Group} Group containing all lights
 */
function createLighting() {
    // Create a group to hold all lights
    const lightGroup = new THREE.Group();
    
    // Add ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    lightGroup.add(ambientLight);
    
    // Add directional light for sun-like lighting and shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 100, 0);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    // Set the shadow camera frustum
    const shadowSize = 500;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 500;
    
    // Add directional light to group
    lightGroup.add(directionalLight);
    
    // Add hemisphere light for more natural outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(
        0xffffff, // Sky color
        0x444444, // Ground color
        0.6       // Intensity
    );
    lightGroup.add(hemisphereLight);
    
    return lightGroup;
} 