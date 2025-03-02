// Variabel global
let scene, camera, renderer, controls;
let gridSize = 5;
let blockSize = 50;
let vehicles = [];
let clouds = [];
let clock = new THREE.Clock();
let grassInstances;
let grassModel;

// Inisialisasi scene
function init() {
    // Buat scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0xCCE0FF, 0.002);
    
    // Buat kamera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    
    // Buat renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Kontrol kamera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 30;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2.2;
    
    // Pencahayaan
    setupLighting();
    
    // Buat grid kawasan transmigrasi
    createTransmigrasiGrid();
    
    // Buat jalan
    createRoads();
    
    // Buat kendaraan bergerak
    createVehicles();
    
    // Buat awan bergerak
    createClouds();
    
    // Buat rumput
    createGrass();
    
    // Event listener
    window.addEventListener('resize', onWindowResize);
    
    // Sembunyikan loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);
    
    // Mulai animasi
    animate();
}

// Setup pencahayaan
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);
    
    // Directional light (matahari)
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    
    // Konfigurasi shadow
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 300;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    
    scene.add(directionalLight);
}

// Buat grid kawasan transmigrasi
function createTransmigrasiGrid() {
    // Tipe blok: 0 = perumahan, 1 = pertanian, 2 = hutan, 3 = fasilitas publik
    const blockTypes = [
        [0, 1, 0, 1, 0],
        [1, 3, 2, 3, 1],
        [0, 2, 3, 2, 0],
        [1, 3, 2, 3, 1],
        [0, 1, 0, 1, 0]
    ];
    
    // Buat jalan
    createRoads();
    
    // Buat blok-blok kawasan
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const blockType = blockTypes[i][j];
            const x = (i - Math.floor(gridSize/2)) * blockSize;
            const z = (j - Math.floor(gridSize/2)) * blockSize;
            
            createBlock(blockType, x, z);
        }
    }
}

// Buat jalan
function createRoads() {
    const roadWidth = 10;
    const gridWorldSize = gridSize * blockSize;
    const halfGridSize = gridWorldSize / 2;
    
    // Material jalan
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Buat jalan horizontal
    for (let i = -Math.floor(gridSize/2); i <= Math.floor(gridSize/2); i++) {
        const roadGeometry = new THREE.BoxGeometry(gridWorldSize, 0.1, roadWidth);
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.position.set(0, 0.05, i * blockSize);
        road.receiveShadow = true;
        scene.add(road);
    }
    
    // Buat jalan vertikal
    for (let i = -Math.floor(gridSize/2); i <= Math.floor(gridSize/2); i++) {
        const roadGeometry = new THREE.BoxGeometry(roadWidth, 0.1, gridWorldSize);
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.position.set(i * blockSize, 0.05, 0);
        road.receiveShadow = true;
        scene.add(road);
    }
    
    // Tambahkan zebra cross di persimpangan
    const crossingMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    
    for (let x = -Math.floor(gridSize/2); x <= Math.floor(gridSize/2); x++) {
        for (let z = -Math.floor(gridSize/2); z <= Math.floor(gridSize/2); z++) {
            // Buat zebra cross
            const crossingGeometry = new THREE.BoxGeometry(3, 0.15, 8);
            const crossing1 = new THREE.Mesh(crossingGeometry, crossingMaterial);
            crossing1.position.set(x * blockSize - 5, 0.06, z * blockSize);
            crossing1.receiveShadow = true;
            scene.add(crossing1);
            
            const crossing2 = new THREE.Mesh(crossingGeometry, crossingMaterial);
            crossing2.position.set(x * blockSize + 5, 0.06, z * blockSize);
            crossing2.receiveShadow = true;
            scene.add(crossing2);
            
            const crossing3 = new THREE.Mesh(crossingGeometry, crossingMaterial);
            crossing3.rotation.y = Math.PI / 2;
            crossing3.position.set(x * blockSize, 0.06, z * blockSize - 5);
            crossing3.receiveShadow = true;
            scene.add(crossing3);
            
            const crossing4 = new THREE.Mesh(crossingGeometry, crossingMaterial);
            crossing4.rotation.y = Math.PI / 2;
            crossing4.position.set(x * blockSize, 0.06, z * blockSize + 5);
            crossing4.receiveShadow = true;
            scene.add(crossing4);
        }
    }
}

