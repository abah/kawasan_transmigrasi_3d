// Mendapatkan ketinggian terrain pada posisi tertentu
function getTerrainHeight(x, z) {
    // Menggunakan simplex noise untuk konsistensi dengan terrain
    const nx = x / 200;
    const nz = z / 200;
    
    let height = 0;
    height += simplex.noise2D(nx * 1, nz * 1) * 1.0;
    height += simplex.noise2D(nx * 2, nz * 2) * 0.5;
    height += simplex.noise2D(nx * 4, nz * 4) * 0.25;
    
    // Pastikan area perumahan dan jalan selalu di atas level air
    const distanceFromCenter = Math.sqrt(x*x + z*z);
    if (distanceFromCenter < 40) {
        // Area pusat selalu lebih tinggi (minimal 2 unit di atas level air)
        height = Math.max(height, 2);
    }
    
    return height * 10;
}

// Membuat terrain
function createTerrain() {
    const size = 200;
    const resolution = 128;
    const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    geometry.rotateX(-Math.PI / 2);
    
    // Menggunakan simplex noise untuk membuat terrain yang lebih alami
    const vertices = geometry.attributes.position.array;
    
    // Array untuk menyimpan warna vertex
    const colors = new Float32Array(vertices.length);
    
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Normalisasi koordinat untuk noise
        const nx = x / size;
        const nz = z / size;
        
        // Menggabungkan beberapa oktaf noise untuk detail yang lebih baik
        let height = 0;
        height += simplex.noise2D(nx * 1, nz * 1) * 1.0;
        height += simplex.noise2D(nx * 2, nz * 2) * 0.5;
        height += simplex.noise2D(nx * 4, nz * 4) * 0.25;
        height += simplex.noise2D(nx * 8, nz * 8) * 0.125;
        
        // Skala ketinggian
        height *= 10;
        
        // Pastikan area jalan dan perumahan selalu di atas level air
        const distanceFromCenter = Math.sqrt(x*x + z*z);
        if (distanceFromCenter < 40) {
            // Area pusat selalu lebih tinggi
            height = Math.max(height, 20);
        }
        
        // Terapkan ketinggian
        vertices[i + 1] = height;
        
        // Tentukan warna berdasarkan ketinggian
        const normalizedHeight = (height + 10) / 20; // Normalisasi ke 0-1
        
        if (normalizedHeight < 0.3) {
            // Tanah
            colors[i] = 0.6; // R
            colors[i + 1] = 0.4; // G
            colors[i + 2] = 0.2; // B
        } else if (normalizedHeight < 0.6) {
            // Rumput
            colors[i] = 0.2; // R
            colors[i + 1] = 0.6; // G
            colors[i + 2] = 0.1; // B
        } else {
            // Rumput kering di tempat tinggi
            colors[i] = 0.7; // R
            colors[i + 1] = 0.7; // G
            colors[i + 2] = 0.3; // B
        }
    }
    
    // Tambahkan atribut warna ke geometri
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Material dengan vertex colors
    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    
    terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    scene.add(terrain);
}

// Membuat air
function createWater() {
    // Geometri air
    const waterGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    waterGeometry.rotateX(-Math.PI / 2);
    
    // Material air dengan efek gelombang
    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(0x0066cc) }
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                float wave1 = sin(pos.x * 0.05 + time * 0.5) * 0.5;
                float wave2 = sin(pos.z * 0.05 + time * 0.3) * 0.5;
                pos.y = wave1 + wave2;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float alpha = 0.7;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -2; // Posisikan di bawah terrain
    scene.add(water);
}

// Membuat rumah
function createHouses() {
    houses = new THREE.Group();
    
    // Membuat perumahan di area pusat
    const houseCount = 20;
    const radius = 25; // Radius area perumahan
    
    for (let i = 0; i < houseCount; i++) {
        // Posisi dalam pola grid
        const row = Math.floor(i / 5);
        const col = i % 5;
        
        const x = -20 + col * 10;
        const z = -20 + row * 10;
        
        // Dapatkan ketinggian terrain di posisi ini
        const y = getTerrainHeight(x, z);
        
        // Pastikan rumah tidak di bawah level air
        if (y > 0) {
            // Variasi ukuran
            const width = 4 + Math.random() * 2;
            const height = 3 + Math.random() * 1;
            const depth = 4 + Math.random() * 2;
            
            // Buat rumah
            const house = createHouse(width, height, depth);
            house.position.set(x, y, z);
            
            // Rotasi acak
            house.rotation.y = Math.floor(Math.random() * 4) * Math.PI / 2;
            
            houses.add(house);
        }
    }
    
    scene.add(houses);
}

