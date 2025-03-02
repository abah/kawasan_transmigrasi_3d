// Inisialisasi Procedural GL
const container = document.getElementById('container');

// Konfigurasi datasource
// Catatan: Untuk penggunaan nyata, Anda perlu mendapatkan API key dari MapTiler
const datasource = {
    provider: 'maptiler',
    apiKey: 'GET_AN_API_KEY_FROM_MAPTILER' // Ganti dengan API key Anda
};

// Inisialisasi library dan tambahkan kontrol UI
Procedural.init({ container, datasource });
Procedural.setRotationControlVisible(true);
Procedural.setZoomControlVisible(true);
Procedural.setCompassVisible(true);

// Untuk simulasi, kita akan menggunakan lokasi yang memiliki topografi menarik
// Ini bisa diganti dengan koordinat kawasan transmigrasi yang sebenarnya
const transmigrationArea = { 
    latitude: -2.5489, 
    longitude: 112.9515, // Koordinat di Kalimantan Tengah (contoh)
    altitude: 5000 // Ketinggian awal dalam meter
};

// Menampilkan lokasi
Procedural.displayLocation(transmigrationArea);

// Menambahkan overlay untuk menandai area-area penting
function addTransmigrationOverlays() {
    // Menambahkan marker untuk pusat administrasi
    Procedural.addOverlay({
        type: 'marker',
        latitude: transmigrationArea.latitude,
        longitude: transmigrationArea.longitude,
        height: 50,
        color: '#1976d2',
        innerRadius: 20,
        outerRadius: 40,
        name: 'Kantor Administrasi'
    });
    
    // Menambahkan area perumahan
    const housingArea = {
        type: 'polygon',
        coordinates: [
            { latitude: transmigrationArea.latitude - 0.01, longitude: transmigrationArea.longitude - 0.01 },
            { latitude: transmigrationArea.latitude - 0.01, longitude: transmigrationArea.longitude + 0.01 },
            { latitude: transmigrationArea.latitude + 0.01, longitude: transmigrationArea.longitude + 0.01 },
            { latitude: transmigrationArea.latitude + 0.01, longitude: transmigrationArea.longitude - 0.01 }
        ],
        color: '#e57373',
        opacity: 0.5,
        name: 'Area Perumahan'
    };
    Procedural.addOverlay(housingArea);
    
    // Menambahkan area pertanian
    const farmingArea = {
        type: 'polygon',
        coordinates: [
            { latitude: transmigrationArea.latitude - 0.02, longitude: transmigrationArea.longitude - 0.02 },
            { latitude: transmigrationArea.latitude - 0.02, longitude: transmigrationArea.longitude - 0.01 },
            { latitude: transmigrationArea.latitude - 0.01, longitude: transmigrationArea.longitude - 0.01 },
            { latitude: transmigrationArea.latitude - 0.01, longitude: transmigrationArea.longitude - 0.02 }
        ],
        color: '#81c784',
        opacity: 0.5,
        name: 'Area Pertanian'
    };
    Procedural.addOverlay(farmingArea);
    
    // Menambahkan jalan utama
    const mainRoad = {
        type: 'line',
        coordinates: [
            { latitude: transmigrationArea.latitude - 0.02, longitude: transmigrationArea.longitude },
            { latitude: transmigrationArea.latitude + 0.02, longitude: transmigrationArea.longitude }
        ],
        color: '#424242',
        width: 10,
        name: 'Jalan Utama'
    };
    Procedural.addOverlay(mainRoad);
    
    // Menambahkan jalan sekunder
    const secondaryRoad = {
        type: 'line',
        coordinates: [
            { latitude: transmigrationArea.latitude, longitude: transmigrationArea.longitude - 0.02 },
            { latitude: transmigrationArea.latitude, longitude: transmigrationArea.longitude + 0.02 }
        ],
        color: '#757575',
        width: 5,
        name: 'Jalan Sekunder'
    };
    Procedural.addOverlay(secondaryRoad);
    
    // Menambahkan fasilitas publik
    const facilities = [
        { name: 'Sekolah', lat: transmigrationArea.latitude + 0.005, lng: transmigrationArea.longitude + 0.005, color: '#ffa000' },
        { name: 'Klinik', lat: transmigrationArea.latitude - 0.005, lng: transmigrationArea.longitude + 0.005, color: '#f44336' },
        { name: 'Pasar', lat: transmigrationArea.latitude + 0.005, lng: transmigrationArea.longitude - 0.005, color: '#7cb342' }
    ];
    
    facilities.forEach(facility => {
        Procedural.addOverlay({
            type: 'marker',
            latitude: facility.lat,
            longitude: facility.lng,
            height: 30,
            color: facility.color,
            innerRadius: 15,
            outerRadius: 30,
            name: facility.name
        });
    });
}

// Menambahkan overlay setelah lokasi dimuat
Procedural.onLocationLoaded(() => {
    addTransmigrationOverlays();
});

// Menambahkan event listener untuk tombol kontrol
document.getElementById('viewFull').addEventListener('click', function() {
    Procedural.focusOnLocation(transmigrationArea, { 
        altitude: 5000,
        animationDuration: 1.5
    });
});

document.getElementById('viewHousing').addEventListener('click', function() {
    Procedural.focusOnLocation({ 
        latitude: transmigrationArea.latitude, 
        longitude: transmigrationArea.longitude,
        altitude: 1000
    }, { 
        animationDuration: 1.5
    });
});

document.getElementById('viewFarms').addEventListener('click', function() {
    Procedural.focusOnLocation({ 
        latitude: transmigrationArea.latitude - 0.015, 
        longitude: transmigrationArea.longitude - 0.015,
        altitude: 1000
    }, { 
        animationDuration: 1.5
    });
});

document.getElementById('viewInfrastructure').addEventListener('click', function() {
    Procedural.focusOnLocation({ 
        latitude: transmigrationArea.latitude, 
        longitude: transmigrationArea.longitude,
        altitude: 2000
    }, { 
        animationDuration: 1.5
    });
});

// Menambahkan event listener untuk interaksi dengan fitur
Procedural.onFeatureClicked((feature) => {
    alert(`Anda mengklik: ${feature.name}`);
}); 