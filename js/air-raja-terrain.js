// Variabel untuk terrain
let terrainData = {
    width: 1000,
    depth: 1000,
    resolution: 128,
    maxHeight: 80,
    waterLevel: 0
};

// Fungsi untuk membuat heightmap berdasarkan data pulau Air Raja
function generateHeightmap(simplex) {
    const { width, depth, resolution, maxHeight } = terrainData;
    const heightmap = new Float32Array(resolution * resolution);
    
    // Koordinat untuk fitur-fitur khusus
    const islandCenter = { x: 0.5, y: 0.5 };
    const portLocation = { x: 0.35, y: 0.2 };
    const settlementLocation = { x: 0.6, y: 0.4 };
    const mangroveLocation = { x: 0.7, y: 0.7 };
    
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            // Normalisasi koordinat ke 0-1
            const x = i / (resolution - 1);
            const y = j / (resolution - 1);
            
            // Jarak dari pusat pulau (untuk membuat bentuk pulau)
            const distFromCenter = Math.sqrt(
                Math.pow(x - islandCenter.x, 2) + 
                Math.pow(y - islandCenter.y, 2)
            );
            
            // Bentuk dasar pulau (lingkaran yang dimodifikasi)
            let height = 0;
            
            // Bentuk dasar pulau
            if (distFromCenter < 0.4) {
                // Area daratan utama
                height = 0.5 * maxHeight * (1 - distFromCenter / 0.4);
                
                // Tambahkan noise untuk detail terrain
                const nx = x * 5;
                const ny = y * 5;
                
                height += simplex.noise2D(nx, ny) * 10;
                height += simplex.noise2D(nx * 2, ny * 2) * 5;
                height += simplex.noise2D(nx * 4, ny * 4) * 2.5;
                
                // Pastikan ketinggian minimum daratan
                height = Math.max(height, 5);
            } else if (distFromCenter < 0.45) {
                // Area pantai
                height = 5 * (0.45 - distFromCenter) / 0.05;
            } else {
                // Area laut
                height = -5;
            }
            
            // Tambahkan fitur khusus
            
            // Pelabuhan (area yang lebih rendah di tepi)
            const distFromPort = Math.sqrt(
                Math.pow(x - portLocation.x, 2) + 
                Math.pow(y - portLocation.y, 2)
            );
            if (distFromPort < 0.1) {
                height = Math.min(height, 2);
            }
            
            // Permukiman (area yang lebih tinggi dan rata)
            const distFromSettlement = Math.sqrt(
                Math.pow(x - settlementLocation.x, 2) + 
                Math.pow(y - settlementLocation.y, 2)
            );
            if (distFromSettlement < 0.1) {
                height = Math.max(height, 15);
                // Ratakan area permukiman
                height = 15 + simplex.noise2D(x * 20, y * 20) * 2;
            }
            
            // Hutan mangrove (area rendah di tepi)
            const distFromMangrove = Math.sqrt(
                Math.pow(x - mangroveLocation.x, 2) + 
                Math.pow(y - mangroveLocation.y, 2)
            );
            if (distFromMangrove < 0.15 && height > 0 && height < 10) {
                height = 3 + simplex.noise2D(x * 15, y * 15) * 2;
            }
            
            // Simpan nilai ketinggian
            heightmap[i + j * resolution] = height;
        }
    }
    
    return heightmap;
}

// Fungsi untuk membuat mesh terrain dari heightmap
function createTerrainMesh(heightmap, simplex) {
    const { width, depth, resolution } = terrainData;
    
    // Buat geometri
    const geometry = new THREE.PlaneGeometry(
        width, 
        depth, 
        resolution - 1, 
        resolution - 1
    );
    
    // Rotasi geometri agar horizontal
    geometry.rotateX(-Math.PI / 2);
    
    // Terapkan heightmap ke vertices
    const vertices = geometry.attributes.position.array;
    
    // Array untuk menyimpan warna vertex
    const colors = new Float32Array(vertices.length);
    
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const index = (i + j * resolution);
            const vIndex = index * 3;
            
            // Terapkan ketinggian
            vertices[vIndex + 1] = heightmap[index];
            
            // Tentukan warna berdasarkan ketinggian
            const height = heightmap[index];
            
            if (height < 0) {
                // Laut
                colors[vIndex] = 0.0; // R
                colors[vIndex + 1] = 0.3; // G
                colors[vIndex + 2] = 0.6; // B
            } else if (height < 3) {
                // Pantai
                colors[vIndex] = 0.9; // R
                colors[vIndex + 1] = 0.8; // G
                colors[vIndex + 2] = 0.6; // B
            } else if (height < 10) {
                // Dataran rendah / mangrove
                colors[vIndex] = 0.2; // R
                colors[vIndex + 1] = 0.6; // G
                colors[vIndex + 2] = 0.3; // B
            } else if (height < 30) {
                // Dataran sedang
                colors[vIndex] = 0.3; // R
                colors[vIndex + 1] = 0.7; // G
                colors[vIndex + 2] = 0.2; // B
            } else {
                // Dataran tinggi
                colors[vIndex] = 0.5; // R
                colors[vIndex + 1] = 0.5; // G
                colors[vIndex + 2] = 0.3; // B
            }
        }
    }
    
    // Tambahkan atribut warna ke geometri
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Perbarui normal setelah mengubah vertices
    geometry.computeVertexNormals();
    
    // Material dengan vertex colors
    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    
    // Buat mesh
    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    
    return terrain;
}

// Fungsi untuk mendapatkan ketinggian terrain pada posisi tertentu
function getTerrainHeight(x, z, heightmap) {
    const { width, depth, resolution } = terrainData;
    
    // Konversi koordinat dunia ke indeks heightmap
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    // Normalisasi koordinat ke 0-1
    const nx = (x + halfWidth) / width;
    const nz = (z + halfDepth) / depth;
    
    // Konversi ke indeks heightmap
    const ix = Math.floor(nx * (resolution - 1));
    const iz = Math.floor(nz * (resolution - 1));
    
    // Pastikan indeks dalam batas
    if (ix < 0 || ix >= resolution || iz < 0 || iz >= resolution) {
        return 0;
    }
    
    // Ambil ketinggian dari heightmap
    return heightmap[ix + iz * resolution];
} 