// Buat blok berdasarkan tipe
function createBlock(type, x, z) {
    // Buat tanah
    const groundGeometry = new THREE.BoxGeometry(blockSize - 10, 0.5, blockSize - 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7CB342,
        roughness: 0.9,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(x, -0.25, z);
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Buat konten blok berdasarkan tipe
    switch(type) {
        case 0: // Perumahan
            createHousingBlock(x, z);
            break;
        case 1: // Pertanian
            createFarmingBlock(x, z);
            break;
        case 2: // Hutan
            createForestBlock(x, z);
            break;
        case 3: // Fasilitas publik
            createPublicFacilityBlock(x, z);
            break;
    }
}

// Buat kendaraan bergerak
function createVehicles() {
    const vehicleColors = [0xE53935, 0x43A047, 0x1E88E5, 0xFDD835, 0x8E24AA];
    const vehicleCount = 20;
    
    for (let i = 0; i < vehicleCount; i++) {
        // Posisi acak di jalan
        const isHorizontal = Math.random() > 0.5;
        const lanePosition = Math.floor(Math.random() * (gridSize + 1)) - Math.floor(gridSize/2) - 0.5;
        const laneOffset = (Math.random() > 0.5 ? 1 : -1) * 3; // Offset untuk jalur berbeda
        
        let x, z, direction;
        
        if (isHorizontal) {
            x = (Math.random() - 0.5) * blockSize * gridSize;
            z = lanePosition * blockSize + laneOffset;
            direction = new THREE.Vector3(Math.random() > 0.5 ? 1 : -1, 0, 0);
        } else {
            x = lanePosition * blockSize + laneOffset;
            z = (Math.random() - 0.5) * blockSize * gridSize;
            direction = new THREE.Vector3(0, 0, Math.random() > 0.5 ? 1 : -1);
        }
        
        // Buat kendaraan
        const vehicle = createVehicle(vehicleColors[Math.floor(Math.random() * vehicleColors.length)]);
        vehicle.position.set(x, 0.6, z);
        
        // Rotasi sesuai arah
        if (isHorizontal) {
            vehicle.rotation.y = direction.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            vehicle.rotation.y = direction.z > 0 ? 0 : Math.PI;
        }
        
        scene.add(vehicle);
        
        // Simpan data kendaraan
        vehicles.push({
            mesh: vehicle,
            direction: direction,
            speed: 0.1 + Math.random() * 0.2,
            isHorizontal: isHorizontal,
            lanePosition: lanePosition
        });
    }
}

// Buat awan bergerak
function createClouds() {
    const cloudCount = 10;
    
    for (let i = 0; i < cloudCount; i++) {
        const cloud = createCloud();
        
        // Posisi acak
        const x = (Math.random() - 0.5) * blockSize * gridSize * 2;
        const y = 50 + Math.random() * 30;
        const z = (Math.random() - 0.5) * blockSize * gridSize * 2;
        
        cloud.position.set(x, y, z);
        scene.add(cloud);
        
        // Simpan data awan
        clouds.push({
            mesh: cloud,
            speed: 0.05 + Math.random() * 0.1,
            direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()
        });
    }
}

// Fungsi untuk animasi
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Update posisi kendaraan
    updateVehicles(delta);
    
    // Update posisi awan
    updateClouds(delta);
    
    // Animasi rumput
    animateGrass(delta);
    
    // Update kontrol
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Update posisi kendaraan
function updateVehicles(delta) {
    const gridWorldSize = gridSize * blockSize;
    
    vehicles.forEach(vehicle => {
        // Pindahkan kendaraan
        vehicle.mesh.position.x += vehicle.direction.x * vehicle.speed;
        vehicle.mesh.position.z += vehicle.direction.z * vehicle.speed;
        
        // Wrapping - jika keluar dari grid, pindahkan ke sisi lain
        if (vehicle.isHorizontal) {
            if (vehicle.mesh.position.x > gridWorldSize / 2) {
                vehicle.mesh.position.x = -gridWorldSize / 2;
            } else if (vehicle.mesh.position.x < -gridWorldSize / 2) {
                vehicle.mesh.position.x = gridWorldSize / 2;
            }
        } else {
            if (vehicle.mesh.position.z > gridWorldSize / 2) {
                vehicle.mesh.position.z = -gridWorldSize / 2;
            } else if (vehicle.mesh.position.z < -gridWorldSize / 2) {
                vehicle.mesh.position.z = gridWorldSize / 2;
            }
        }
    });
}

// Update posisi awan
function updateClouds(delta) {
    const gridWorldSize = gridSize * blockSize * 2;
    
    clouds.forEach(cloud => {
        // Pindahkan awan
        cloud.mesh.position.x += cloud.direction.x * cloud.speed;
        cloud.mesh.position.z += cloud.direction.z * cloud.speed;
        
        // Wrapping - jika keluar dari grid, pindahkan ke sisi lain
        if (cloud.mesh.position.x > gridWorldSize) {
            cloud.mesh.position.x = -gridWorldSize;
        } else if (cloud.mesh.position.x < -gridWorldSize) {
            cloud.mesh.position.x = gridWorldSize;
        }
        
        if (cloud.mesh.position.z > gridWorldSize) {
            cloud.mesh.position.z = -gridWorldSize;
        } else if (cloud.mesh.position.z < -gridWorldSize) {
            cloud.mesh.position.z = gridWorldSize;
        }
    });
}

// Fungsi untuk membuat blok perumahan
function createHousingBlock(x, z) {
    const houseCount = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < houseCount; i++) {
        // Posisi acak dalam blok
        const offsetX = (Math.random() - 0.5) * (blockSize - 20);
        const offsetZ = (Math.random() - 0.5) * (blockSize - 20);
        
        // Buat rumah
        const house = createHouse(0xE57373, 0x795548);
        house.position.set(x + offsetX, 0, z + offsetZ);
        
        // Rotasi acak
        house.rotation.y = Math.floor(Math.random() * 4) * Math.PI / 2;
        
        scene.add(house);
    }
}

