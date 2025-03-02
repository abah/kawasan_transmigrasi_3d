// Data cerita untuk setiap lokasi
const storyData = {
    desa: {
        title: "Desa Transmigrasi Air Raja",
        content: "Desa Air Raja adalah salah satu desa transmigrasi yang berhasil berkembang menjadi kawasan mandiri. Didirikan pada tahun 1985, desa ini kini menjadi contoh keberhasilan program transmigrasi lokal yang fokus pada pengembangan potensi setempat tanpa harus mendatangkan penduduk dari luar daerah.",
        steps: [
            "Desa ini awalnya hanya dihuni oleh 50 keluarga",
            "Kini telah berkembang menjadi 250 keluarga dengan berbagai fasilitas",
            "Menjadi model percontohan program TRANSLOK di Kepulauan Riau"
        ]
    },
    hutan: {
        title: "Kawasan Hutan Konservasi",
        content: "Kawasan hutan di sekitar desa transmigrasi menjadi area konservasi yang dilindungi. Penduduk desa berperan aktif dalam menjaga kelestarian hutan ini, yang menjadi sumber air dan penyeimbang ekosistem bagi kawasan sekitarnya.",
        steps: [
            "Hutan ini menjadi habitat bagi 120 spesies tumbuhan lokal",
            "Program reboisasi telah menambah luas hutan sebesar 15% dalam 5 tahun terakhir",
            "Masyarakat memanfaatkan hasil hutan non-kayu secara berkelanjutan"
        ]
    },
    sungai: {
        title: "Sungai Kehidupan",
        content: "Sungai yang mengalir di tengah kawasan transmigrasi menjadi urat nadi kehidupan penduduk. Selain untuk irigasi pertanian, sungai ini juga menjadi jalur transportasi dan sumber protein hewani bagi masyarakat.",
        steps: [
            "Sistem irigasi modern telah dibangun untuk mengoptimalkan pemanfaatan air",
            "Budidaya ikan air tawar di sepanjang sungai menjadi sumber penghasilan tambahan",
            "Program konservasi bantaran sungai mencegah erosi dan banjir"
        ]
    },
    pertanian: {
        title: "Lahan Pertanian Produktif",
        content: "Lahan pertanian di kawasan transmigrasi dikelola dengan sistem pertanian terpadu. Kombinasi tanaman pangan, hortikultura, dan perkebunan memberikan hasil yang optimal dan berkelanjutan.",
        steps: [
            "Setiap keluarga mendapatkan lahan pertanian seluas 2 hektar",
            "Sistem pertanian terpadu meningkatkan produktivitas hingga 40%",
            "Hasil pertanian diolah di sentra industri kecil di dalam desa"
        ]
    },
    penduduk: {
        title: "Kehidupan Masyarakat Transmigran",
        content: "Masyarakat transmigran di Desa Air Raja memiliki kehidupan yang harmonis dan produktif. Berbagai kegiatan sosial, ekonomi, dan budaya memperkuat kohesi sosial dan meningkatkan kesejahteraan bersama.",
        steps: [
            "Pendapatan per kapita meningkat 300% dalam 20 tahun terakhir",
            "Angka partisipasi sekolah mencapai 98% untuk tingkat dasar dan menengah",
            "Koperasi desa mengelola aset senilai 2 miliar rupiah"
        ]
    }
};

let currentStoryStep = 0;

function showStory(locationId) {
    const story = storyData[locationId];
    if (!story) return;
    
    const storyOverlay = document.getElementById('story-overlay');
    const storyTitle = storyOverlay.querySelector('.story-title');
    const storyContent = storyOverlay.querySelector('.story-content');
    
    storyTitle.textContent = story.title;
    storyContent.textContent = story.content;
    
    storyOverlay.classList.remove('hidden');
    currentStoryStep = 0;
    
    // Next button
    storyOverlay.querySelector('.story-next').addEventListener('click', function() {
        if (currentStoryStep < story.steps.length) {
            storyContent.textContent = story.steps[currentStoryStep];
            currentStoryStep++;
        } else {
            storyOverlay.classList.add('hidden');
        }
    });
}

// Action buttons
document.getElementById('become-protector').addEventListener('click', function() {
    const infoPanel = document.getElementById('info-panel');
    const infoContent = infoPanel.querySelector('.info-content');
    
    infoContent.innerHTML = `
        <h2>Dukung Program Transmigrasi</h2>
        <p>Anda dapat mendukung program transmigrasi lokal dengan berbagai cara:</p>
        <ul>
            <li>Menjadi relawan pemberdayaan masyarakat</li>
            <li>Investasi di usaha kecil menengah di kawasan transmigrasi</li>
            <li>Membeli produk-produk hasil kawasan transmigrasi</li>
        </ul>
        <form id="support-form">
            <input type="text" placeholder="Nama" required>
            <input type="email" placeholder="Email" required>
            <button type="submit">Daftar Sebagai Pendukung</button>
        </form>
    `;
    
    infoPanel.classList.remove('hidden');
    
    // Form submission
    document.getElementById('support-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Terima kasih atas dukungan Anda! Kami akan menghubungi Anda segera.');
        infoPanel.classList.add('hidden');
    });
});

document.getElementById('share-button').addEventListener('click', function() {
    if (navigator.share) {
        navigator.share({
            title: 'Eksplorasi Kawasan Transmigrasi',
            text: 'Jelajahi kawasan transmigrasi dalam visualisasi interaktif 360°',
            url: window.location.href
        });
    } else {
        alert('Bagikan tautan ini: ' + window.location.href);
    }
}); 