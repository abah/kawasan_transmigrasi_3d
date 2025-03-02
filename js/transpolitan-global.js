// Variabel global
let scene, camera, renderer, controls;
let raycaster, mouse;

// Inisialisasi scene
function init() {
    // Buat scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Buat kamera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(100, 100, 100);
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
    controls.screenSpacePanning = false;
    controls.minDistance = 20;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2.1;
    
    // Raycaster untuk interaksi
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Inisialisasi clock di sini untuk memastikan tersedia
    if (typeof THREE !== 'undefined') {
        window.clock = new THREE.Clock();
    }
    
    // Inisialisasi lingkungan
    if (typeof initEnvironment === 'function') {
        initEnvironment();
    }
    
    // Inisialisasi model
    if (typeof initModels === 'function') {
        initModels();
    }
    
    // Inisialisasi animasi
    if (typeof initAnimation === 'function') {
        initAnimation();
    }
    
    // Event listener
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    
    // Update loading progress
    if (typeof updateLoadingProgress === 'function') {
        updateLoadingProgress(100);
    }
    
    // Sembunyikan loading screen setelah semua dimuat
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 2000);
    
    // Mulai animasi
    animate();
}

// Buat objek dasar
function createBasicObjects() {
    // Buat lantai
    const floorGeometry = new THREE.PlaneGeometry(500, 500);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
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
        scene.add(house);
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
        scene.add(factory);
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
        scene.add(farm);
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
        scene.add(research);
    }
}

// Buat jalan
function createRoads() {
    // Jalan horizontal
    const roadHGeometry = new THREE.BoxGeometry(500, 0.1, 20);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const roadH = new THREE.Mesh(roadHGeometry, roadMaterial);
    roadH.position.y = 0.05;
    scene.add(roadH);
    
    // Jalan vertikal
    const roadVGeometry = new THREE.BoxGeometry(20, 0.1, 500);
    const roadV = new THREE.Mesh(roadVGeometry, roadMaterial);
    roadV.position.y = 0.05;
    scene.add(roadV);
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
    
    return house;
}

// Buat pabrik
function createFactory() {
    const factory = new THREE.Group();
    
    // Bangunan utama
    const buildingGeometry = new THREE.BoxGeometry(20, 15, 30);
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 7.5;
    building.castShadow = true;
    building.receiveShadow = true;
    factory.add(building);
    
    // Cerobong asap
    const chimneyGeometry = new THREE.CylinderGeometry(2, 2, 10, 16);
    const chimneyMaterial = new THREE.MeshStandardMaterial({
        color: 0xA52A2A,
        roughness: 0.7,
        metalness: 0.2
    });
    
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(5, 15, 10);
    chimney.castShadow = true;
    factory.add(chimney);
    
    return factory;
}

// Buat pertanian
function createFarm() {
    const farm = new THREE.Group();
    
    // Tanah
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
    
    return farm;
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
    
    return building;
}

// Buat bangunan sederhana
function createSimpleBuilding() {
    const building = new THREE.Group();
    
    // Badan bangunan
    const height = 5 + Math.random() * 5;
    const width = 5 + Math.random() * 5;
    const depth = 5 + Math.random() * 5;
    
    const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0xF5F5DC : 0xD3D3D3,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    building.add(body);
    
    return building;
}