// Fungsi untuk membuat blok pertanian
function createFarmingBlock(x, z) {
    // Buat lahan pertanian
    const farmGeometry = new THREE.BoxGeometry(blockSize - 15, 0.2, blockSize - 15);
    const farmMaterial = new THREE.MeshStandardMaterial({ color: 0xA5D6A7 });
    const farm = new THREE.Mesh(farmGeometry, farmMaterial);
    farm.position.set(x, 0.1, z);
    farm.receiveShadow = true;
    scene.add(farm);
    
    // Buat tanaman
    const rows = 5;
    const cols = 5;
    const spacing = (blockSize - 20) / rows;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const plantX = x - (blockSize - 20) / 2 + i * spacing;
            const plantZ = z - (blockSize - 20) / 2 + j * spacing;
            
            const plant = createPlant();
            plant.position.set(plantX, 0.2, plantZ);
            scene.add(plant);
        }
    }
}

// Fungsi untuk membuat blok hutan
function createForestBlock(x, z) {
    const treeCount = 10 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < treeCount; i++) {
        // Posisi acak dalam blok
        const offsetX = (Math.random() - 0.5) * (blockSize - 15);
        const offsetZ = (Math.random() - 0.5) * (blockSize - 15);
        
        // Buat pohon
        const tree = createTree();
        tree.position.set(x + offsetX, 0, z + offsetZ);
        scene.add(tree);
    }
}

// Fungsi untuk membuat blok fasilitas publik
function createPublicFacilityBlock(x, z) {
    // Buat bangunan utama
    const building = createPublicBuilding();
    building.position.set(x, 0, z);
    scene.add(building);
    
    // Buat beberapa pohon dekoratif
    for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2;
        const offsetX = Math.cos(angle) * (blockSize / 3);
        const offsetZ = Math.sin(angle) * (blockSize / 3);
        
        const tree = createTree();
        tree.scale.set(0.7, 0.7, 0.7);
        tree.position.set(x + offsetX, 0, z + offsetZ);
        scene.add(tree);
    }
}

// Fungsi untuk membuat rumah
function createHouse(wallColor = 0xE57373, roofColor = 0x795548) {
    const house = new THREE.Group();
    
    // Dinding rumah
    const wallsGeometry = new THREE.BoxGeometry(5, 3, 5);
    const wallsMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
    const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
    walls.position.y = 1.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);
    
    // Atap rumah
    const roofGeometry = new THREE.ConeGeometry(4, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.castShadow = true;
    house.add(roof);
    
    return house;
}

// Fungsi untuk membuat pohon
function createTree() {
    const tree = new THREE.Group();
    
    // Batang pohon
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Daun pohon
    const leavesGeometry = new THREE.ConeGeometry(3, 6, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x66BB6A });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 6;
    leaves.castShadow = true;
    tree.add(leaves);
    
    return tree;
}

// Fungsi untuk membuat tanaman
function createPlant() {
    const plant = new THREE.Group();
    
    // Batang tanaman
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.5;
    stem.castShadow = true;
    plant.add(stem);
    
    // Daun tanaman
    const leavesGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x66BB6A });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 1;
    leaves.scale.set(1, 0.5, 1);
    leaves.castShadow = true;
    plant.add(leaves);
    
    return plant;
}

