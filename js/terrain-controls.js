// Setup tombol kontrol
function setupControls() {
    document.getElementById('viewFull').addEventListener('click', function() {
        gsap.to(camera.position, {
            x: 50,
            y: 50,
            z: 50,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });
    });
    
    document.getElementById('viewHousing').addEventListener('click', function() {
        gsap.to(camera.position, {
            x: 0,
            y: 10,
            z: 20,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(0, 2, 0);
            }
        });
    });
    
    document.getElementById('viewFarms').addEventListener('click', function() {
        gsap.to(camera.position, {
            x: 40,
            y: 15,
            z: 40,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(40, 0, 40);
            }
        });
    });
    
    document.getElementById('viewInfrastructure').addEventListener('click', function() {
        gsap.to(camera.position, {
            x: 0,
            y: 20,
            z: 0,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });
    });
    
    document.getElementById('toggleDayNight').addEventListener('click', function() {
        isNightMode = !isNightMode;
        
        if (isNightMode) {
            // Mode malam
            gsap.to(scene.background, {
                r: 0.05,
                g: 0.05,
                b: 0.1,
                duration: 1.5
            });
            
            gsap.to(ambientLight, {
                intensity: 0.1,
                duration: 1.5
            });
            
            gsap.to(directionalLight, {
                intensity: 0.3,
                duration: 1.5
            });
            
            gsap.to(directionalLight.position, {
                x: -50,
                y: 10,
                z: -50,
                duration: 1.5
            });
        } else {
            // Mode siang
            gsap.to(scene.background, {
                r: 0.53,
                g: 0.81,
                b: 0.92,
                duration: 1.5
            });
            
            gsap.to(ambientLight, {
                intensity: 0.4,
                duration: 1.5
            });
            
            gsap.to(directionalLight, {
                intensity: 1.0,
                duration: 1.5
            });
            
            gsap.to(directionalLight.position, {
                x: 50,
                y: 100,
                z: 50,
                duration: 1.5
            });
        }
    });
}

// Mendapatkan ketinggian terrain pada posisi tertentu
function getTerrainHeight(x, z) {
    // Menggunakan simplex noise untuk konsistensi dengan terrain
    const nx = x / 200;
    const nz = z / 200;
    
    let height = 0;
    height += simplex.noise2D(nx * 1, nz * 1) * 1.0;
    height += simplex.noise2D(nx * 2, nz * 2) * 0.5;
    height += simplex.noise2D(nx * 4, nz * 4) * 0.25;
    
    return height * 10;
}

// Fungsi untuk membuat lahan pertanian
function createFarms() {
    farms = new THREE.Group();
    
    // Membuat beberapa area pertanian
    createFarmArea(30, 40, 20, 15, 0);
    createFarmArea(-40, 30, 25, 20, 45);
    createFarmArea(40, -40, 30, 25, 15);
    
    scene.add(farms);
}

// Membuat satu area pertanian
function createFarmArea(x, z, width, depth, rotation) {
    const farm = new THREE.Group();
    
    // Tanah pertanian
    const groundGeometry = new THREE.PlaneGeometry(width, depth, 10, 10);
    groundGeometry.rotateX(-Math.PI / 2);
    
    // Material dengan tekstur tanah
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x5D4037,
        roughness: 1.0,
        metalness: 0.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    farm.add(ground);
    
    // Membuat baris-baris tanaman
    const rowCount = Math.floor(width / 2);
    const plantCount = Math.floor(depth / 2);
    
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < plantCount; j++) {
            // Posisi tanaman
            const plantX = -width / 2 + 1 + i * 2;
            const plantZ = -depth / 2 + 1 + j * 2;
            
            // Buat tanaman
            const plant = createPlant();
            plant.position.set(plantX, 0.5, plantZ);
            farm.add(plant);
        }
    }
    
    // Posisi dan rotasi area pertanian
    farm.position.set(x, getTerrainHeight(x, z) + 0.1, z);
    farm.rotation.y = rotation * Math.PI / 180;
    
    farms.add(farm);
}

// Membuat satu tanaman
function createPlant() {
    const plant = new THREE.Group();
    
    // Batang tanaman
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x33691E });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    stem.castShadow = true;
    plant.add(stem);
    
    // Daun tanaman
    const leafGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    leafGeometry.scale(1, 0.3, 1);
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x7CB342 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.y = 0.5;
    leaf.castShadow = true;
    plant.add(leaf);
    
    return plant;
}

// Membuat jalan
function createRoads() {
    roads = new THREE.Group();
    
    // Jalan utama
    const mainRoad = createRoad(0, 0, 100, 5, 0);
    roads.add(mainRoad);
    
    // Jalan sekunder
    const secondaryRoad1 = createRoad(0, 0, 50, 3, 90);
    roads.add(secondaryRoad1);
    
    const secondaryRoad2 = createRoad(25, 25, 30, 3, 45);
    roads.add(secondaryRoad2);
    
    const secondaryRoad3 = createRoad(-25, 25, 30, 3, -45);
    roads.add(secondaryRoad3);
    
    scene.add(roads);
} 