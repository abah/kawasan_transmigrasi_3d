// Variabel global
let scene, camera, renderer, controls;
let terrain, houses, farms, roads, publicBuildings;
let water;
let clock = new THREE.Clock();

// Inisialisasi scene
function init() {
    console.log("Inisialisasi Three.js...");
    
    // Membuat scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Warna langit biru muda
    scene.fog = new THREE.FogExp2(0xDFE9F3, 0.0025); // Menambahkan kabut untuk kedalaman
    
    // Membuat kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);
    
    // Membuat renderer dengan efek post-processing
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bayangan yang lebih halus
    document.body.appendChild(renderer.domElement);
    
    // Menambahkan kontrol orbit
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.45; // Membatasi rotasi ke bawah
    
    // Pencahayaan ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Pencahayaan directional (matahari)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Membuat elemen-elemen kawasan transmigrasi
    createTerrain();
    createWater();
    createHouses();
    createFarms();
    createRoads();
    createPublicBuildings();
    createTrees();
    
    // Membuat axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    
    // Tombol kontrol
    document.getElementById('viewFull').addEventListener('click', function() {
        console.log("Tombol viewFull diklik");
        gsap.to(camera.position, {
            x: 20,
            y: 20,
            z: 20,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });
    });
    
    document.getElementById('viewHousing').addEventListener('click', function() {
        console.log("Tombol viewHousing diklik");
        gsap.to(camera.position, {
            x: 0,
            y: 10,
            z: 15,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });
    });
    
    document.getElementById('viewFarms').addEventListener('click', function() {
        console.log("Tombol viewFarms diklik");
        gsap.to(camera.position, {
            x: 30,
            y: 10,
            z: 30,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(30, 0, 30);
            }
        });
    });
    
    document.getElementById('viewInfrastructure').addEventListener('click', function() {
        console.log("Tombol viewInfrastructure diklik");
        gsap.to(camera.position, {
            x: 5,
            y: 10,
            z: 0,
            duration: 1.5,
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });
    });
    
    // Mulai animasi
    animate();
}

// Membuat terrain (tanah dasar) yang lebih realistis
function createTerrain() {
    const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    
    // Membuat variasi ketinggian untuk terrain
    const vertices = geometry.attributes.position.array;
    
    // Membuat variasi ketinggian sederhana
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        
        // Membuat beberapa bukit dan lembah dengan fungsi matematika sederhana
        vertices[i + 2] = Math.sin(x / 10) * Math.cos(y / 10) * 3 + 
                          Math.sin(x / 20 + 5) * Math.cos(y / 20) * 2;
        
        // Tambahkan cekungan untuk danau
        const distanceToCenter = Math.sqrt(x * x + y * y);
        if (distanceToCenter < 15) {
            vertices[i + 2] = -1; // Cekungan untuk danau
        }
    }
    
    geometry.computeVertexNormals();
    
    // Material untuk terrain
    const terrainMaterial = new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide,
        flatShading: true
    });
    
    terrain = new THREE.Mesh(geometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
}

// Membuat danau/sungai
function createWater() {
    // Geometri untuk air
    const waterGeometry = new THREE.CircleGeometry(15, 32);
    
    // Material air dengan efek refleksi dan gelombang
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.8
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.8;
    scene.add(water);
}

// Menambahkan pohon-pohon
function createTrees() {
    // Membuat pohon
    for (let i = 0; i < 100; i++) {
        // Posisi acak di sekitar kawasan
        const x = Math.random() * 100 - 50;
        const z = Math.random() * 100 - 50;
        
        // Jarak dari pusat
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        // Hanya tambahkan pohon di luar area perumahan dan tidak di danau
        if (distanceFromCenter > 25 && distanceFromCenter < 45) {
            const tree = createTree();
            
            // Dapatkan ketinggian terrain di posisi ini (estimasi sederhana)
            const y = Math.sin(x / 10) * Math.cos(z / 10) * 3 + 
                     Math.sin(x / 20 + 5) * Math.cos(z / 20) * 2;
            
            tree.position.set(x, y, z);
            scene.add(tree);
        }
    }
}