// Fungsi untuk membuat bangunan publik
function createPublicBuilding() {
    const building = new THREE.Group();
    
    // Bangunan utama
    const mainGeometry = new THREE.BoxGeometry(15, 10, 15);
    const mainMaterial = new THREE.MeshStandardMaterial({ color: 0x64B5F6 });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 5;
    main.castShadow = true;
    main.receiveShadow = true;
    building.add(main);
    
    // Atap
    const roofGeometry = new THREE.BoxGeometry(17, 1, 17);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1976D2 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10.5;
    roof.castShadow = true;
    building.add(roof);
    
    return building;
}

// Fungsi untuk membuat kendaraan
function createVehicle(color) {
    const vehicle = new THREE.Group();
    
    // Badan kendaraan
    const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    vehicle.add(body);
    
    // Kabin kendaraan
    const cabinGeometry = new THREE.BoxGeometry(2, 1, 1.8);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x90CAF9 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-0.5, 1.5, 0);
    cabin.castShadow = true;
    vehicle.add(cabin);
    
    return vehicle;
}

// Fungsi untuk membuat awan
function createCloud() {
    const cloud = new THREE.Group();
    
    // Buat beberapa bola untuk membentuk awan
    const sphereGeometry = new THREE.SphereGeometry(1, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.9
    });
    
    // Posisi relatif untuk bola-bola awan
    const positions = [
        [0, 0, 0],
        [1, 0.2, 0],
        [-1, 0.3, 0],
        [0, 0.2, 1],
        [0, 0.1, -1]
    ];
    
    // Ukuran acak untuk bola-bola awan
    const scales = [
        [1.5, 1.5, 1.5],
        [1.2, 1.2, 1.2],
        [1.3, 1.3, 1.3],
        [1.1, 1.1, 1.1],
        [1.4, 1.4, 1.4]
    ];
    
    // Buat bola-bola awan
    for (let i = 0; i < positions.length; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
        sphere.position.set(positions[i][0] * 2, positions[i][1] * 2, positions[i][2] * 2);
        sphere.scale.set(scales[i][0], scales[i][1], scales[i][2]);
        cloud.add(sphere);
    }
    
    // Skala keseluruhan awan
    cloud.scale.set(3, 2, 3);
    
    return cloud;
}

// Fungsi untuk membuat rumput sederhana dengan instancing
function createGrass() {
    // Buat geometri dasar untuk satu rumput
    const grassGeometry = new THREE.PlaneGeometry(1, 2);
    grassGeometry.translate(0, 1, 0); // Pindahkan pivot point ke bawah
    
    // Buat material dengan tekstur rumput
    const grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    });
    
    // Jumlah instance rumput
    const instanceCount = 10000;
    
    // Buat mesh instanced
    grassInstances = new THREE.InstancedMesh(
        grassGeometry,
        grassMaterial,
        instanceCount
    );
    
    // Matriks transformasi untuk setiap instance
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    // Batas area rumput
    const extent = gridSize * blockSize / 2;
    
    // Atur posisi dan rotasi untuk setiap instance
    for (let i = 0; i < instanceCount; i++) {
        // Posisi acak dalam grid
        position.x = (Math.random() * 2 - 1) * extent;
        position.z = (Math.random() * 2 - 1) * extent;
        
        // Cek apakah posisi berada di jalan
        const isOnRoad = isPositionOnRoad(position.x, position.z);
        
        // Jika di jalan, lanjutkan ke iterasi berikutnya
        if (isOnRoad) {
            i--;
            continue;
        }
        
        // Rotasi acak
        rotation.y = Math.random() * Math.PI * 2;
        quaternion.setFromEuler(rotation);
        
        // Skala acak
        const grassHeight = 0.8 + Math.random() * 0.7;
        scale.set(0.3, grassHeight, 0.3);
        
        // Atur matriks transformasi
        matrix.compose(position, quaternion, scale);
        
        // Terapkan ke instance
        grassInstances.setMatrixAt(i, matrix);
        
        // Warna sedikit bervariasi
        const hue = 0.3 + (Math.random() * 0.1); // Hijau dengan variasi
        const saturation = 0.5 + (Math.random() * 0.3);
        const lightness = 0.4 + (Math.random() * 0.2);
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        grassInstances.setColorAt(i, color);
    }
    
    // Update buffers
    grassInstances.instanceMatrix.needsUpdate = true;
    if (grassInstances.instanceColor) grassInstances.instanceColor.needsUpdate = true;
    
    // Tambahkan ke scene
    grassInstances.castShadow = true;
    grassInstances.receiveShadow = true;
    scene.add(grassInstances);
}

