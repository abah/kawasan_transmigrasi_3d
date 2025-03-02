// Variabel lingkungan
let terrain, skyDome, clouds = [];
let isNight = false;
let sunLight, ambientLight;

// Inisialisasi lingkungan
function initEnvironment() {
    // Buat terrain
    createTerrain();
    
    // Buat skybox
    createSkyDome();
    
    // Buat awan
    createClouds();
    
    // Setup pencahayaan
    setupLighting();
}

// Setup pencahayaan
function setupLighting() {
    // Ambient light
    ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
    scene.add(ambientLight);
    
    // Directional light (matahari)
    sunLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    
    // Konfigurasi shadow
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    
    scene.add(sunLight);
    
    // Hemisphere light untuk pencahayaan alami
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.2);
    scene.add(hemiLight);
}

// Buat terrain
function createTerrain() {
    // Buat geometri terrain
    const geometry = new THREE.PlaneGeometry(1000, 1000, 64, 64);
    
    // Material terrain dengan tekstur
    const material = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Buat mesh
    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    // Tambahkan rumput
    addGrass();
}

// Tambahkan rumput
function addGrass() {
    // Buat geometri rumput
    const grassGeometry = new THREE.PlaneGeometry(1000, 1000);
    
    // Tekstur rumput
    const grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        alphaTest: 0.5
    });
    
    // Buat mesh
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.01;
    grass.receiveShadow = true;
    scene.add(grass);
}

// Buat skybox
function createSkyDome() {
    // Buat geometri dome
    const geometry = new THREE.SphereGeometry(500, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    
    // Material skybox
    const material = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    
    // Buat mesh
    skyDome = new THREE.Mesh(geometry, material);
    skyDome.position.y = 0;
    scene.add(skyDome);
}

// Buat awan
function createClouds() {
    for (let i = 0; i < 20; i++) {
        const cloud = createCloud();
        
        // Posisi acak
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 200;
        const height = 100 + Math.random() * 50;
        
        cloud.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // Rotasi acak
        cloud.rotation.y = Math.random() * Math.PI * 2;
        
        // Tambahkan properti untuk animasi
        cloud.userData = {
            speed: 0.05 + Math.random() * 0.1,
            angle: angle,
            radius: radius
        };
        
        scene.add(cloud);
        clouds.push(cloud);
    }
}

// Buat awan
function createCloud() {
    const cloud = new THREE.Group();
    
    // Material awan
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.5,
        metalness: 0.1
    });
    
    // Buat beberapa bola untuk membentuk awan
    const count = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < count; i++) {
        const size = 5 + Math.random() * 10;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const part = new THREE.Mesh(geometry, cloudMaterial);
        
        // Posisi acak dalam awan
        part.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 15
        );
        
        cloud.add(part);
    }
    
    return cloud;
}

// Toggle siang/malam
function toggleDayNight() {
    isNight = !isNight;
    
    if (isNight) {
        // Mode malam
        scene.background = new THREE.Color(0x0A1A2A);
        skyDome.material.color.set(0x0A1A2A);
        ambientLight.intensity = 0.1;
        sunLight.intensity = 0.1;
        
        // Tambahkan cahaya bulan
        if (!scene.getObjectByName('moonLight')) {
            const moonLight = new THREE.DirectionalLight(0xCCCCFF, 0.2);
            moonLight.position.set(-100, 100, -50);
            moonLight.name = 'moonLight';
            scene.add(moonLight);
        }
        
        // Tambahkan bintang-bintang
        addStars();
        
        document.getElementById('time-toggle').textContent = 'Ganti ke Mode Siang';
    } else {
        // Mode siang
        scene.background = new THREE.Color(0x87CEEB);
        skyDome.material.color.set(0x87CEEB);
        ambientLight.intensity = 0.4;
        sunLight.intensity = 1.0;
        
        // Hapus cahaya bulan
        const moonLight = scene.getObjectByName('moonLight');
        if (moonLight) {
            scene.remove(moonLight);
        }
        
        // Hapus bintang-bintang
        removeStars();
        
        document.getElementById('time-toggle').textContent = 'Ganti ke Mode Malam';
    }
}

// Tambahkan bintang-bintang
function addStars() {
    if (scene.getObjectByName('stars')) return;
    
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 1,
        sizeAttenuation: false
    });
    
    const starsVertices = [];
    
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 500 + 100;
        const z = Math.random() * 2000 - 1000;
        
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.name = 'stars';
    scene.add(stars);
}

// Hapus bintang-bintang
function removeStars() {
    const stars = scene.getObjectByName('stars');
    if (stars) {
        scene.remove(stars);
    }
}

// Fungsi untuk memperbarui pohon berdasarkan waktu
function updateTrees() {
    if (typeof trees !== 'undefined') {
        // Jika malam hari, kurangi visibilitas pohon
        const treeMaterialIntensity = isNight ? 0.3 : 1.0;
        
        for (let i = 0; i < trees.length; i++) {
            const tree = trees[i];
            
            // Cari semua material di pohon
            tree.traverse(function(child) {
                if (child.isMesh && child.material) {
                    // Jika material adalah array
                    if (Array.isArray(child.material)) {
                        for (let j = 0; j < child.material.length; j++) {
                            adjustMaterial(child.material[j]);
                        }
                    } else {
                        adjustMaterial(child.material);
                    }
                }
            });
        }
        
        // Fungsi untuk menyesuaikan material
        function adjustMaterial(material) {
            if (material.color) {
                // Simpan warna asli jika belum disimpan
                if (!material.userData.originalColor) {
                    material.userData.originalColor = material.color.clone();
                }
                
                // Sesuaikan intensitas warna berdasarkan waktu
                material.color.copy(material.userData.originalColor);
                if (isNight) {
                    material.color.multiplyScalar(treeMaterialIntensity);
                }
            }
        }
    }
} 