// Variabel model
let buildings = [];
let vehicles = [];
let people = [];
let trees = [];

// Inisialisasi model
function initModels() {
    // Buat kawasan kota
    createCity();
    
    // Buat kendaraan
    createVehicles();
    
    // Buat orang-orang
    createPeople();
    
    // Buat pohon
    createTrees();
}

// Buat kawasan kota
function createCity() {
    // Buat kawasan perumahan (kuadran 1)
    createResidentialArea();
    
    // Buat kawasan industri (kuadran 2)
    createIndustrialArea();
    
    // Buat kawasan pertanian (kuadran 3)
    createAgriculturalArea();
    
    // Buat kawasan riset (kuadran 4)
    createResearchArea();
    
    // Buat jalan
    createRoads();
}

// Buat kawasan perumahan
function createResidentialArea() {
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 100 + 50;
        const z = Math.random() * 100 + 50;
        
        const house = createHouse();
        house.position.set(x, 0, z);
        house.rotation.y = Math.random() * Math.PI * 2;
        house.userData = { type: 'residential' };
        scene.add(house);
        buildings.push(house);
    }
}

// Buat kawasan industri
function createIndustrialArea() {
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 100 - 150;
        const z = Math.random() * 100 + 50;
        
        const factory = createFactory();
        factory.position.set(x, 0, z);
        factory.rotation.y = Math.random() * Math.PI * 2;
        factory.userData = { type: 'industrial' };
        scene.add(factory);
        buildings.push(factory);
    }
}

// Buat kawasan pertanian
function createAgriculturalArea() {
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 100 - 150;
        const z = Math.random() * 100 - 150;
        
        const farm = createFarm();
        farm.position.set(x, 0, z);
        farm.rotation.y = Math.random() * Math.PI * 2;
        farm.userData = { type: 'agricultural' };
        scene.add(farm);
        buildings.push(farm);
    }
}

// Buat kawasan riset
function createResearchArea() {
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 100 + 50;
        const z = Math.random() * 100 - 150;
        
        const research = createResearchBuilding();
        research.position.set(x, 0, z);
        research.rotation.y = Math.random() * Math.PI * 2;
        research.userData = { type: 'research' };
        scene.add(research);
        buildings.push(research);
    }
}

// Buat jalan
function createRoads() {
    // Jalan horizontal
    const roadHGeometry = new THREE.BoxGeometry(500, 0.1, 20);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.9,
        metalness: 0.2
    });
    const roadH = new THREE.Mesh(roadHGeometry, roadMaterial);
    roadH.position.y = 0.05;
    roadH.receiveShadow = true;
    scene.add(roadH);
    
    // Jalan vertikal
    const roadVGeometry = new THREE.BoxGeometry(20, 0.1, 500);
    const roadV = new THREE.Mesh(roadVGeometry, roadMaterial);
    roadV.position.y = 0.05;
    roadV.receiveShadow = true;
    scene.add(roadV);
    
    // Tambahkan garis jalan
    addRoadLines();
    
    // Tambahkan jalan melingkar
    addCircularRoad();
}

// Tambahkan garis jalan
function addRoadLines() {
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    // Garis horizontal
    const lineHGeometry = new THREE.BoxGeometry(500, 0.1, 1);
    const lineH = new THREE.Mesh(lineHGeometry, lineMaterial);
    lineH.position.y = 0.06;
    scene.add(lineH);
    
    // Garis vertikal
    const lineVGeometry = new THREE.BoxGeometry(1, 0.1, 500);
    const lineV = new THREE.Mesh(lineVGeometry, lineMaterial);
    lineV.position.y = 0.06;
    scene.add(lineV);
}

// Tambahkan jalan melingkar
function addCircularRoad() {
    const segments = 64;
    const radius = 100;
    
    // Buat geometri jalan melingkar
    const roadGeometry = new THREE.RingGeometry(radius - 10, radius + 10, segments);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.9,
        metalness: 0.2
    });
    
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.05;
    road.receiveShadow = true;
    scene.add(road);
    
    // Tambahkan garis jalan
    const lineGeometry = new THREE.RingGeometry(radius - 0.5, radius + 0.5, segments);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.06;
    scene.add(line);
}

