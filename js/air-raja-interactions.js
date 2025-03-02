// Variabel untuk interaksi
let raycaster, mouse;
let selectedObject = null;
let isNightMode = false;
let moon, stars;

// Inisialisasi interaksi
function initInteractions() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Event listener untuk klik mouse
    window.addEventListener('click', onMouseClick);
    
    // Event listener untuk tombol-tombol kontrol
    document.getElementById('viewFull').addEventListener('click', viewFullIsland);
    document.getElementById('viewSettlement').addEventListener('click', viewSettlement);
    document.getElementById('viewPort').addEventListener('click', viewPort);
    document.getElementById('viewMangrove').addEventListener('click', viewMangrove);
    document.getElementById('toggleDayNight').addEventListener('click', toggleDayNight);
}

// Handler untuk klik mouse
function onMouseClick(event) {
    // Normalisasi koordinat mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Cari interseksi dengan POI
    const intersects = raycaster.intersectObjects(pois.children, true);
    
    if (intersects.length > 0) {
        // Dapatkan objek yang diklik
        let object = intersects[0].object;
        
        // Naik ke parent sampai menemukan userData
        while (object && !object.userData.name) {
            object = object.parent;
        }
        
        if (object && object.userData.name) {
            // Tampilkan informasi POI
            showPOIInfo(object.userData);
            
            // Animasi kamera ke POI
            animateCameraTo(object.position.clone().add(new THREE.Vector3(0, 30, 30)), object.position);
            
            // Simpan objek yang dipilih
            selectedObject = object;
        }
    } else {
        // Sembunyikan informasi POI jika klik di luar POI
        hidePOIInfo();
        selectedObject = null;
    }
}

// Fungsi untuk menampilkan informasi POI
function showPOIInfo(data) {
    const poiTitle = document.querySelector('.poi-title');
    const poiContent = document.querySelector('.poi-content');
    
    poiTitle.textContent = data.name;
    poiContent.textContent = data.description || 'Tidak ada informasi detail.';
    
    document.getElementById('poi-info').style.display = 'block';
}

// Fungsi untuk menyembunyikan informasi POI
function hidePOIInfo() {
    const poiTitle = document.querySelector('.poi-title');
    const poiContent = document.querySelector('.poi-content');
    
    poiTitle.textContent = 'Informasi Lokasi';
    poiContent.textContent = 'Klik pada titik-titik lokasi penting di pulau untuk melihat informasi detailnya.';
}

// Fungsi untuk animasi kamera
function animateCameraTo(targetPosition, lookAtPosition) {
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    
    // Durasi animasi dalam milidetik
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Fungsi easing
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolasi posisi kamera
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        // Interpolasi target kontrol
        controls.target.lerpVectors(startLookAt, lookAtPosition, easeProgress);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Fungsi untuk melihat seluruh pulau
function viewFullIsland() {
    animateCameraTo(
        new THREE.Vector3(0, 300, 300),
        new THREE.Vector3(0, 0, 0)
    );
}

// Fungsi untuk melihat permukiman
function viewSettlement() {
    animateCameraTo(
        new THREE.Vector3(100, 100, 0),
        new THREE.Vector3(100, 0, -50)
    );
}

// Fungsi untuk melihat pelabuhan
function viewPort() {
    animateCameraTo(
        new THREE.Vector3(-130, 50, 130),
        new THREE.Vector3(-100, 0, 100)
    );
}

// Fungsi untuk melihat hutan mangrove
function viewMangrove() {
    animateCameraTo(
        new THREE.Vector3(170, 50, 170),
        new THREE.Vector3(200, 0, 200)
    );
}

// Fungsi untuk toggle mode siang/malam
function toggleDayNight() {
    isNightMode = !isNightMode;
    
    if (isNightMode) {
        // Mode malam
        scene.background = new THREE.Color(0x001133);
        scene.fog = new THREE.FogExp2(0x001133, 0.002);
        
        // Ubah pencahayaan
        directionalLight.intensity = 0.3;
        directionalLight.position.set(-1, 0.5, -1);
        ambientLight.intensity = 0.2;
        
        // Tambahkan bulan
        if (!moon) {
            const moonGeometry = new THREE.SphereGeometry(10, 16, 16);
            const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
            moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(500, 300, -500);
            scene.add(moon);
        } else {
            moon.visible = true;
        }
        
        // Tambahkan bintang-bintang
        if (!stars) {
            const starsGeometry = new THREE.BufferGeometry();
            const starsMaterial = new THREE.PointsMaterial({
                color: 0xFFFFFF,
                size: 1,
                sizeAttenuation: false
            });
            
            const starsVertices = [];
            for (let i = 0; i < 1000; i++) {
                const x = (Math.random() - 0.5) * 2000;
                const y = Math.random() * 1000;
                const z = (Math.random() - 0.5) * 2000;
                starsVertices.push(x, y, z);
            }
            
            starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
            stars = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(stars);
        } else {
            stars.visible = true;
        }
    } else {
        // Mode siang
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.FogExp2(0xDFE9F3, 0.0025);
        
        // Ubah pencahayaan
        directionalLight.intensity = 1.0;
        directionalLight.position.set(1, 1, 1);
        ambientLight.intensity = 0.5;
        
        // Sembunyikan bulan dan bintang
        if (moon) moon.visible = false;
        if (stars) stars.visible = false;
    }
}

// Fungsi untuk resize window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
} 