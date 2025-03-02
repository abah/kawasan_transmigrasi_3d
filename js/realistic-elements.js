/**
 * Realistic Elements Library
 * Kumpulan fungsi untuk membuat elemen-elemen realistis
 * yang dapat digunakan di berbagai proyek Three.js
 */

// Variabel untuk menyimpan model yang sudah dimuat
const RealisticElements = {
    // Cache untuk model yang sudah dimuat
    loadedModels: {},
    
    // Loader untuk model 3D
    gltfLoader: null,
    textureLoader: null,
    
    // Inisialisasi loader
    init: function() {
        if (!this.gltfLoader && typeof THREE !== 'undefined') {
            // Pastikan GLTFLoader tersedia
            if (typeof THREE.GLTFLoader === 'undefined') {
                console.error('THREE.GLTFLoader tidak tersedia. Pastikan Anda telah memuat library ini.');
                return;
            }
            
            this.gltfLoader = new THREE.GLTFLoader();
            this.textureLoader = new THREE.TextureLoader();
        }
    },
    
    /**
     * Membuat rumah realistis
     * @param {Object} options - Opsi konfigurasi rumah
     * @param {Function} callback - Callback setelah rumah dibuat
     */
    createRealisticHouse: function(options = {}, callback) {
        this.init();
        
        const defaultOptions = {
            style: 'modern', // modern, traditional, colonial
            scale: 1.0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Pilih model berdasarkan style
        let modelUrl;
        switch (config.style) {
            case 'traditional':
                modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/House/glTF/House.gltf';
                break;
            case 'colonial':
                modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/House/glTF/House.gltf';
                break;
            case 'modern':
            default:
                modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/House/glTF/House.gltf';
                break;
        }
        
        // Cek apakah model sudah dimuat sebelumnya
        if (this.loadedModels[modelUrl]) {
            const house = this.loadedModels[modelUrl].clone();
            this._configureObject(house, config);
            
            if (callback) callback(house);
            return;
        }
        
        // Muat model jika belum ada di cache
        this.gltfLoader.load(
            modelUrl,
            (gltf) => {
                const house = gltf.scene;
                
                // Simpan model di cache
                this.loadedModels[modelUrl] = house.clone();
                
                // Konfigurasi objek
                this._configureObject(house, config);
                
                // Tambahkan userData untuk identifikasi
                house.userData = { 
                    type: 'house',
                    style: config.style
                };
                
                // Aktifkan shadow
                house.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                if (callback) callback(house);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading house model:', error);
                // Fallback ke model sederhana jika gagal memuat
                const fallbackHouse = this._createFallbackHouse(config);
                if (callback) callback(fallbackHouse);
            }
        );
    },
    
    /**
     * Membuat pohon realistis
     * @param {Object} options - Opsi konfigurasi pohon
     * @param {Function} callback - Callback setelah pohon dibuat
     */
    createRealisticTree: function(options = {}, callback) {
        this.init();
        
        const defaultOptions = {
            type: 'maple', // maple, oak, pine, palm
            scale: 1.0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            detail: 'medium' // low, medium, high
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Gunakan THREEx.Tree untuk membuat pohon procedural yang realistis
        if (typeof THREEx !== 'undefined' && THREEx.Tree) {
            const treeGroup = new THREE.Group();
            
            // Konfigurasi pohon berdasarkan tipe
            let treeConfig = {};
            
            switch (config.type) {
                case 'maple':
                    // Konfigurasi untuk pohon maple
                    treeConfig = {
                        trunkHeight: 4 + Math.random() * 2,
                        trunkRadius: 0.4 + Math.random() * 0.3,
                        trunkRadiusBottom: 0.6 + Math.random() * 0.3,
                        trunkRadiusTop: 0.3 + Math.random() * 0.2,
                        trunkColor: 0x8B4513,
                        leavesRadius: 4 + Math.random() * 2,
                        leavesRadiusBottom: 1 + Math.random(),
                        leavesColor: 0xD2691E, // Warna maple (kemerahan)
                        detail: config.detail === 'high' ? 8 : (config.detail === 'medium' ? 6 : 4)
                    };
                    break;
                case 'oak':
                    // Konfigurasi untuk pohon oak
                    treeConfig = {
                        trunkHeight: 5 + Math.random() * 3,
                        trunkRadius: 0.5 + Math.random() * 0.4,
                        trunkRadiusBottom: 0.7 + Math.random() * 0.4,
                        trunkRadiusTop: 0.4 + Math.random() * 0.2,
                        trunkColor: 0x8B4513,
                        leavesRadius: 5 + Math.random() * 3,
                        leavesRadiusBottom: 2 + Math.random(),
                        leavesColor: 0x006400, // Warna oak (hijau tua)
                        detail: config.detail === 'high' ? 8 : (config.detail === 'medium' ? 6 : 4)
                    };
                    break;
                case 'pine':
                    // Konfigurasi untuk pohon pine
                    treeConfig = {
                        trunkHeight: 8 + Math.random() * 4,
                        trunkRadius: 0.4 + Math.random() * 0.3,
                        trunkRadiusBottom: 0.6 + Math.random() * 0.3,
                        trunkRadiusTop: 0.2 + Math.random() * 0.1,
                        trunkColor: 0x8B4513,
                        leavesRadius: 3 + Math.random() * 2,
                        leavesRadiusBottom: 0.5 + Math.random(),
                        leavesColor: 0x228B22, // Warna pine (hijau hutan)
                        detail: config.detail === 'high' ? 8 : (config.detail === 'medium' ? 6 : 4)
                    };
                    break;
                case 'palm':
                    // Konfigurasi untuk pohon palm
                    treeConfig = {
                        trunkHeight: 10 + Math.random() * 5,
                        trunkRadius: 0.3 + Math.random() * 0.2,
                        trunkRadiusBottom: 0.5 + Math.random() * 0.2,
                        trunkRadiusTop: 0.3 + Math.random() * 0.1,
                        trunkColor: 0xA0522D,
                        leavesRadius: 4 + Math.random() * 2,
                        leavesRadiusBottom: 0.1,
                        leavesColor: 0x32CD32, // Warna palm (hijau cerah)
                        detail: config.detail === 'high' ? 8 : (config.detail === 'medium' ? 6 : 4)
                    };
                    break;
                default:
                    // Konfigurasi default
                    treeConfig = {
                        trunkHeight: 5 + Math.random() * 3,
                        trunkRadius: 0.4 + Math.random() * 0.3,
                        trunkRadiusBottom: 0.6 + Math.random() * 0.3,
                        trunkRadiusTop: 0.3 + Math.random() * 0.2,
                        trunkColor: 0x8B4513,
                        leavesRadius: 4 + Math.random() * 2,
                        leavesRadiusBottom: 1 + Math.random(),
                        leavesColor: 0x228B22,
                        detail: config.detail === 'high' ? 8 : (config.detail === 'medium' ? 6 : 4)
                    };
            }
            
            // Buat pohon dengan konfigurasi yang sesuai
            THREEx.Tree.createTree({
                trunkHeight: treeConfig.trunkHeight,
                trunkRadius: treeConfig.trunkRadius,
                trunkRadiusBottom: treeConfig.trunkRadiusBottom,
                trunkRadiusTop: treeConfig.trunkRadiusTop,
                trunkColor: treeConfig.trunkColor,
                leavesRadius: treeConfig.leavesRadius,
                leavesRadiusBottom: treeConfig.leavesRadiusBottom,
                leavesColor: treeConfig.leavesColor,
                detail: treeConfig.detail
            }, function(tree) {
                treeGroup.add(tree);
            });
            
            // Konfigurasi objek
            this._configureObject(treeGroup, config);
            
            // Tambahkan userData untuk identifikasi
            treeGroup.userData = { 
                type: 'tree',
                treeType: config.type,
                procedural: true
            };
            
            if (callback) callback(treeGroup);
            return;
        }
        
        // Fallback ke model sederhana jika THREEx.Tree tidak tersedia
        const fallbackTree = this._createFallbackTree(config);
        if (callback) callback(fallbackTree);
    },
    
    /**
     * Membuat rumput realistis
     * @param {Object} options - Opsi konfigurasi rumput
     * @param {Function} callback - Callback setelah rumput dibuat
     */
    createRealisticGrass: function(options = {}, callback) {
        this.init();
        
        const defaultOptions = {
            size: { width: 10, height: 10 },
            density: 'medium', // low, medium, high
            scale: 1.0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            useLocalModel: false,
            localModelPath: ''
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Jika menggunakan model lokal
        if (config.useLocalModel && config.localModelPath) {
            // Cek apakah model sudah dimuat sebelumnya
            if (this.loadedModels[config.localModelPath]) {
                const grass = this.loadedModels[config.localModelPath].clone();
                this._configureObject(grass, config);
                
                if (callback) callback(grass);
                return;
            }
            
            // Tentukan loader berdasarkan ekstensi file
            let loader;
            if (config.localModelPath.toLowerCase().endsWith('.gltf') || 
                config.localModelPath.toLowerCase().endsWith('.glb')) {
                loader = this.gltfLoader;
            } else if (config.localModelPath.toLowerCase().endsWith('.fbx')) {
                // Pastikan FBXLoader tersedia
                if (typeof THREE.FBXLoader === 'undefined') {
                    console.error('THREE.FBXLoader tidak tersedia. Pastikan Anda telah memuat library ini.');
                    // Fallback ke model sederhana
                    const fallbackGrass = this._createFallbackGrass(config);
                    if (callback) callback(fallbackGrass);
                    return;
                }
                loader = new THREE.FBXLoader();
            } else {
                console.error('Format file tidak didukung:', config.localModelPath);
                // Fallback ke model sederhana
                const fallbackGrass = this._createFallbackGrass(config);
                if (callback) callback(fallbackGrass);
                return;
            }
            
            // Muat model
            loader.load(
                config.localModelPath,
                (model) => {
                    const grass = model.scene || model; // GLTFLoader returns {scene}, FBXLoader returns model directly
                    
                    // Simpan model di cache
                    this.loadedModels[config.localModelPath] = grass.clone();
                    
                    // Konfigurasi objek
                    this._configureObject(grass, config);
                    
                    // Tambahkan userData untuk identifikasi
                    grass.userData = { 
                        type: 'grass',
                        density: config.density,
                        localModel: true
                    };
                    
                    // Aktifkan shadow
                    grass.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    if (callback) callback(grass);
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('Error loading grass model:', error);
                    // Fallback ke model sederhana
                    const fallbackGrass = this._createFallbackGrass(config);
                    if (callback) callback(fallbackGrass);
                }
            );
            return;
        }
        
        // Jika tidak menggunakan model lokal, buat rumput procedural
        const grass = this._createProceduralGrass(config);
        if (callback) callback(grass);
    },
    
    /**
     * Buat rumput procedural
     * @private
     */
    _createProceduralGrass: function(config) {
        const grass = new THREE.Group();
        
        // Dasar rumput
        const groundGeometry = new THREE.PlaneGeometry(
            config.size.width, 
            config.size.height
        );
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        grass.add(ground);
        
        // Tambahkan blade rumput jika density tidak low
        if (config.density !== 'low') {
            const bladeCount = config.density === 'high' ? 1000 : 500;
            
            for (let i = 0; i < bladeCount; i++) {
                const blade = this._createGrassBlade();
                
                // Posisi acak di dalam area rumput
                const x = (Math.random() - 0.5) * config.size.width;
                const z = (Math.random() - 0.5) * config.size.height;
                
                blade.position.set(x, 0, z);
                blade.rotation.y = Math.random() * Math.PI * 2;
                
                grass.add(blade);
            }
        }
        
        // Tambahkan userData untuk identifikasi
        grass.userData = { 
            type: 'grass',
            density: config.density,
            procedural: true
        };
        
        this._configureObject(grass, config);
        
        return grass;
    },
    
    /**
     * Buat blade rumput tunggal
     * @private
     */
    _createGrassBlade: function() {
        const blade = new THREE.Group();
        
        // Geometri blade rumput
        const height = 0.2 + Math.random() * 0.3;
        const width = 0.02 + Math.random() * 0.02;
        
        const bladeGeometry = new THREE.PlaneGeometry(width, height);
        bladeGeometry.translate(0, height / 2, 0);
        
        // Warna rumput dengan sedikit variasi
        const hue = 0.3 + Math.random() * 0.1; // Hijau dengan variasi
        const saturation = 0.5 + Math.random() * 0.3;
        const lightness = 0.3 + Math.random() * 0.2;
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const bladeMesh = new THREE.Mesh(bladeGeometry, bladeMaterial);
        
        // Sedikit kemiringan acak
        bladeMesh.rotation.x = Math.random() * 0.3;
        bladeMesh.rotation.z = (Math.random() - 0.5) * 0.2;
        
        bladeMesh.castShadow = true;
        bladeMesh.receiveShadow = true;
        
        blade.add(bladeMesh);
        
        return blade;
    },
    
    /**
     * Konfigurasi objek (posisi, rotasi, skala)
     * @private
     */
    _configureObject: function(object, config) {
        // Atur posisi
        object.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );
        
        // Atur rotasi
        object.rotation.set(
            config.rotation.x,
            config.rotation.y,
            config.rotation.z
        );
        
        // Atur skala
        object.scale.set(
            config.scale,
            config.scale,
            config.scale
        );
    },
    
    /**
     * Buat model fallback untuk rumah jika model utama gagal dimuat
     * @private
     */
    _createFallbackHouse: function(config) {
        const house = new THREE.Group();
        
        // Badan rumah
        const bodyGeometry = new THREE.BoxGeometry(10, 8, 15);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5DC,
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
        
        // Pintu
        const doorGeometry = new THREE.PlaneGeometry(3, 5);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 2.5, 7.51);
        house.add(door);
        
        // Jendela
        const windowGeometry = new THREE.PlaneGeometry(2, 2);
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEFA,
            roughness: 0.3,
            metalness: 0.8
        });
        
        const windowL = new THREE.Mesh(windowGeometry, windowMaterial);
        windowL.position.set(-3, 5, 7.51);
        house.add(windowL);
        
        const windowR = new THREE.Mesh(windowGeometry, windowMaterial);
        windowR.position.set(3, 5, 7.51);
        house.add(windowR);
        
        // Tambahkan userData untuk identifikasi
        house.userData = { 
            type: 'house',
            style: config.style,
            fallback: true
        };
        
        this._configureObject(house, config);
        
        return house;
    },
    
    /**
     * Buat model fallback untuk pohon jika model utama gagal dimuat
     * @private
     */
    _createFallbackTree: function(config) {
        const tree = new THREE.Group();
        
        // Pilih warna berdasarkan tipe pohon
        let trunkColor, leavesColor;
        
        switch (config.type) {
            case 'maple':
                trunkColor = 0x8B4513;
                leavesColor = 0xD2691E; // Kemerahan untuk maple
                break;
            case 'oak':
                trunkColor = 0x8B4513;
                leavesColor = 0x006400; // Hijau tua untuk oak
                break;
            case 'pine':
                trunkColor = 0x8B4513;
                leavesColor = 0x228B22; // Hijau hutan untuk pine
                break;
            case 'palm':
                trunkColor = 0xA0522D;
                leavesColor = 0x32CD32; // Hijau cerah untuk palm
                break;
            default:
                trunkColor = 0x8B4513;
                leavesColor = 0x228B22;
        }
        
        // Batang
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: trunkColor,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Daun - bentuk berbeda berdasarkan tipe pohon
        let leavesGeometry;
        
        switch (config.type) {
            case 'pine':
                // Bentuk kerucut untuk pohon pinus
                leavesGeometry = new THREE.ConeGeometry(3, 7, 8);
                break;
            case 'palm':
                // Bentuk bintang untuk pohon palm
                leavesGeometry = new THREE.SphereGeometry(3, 4, 2);
                break;
            case 'maple':
            case 'oak':
            default:
                // Bentuk bola untuk pohon daun lebar
                leavesGeometry = new THREE.SphereGeometry(3, 8, 8);
        }
        
        const leavesMaterial = new THREE.MeshStandardMaterial({
            color: leavesColor,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        
        // Posisi daun berbeda berdasarkan tipe pohon
        if (config.type === 'pine') {
            leaves.position.y = 6;
        } else if (config.type === 'palm') {
            leaves.position.y = 8;
            leaves.scale.set(1, 2, 1);
        } else {
            leaves.position.y = 7;
        }
        
        leaves.castShadow = true;
        tree.add(leaves);
        
        // Tambahkan userData untuk identifikasi
        tree.userData = { 
            type: 'tree',
            treeType: config.type,
            fallback: true
        };
        
        this._configureObject(tree, config);
        
        return tree;
    },
    
    /**
     * Buat model fallback untuk rumput jika model utama gagal dimuat
     * @private
     */
    _createFallbackGrass: function(config) {
        const grass = new THREE.Group();
        
        // Dasar rumput
        const groundGeometry = new THREE.PlaneGeometry(
            config.size.width, 
            config.size.height
        );
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        grass.add(ground);
        
        // Tambahkan userData untuk identifikasi
        grass.userData = { 
            type: 'grass',
            density: config.density,
            fallback: true
        };
        
        this._configureObject(grass, config);
        
        return grass;
    }
}; 