// Buat kendaraan
function createVehicles() {
    // Buat kendaraan di jalan horizontal
    for (let i = 0; i < 10; i++) {
        const vehicle = createVehicle();
        const direction = Math.random() > 0.5 ? 1 : -1;
        const x = Math.random() * 500 - 250;
        const z = direction > 0 ? -5 : 5;
        
        vehicle.position.set(x, 1, z);
        vehicle.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        
        vehicle.userData = {
            road: 'horizontal',
            direction: direction,
            speed: 0.2 + Math.random() * 0.3
        };
        
        scene.add(vehicle);
        vehicles.push(vehicle);
    }
    
    // Buat kendaraan di jalan vertikal
    for (let i = 0; i < 10; i++) {
        const vehicle = createVehicle();
        const direction = Math.random() > 0.5 ? 1 : -1;
        const z = Math.random() * 500 - 250;
        const x = direction > 0 ? -5 : 5;
        
        vehicle.position.set(x, 1, z);
        vehicle.rotation.y = direction > 0 ? 0 : Math.PI;
        
        vehicle.userData = {
            road: 'vertical',
            direction: direction,
            speed: 0.2 + Math.random() * 0.3
        };
        
        scene.add(vehicle);
        vehicles.push(vehicle);
    }
    
    // Buat kendaraan di jalan melingkar
    for (let i = 0; i < 8; i++) {
        const vehicle = createVehicle();
        const angle = Math.random() * Math.PI * 2;
        const radius = 100;
        
        vehicle.position.x = Math.cos(angle) * radius;
        vehicle.position.y = 1;
        vehicle.position.z = Math.sin(angle) * radius;
        vehicle.rotation.y = angle + Math.PI / 2;
        
        vehicle.userData = {
            road: 'circular',
            angle: angle,
            radius: radius,
            speed: 0.2 + Math.random() * 0.3
        };
        
        scene.add(vehicle);
        vehicles.push(vehicle);
    }
}

// Buat kendaraan
function createVehicle() {
    const vehicle = new THREE.Group();
    
    // Badan kendaraan
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: getRandomColor(),
        roughness: 0.5,
        metalness: 0.7
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    vehicle.add(body);
    
    // Kaca depan
    const windshieldGeometry = new THREE.BoxGeometry(1, 1, 1.8);
    const windshieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEFA,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7
    });
    
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(1, 1.5, 0);
    vehicle.add(windshield);
    
    // Roda
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Roda depan kiri
    const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelFL.position.set(1.5, 0.5, -1.1);
    wheelFL.rotation.z = Math.PI / 2;
    vehicle.add(wheelFL);
    
    // Roda depan kanan
    const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelFR.position.set(1.5, 0.5, 1.1);
    wheelFR.rotation.z = Math.PI / 2;
    vehicle.add(wheelFR);
    
    // Roda belakang kiri
    const wheelBL = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelBL.position.set(-1.5, 0.5, -1.1);
    wheelBL.rotation.z = Math.PI / 2;
    vehicle.add(wheelBL);
    
    // Roda belakang kanan
    const wheelBR = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelBR.position.set(-1.5, 0.5, 1.1);
    wheelBR.rotation.z = Math.PI / 2;
    vehicle.add(wheelBR);
    
    return vehicle;
}

// Buat orang-orang
function createPeople() {
    // Tambahkan orang di berbagai area
    for (let i = 0; i < 30; i++) {
        const person = createPerson();
        
        // Tentukan area
        let x, z;
        
        if (i < 10) { // Perumahan
            x = Math.random() * 100 + 50;
            z = Math.random() * 100 + 50;
        } else if (i < 15) { // Industri
            x = Math.random() * 100 - 150;
            z = Math.random() * 100 + 50;
        } else if (i < 20) { // Pertanian
            x = Math.random() * 100 - 150;
            z = Math.random() * 100 - 150;
        } else { // Riset
            x = Math.random() * 100 + 50;
            z = Math.random() * 100 - 150;
        }
        
        person.position.set(x, 0, z);
        
        // Data untuk animasi
        person.userData = {
            startX: x,
            startZ: z,
            walkRadius: 10 + Math.random() * 10,
            direction: Math.random() * Math.PI * 2,
            speed: 0.05 + Math.random() * 0.05
        };
        
        scene.add(person);
        people.push(person);
    }
}