// Membuat satu rumah
function createHouse(width, height, depth) {
    const house = new THREE.Group();
    
    // Struktur utama
    const structureGeometry = new THREE.BoxGeometry(width, height, depth);
    const structureMaterial = new THREE.MeshStandardMaterial({ color: 0xE0E0E0 });
    const structure = new THREE.Mesh(structureGeometry, structureMaterial);
    structure.position.y = height / 2;
    structure.castShadow = true;
    structure.receiveShadow = true;
    house.add(structure);
    
    // Atap
    const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, height * 0.7, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + height * 0.35;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    // Pintu
    const doorGeometry = new THREE.PlaneGeometry(width * 0.3, height * 0.7);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, height * 0.35, depth / 2 + 0.01);
    house.add(door);
    
    // Jendela
    const windowGeometry = new THREE.PlaneGeometry(width * 0.3, height * 0.3);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87CEEB, side: THREE.DoubleSide });
    
    // Jendela depan
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(width * 0.3, height * 0.6, depth / 2 + 0.01);
    house.add(frontWindow);
    
    // Jendela belakang
    const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    backWindow.position.set(width * 0.3, height * 0.6, -depth / 2 - 0.01);
    backWindow.rotation.y = Math.PI;
    house.add(backWindow);
    
    return house;
}

// Membuat jalan
function createRoads() {
    roads = new THREE.Group();
    
    // Jalan utama (horizontal)
    createRoad(0, 0, 80, 6, 0);
    
    // Jalan utama (vertikal)
    createRoad(0, 0, 80, 6, 90);
    
    // Jalan sekunder
    createRoad(25, 25, 30, 4, 45);
    createRoad(-25, 25, 30, 4, -45);
    createRoad(25, -25, 30, 4, -45);
    createRoad(-25, -25, 30, 4, 45);
    
    scene.add(roads);
}

// Membuat satu jalan
function createRoad(x, z, length, width, rotation) {
    // Geometri jalan
    const roadGeometry = new THREE.PlaneGeometry(length, width);
    roadGeometry.rotateX(-Math.PI / 2);
    
    // Material jalan
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.9,
        metalness: 0.0
    });
    
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    
    // Garis tengah jalan
    const lineGeometry = new THREE.PlaneGeometry(length * 0.9, width * 0.05);
    lineGeometry.rotateX(-Math.PI / 2);
    
    const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.5
    });
    
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.y = 0.01; // Sedikit di atas jalan
    road.add(line);
    
    // Posisi dan rotasi jalan
    road.position.set(x, 0, z);
    road.rotation.y = rotation * Math.PI / 180;
    
    // Sesuaikan ketinggian jalan dengan terrain
    // Kita perlu mengambil beberapa sampel ketinggian di sepanjang jalan
    const sampleCount = 10;
    let totalHeight = 0;
    
    for (let i = 0; i < sampleCount; i++) {
        const t = i / (sampleCount - 1);
        const sampleX = x + Math.cos(rotation * Math.PI / 180) * (t - 0.5) * length;
        const sampleZ = z + Math.sin(rotation * Math.PI / 180) * (t - 0.5) * length;
        
        totalHeight += getTerrainHeight(sampleX, sampleZ);
    }
    
    // Gunakan rata-rata ketinggian + sedikit offset
    const avgHeight = totalHeight / sampleCount;
    road.position.y = avgHeight + 0.2; // Sedikit di atas terrain
    
    roads.add(road);
    return road;
}

// Membuat bangunan publik
function createPublicBuildings() {
    publicBuildings = new THREE.Group();
    
    // Kantor administrasi di pusat
    const adminOffice = createPublicBuilding(10, 8, 15, 0x1976D2);
    adminOffice.position.set(0, getTerrainHeight(0, 0), 0);
    publicBuildings.add(adminOffice);
    
    // Sekolah
    const school = createPublicBuilding(15, 6, 10, 0xFFA000);
    school.position.set(20, getTerrainHeight(20, 15), 15);
    school.rotation.y = Math.PI / 4;
    publicBuildings.add(school);
    
    // Klinik kesehatan
    const clinic = createPublicBuilding(8, 5, 12, 0xE53935);
    clinic.position.set(-20, getTerrainHeight(-20, 15), 15);
    clinic.rotation.y = -Math.PI / 6;
    publicBuildings.add(clinic);
    
    // Pasar
    const market = createPublicBuilding(20, 4, 20, 0x7CB342);
    market.position.set(-15, getTerrainHeight(-15, -20), -20);
    market.rotation.y = Math.PI / 3;
    publicBuildings.add(market);
    
    scene.add(publicBuildings);
}

