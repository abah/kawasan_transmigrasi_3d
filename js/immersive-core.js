// Variabel global
let currentMode = 'panorama'; // 'panorama' atau '3d'
let scene, camera, renderer, controls;

// Inisialisasi aplikasi
function initApp() {
    console.log('Initializing immersive application...');
    
    // Deteksi device orientation untuk mobile
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    // Resize handler
    window.addEventListener('resize', handleResize);
    
    // Inisialisasi mode default (panorama)
    switchMode('panorama');
}

// Handler untuk device orientation
function handleDeviceOrientation(event) {
    if (currentMode === 'panorama' && viewer) {
        // Implementasi kontrol panorama dengan gyroscope
        const yaw = event.alpha || 0;
        const pitch = event.beta || 0;
        
        // Update view panorama berdasarkan orientasi device
        if (viewer.setYaw && viewer.setPitch) {
            viewer.setYaw(yaw);
            viewer.setPitch(pitch);
        }
    }
}

// Handler untuk resize window
function handleResize() {
    if (currentMode === 'panorama' && viewer) {
        viewer.resize();
    } else if (currentMode === '3d' && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Fungsi untuk beralih antara mode panorama dan 3D
function switchMode(mode) {
    if (mode === currentMode) return;
    
    const panoramaContainer = document.getElementById('panorama');
    const sceneContainer = document.getElementById('scene-container');
    
    if (mode === 'panorama') {
        panoramaContainer.style.display = 'block';
        sceneContainer.style.display = 'none';
        
        // Inisialisasi panorama jika belum
        if (!viewer) {
            initPanorama();
        }
    } else if (mode === '3d') {
        panoramaContainer.style.display = 'none';
        sceneContainer.style.display = 'block';
        
        // Inisialisasi scene 3D jika belum
        if (!scene) {
            init3DScene();
        }
    }
    
    currentMode = mode;
}

// Inisialisasi scene 3D
function init3DScene() {
    // Membuat scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Membuat kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);
    
    // Membuat renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Menambahkan kontrol orbit
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Menambahkan pencahayaan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Membuat terrain dasar
    const geometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x4CAF50,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    
    // Menambahkan beberapa objek 3D sederhana
    addSimple3DObjects();
    
    // Animasi
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// Menambahkan objek 3D sederhana
function addSimple3DObjects() {
    // Rumah-rumah
    for (let i = 0; i < 10; i++) {
        const house = createHouse();
        house.position.set(
            Math.random() * 40 - 20,
            0,
            Math.random() * 40 - 20
        );
        scene.add(house);
    }
    
    // Pohon-pohon
    for (let i = 0; i < 30; i++) {
        const tree = createTree();
        tree.position.set(
            Math.random() * 80 - 40,
            0,
            Math.random() * 80 - 40
        );
        scene.add(tree);
    }
    
    // Sungai
    createRiver();
}

// Membuat model rumah sederhana
function createHouse() {
    const house = new THREE.Group();
    
    // Dinding
    const wallGeometry = new THREE.BoxGeometry(4, 3, 5);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xE0E0E0 });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 1.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);
    
    // Atap
    const roofGeometry = new THREE.ConeGeometry(4, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
    
    return house;
}

// Membuat model pohon sederhana
function createTree() {
    const tree = new THREE.Group();
    
    // Batang
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Daun
    const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3.5;
    leaves.castShadow = true;
    tree.add(leaves);
    
    return tree;
}

// Membuat sungai
function createRiver() {
    const riverGeometry = new THREE.PlaneGeometry(10, 60, 1, 10);
    const riverMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1E88E5,
        transparent: true,
        opacity: 0.8
    });
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-20, 0.1, 0);
    scene.add(river);
}

// Inisialisasi aplikasi saat dokumen dimuat
document.addEventListener('DOMContentLoaded', initApp);

// Tambahkan tombol untuk beralih mode
const modeToggleButton = document.createElement('button');
modeToggleButton.textContent = 'Beralih ke Mode 3D';
modeToggleButton.style.position = 'absolute';
modeToggleButton.style.bottom = '80px';
modeToggleButton.style.left = '50%';
modeToggleButton.style.transform = 'translateX(-50%)';
modeToggleButton.style.zIndex = '100';
modeToggleButton.style.padding = '8px 15px';
modeToggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
modeToggleButton.style.color = 'white';
modeToggleButton.style.border = 'none';
modeToggleButton.style.borderRadius = '5px';
modeToggleButton.style.cursor = 'pointer';

modeToggleButton.addEventListener('click', function() {
    if (currentMode === 'panorama') {
        switchMode('3d');
        this.textContent = 'Beralih ke Mode Panorama';
    } else {
        switchMode('panorama');
        this.textContent = 'Beralih ke Mode 3D';
    }
});

document.getElementById('app-container').appendChild(modeToggleButton); 