// Buat orang
function createPerson() {
    const person = new THREE.Group();
    
    // Kepala
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7;
    head.castShadow = true;
    person.add(head);
    
    // Badan
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: getRandomColor(),
        roughness: 0.7,
        metalness: 0.1
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    person.add(body);
    
    // Kaki
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000FF,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const legL = new THREE.Mesh(legGeometry, legMaterial);
    legL.position.set(0.2, 0.4, 0);
    legL.castShadow = true;
    person.add(legL);
    
    const legR = new THREE.Mesh(legGeometry, legMaterial);
    legR.position.set(-0.2, 0.4, 0);
    legR.castShadow = true;
    person.add(legR);
    
    return person;
}

// Buat pohon
function createTrees() {
    // Tambahkan pohon di sekitar kawasan
    for (let i = 0; i < 100; i++) {
        const tree = createTree();
        
        // Posisi acak di sekitar kawasan
        let x, z;
        
        // Hindari jalan
        do {
            x = Math.random() * 400 - 200;
            z = Math.random() * 400 - 200;
        } while (
            (Math.abs(x) < 15 && Math.abs(z) < 250) || // Jalan vertikal
            (Math.abs(z) < 15 && Math.abs(x) < 250) || // Jalan horizontal
            (Math.sqrt(x*x + z*z) > 90 && Math.sqrt(x*x + z*z) < 110) // Jalan melingkar
        );
        
        // Tambahkan variasi skala untuk pohon yang lebih realistis
        const scale = 0.5 + Math.random() * 0.5;
        tree.scale.set(scale, scale, scale);
        
        // Tambahkan sedikit rotasi acak untuk variasi
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        tree.position.set(x, 0, z);
        scene.add(tree);
        trees.push(tree);
    }
    
    // Tambahkan kelompok pohon di area tertentu (hutan kecil)
    createForestCluster(150, 150, 20, 15); // Hutan di kuadran 1
    createForestCluster(-150, 150, 20, 15); // Hutan di kuadran 2
    createForestCluster(-150, -150, 20, 15); // Hutan di kuadran 3
    createForestCluster(150, -150, 20, 15); // Hutan di kuadran 4
}

// Buat kelompok pohon (hutan kecil)
function createForestCluster(centerX, centerZ, radius, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        const x = centerX + Math.cos(angle) * distance;
        const z = centerZ + Math.sin(angle) * distance;
        
        const tree = createTree();
        
        // Variasi skala untuk pohon yang lebih realistis
        const scale = 0.5 + Math.random() * 0.7;
        tree.scale.set(scale, scale, scale);
        
        // Tambahkan sedikit rotasi acak
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        tree.position.set(x, 0, z);
        scene.add(tree);
        trees.push(tree);
    }
}

// Buat pohon
function createTree() {
    // Gunakan placeholder sementara
    const placeholder = new THREE.Group();
    
    // Jika THREEx.Tree tersedia, gunakan pohon procedural
    if (typeof THREEx !== 'undefined' && THREEx.Tree) {
        // Buat pohon dengan parameter acak untuk variasi
        const height = 5 + Math.random() * 5;
        const radius = 0.3 + Math.random() * 0.5;
        const detail = 3 + Math.floor(Math.random() * 3);
        
        THREEx.Tree.createTree({
            trunkHeight: height,
            trunkRadius: radius,
            detail: detail
        }, function(tree) {
            // Tambahkan pohon ke placeholder
            placeholder.add(tree);
        });
        
        return placeholder;
    }
    
    // Fallback jika THREEx.Tree tidak tersedia
    // Batang
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2.5;
    trunk.castShadow = true;
    placeholder.add(trunk);
    
    // Daun
    const leavesGeometry = new THREE.SphereGeometry(3, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 7;
    leaves.castShadow = true;
    placeholder.add(leaves);
    
    return placeholder;
}

// Buat rumah
function createHouse() {
    const house = new THREE.Group();
    
    // Badan rumah
    const bodyGeometry = new THREE.BoxGeometry(10, 8, 15);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0xF5F5DC : 0xD3D3D3,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 4;
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);
    
    // Atap
    const roofGeometry = new THREE.ConeGeometry(10, 6, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0xA52A2A,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 11;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    // Pintu
    const doorGeometry = new THREE.PlaneGeometry(3, 5);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.5, 7.51);
    house.add(door);
    
    // Jendela
    const windowGeometry = new THREE.PlaneGeometry(2, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEFA,
        roughness: 0.3,
        metalness: 0.8
    });
    
    const windowL = new THREE.Mesh(windowGeometry, windowMaterial);
    windowL.position.set(-3, 5, 7.51);
    house.add(windowL);
    
    const windowR = new THREE.Mesh(windowGeometry, windowMaterial);
    windowR.position.set(3, 5, 7.51);
    house.add(windowR);
    
    // Tambahkan userData untuk identifikasi
    house.userData = { type: 'residential' };
    
    return house;
}

