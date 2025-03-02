// Variabel animasi
let mixers = [];
let clock;

// Inisialisasi animasi
function initAnimation() {
    // Inisialisasi clock
    clock = new THREE.Clock();
}

// Update animasi
function updateAnimations(delta) {
    // Update mixer animasi
    for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
    }
    
    // Update kendaraan
    updateVehicles(delta);
    
    // Update orang
    updatePeople(delta);
    
    // Update awan
    updateClouds(delta);
}

// Update kendaraan
function updateVehicles(delta) {
    for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        const userData = vehicle.userData;
        
        if (userData.road === 'horizontal') {
            // Kendaraan di jalan horizontal
            vehicle.position.x += userData.speed * userData.direction;
            
            // Jika keluar batas, kembalikan ke sisi lain
            if (userData.direction > 0 && vehicle.position.x > 250) {
                vehicle.position.x = -250;
            } else if (userData.direction < 0 && vehicle.position.x < -250) {
                vehicle.position.x = 250;
            }
        } else if (userData.road === 'vertical') {
            // Kendaraan di jalan vertikal
            vehicle.position.z += userData.speed * userData.direction;
            
            // Jika keluar batas, kembalikan ke sisi lain
            if (userData.direction > 0 && vehicle.position.z > 250) {
                vehicle.position.z = -250;
            } else if (userData.direction < 0 && vehicle.position.z < -250) {
                vehicle.position.z = 250;
            }
        } else if (userData.road === 'circular') {
            // Kendaraan di jalan melingkar
            userData.angle += userData.speed * 0.01;
            
            vehicle.position.x = Math.cos(userData.angle) * userData.radius;
            vehicle.position.z = Math.sin(userData.angle) * userData.radius;
            
            // Rotasi menghadap arah jalan
            vehicle.rotation.y = userData.angle + Math.PI / 2;
        }
    }
}

// Update orang
function updatePeople(delta) {
    for (let i = 0; i < people.length; i++) {
        const person = people[i];
        const userData = person.userData;
        
        // Update arah secara acak
        if (Math.random() < 0.01) {
            userData.direction += (Math.random() - 0.5) * Math.PI / 4;
        }
        
        // Gerakkan orang
        const dx = Math.cos(userData.direction) * userData.speed;
        const dz = Math.sin(userData.direction) * userData.speed;
        
        person.position.x += dx;
        person.position.z += dz;
        
        // Rotasi menghadap arah jalan
        person.rotation.y = userData.direction;
        
        // Batasi pergerakan dalam radius tertentu dari posisi awal
        const distX = person.position.x - userData.startX;
        const distZ = person.position.z - userData.startZ;
        const dist = Math.sqrt(distX * distX + distZ * distZ);
        
        if (dist > userData.walkRadius) {
            // Balik arah
            userData.direction += Math.PI;
        }
    }
}

// Update awan
function updateClouds(delta) {
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const userData = cloud.userData;
        
        // Update posisi awan
        userData.angle += userData.speed * 0.001;
        
        cloud.position.x = Math.cos(userData.angle) * userData.radius;
        cloud.position.z = Math.sin(userData.angle) * userData.radius;
    }
} 