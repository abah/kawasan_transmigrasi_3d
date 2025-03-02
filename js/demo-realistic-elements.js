// Inisialisasi scene Three.js
let scene, camera, renderer, controls;

// Inisialisasi scene
function init() {
    // Buat scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Buat kamera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(20, 10, 20);
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
    
    // Pencahayaan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    scene.add(directionalLight);
    
    // Tambahkan elemen-elemen realistis
    addRealisticElements();
    
    // Mulai animasi
    animate();
}

// Tambahkan elemen-elemen realistis
function addRealisticElements() {
    // Tambahkan rumput sebagai dasar
    RealisticElements.createRealisticGrass({
        size: { width: 50, height: 50 },
        density: 'high',
        position: { x: 0, y: 0, z: 0 }
    }, (grass) => {
        scene.add(grass);
    });
    
    // Tambahkan beberapa rumah
    const houseStyles = ['modern', 'traditional', 'colonial'];
    for (let i = 0; i < 5; i++) {
        const style = houseStyles[i % houseStyles.length];
        const x = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 30;
        
        RealisticElements.createRealisticHouse({
            style: style,
            scale: 1 + Math.random() * 0.5,
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
        }, (house) => {
            scene.add(house);
        });
    }
    
    // Tambahkan beberapa pohon
    const treeTypes = ['oak', 'pine', 'palm', 'maple'];
    for (let i = 0; i < 20; i++) {
        const type = treeTypes[i % treeTypes.length];
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        // Hindari menempatkan pohon terlalu dekat dengan pusat (di mana rumah berada)
        if (Math.sqrt(x*x + z*z) < 10) continue;
        
        RealisticElements.createRealisticTree({
            type: type,
            scale: 0.5 + Math.random() * 1.0,
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
            detail: Math.random() > 0.5 ? 'high' : 'medium'
        }, (tree) => {
            scene.add(tree);
        });
    }
}

// Fungsi animasi
function animate() {
    requestAnimationFrame(animate);
    
    // Update kontrol
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Fungsi untuk resize window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listener
window.addEventListener('resize', onWindowResize);

// Mulai aplikasi
window.onload = init; 