// Buat pabrik
function createFactory() {
    const factory = new THREE.Group();
    
    // Bangunan utama
    const mainGeometry = new THREE.BoxGeometry(20, 15, 30);
    const mainMaterial = new THREE.MeshStandardMaterial({
        color: 0xA9A9A9,
        roughness: 0.8,
        metalness: 0.3
    });
    
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 7.5;
    main.castShadow = true;
    main.receiveShadow = true;
    factory.add(main);
    
    // Cerobong asap
    const chimneyGeometry = new THREE.CylinderGeometry(2, 2, 10, 16);
    const chimneyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B0000,
        roughness: 0.7,
        metalness: 0.2
    });
    
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(5, 17, 5);
    chimney.castShadow = true;
    factory.add(chimney);
    
    // Tambahkan userData untuk identifikasi
    factory.userData = { type: 'industrial' };
    
    return factory;
}

// Buat area pertanian
function createFarm() {
    const farm = new THREE.Group();
    
    // Tanah pertanian
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.01;
    ground.receiveShadow = true;
    farm.add(ground);
    
    // Rumah petani
    const farmhouse = createSimpleBuilding();
    farmhouse.position.set(0, 0, -10);
    farm.add(farmhouse);
    
    // Tanaman
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        
        const plant = createPlant();
        plant.position.set(
            (col - 1.5) * 6,
            0,
            (row - 1.5) * 6 + 5
        );
        farm.add(plant);
    }
    
    // Tambahkan userData untuk identifikasi
    farm.userData = { type: 'agricultural' };
    
    return farm;
}

// Buat bangunan sederhana
function createSimpleBuilding() {
    const building = new THREE.Group();
    
    // Badan bangunan
    const bodyGeometry = new THREE.BoxGeometry(8, 6, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xD2B48C,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 3;
    body.castShadow = true;
    body.receiveShadow = true;
    building.add(body);
    
    // Atap
    const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    building.add(roof);
    
    return building;
}

// Buat tanaman
function createPlant() {
    const plant = new THREE.Group();
    
    // Batang
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 1;
    stem.castShadow = true;
    plant.add(stem);
    
    // Daun
    const leafGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x32CD32,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.y = 2;
    leaf.scale.set(1, 0.5, 1);
    leaf.castShadow = true;
    plant.add(leaf);
    
    return plant;
}

// Buat gedung riset
function createResearchBuilding() {
    const building = new THREE.Group();
    
    // Bangunan utama
    const mainGeometry = new THREE.BoxGeometry(20, 30, 20);
    const mainMaterial = new THREE.MeshStandardMaterial({
        color: 0xADD8E6,
        roughness: 0.5,
        metalness: 0.5
    });
    
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 15;
    main.castShadow = true;
    main.receiveShadow = true;
    building.add(main);
    
    // Antena
    const antennaGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        roughness: 0.3,
        metalness: 0.8
    });
    
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.y = 35;
    antenna.castShadow = true;
    building.add(antenna);
    
    return building;
}

// Fungsi utilitas untuk warna acak
function getRandomColor() {
    const colors = [
        0xFF0000, // Merah
        0x00FF00, // Hijau
        0x0000FF, // Biru
        0xFFFF00, // Kuning
        0xFF00FF, // Magenta
        0x00FFFF, // Cyan
        0xFFA500, // Oranye
        0x800080, // Ungu
        0x008000, // Hijau tua
        0x000080  // Biru tua
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
} 