// Membuat satu pohon
function createTree() {
    const tree = new THREE.Group();
    
    // Batang pohon
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    
    // Daun pohon
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    leaves.castShadow = true;
    tree.add(leaves);
    
    return tree;
}

// Membuat perumahan transmigran yang lebih realistis
function createHouses() {
    houses = new THREE.Group();
    
    // Membuat beberapa rumah dalam pola grid
    for (let x = -20; x <= 20; x += 10) {
        for (let z = -20; z <= 20; z += 10) {
            if (Math.random() > 0.3) { // Beberapa area kosong
                const house = createHouse();
                
                // Estimasi ketinggian terrain di posisi ini
                const y = Math.sin(x / 10) * Math.cos(z / 10) * 3 + 
                         Math.sin(x / 20 + 5) * Math.cos(z / 20) * 2;
                
                house.position.set(x + (Math.random() * 2 - 1), y, z + (Math.random() * 2 - 1));
                house.rotation.y = Math.random() * Math.PI * 2;
                houses.add(house);
                
                // Tambahkan halaman dan pagar
                createYard(x, y, z);
            }
        }
    }
    
    scene.add(houses);
}

// Membuat satu rumah dengan detail lebih
function createHouse() {
    const house = new THREE.Group();
    
    // Dinding rumah
    const wallGeometry = new THREE.BoxGeometry(3, 2, 4);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0,
        roughness: 0.7,
        metalness: 0.1
    });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 1;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);
    
    // Atap rumah
    const roofGeometry = new THREE.ConeGeometry(3, 1.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8d6e63,
        roughness: 0.6,
        metalness: 0.2
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    // Pintu
    const doorGeometry = new THREE.PlaneGeometry(0.8, 1.5);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5d4037, 
        side: THREE.DoubleSide,
        roughness: 0.5
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.75, 2.01);
    house.add(door);
    
    // Jendela
    const windowGeometry = new THREE.PlaneGeometry(0.7, 0.7);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xbbdefb, 
        side: THREE.DoubleSide,
        roughness: 0.2,
        metalness: 0.8
    });
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-1, 1.2, 2.01);
    house.add(window1);
    
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(1, 1.2, 2.01);
    house.add(window2);
    
    return house;
}

// Membuat halaman rumah
function createYard(x, y, z) {
    // Pagar sederhana
    const fenceGeometry = new THREE.BoxGeometry(8, 0.5, 0.1);
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
    
    // Pagar depan
    const frontFence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    frontFence.position.set(x, y + 0.25, z + 4);
    scene.add(frontFence);
    
    // Pagar belakang
    const backFence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    backFence.position.set(x, y + 0.25, z - 4);
    scene.add(backFence);
    
    // Pagar kiri
    const leftFence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    leftFence.rotation.y = Math.PI / 2;
    leftFence.position.set(x - 4, y + 0.25, z);
    scene.add(leftFence);
    
    // Pagar kanan
    const rightFence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    rightFence.rotation.y = Math.PI / 2;
    rightFence.position.set(x + 4, y + 0.25, z);
    scene.add(rightFence);
}

// Membuat lahan pertanian
function createFarms() {
    farms = new THREE.Group();
    
    // Membuat beberapa area pertanian
    for (let x = -40; x <= 40; x += 20) {
        for (let z = -40; z <= 40; z += 20) {
            if (Math.abs(x) > 25 || Math.abs(z) > 25) { // Pertanian di pinggiran
                const farm = createFarm();
                
                // Estimasi ketinggian terrain di posisi ini
                const y = Math.sin(x / 10) * Math.cos(z / 10) * 3 + 
                         Math.sin(x / 20 + 5) * Math.cos(z / 20) * 2;
                
                farm.position.set(x, y + 0.1, z);
                farms.add(farm);
            }
        }
    }
    
    scene.add(farms);
}