// Fungsi animasi
function animate() {
    requestAnimationFrame(animate);
    
    // Gunakan delta time yang aman
    let delta = 0.016; // Default 60fps jika clock tidak tersedia
    
    if (typeof clock !== 'undefined' && clock) {
        delta = clock.getDelta();
    }
    
    // Update animasi
    if (typeof updateAnimations === 'function') {
        updateAnimations(delta);
    }
    
    // Update kontrol
    if (controls) {
        controls.update();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Update loading progress
function updateLoadingProgress(progress) {
    const loaderBar = document.getElementById('loader-bar');
    if (loaderBar) {
        loaderBar.style.width = progress + '%';
    }
}

// Fungsi untuk resize window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Fungsi untuk mouse move
function onMouseMove(event) {
    // Normalisasi koordinat mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Fungsi untuk mouse click
function onMouseClick(event) {
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Cek interseksi dengan objek
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        // Cari objek yang dapat diinteraksi
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            
            // Cari objek induk yang memiliki userData.type
            let parent = object;
            while (parent && !parent.userData?.type) {
                parent = parent.parent;
            }
            
            if (parent && parent.userData?.type) {
                // Tampilkan informasi bangunan
                showBuildingInfo(parent);
                break;
            }
        }
    }
}

// Tampilkan informasi bangunan
function showBuildingInfo(building) {
    let message = '';
    
    switch (building.userData.type) {
        case 'residential':
            message = 'Kawasan Perumahan: Area tempat tinggal modern untuk masyarakat transmigrasi dan WNA.';
            break;
        case 'industrial':
            message = 'Kawasan Industri: Pusat produksi dan pengolahan yang menyediakan lapangan kerja.';
            break;
        case 'agricultural':
            message = 'Kawasan Pertanian: Area pertanian dengan teknologi modern untuk ketahanan pangan.';
            break;
        case 'research':
            message = 'Pusat Riset: Fasilitas penelitian dan pengembangan untuk transfer teknologi.';
            break;
        default:
            message = 'Bangunan di kawasan Transpolitan Global';
    }
    
    alert(message);
}

// Fungsi navigasi
function flyToOverview() {
    if (typeof gsap !== 'undefined') {
        gsap.to(camera.position, {
            x: 100,
            y: 100,
            z: 100,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });
    } else {
        // Fallback jika GSAP tidak tersedia
        camera.position.set(100, 100, 100);
        camera.lookAt(0, 0, 0);
    }
}

function flyToResidential() {
    if (typeof gsap !== 'undefined') {
        gsap.to(camera.position, {
            x: 80,
            y: 30,
            z: 80,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: function() {
                camera.lookAt(60, 0, 60);
            }
        });
    } else {
        // Fallback jika GSAP tidak tersedia
        camera.position.set(80, 30, 80);
        camera.lookAt(60, 0, 60);
    }
}

function flyToIndustrial() {
    gsap.to(camera.position, {
        x: -80,
        y: 30,
        z: 80,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: function() {
            camera.lookAt(-60, 0, 60);
        }
    });
}

function flyToAgricultural() {
    gsap.to(camera.position, {
        x: -80,
        y: 30,
        z: -80,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: function() {
            camera.lookAt(-60, 0, -60);
        }
    });
}

function flyToResearch() {
    gsap.to(camera.position, {
        x: 80,
        y: 30,
        z: -80,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: function() {
            camera.lookAt(60, 0, -60);
        }
    });
}

// Fungsi untuk berbagi pengalaman
function shareExperience() {
    if (navigator.share) {
        navigator.share({
            title: 'Transpolitan Global - Kawasan Ekonomi Transmigrasi Terintegrasi',
            text: 'Jelajahi kawasan ekonomi transmigrasi terintegrasi dalam visualisasi 3D yang interaktif!',
            url: window.location.href
        });
    } else {
        alert('Bagikan tautan ini: ' + window.location.href);
    }
}

// Fungsi untuk toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error saat mencoba masuk mode layar penuh: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Toggle day/night
function toggleDayNight() {
    if (typeof isNight !== 'undefined') {
        isNight = !isNight;
        
        if (isNight) {
            // Ganti ke mode malam
            scene.background = new THREE.Color(0x000033);
            if (typeof ambientLight !== 'undefined') {
                ambientLight.intensity = 0.1;
            }
            if (typeof sunLight !== 'undefined') {
                sunLight.intensity = 0.2;
            }
            if (typeof addStars === 'function') {
                addStars();
            }
            if (typeof updateTrees === 'function') {
                updateTrees();
            }
            document.getElementById('time-toggle').textContent = 'Ganti ke Mode Siang';
        } else {
            // Ganti ke mode siang
            scene.background = new THREE.Color(0x87CEEB);
            if (typeof ambientLight !== 'undefined') {
                ambientLight.intensity = 0.4;
            }
            if (typeof sunLight !== 'undefined') {
                sunLight.intensity = 1;
            }
            if (typeof removeStars === 'function') {
                removeStars();
            }
            if (typeof updateTrees === 'function') {
                updateTrees();
            }
            document.getElementById('time-toggle').textContent = 'Ganti ke Mode Malam';
        }
    }
}

// Mulai aplikasi
window.onload = init; 