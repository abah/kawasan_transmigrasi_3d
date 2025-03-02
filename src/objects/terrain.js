/**
 * Creates a terrain with slight elevation variations
 * @param {number} size - Size of the terrain
 * @returns {THREE.Group} The terrain group
 */
function createTerrain(size = 1000) {
    // Create a group to hold all terrain elements
    const terrainGroup = new THREE.Group();
    
    // Create main ground plane
    const groundGeometry = new THREE.PlaneGeometry(size, size, 64, 64);
    
    // Apply height variations to create natural terrain
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        // Skip center area to keep it flat for settlement
        const x = vertices[i];
        const z = vertices[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > size * 0.15) {
            // Apply perlin-like noise for natural terrain
            const scale = 0.02;
            const noiseValue = Math.sin(x * scale) * Math.cos(z * scale) * 5;
            
            // Add more elevation as we move away from center
            const distanceFactor = Math.max(0, (distanceFromCenter - size * 0.15) / (size * 0.3));
            const elevationFactor = Math.min(1, distanceFactor * 0.5);
            
            vertices[i + 1] = noiseValue * elevationFactor;
        }
    }
    
    // Update normals after modifying vertices
    groundGeometry.computeVertexNormals();
    
    // Create ground material
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown color for soil
        roughness: 0.8,
        metalness: 0.1,
        flatShading: false
    });
    
    // Create ground mesh
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to horizontal
    ground.receiveShadow = true;
    
    terrainGroup.add(ground);
    
    // Add grass patches using the RealisticElements library
    const grassPatches = 15;
    const grassRadius = size * 0.4; // Radius where grass patches will be placed
    
    for (let i = 0; i < grassPatches; i++) {
        // Calculate position in a circle around the settlement
        const angle = (i / grassPatches) * Math.PI * 2;
        const x = Math.cos(angle) * (grassRadius + Math.random() * (size * 0.1));
        const z = Math.sin(angle) * (grassRadius + Math.random() * (size * 0.1));
        
        // Create grass with random size
        const grassSize = size * 0.02 + Math.random() * (size * 0.03);
        
        // Use the RealisticElements library to create grass
        RealisticElements.createRealisticGrass({
            size: { width: grassSize, height: grassSize },
            density: 'medium',
            scale: 1.0,
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
        }, (grass) => {
            terrainGroup.add(grass);
        });
    }
    
    // Add water features (small lakes or ponds)
    const waterFeatures = 3;
    for (let i = 0; i < waterFeatures; i++) {
        const angle = (i / waterFeatures) * Math.PI * 2 + (Math.random() * 0.5);
        const distance = size * (0.25 + Math.random() * 0.15);
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Random size for water feature
        const waterSize = size * (0.05 + Math.random() * 0.05);
        
        // Create water geometry
        const waterGeometry = new THREE.CircleGeometry(waterSize, 32);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4444ff,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2; // Rotate to horizontal
        water.position.set(x, 0.5, z); // Slightly above ground
        
        terrainGroup.add(water);
    }
    
    return terrainGroup;
} 