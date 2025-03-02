// Variabel global
let scene, camera, renderer, controls;
let terrain, heightmap;
let directionalLight, ambientLight;
let simplex = new SimplexNoise();
let clock = new THREE.Clock();

// Inisialisasi scene
function init() {
    console.log("Inisialisasi dimulai...");
    
    try {
        // Membuat scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Warna langit biru muda
        scene.fog = new THREE.FogExp2(0xDFE9F3, 0.0025); // Menambahkan kabut untuk kedalaman
        
        // Membuat kamera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(200, 200, 200);
        camera.lookAt(0, 0, 0);
        
        // Membuat renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bayangan yang lebih halus
        document.body.appendChild(renderer.domElement);
        
        // Menambahkan kontrol orbit
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Efek inersia
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10;
        controls.maxDistance = 500;
        controls.maxPolarAngle = Math.PI / 2; // Batasi rotasi agar tidak bisa melihat dari bawah
        
        // Setup pencahayaan
        setupLighting();
        
        // Membuat terrain
        heightmap = generateHeightmap(simplex);
        terrain = createTerrainMesh(heightmap, simplex);
        scene.add(terrain);
        
        // Membuat air
        water = createWater();
        scene.add(water);
        
        // Membuat elemen-elemen pulau
        buildings = createBuildings(heightmap);
        scene.add(buildings);
        
        trees = createTrees(heightmap);
        scene.add(trees);
        
        roads = createRoads(heightmap);
        scene.add(roads);
        
        pois = createPOIs(heightmap);
        scene.add(pois);
        
        // Inisialisasi interaksi
        initInteractions();
        
        // Setup event listeners
        window.addEventListener('resize', onWindowResize);
        
        // Mulai animasi
        animate();
        
        console.log("Inisialisasi selesai!");
    } catch (error) {
        console.error("Error saat inisialisasi:", error);
        alert("Terjadi kesalahan saat memuat visualisasi: " + error.message);
    }
}

// Setup pencahayaan
function setupLighting() {
    // Cahaya ambient
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Cahaya directional (matahari)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    
    // Konfigurasi bayangan
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    
    const d = 300;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    
    scene.add(directionalLight);
}

// Animasi
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Animasi air bergelombang
    if (water && water.material.uniforms) {
        water.material.uniforms['time'].value += delta;
    }
    
    // Animasi pohon bergoyang
    if (trees) {
        trees.children.forEach((tree, index) => {
            if (index % 3 === 0 && tree.children.length > 1) { // Hanya sebagian pohon yang bergoyang
                const leaves = tree.children[1];
                leaves.rotation.y = Math.sin(clock.getElapsedTime() * 0.5 + index) * 0.05;
                leaves.rotation.z = Math.cos(clock.getElapsedTime() * 0.3 + index) * 0.05;
            }
        });
    }
    
    // Update kontrol
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Memulai aplikasi
init(); 