// Membuat satu bangunan publik
function createPublicBuilding(width, height, depth, color) {
    const building = new THREE.Group();
    
    // Struktur utama
    const structureGeometry = new THREE.BoxGeometry(width, height, depth);
    const structureMaterial = new THREE.MeshStandardMaterial({ color: color });
    const structure = new THREE.Mesh(structureGeometry, structureMaterial);
    structure.position.y = height / 2;
    structure.castShadow = true;
    structure.receiveShadow = true;
    building.add(structure);
    
    // Atap
    const roofGeometry = new THREE.BoxGeometry(width + 2, height * 0.2, depth + 2);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + height * 0.1;
    roof.castShadow = true;
    building.add(roof);
    
    // Jendela
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < Math.floor(width / 2); j++) {
            const windowGeometry = new THREE.PlaneGeometry(1, 1);
            const windowMaterial = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            
            // Jendela depan
            const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
            windowFront.position.set(
                -width / 2 + 1 + j * 2,
                1 + i * 2,
                depth / 2 + 0.01
            );
            building.add(windowFront);
            
            // Jendela belakang
            const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
            windowBack.position.set(
                -width / 2 + 1 + j * 2,
                1 + i * 2,
                -depth / 2 - 0.01
            );
            windowBack.rotation.y = Math.PI;
            building.add(windowBack);
        }
    }
    
    return building;
}

// Membuat lahan pertanian
function createFarms() {
    farms = new THREE.Group();
    
    // Membuat beberapa area pertanian
    for (let i = 0; i < 3; i++) {
        const x = 30 + i * 15;
        const z = 30 + i * 10;
        const size = 10 + Math.random() * 5;
        
        const farm = createFarm(size, x, z);
        farms.add(farm);
    }
    
    scene.add(farms);
}

// Membuat satu lahan pertanian
function createFarm(size, x, z) {
    const farm = new THREE.Group();
    
    // Tanah pertanian
    const groundGeometry = new THREE.PlaneGeometry(size, size, 10, 10);
    groundGeometry.rotateX(-Math.PI / 2);
    
    // Material dengan pola grid untuk menunjukkan baris tanaman
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 1.0,
        metalness: 0.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    farm.add(ground);
    
    // Tambahkan tanaman (representasi sederhana)
    const plantCount = Math.floor(size * size / 4);
    
    for (let i = 0; i < plantCount; i++) {
        const plantX = (Math.random() - 0.5) * size * 0.9;
        const plantZ = (Math.random() - 0.5) * size * 0.9;
        
        const plantGeometry = new THREE.ConeGeometry(0.2, 0.8, 4);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        
        plant.position.set(plantX, 0.4, plantZ);
        plant.castShadow = true;
        farm.add(plant);
    }
    
    // Posisi farm
    farm.position.set(x, getTerrainHeight(x, z), z);
    
    return farm;
}

// Membuat pohon
function createTrees() {
    trees = new THREE.Group();
    
    // Jumlah pohon
    const treeCount = 200;
    
    for (let i = 0; i < treeCount; i++) {
        // Posisi acak
        const x = Math.random() * 180 - 90;
        const z = Math.random() * 180 - 90;
        
        // Dapatkan ketinggian terrain di posisi ini
        const y = getTerrainHeight(x, z);
        
        // Jangan letakkan pohon di air atau di area perumahan
        if (y < -1.5 || (Math.abs(x) < 20 && Math.abs(z) < 20)) {
            continue;
        }
        
        // Variasi ukuran
        const scale = 0.5 + Math.random() * 1.0;
        
        // Buat pohon
        const tree = createTree(scale);
        tree.position.set(x, y, z);
        
        // Rotasi acak
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        trees.add(tree);
    }
    
    scene.add(trees);
}

// Membuat satu pohon
function createTree(scale) {
    const tree = new THREE.Group();
    
    // Batang pohon
    const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, 2 * scale, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    
    // Daun pohon
    const leavesGeometry = new THREE.SphereGeometry(1 * scale, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2.5 * scale;
    leaves.castShadow = true;
    tree.add(leaves);
    
    return tree;
} 