// Fungsi untuk memeriksa apakah posisi berada di jalan
function isPositionOnRoad(x, z) {
    const roadWidth = 10;
    const halfRoadWidth = roadWidth / 2;
    
    // Jarak dari sumbu x dan z terdekat
    const gridX = Math.round(x / blockSize) * blockSize;
    const gridZ = Math.round(z / blockSize) * blockSize;
    
    const distX = Math.abs(x - gridX);
    const distZ = Math.abs(z - gridZ);
    
    // Jika dekat dengan sumbu grid (jalan), return true
    return (distX < halfRoadWidth || distZ < halfRoadWidth);
}

// Fungsi untuk menganimasikan rumput
function animateGrass(delta) {
    if (!grassInstances) return;
    
    // Waktu untuk animasi
    const time = clock.getElapsedTime();
    
    // Matriks untuk update
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    // Update setiap instance
    for (let i = 0; i < grassInstances.count; i++) {
        // Ambil matriks saat ini
        grassInstances.getMatrixAt(i, matrix);
        
        // Dekomposisi matriks
        matrix.decompose(position, quaternion, scale);
        
        // Konversi quaternion ke euler untuk modifikasi
        rotation.setFromQuaternion(quaternion);
        
        // Animasi bergoyang berdasarkan posisi dan waktu
        const swayAmount = 0.1;
        const swayFrequency = 1.5;
        
        // Variasi berdasarkan posisi
        const positionFactor = (Math.sin(position.x * 0.5) + Math.cos(position.z * 0.5)) * 0.5;
        
        // Animasi bergoyang
        rotation.z = Math.sin(time * swayFrequency + positionFactor) * swayAmount;
        
        // Konversi kembali ke quaternion
        quaternion.setFromEuler(rotation);
        
        // Rekomposisi matriks
        matrix.compose(position, quaternion, scale);
        
        // Terapkan kembali ke instance
        grassInstances.setMatrixAt(i, matrix);
    }
    
    // Update buffer
    grassInstances.instanceMatrix.needsUpdate = true;
}

// Fungsi untuk resize window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Fungsi untuk berbagi pengalaman
function shareExperience() {
    if (navigator.share) {
        navigator.share({
            title: 'TransmigrasiTown - Visualisasi Kawasan Transmigrasi',
            text: 'Jelajahi kawasan transmigrasi dalam visualisasi 3D yang interaktif!',
            url: window.location.href
        });
    } else {
        alert('Bagikan tautan ini: ' + window.location.href);
    }
}

// Fungsi untuk toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error saat mencoba masuk mode layar penuh: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Fungsi untuk memuat model rumput
function loadGrassModel() {
    // Gunakan GLTFLoader
    const loader = new THREE.GLTFLoader();
    
    // URL model rumput (ganti dengan URL model yang valid)
    const modelUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/grass/grass.glb';
    
    loader.load(
        modelUrl,
        function(gltf) {
            grassModel = gltf.scene;
            
            // Sesuaikan skala model
            grassModel.scale.set(0.1, 0.1, 0.1);
            
            // Buat instance rumput
            createGrassInstances();
        },
        function(xhr) {
            // Progress loading
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            updateLoadingProgress(xhr.loaded / xhr.total * 100);
        },
        function(error) {
            console.error('Error loading grass model:', error);
            // Fallback ke rumput sederhana jika gagal
            createGrass();
        }
    );
}

// Fungsi untuk membuat instance rumput dari model 3D
function createGrassInstances() {
    if (!grassModel) return;
    
    const instanceCount = 2000; // Kurangi jumlah untuk performa
    const extent = gridSize * blockSize / 2;
    
    // Buat grup untuk rumput
    const grassGroup = new THREE.Group();
    
    for (let i = 0; i < instanceCount; i++) {
        // Posisi acak
        const x = (Math.random() * 2 - 1) * extent;
        const z = (Math.random() * 2 - 1) * extent;
        
        // Cek apakah di jalan
        if (isPositionOnRoad(x, z)) {
            i--;
            continue;
        }
        
        // Clone model
        const grass = grassModel.clone();
        
        // Posisikan
        grass.position.set(x, 0, z);
        
        // Rotasi acak
        grass.rotation.y = Math.random() * Math.PI * 2;
        
        // Skala acak
        const scale = 0.08 + Math.random() * 0.04;
        grass.scale.set(scale, scale, scale);
        
        // Tambahkan ke grup
        grassGroup.add(grass);
    }
    
    // Tambahkan grup ke scene
    scene.add(grassGroup);
}

// Mulai aplikasi
init(); 