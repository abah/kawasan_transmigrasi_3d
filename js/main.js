import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

// Variabel global
let scene, camera, renderer, controls;
let terrain, houses, farms, roads, publicBuildings;
let raycaster, mouse;

// Inisialisasi scene
function init() {
    console.log("Inisialisasi Three.js...");
    
    // Membuat scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Warna langit biru muda
    
    // Membuat kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // Membuat renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Menambahkan kontrol orbit
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Pencahayaan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Inisialisasi raycaster untuk interaksi
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Membuat elemen-elemen kawasan transmigrasi
    createTerrain();
    createHouses();
    createFarms();
    createRoads();
    createPublicBuildings();
    
    // Membuat objek sederhana untuk tes
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Membuat grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    
    // Tombol kontrol
    document.getElementById('viewFull').addEventListener('click', function() {
        console.log("Tombol viewFull diklik");
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
    });
    
    document.getElementById('viewHousing').addEventListener('click', function() {
        console.log("Tombol viewHousing diklik");
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
    });
    
    document.getElementById('viewFarms').addEventListener('click', function() {
        console.log("Tombol viewFarms diklik");
        camera.position.set(-5, 5, 5);
        camera.lookAt(0, 0, 0);
    });
    
    document.getElementById('viewInfrastructure').addEventListener('click', function() {
        console.log("Tombol viewInfrastructure diklik");
        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);
    });
    
    // Mulai animasi
    animate();
}

// Membuat terrain (tanah dasar)
function createTerrain() {
    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    
    // Membuat variasi ketinggian untuk terrain
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        // Membuat beberapa bukit dan lembah
        vertices[i + 2] = Math.sin(vertices[i] / 10) * Math.cos(vertices[i + 1] / 10) * 5;
    }
    
    geometry.computeVertexNormals();
    
    // Material untuk terrain
    const material = new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        side: THREE.DoubleSide,
        flatShading: true
    });
    
    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
}

// Membuat perumahan transmigran
function createHouses() {
    houses = new THREE.Group();
    
    // Membuat beberapa rumah dalam pola grid
    for (let x = -40; x <= 40; x += 20) {
        for (let z = -40; z <= 40; z += 20) {
            if (Math.random() > 0.3) { // Beberapa area kosong
                const house = createHouse();
                house.position.set(x + (Math.random() * 5 - 2.5), 0, z + (Math.random() * 5 - 2.5));
                house.rotation.y = Math.random() * Math.PI * 2;
                houses.add(house);
            }
        }
    }
    
    scene.add(houses);
}

// Membuat satu rumah
function createHouse() {
    const house = new THREE.Group();
    
    // Dinding rumah
    const wallGeometry = new THREE.BoxGeometry(5, 3, 7);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 1.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);
    
    // Atap rumah
    const roofGeometry = new THREE.ConeGeometry(5, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    // Pintu
    const doorGeometry = new THREE.PlaneGeometry(1, 2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037, side: THREE.DoubleSide });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, 3.51);
    house.add(door);
    
    // Jendela
    const windowGeometry = new THREE.PlaneGeometry(1, 1);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xbbdefb, side: THREE.DoubleSide });
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-1.5, 1.5, 3.51);
    house.add(window1);
    
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(1.5, 1.5, 3.51);
    house.add(window2);
    
    return house;
}

// Membuat lahan pertanian
function createFarms() {
    farms = new THREE.Group();
    
    // Membuat beberapa area pertanian
    for (let x = -80; x <= 80; x += 30) {
        for (let z = -80; z <= 80; z += 30) {
            if (Math.abs(x) > 50 || Math.abs(z) > 50) { // Pertanian di pinggiran
                const farm = createFarm();
                farm.position.set(x, 0.1, z);
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
    const fieldGeometry = new THREE.PlaneGeometry(25, 25, 10, 10);
    const fieldMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8d6e63, 
        side: THREE.DoubleSide 
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    farm.add(field);
    
    // Tanaman (representasi sederhana)
    for (let i = 0; i < 100; i++) {
        const plantGeometry = new THREE.ConeGeometry(0.3, 1, 4);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x33691e });
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        
        // Posisi acak dalam lahan
        const x = Math.random() * 20 - 10;
        const z = Math.random() * 20 - 10;
        plant.position.set(x, 0.5, z);
        plant.castShadow = true;
        farm.add(plant);
    }
    
    return farm;
}

// Membuat jalan
function createRoads() {
    roads = new THREE.Group();
    
    // Jalan utama horizontal
    const mainRoadGeometry = new THREE.PlaneGeometry(200, 8);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x424242, 
        side: THREE.DoubleSide 
    });
    const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.1;
    roads.add(mainRoad);
    
    // Jalan utama vertikal
    const crossRoadGeometry = new THREE.PlaneGeometry(8, 200);
    const crossRoad = new THREE.Mesh(crossRoadGeometry, roadMaterial);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.y = 0.1;
    roads.add(crossRoad);
    
    // Jalan-jalan kecil
    for (let i = -80; i <= 80; i += 20) {
        if (i !== 0) { // Hindari tumpang tindih dengan jalan utama
            // Jalan horizontal
            const smallRoadH = new THREE.Mesh(
                new THREE.PlaneGeometry(200, 4),
                roadMaterial
            );
            smallRoadH.rotation.x = -Math.PI / 2;
            smallRoadH.position.set(0, 0.1, i);
            roads.add(smallRoadH);
            
            // Jalan vertikal
            const smallRoadV = new THREE.Mesh(
                new THREE.PlaneGeometry(4, 200),
                roadMaterial
            );
            smallRoadV.rotation.x = -Math.PI / 2;
            smallRoadV.position.set(i, 0.1, 0);
            roads.add(smallRoadV);
        }
    }
    
    scene.add(roads);
}

// Membuat bangunan publik
function createPublicBuildings() {
    publicBuildings = new THREE.Group();
    
    // Kantor administrasi (di pusat)
    const adminBuilding = createPublicBuilding(0x1976d2, 10, 5, 15);
    adminBuilding.position.set(0, 0, 0);
    publicBuildings.add(adminBuilding);
    
    // Sekolah
    const school = createPublicBuilding(0xffa000, 15, 4, 10);
    school.position.set(-30, 0, 30);
    publicBuildings.add(school);
    
    // Klinik kesehatan
    const clinic = createPublicBuilding(0xf44336, 8, 4, 12);
    clinic.position.set(30, 0, -30);
    publicBuildings.add(clinic);
    
    // Pasar
    const market = createPublicBuilding(0x7cb342, 20, 3, 20);
    market.position.set(30, 0, 30);
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
    const roofGeometry = new THREE.BoxGeometry(width + 2, 1, depth + 2);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x424242 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.5;
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

function onMouseMove(event) {
    // Menghitung posisi mouse dalam koordinat normalized device coordinates (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Animasi
function animate() {
    requestAnimationFrame(animate);
    
    // Update kontrol
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Memulai aplikasi
console.log("Memulai aplikasi Three.js");
init(); 