// Membuat satu lahan pertanian
function createFarm() {
    const farm = new THREE.Group();
    
    // Tanah pertanian
    const fieldGeometry = new THREE.PlaneGeometry(15, 15, 5, 5);
    const fieldMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8d6e63, 
        side: THREE.DoubleSide 
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    farm.add(field);
    
    // Tanaman (representasi sederhana)
    for (let i = 0; i < 50; i++) {
        const plantGeometry = new THREE.ConeGeometry(0.2, 0.8, 4);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x33691e });
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        
        // Posisi acak dalam lahan
        const x = Math.random() * 12 - 6;
        const z = Math.random() * 12 - 6;
        plant.position.set(x, 0.4, z);
        plant.castShadow = true;
        farm.add(plant);
    }
    
    return farm;
}

// Membuat jalan
function createRoads() {
    roads = new THREE.Group();
    
    // Jalan utama horizontal
    const mainRoadGeometry = new THREE.PlaneGeometry(100, 5);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x424242, 
        side: THREE.DoubleSide 
    });
    const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.05;
    roads.add(mainRoad);
    
    // Jalan utama vertikal
    const crossRoadGeometry = new THREE.PlaneGeometry(5, 100);
    const crossRoad = new THREE.Mesh(crossRoadGeometry, roadMaterial);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.y = 0.05;
    roads.add(crossRoad);
    
    // Jalan-jalan kecil
    for (let i = -40; i <= 40; i += 20) {
        if (i !== 0) { // Hindari tumpang tindih dengan jalan utama
            // Jalan horizontal
            const smallRoadH = new THREE.Mesh(
                new THREE.PlaneGeometry(100, 3),
                roadMaterial
            );
            smallRoadH.rotation.x = -Math.PI / 2;
            smallRoadH.position.set(0, 0.05, i);
            roads.add(smallRoadH);
            
            // Jalan vertikal
            const smallRoadV = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 100),
                roadMaterial
            );
            smallRoadV.rotation.x = -Math.PI / 2;
            smallRoadV.position.set(i, 0.05, 0);
            roads.add(smallRoadV);
        }
    }
    
    scene.add(roads);
}

// Membuat bangunan publik
function createPublicBuildings() {
    publicBuildings = new THREE.Group();
    
    // Kantor administrasi (di pusat)
    const adminBuilding = createPublicBuilding(0x1976d2, 6, 4, 8);
    adminBuilding.position.set(0, 0, 0);
    publicBuildings.add(adminBuilding);
    
    // Sekolah
    const school = createPublicBuilding(0xffa000, 8, 3, 6);
    school.position.set(-15, 0, 15);
    publicBuildings.add(school);
    
    // Klinik kesehatan
    const clinic = createPublicBuilding(0xf44336, 5, 3, 7);
    clinic.position.set(15, 0, -15);
    publicBuildings.add(clinic);
    
    // Pasar
    const market = createPublicBuilding(0x7cb342, 10, 2, 10);
    market.position.set(15, 0, 15);
    publicBuildings.add(market);
    
    scene.add(publicBuildings);
}

// Membuat satu bangunan publik
function createPublicBuilding(color, width, height, depth) {
    const building = new THREE.Group();
    
    // Struktur utama
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const structure = new THREE.Mesh(geometry, material);
    structure.position.y = height / 2;
    structure.castShadow = true;
    structure.receiveShadow = true;
    building.add(structure);
    
    // Atap
    const roofGeometry = new THREE.BoxGeometry(width + 1, 0.5, depth + 1);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x424242 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.25;
    roof.castShadow = true;
    building.add(roof);
    
    return building;
}

// Event handlers
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animasi
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Animasi air bergelombang
    if (water) {
        water.rotation.z += 0.05 * delta;
    }
    
    // Update kontrol
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Memulai aplikasi
console.log("Memulai aplikasi Three.js");
init(); 