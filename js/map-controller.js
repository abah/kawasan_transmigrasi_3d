// Inisialisasi peta
function initMap() {
    const mapContainer = document.getElementById('map-container');
    
    // Buat elemen peta
    const mapElement = document.createElement('div');
    mapElement.style.width = '100%';
    mapElement.style.height = '100%';
    mapElement.style.position = 'relative';
    // Menggunakan peta online dari Wikimedia
    mapElement.style.backgroundImage = 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Indonesia_Topography.png/800px-Indonesia_Topography.png")';
    mapElement.style.backgroundSize = 'cover';
    mapElement.style.backgroundPosition = 'center';
    
    mapContainer.appendChild(mapElement);
    
    // Tambahkan marker untuk setiap POI
    const pois = [
        { id: 'desa', x: 50, y: 50, label: 'Desa' },
        { id: 'hutan', x: 70, y: 30, label: 'Hutan' },
        { id: 'sungai', x: 30, y: 60, label: 'Sungai' },
        { id: 'pertanian', x: 60, y: 70, label: 'Pertanian' },
        { id: 'penduduk', x: 40, y: 40, label: 'Penduduk' }
    ];
    
    pois.forEach(poi => {
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = poi.x + '%';
        marker.style.top = poi.y + '%';
        marker.style.width = '20px';
        marker.style.height = '20px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = '#4CAF50';
        marker.style.transform = 'translate(-50%, -50%)';
        marker.style.cursor = 'pointer';
        marker.setAttribute('data-poi', poi.id);
        
        // Label
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.left = '50%';
        label.style.bottom = '-20px';
        label.style.transform = 'translateX(-50%)';
        label.style.whiteSpace = 'nowrap';
        label.style.color = 'white';
        label.style.fontSize = '12px';
        label.textContent = poi.label;
        
        marker.appendChild(label);
        mapElement.appendChild(marker);
        
        // Event listener
        marker.addEventListener('click', function() {
            const poiId = this.getAttribute('data-poi');
            initPanorama(poiId);
        });
    });
    
    // Tambahkan user location
    const userLocation = document.createElement('div');
    userLocation.style.position = 'absolute';
    userLocation.style.left = '50%';
    userLocation.style.top = '50%';
    userLocation.style.width = '15px';
    userLocation.style.height = '15px';
    userLocation.style.borderRadius = '50%';
    userLocation.style.backgroundColor = 'red';
    userLocation.style.transform = 'translate(-50%, -50%)';
    
    mapElement.appendChild(userLocation);
}

// Toggle map visibility
document.getElementById('toggle-map').addEventListener('click', function() {
    const mapContainer = document.getElementById('map-container');
    
    if (mapContainer.style.display === 'none' || mapContainer.style.display === '') {
        mapContainer.style.display = 'block';
        this.textContent = 'Tutup Peta';
        
        // Initialize map if not already
        if (mapContainer.children.length === 0) {
            initMap();
        }
    } else {
        mapContainer.style.display = 'none';
        this.textContent = 'Lihat Peta';
    }
}); 