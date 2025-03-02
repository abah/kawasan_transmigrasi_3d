// Konfigurasi panorama untuk setiap lokasi
const panoramaLocations = {
    desa: {
        title: "Desa Transmigrasi",
        imageSource: "https://images.unsplash.com/photo-1494587351196-bbf5f29cff42?auto=format&fit=crop&w=2000&q=80",
        hotSpots: [
            {
                pitch: -3,
                yaw: 117,
                type: "info",
                text: "Rumah Penduduk",
                id: "rumah"
            },
            {
                pitch: -9,
                yaw: 222,
                type: "info",
                text: "Balai Desa",
                id: "balai"
            },
            {
                pitch: 2,
                yaw: 43,
                type: "scene",
                text: "Menuju Lahan Pertanian",
                sceneId: "pertanian"
            }
        ]
    },
    hutan: {
        title: "Kawasan Hutan",
        imageSource: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80",
        hotSpots: [
            {
                pitch: -3,
                yaw: 117,
                type: "info",
                text: "Hutan Konservasi",
                id: "konservasi"
            },
            {
                pitch: 2,
                yaw: 43,
                type: "scene",
                text: "Menuju Desa",
                sceneId: "desa"
            }
        ]
    },
    sungai: {
        title: "Tepi Sungai",
        imageSource: "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=2000&q=80",
        hotSpots: [
            {
                pitch: -3,
                yaw: 117,
                type: "info",
                text: "Dermaga Kecil",
                id: "dermaga"
            },
            {
                pitch: 2,
                yaw: 43,
                type: "scene",
                text: "Menuju Desa",
                sceneId: "desa"
            }
        ]
    },
    pertanian: {
        title: "Lahan Pertanian",
        imageSource: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
        hotSpots: [
            {
                pitch: -3,
                yaw: 117,
                type: "info",
                text: "Tanaman Pangan",
                id: "tanaman"
            },
            {
                pitch: 2,
                yaw: 43,
                type: "scene",
                text: "Menuju Desa",
                sceneId: "desa"
            }
        ]
    },
    penduduk: {
        title: "Kehidupan Masyarakat",
        imageSource: "https://images.unsplash.com/photo-1517732306149-e8f829eb588a?auto=format&fit=crop&w=2000&q=80",
        hotSpots: [
            {
                pitch: -3,
                yaw: 117,
                type: "info",
                text: "Aktivitas Warga",
                id: "aktivitas"
            },
            {
                pitch: 2,
                yaw: 43,
                type: "scene",
                text: "Menuju Desa",
                sceneId: "desa"
            }
        ]
    }
};

// Informasi untuk setiap hotspot
const hotspotInfo = {
    rumah: {
        title: "Rumah Penduduk",
        content: "Rumah-rumah di kawasan transmigrasi dibangun dengan standar yang sama, terdiri dari 2 kamar tidur, ruang tamu, dan dapur. Setiap rumah memiliki lahan pekarangan seluas 0.25 hektar untuk berkebun."
    },
    balai: {
        title: "Balai Desa",
        content: "Balai desa menjadi pusat kegiatan administrasi dan pertemuan warga. Di sini juga terdapat fasilitas posyandu dan perpustakaan kecil untuk masyarakat."
    },
    konservasi: {
        title: "Hutan Konservasi",
        content: "Kawasan hutan konservasi seluas 100 hektar yang dilindungi untuk menjaga keseimbangan ekosistem dan sumber air bagi kawasan transmigrasi."
    },
    dermaga: {
        title: "Dermaga Kecil",
        content: "Dermaga ini digunakan penduduk untuk transportasi dan aktivitas perikanan. Sungai menjadi salah satu sumber penghidupan bagi sebagian warga."
    },
    tanaman: {
        title: "Tanaman Pangan",
        content: "Lahan pertanian padi menjadi sumber utama penghasilan penduduk. Dengan sistem irigasi yang baik, petani dapat panen hingga 2-3 kali dalam setahun."
    },
    aktivitas: {
        title: "Aktivitas Warga",
        content: "Penduduk transmigrasi memiliki berbagai aktivitas, dari bertani, beternak, hingga kegiatan ekonomi kreatif seperti kerajinan tangan yang dipasarkan ke kota."
    }
};

// Inisialisasi panorama
let viewer;

function initPanorama(locationId = 'desa') {
    const location = panoramaLocations[locationId];
    
    // Jika viewer sudah ada, hapus dulu
    if (viewer) {
        viewer.destroy();
    }
    
    // Buat viewer baru
    viewer = pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: location.imageSource,
        autoLoad: true,
        title: location.title,
        hotSpots: location.hotSpots,
        hfov: 110,
        compass: true,
        northOffset: 247.5,
        showZoomCtrl: false,
        keyboardZoom: false
    });
    
    // Event listener untuk hotspot
    viewer.on('click', function(e) {
        if (e.target.classList.contains('pnlm-hotspot')) {
            const hotspotId = e.target.getAttribute('data-hotspot-id');
            const hotspotData = location.hotSpots.find(h => h.id === hotspotId);
            
            if (hotspotData) {
                if (hotspotData.type === 'info') {
                    showInfoPanel(hotspotData.id);
                } else if (hotspotData.type === 'scene') {
                    loadNewScene(hotspotData.sceneId);
                }
            }
        }
    });
    
    // Tampilkan story untuk lokasi ini
    showStory(locationId);
}

function showInfoPanel(infoId) {
    const info = hotspotInfo[infoId];
    if (!info) return;
    
    const infoPanel = document.getElementById('info-panel');
    const infoContent = infoPanel.querySelector('.info-content');
    
    infoContent.innerHTML = `
        <h2>${info.title}</h2>
        <p>${info.content}</p>
    `;
    
    infoPanel.classList.remove('hidden');
    
    // Close button
    infoPanel.querySelector('.close-btn').addEventListener('click', function() {
        infoPanel.classList.add('hidden');
    });
}

function loadNewScene(sceneId) {
    initPanorama(sceneId);
}

// Event listener untuk navigasi POI
document.querySelectorAll('#poi-navigation li').forEach(item => {
    item.addEventListener('click', function() {
        const poiId = this.getAttribute('data-poi');
        initPanorama(poiId);
    });
});

// Inisialisasi dengan scene default
document.addEventListener('DOMContentLoaded', function() {
    initPanorama();
    
    // Deteksi mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.getElementById('mobile-controls').style.display = 'block';
        
        document.getElementById('mobile-toggle').addEventListener('click', function() {
            document.getElementById('mobile-controls').style.display = 'none';
        });
    }
}); 