// Global variables
let scene, renderer, camera, controls;
let settlement, terrain, sky;
let gridSize = 3; // Number of settlement copies in each direction (3x3 grid)
let settlementSize = 700; // Size of one settlement unit
let cameraTarget = new THREE.Vector3(0, 0, 0);
let autoRotate = true;
let clock = new THREE.Clock(); // Clock for animation timing

// Initialize the application
function init() {
    // Create scene, renderer, camera, and controls
    scene = createScene();
    renderer = createRenderer();
    camera = createCamera();
    controls = createControls(camera, renderer.domElement);
    
    // Add renderer to DOM
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Create sky
    sky = createSky();
    scene.add(sky);
    
    // Create lighting
    const lighting = createLighting();
    scene.add(lighting);
    
    // Create base terrain and settlement
    createBaseSettlement().then(baseSettlement => {
        // Create infinite grid of settlements
        createInfiniteGrid(baseSettlement);
    });
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('view-height').addEventListener('input', updateCameraHeight);
    document.getElementById('time-of-day').addEventListener('change', updateTimeOfDay);
    document.getElementById('toggle-labels').addEventListener('click', toggleLabels);
    
    // Add auto-rotate toggle button
    const autoRotateBtn = document.createElement('button');
    autoRotateBtn.id = 'toggle-rotation';
    autoRotateBtn.textContent = 'Matikan Rotasi Otomatis';
    autoRotateBtn.addEventListener('click', toggleAutoRotate);
    document.getElementById('controls').appendChild(autoRotateBtn);
    
    // Add info about infinite grid feature
    const infoElement = document.createElement('p');
    infoElement.innerHTML = 'Fitur "Infinite Grid": Kamera akan dibungkus ke sisi lain ketika mencapai tepi peta.';
    document.getElementById('info-panel').appendChild(infoElement);
    
    // Start animation loop
    animate();
}

// Create base settlement that will be replicated
function createBaseSettlement() {
    return new Promise((resolve) => {
        // Create a group to hold the base settlement
        const baseGroup = new THREE.Group();
        
        // Create terrain
        const terrain = createTerrain(settlementSize);
        baseGroup.add(terrain);
        
        // Create settlement
        createSettlement(settlementSize/2).then(settlementObject => {
            baseGroup.add(settlementObject);
            resolve(baseGroup);
        });
    });
}

// Create infinite grid by replicating the base settlement
function createInfiniteGrid(baseSettlement) {
    settlement = new THREE.Group();
    
    // Create a grid of settlements
    const offset = Math.floor(gridSize / 2);
    
    for (let x = -offset; x <= offset; x++) {
        for (let z = -offset; z <= offset; z++) {
            const clone = baseSettlement.clone();
            clone.position.set(x * settlementSize, 0, z * settlementSize);
            settlement.add(clone);
        }
    }
    
    scene.add(settlement);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update camera height based on slider
function updateCameraHeight() {
    const height = document.getElementById('view-height').value;
    camera.position.y = height;
    camera.lookAt(cameraTarget);
}

// Update time of day (lighting)
function updateTimeOfDay() {
    const time = document.getElementById('time-of-day').value;
    
    // Update sky and lighting based on time of day
    switch(time) {
        case 'morning':
            // Morning settings
            sky.material.uniforms.topColor.value.set(0x88ccff);
            sky.material.uniforms.bottomColor.value.set(0xffeebb);
            break;
        case 'noon':
            // Noon settings
            sky.material.uniforms.topColor.value.set(0x0077ff);
            sky.material.uniforms.bottomColor.value.set(0xffffff);
            break;
        case 'evening':
            // Evening settings
            sky.material.uniforms.topColor.value.set(0xff7700);
            sky.material.uniforms.bottomColor.value.set(0xffcc99);
            break;
        case 'night':
            // Night settings
            sky.material.uniforms.topColor.value.set(0x000033);
            sky.material.uniforms.bottomColor.value.set(0x000066);
            break;
    }
    
    // Update lighting
    scene.traverse(object => {
        if (object.isDirectionalLight) {
            switch(time) {
                case 'morning':
                    object.position.set(50, 50, 50);
                    object.intensity = 0.8;
                    object.color.set(0xffeedd);
                    break;
                case 'noon':
                    object.position.set(0, 100, 0);
                    object.intensity = 1.0;
                    object.color.set(0xffffff);
                    break;
                case 'evening':
                    object.position.set(-50, 30, -50);
                    object.intensity = 0.7;
                    object.color.set(0xff9966);
                    break;
                case 'night':
                    object.position.set(0, 50, 0);
                    object.intensity = 0.2;
                    object.color.set(0x3366ff);
                    break;
            }
        }
    });
}

// Toggle labels visibility
function toggleLabels() {
    if (settlement) {
        settlement.traverse(object => {
            if (object.userData && object.userData.isLabel) {
                object.visible = !object.visible;
            }
        });
    }
}

// Toggle auto-rotation
function toggleAutoRotate() {
    autoRotate = !autoRotate;
    const btn = document.getElementById('toggle-rotation');
    btn.textContent = autoRotate ? 'Matikan Rotasi Otomatis' : 'Aktifkan Rotasi Otomatis';
}

// Check if camera has moved outside the central grid and wrap around
function wrapCameraPosition() {
    const halfSize = (settlementSize * Math.floor(gridSize / 2));
    
    // Check X position
    if (camera.position.x > halfSize) {
        camera.position.x -= settlementSize;
        controls.target.x -= settlementSize;
    } else if (camera.position.x < -halfSize) {
        camera.position.x += settlementSize;
        controls.target.x += settlementSize;
    }
    
    // Check Z position
    if (camera.position.z > halfSize) {
        camera.position.z -= settlementSize;
        controls.target.z -= settlementSize;
    } else if (camera.position.z < -halfSize) {
        camera.position.z += settlementSize;
        controls.target.z += settlementSize;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Get time delta for smooth animations
    const delta = clock.getDelta();
    
    // Update controls
    controls.update();
    
    // Auto-rotate camera around the scene
    if (autoRotate) {
        const time = Date.now() * 0.0001;
        const radius = 300;
        camera.position.x = Math.cos(time) * radius;
        camera.position.z = Math.sin(time) * radius;
        camera.lookAt(cameraTarget);
    } else {
        // Check if we need to wrap the camera position
        wrapCameraPosition();
    }
    
    // Animate vehicles
    if (typeof animateVehicles === 'function') {
        animateVehicles(delta * 1000); // Convert to milliseconds for vehicle animation
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Start the application when the window loads
window.onload = init; 