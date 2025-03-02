// Variabel global
let scene, camera, renderer, controls;
let terrain, trees, houses, farms, roads, publicBuildings, water;
let directionalLight, ambientLight;
let isNightMode = false;
let simplex = new SimplexNoise();
let clock = new THREE.Clock();
let loadingManager = new THREE.LoadingManager();
let progressBar = document.getElementById('progress-bar');
let loadingScreen = document.getElementById('loading');

// Konfigurasi loading manager
loadingManager.onProgress = function(url, loaded, total) {
    progressBar.style.width = (loaded / total * 100) + '%';
    console.log("Loading: " + (loaded / total * 100) + "%");
};

loadingManager.onLoad = function() {
    // Pastikan layar loading dihapus saat semua aset dimuat
    setTimeout(function() {
        loadingScreen.style.display = 'none';
        console.log("Loading selesai!");
    }, 500);
};

// Inisialisasi scene
function init() {
    console.log("Inisialisasi dimulai...");
    
    try {
        // Membuat scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Warna langit biru muda
        scene.fog = new THREE.FogExp2(0xDFE9F3, 0.0025); // Menambahkan kabut untuk kedalaman
        
        updateProgress(20);
        
        // Membuat kamera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(50, 50, 50);
        camera.lookAt(0, 0, 0);
        
        // Membuat renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bayangan yang lebih halus
        document.body.appendChild(renderer.domElement);
        
        updateProgress(40);
        
        // Menambahkan kontrol orbit
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI * 0.45; // Membatasi rotasi ke bawah
        
        // Setup pencahayaan
        setupLighting();
        
        updateProgress(60);
        
        // Membuat elemen-elemen kawasan transmigrasi
        createTerrain();
        createWater();
        createHouses();
        createFarms();
        createRoads();
        createPublicBuildings();
        createTrees();
        
        updateProgress(90);
        
        // Setup event listeners
        window.addEventListener('resize', onWindowResize);
        setupControls();
        
        // Sembunyikan layar loading secara manual
        setTimeout(function() {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                console.log("Loading screen dihapus secara manual");
            }
        }, 2000);
        
        // Mulai animasi
        animate();
        
        updateProgress(100);
    } catch (error) {
        console.error("Error saat inisialisasi:", error);
        alert("Terjadi kesalahan saat memuat simulasi: " + error.message);
    }
}

// Fungsi untuk menampilkan loading progress
function updateProgress(percent) {
    if (progressBar) {
        progressBar.style.width = percent + '%';
        console.log("Loading: " + percent + "%");
    }
}

// Setup pencahayaan
function setupLighting() {
    // Ambient light
    ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Directional light (matahari)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
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
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, starting initialization...");
    // Tambahkan penundaan kecil untuk memastikan semua elemen DOM sudah siap
    setTimeout(init, 500);
    
    // Tambahkan event listener untuk tombol reload
    document.addEventListener('keydown', function(event) {
        // Jika tombol F5 ditekan, sembunyikan layar loading
        if (event.key === 'F5' || event.keyCode === 116) {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }
    });
}); 