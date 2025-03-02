// Variabel untuk menyimpan elemen-elemen
let buildings, trees, roads, pois, water;

// Fungsi untuk membuat air
function createWater() {
    const { width, depth, waterLevel } = terrainData;
    
    // Geometri air
    const waterGeometry = new THREE.PlaneGeometry(width * 1.5, depth * 1.5, 32, 32);
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
                pos.y = ${waterLevel.toFixed(1)} + wave1 + wave2;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float depth = 0.5 + 0.5 * sin(vUv.x * 10.0) * sin(vUv.y * 10.0);
                vec3 waterColor = color * depth;
                gl_FragColor = vec4(waterColor, 0.8);
            }
        `,
        transparent: true
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = waterLevel;
    
    return water;
}

// Fungsi untuk membuat bangunan
function createBuildings(heightmap) {
    buildings = new THREE.Group();
    
    // Lokasi permukiman
    const settlementCenter = { x: 100, z: -50 };
    const buildingCount = 30;
    
    // Buat rumah-rumah
    for (let i = 0; i < buildingCount; i++) {
        // Posisi acak di sekitar pusat permukiman
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 80;
        const x = settlementCenter.x + Math.cos(angle) * distance;
        const z = settlementCenter.z + Math.sin(angle) * distance;
        
        // Dapatkan ketinggian terrain di posisi ini
        const y = getTerrainHeight(x, z, heightmap);
        
        // Jika di bawah air, lewati
        if (y <= terrainData.waterLevel) continue;
        
        // Ukuran acak
        const width = 4 + Math.random() * 3;
        const height = 3 + Math.random() * 2;
        const depth = 4 + Math.random() * 3;
        
        // Buat rumah
        const house = createHouse(width, height, depth);
        house.position.set(x, y, z);
        
        // Rotasi acak
        house.rotation.y = Math.random() * Math.PI * 2;
        
        buildings.add(house);
    }
    
    // Buat bangunan publik
    const publicBuildings = [
        { name: "Kantor Desa", x: 120, z: -40, width: 10, height: 6, depth: 15, color: 0x1976D2 },
        { name: "Sekolah", x: 80, z: -70, width: 15, height: 6, depth: 10, color: 0xFFA000 },
        { name: "Puskesmas", x: 100, z: -90, width: 12, height: 5, depth: 8, color: 0xE53935 },
        { name: "Pasar", x: 140, z: -60, width: 20, height: 4, depth: 20, color: 0x7CB342 }
    ];
    
    publicBuildings.forEach(building => {
        const y = getTerrainHeight(building.x, building.z, heightmap);
        if (y <= terrainData.waterLevel) return;
        
        const publicBuilding = createPublicBuilding(
            building.width, 
            building.height, 
            building.depth, 
            building.color
        );
        publicBuilding.position.set(building.x, y, building.z);
        publicBuilding.rotation.y = Math.random() * Math.PI * 0.5;
        publicBuilding.userData = { name: building.name };
        
        buildings.add(publicBuilding);
    });
    
    // Buat pelabuhan
    const port = createPort();
    port.position.set(-100, getTerrainHeight(-100, 100, heightmap), 100);
    port.rotation.y = Math.PI / 4;
    buildings.add(port);
    
    return buildings;
}

// Fungsi untuk membuat satu rumah
function createHouse(width, height, depth) {
    const house = new THREE.Group();
    
    // Struktur utama
    const structureGeometry = new THREE.BoxGeometry(width, height, depth);
    const structureMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(0.8, 0.7, 0.6) 
    });
    const structure = new THREE.Mesh(structureGeometry, structureMaterial);
    structure.position.y = height / 2;
    structure.castShadow = true;
    structure.receiveShadow = true;
    house.add(structure);
    
    // Atap
    const roofHeight = height * 0.5;
    const roofGeometry = new THREE.ConeGeometry(
        Math.sqrt(width * width + depth * depth) * 0.6, 
        roofHeight, 
        4
    );
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + roofHeight / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    return house;
}

// Fungsi untuk membuat bangunan publik
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
    
    return building;
}

// Fungsi untuk membuat pelabuhan
function createPort() {
    const port = new THREE.Group();
    
    // Dermaga
    const pierGeometry = new THREE.BoxGeometry(10, 1, 50);
    const pierMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const pier = new THREE.Mesh(pierGeometry, pierMaterial);
    pier.position.y = 0.5;
    pier.castShadow = true;
    pier.receiveShadow = true;
    port.add(pier);
    
    // Tiang-tiang dermaga
    for (let i = -20; i <= 20; i += 10) {
        const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(0, -1, i);
        pole.castShadow = true;
        port.add(pole);
    }
    
    // Gudang pelabuhan
    const warehouseGeometry = new THREE.BoxGeometry(8, 5, 15);
    const warehouseMaterial = new THREE.MeshStandardMaterial({ color: 0x607D8B });
    const warehouse = new THREE.Mesh(warehouseGeometry, warehouseMaterial);
    warehouse.position.set(0, 2.5, -30);
    warehouse.castShadow = true;
    warehouse.receiveShadow = true;
    port.add(warehouse);
    
    // Kapal kecil
    const boat = createBoat();
    boat.position.set(15, 0, 10);
    port.add(boat);
    
    port.userData = { name: "Pelabuhan Air Raja" };
    
    return port;
}

// Fungsi untuk membuat kapal
function createBoat() {
    const boat = new THREE.Group();
    
    // Lambung kapal
    const hullGeometry = new THREE.BoxGeometry(5, 2, 12);
    // Modifikasi bentuk untuk membuat ujung lancip
    const hullPositions = hullGeometry.attributes.position.array;
    for (let i = 0; i < hullPositions.length; i += 3) {
        const z = hullPositions[i + 2];
        if (z > 5) {
            hullPositions[i] *= 0.5; // Persempit bagian depan
        }
    }
    
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 1;
    hull.castShadow = true;
    boat.add(hull);
    
    // Dek kapal
    const deckGeometry = new THREE.BoxGeometry(4.5, 0.5, 11);
    const deckMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 2.25;
    boat.add(deck);
    
    // Kabin
    const cabinGeometry = new THREE.BoxGeometry(3, 2, 4);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xBCAAA4 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 3.5, -2);
    cabin.castShadow = true;
    boat.add(cabin);
    
    boat.position.y = -1; // Posisikan di air
    
    return boat;
}

// Fungsi untuk membuat pohon
function createTrees(heightmap) {
    trees = new THREE.Group();
    
    // Jumlah pohon
    const treeCount = 500;
    
    // Buat pohon-pohon
    for (let i = 0; i < treeCount; i++) {
        // Posisi acak
        const x = Math.random() * terrainData.width - terrainData.width / 2;
        const z = Math.random() * terrainData.depth - terrainData.depth / 2;
        
        // Dapatkan ketinggian terrain di posisi ini
        const y = getTerrainHeight(x, z, heightmap);
        
        // Jika di bawah air atau di area permukiman, lewati
        if (y <= terrainData.waterLevel + 1) continue;
        
        // Jarak dari pusat permukiman
        const distFromSettlement = Math.sqrt(
            Math.pow(x - 100, 2) + 
            Math.pow(z - (-50), 2)
        );
        
        // Jika terlalu dekat dengan permukiman, lewati
        if (distFromSettlement < 50) continue;
        
        // Variasi ukuran
        const scale = 0.5 + Math.random() * 1.5;
        
        // Buat pohon
        const tree = createTree(scale, y < 10);
        tree.position.set(x, y, z);
        
        // Rotasi acak
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        trees.add(tree);
    }
    
    return trees;
}

// Fungsi untuk membuat pohon
function createTree(scale, isMangrove) {
    const tree = new THREE.Group();
    
    if (isMangrove) {
        // Pohon mangrove dengan akar yang terlihat
        
        // Batang utama
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2 * scale, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1 * scale;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Akar-akar
        const rootCount = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < rootCount; i++) {
            const angle = (i / rootCount) * Math.PI * 2;
            const rootGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.1 * scale, 1.5 * scale, 4);
            const root = new THREE.Mesh(rootGeometry, trunkMaterial);
            
            // Posisikan dan rotasikan akar
            root.position.set(
                Math.cos(angle) * 0.5 * scale,
                0.5 * scale,
                Math.sin(angle) * 0.5 * scale
            );
            
            // Rotasi akar keluar dari batang
            root.rotation.x = Math.PI / 4;
            root.rotation.y = angle;
            
            root.castShadow = true;
            tree.add(root);
        }
        
        // Daun mangrove (lebih kecil dan lebih banyak)
        const leavesCount = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < leavesCount; i++) {
            const leavesGeometry = new THREE.SphereGeometry(0.6 * scale, 8, 8);
            const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            
            // Posisikan daun di sekitar bagian atas batang
            const angle = (i / leavesCount) * Math.PI * 2;
            const radius = 0.3 * scale;
            leaves.position.set(
                Math.cos(angle) * radius,
                2 * scale + Math.random() * 0.5 * scale,
                Math.sin(angle) * radius
            );
            
            leaves.castShadow = true;
            tree.add(leaves);
        }
    } else {
        // Pohon normal
        
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
    }
    
    return tree;
}

// Fungsi untuk membuat jalan
function createRoads(heightmap) {
    roads = new THREE.Group();
    
    // Jalan utama dari pelabuhan ke permukiman
    const mainRoadPoints = [
        new THREE.Vector3(-100, 0, 100), // Pelabuhan
        new THREE.Vector3(-50, 0, 50),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(50, 0, -25),
        new THREE.Vector3(100, 0, -50) // Permukiman
    ];
    
    // Sesuaikan ketinggian jalan dengan terrain
    mainRoadPoints.forEach(point => {
        point.y = getTerrainHeight(point.x, point.z, heightmap) + 0.2;
    });
    
    // Buat jalan utama
    const mainRoad = createRoadSegment(mainRoadPoints, 6, 0x5D4037);
    roads.add(mainRoad);
    
    // Jalan-jalan di permukiman
    const settlementRoads = [
        // Jalan horizontal
        [
            new THREE.Vector3(50, 0, -50),
            new THREE.Vector3(150, 0, -50)
        ],
        // Jalan vertikal
        [
            new THREE.Vector3(100, 0, -100),
            new THREE.Vector3(100, 0, 0)
        ],
        // Jalan diagonal
        [
            new THREE.Vector3(70, 0, -70),
            new THREE.Vector3(130, 0, -30)
        ]
    ];
    
    // Sesuaikan ketinggian jalan dengan terrain
    settlementRoads.forEach(roadPoints => {
        roadPoints.forEach(point => {
            point.y = getTerrainHeight(point.x, point.z, heightmap) + 0.2;
        });
        
        // Buat jalan
        const road = createRoadSegment(roadPoints, 4, 0x795548);
        roads.add(road);
    });
    
    return roads;
}

// Fungsi untuk membuat segmen jalan
function createRoadSegment(points, width, color) {
    const road = new THREE.Group();
    
    // Buat kurva dari titik-titik
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Buat geometri jalan
    const roadGeometry = new THREE.TubeGeometry(curve, 64, width / 2, 8, false);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: color });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.receiveShadow = true;
    road.add(roadMesh);
    
    // Tambahkan garis tengah jalan
    const centerLineGeometry = new THREE.TubeGeometry(curve, 64, 0.2, 8, false);
    const centerLineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
    centerLine.position.y = 0.05;
    road.add(centerLine);
    
    return road;
}

// Fungsi untuk membuat titik-titik informasi
function createPOIs(heightmap) {
    pois = new THREE.Group();
    
    // Daftar POI
    const poiList = [
        { name: "Pelabuhan Air Raja", description: "Pelabuhan utama yang menghubungkan Pulau Air Raja dengan pulau-pulau lain di sekitarnya.", x: -100, z: 100, color: 0x2196F3 },
        { name: "Kantor Desa", description: "Pusat administrasi dan pelayanan masyarakat di Pulau Air Raja.", x: 120, z: -40, color: 0x4CAF50 },
        { name: "Sekolah", description: "SMA Negeri 6 Batam, satu-satunya sekolah menengah atas di Pulau Air Raja.", x: 80, z: -70, color: 0xFFC107 },
        { name: "Puskesmas", description: "Fasilitas kesehatan yang melayani masyarakat Pulau Air Raja.", x: 100, z: -90, color: 0xF44336 },
        { name: "Hutan Mangrove", description: "Kawasan konservasi mangrove yang menjadi habitat berbagai spesies dan melindungi pantai dari abrasi.", x: 200, z: 200, color: 0x8BC34A },
        { name: "Makam Raja Ja'far", description: "Situs bersejarah yang merupakan makam Raja Ja'far, tokoh penting dalam sejarah Pulau Air Raja.", x: 0, z: 200, color: 0x9C27B0 }
    ];
    
    // Buat marker untuk setiap POI
    poiList.forEach(poi => {
        const y = getTerrainHeight(poi.x, poi.z, heightmap) + 10;
        
        // Buat marker
        const marker = createPOIMarker(poi.color);
        marker.position.set(poi.x, y, poi.z);
        marker.userData = { 
            name: poi.name, 
            description: poi.description 
        };
        
        pois.add(marker);
    });
    
    return pois;
}

// Fungsi untuk membuat marker POI
function createPOIMarker(color) {
    const marker = new THREE.Group();
    
    // Pin
    const pinGeometry = new THREE.CylinderGeometry(0, 2, 5, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: color });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.rotation.x = Math.PI;
    pin.castShadow = true;
    marker.add(pin);
    
    // Lingkaran di atas pin
    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 3;
    sphere.castShadow = true;
    marker.add(sphere);
    
    // Animasi naik turun
    const animate = () => {
        marker.position.y = Math.sin(Date.now() * 0.002) * 2;
        requestAnimationFrame(animate);
    };
    animate();
    
    return marker;
} 