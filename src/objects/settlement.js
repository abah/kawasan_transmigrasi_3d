/**
 * Creates a circular settlement with radial agricultural fields
 * @param {number} maxRadius - Maximum radius of the settlement
 * @returns {Promise<THREE.Group>} Promise resolving to the settlement group
 */
function createSettlement(maxRadius = 350) {
    return new Promise((resolve) => {
        // Create a group to hold all settlement elements
        const settlementGroup = new THREE.Group();
        
        // Scale all radii based on the maxRadius parameter
        const scale = maxRadius / 350; // Scale factor based on default maxRadius
        const centerRadius = 30 * scale;      // Radius of central area
        const innerRadius = 60 * scale;       // Radius of inner residential ring
        const middleRadius = 120 * scale;     // Radius of middle facilities ring
        const outerRadius = 200 * scale;      // Radius of outer agricultural ring
        
        // Create central area (administrative and community buildings)
        createCentralArea(settlementGroup, centerRadius);
        
        // Create inner residential ring
        createResidentialRing(settlementGroup, centerRadius, innerRadius);
        
        // Create middle facilities ring (schools, markets, etc.)
        createFacilitiesRing(settlementGroup, innerRadius, middleRadius);
        
        // Create agricultural fields in radial pattern
        createAgriculturalFields(settlementGroup, middleRadius, outerRadius);
        
        // Create outer sparse settlements
        createOuterSettlements(settlementGroup, outerRadius, maxRadius);
        
        // Create roads (radial and concentric)
        createRoadNetwork(settlementGroup, centerRadius, maxRadius);
        
        // Create moving vehicles
        createMovingVehicles(settlementGroup, centerRadius, maxRadius);
        
        // Create labels for different areas (only in the main settlement)
        if (Math.abs(maxRadius - 350) < 1) { // Only add labels to original-sized settlement
            createLabels(settlementGroup);
        }
        
        // Resolve the promise with the settlement group
        resolve(settlementGroup);
    });
}

/**
 * Creates the central administrative area
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} radius - Radius of central area
 */
function createCentralArea(parent, radius) {
    // Create a circular platform for the central area
    const platformGeometry = new THREE.CircleGeometry(radius, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999, // Gray color for concrete/stone
        roughness: 0.7,
        metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2; // Rotate to horizontal
    platform.position.y = 0.2; // Slightly above ground
    platform.receiveShadow = true;
    parent.add(platform);
    
    // Add central administrative building
    RealisticElements.createRealisticHouse({
        style: 'modern',
        scale: 2.0 * (radius / 30), // Scale relative to radius
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    }, (building) => {
        building.userData = { type: 'administrative' };
        parent.add(building);
    });
    
    // Add smaller community buildings around the center
    const buildingCount = 5;
    for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        const distance = radius * 0.6;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        RealisticElements.createRealisticHouse({
            style: 'modern',
            scale: 1.0 * (radius / 30), // Scale relative to radius
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: angle + Math.PI, z: 0 }
        }, (building) => {
            building.userData = { type: 'community' };
            parent.add(building);
        });
    }
}

/**
 * Creates the residential ring around the center
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} innerRadius - Inner radius of the ring
 * @param {number} outerRadius - Outer radius of the ring
 */
function createResidentialRing(parent, innerRadius, outerRadius) {
    // Create a circular platform for the residential area
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 1);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC, // Light gray
        roughness: 0.8,
        metalness: 0.1
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2; // Rotate to horizontal
    ring.position.y = 0.1; // Slightly above ground
    ring.receiveShadow = true;
    parent.add(ring);
    
    // Add houses in concentric rings
    const ringCount = 2; // Number of house rings
    const housesPerRing = [12, 20]; // Houses in each ring
    const scaleFactor = innerRadius / 30; // Scale factor based on inner radius
    
    for (let ring = 0; ring < ringCount; ring++) {
        const ringRadius = innerRadius + (outerRadius - innerRadius) * (ring + 0.5) / ringCount;
        const houseCount = Math.floor(housesPerRing[ring] * scaleFactor);
        
        for (let i = 0; i < houseCount; i++) {
            const angle = (i / houseCount) * Math.PI * 2;
            const x = Math.cos(angle) * ringRadius;
            const z = Math.sin(angle) * ringRadius;
            
            // Alternate house styles
            const style = (i % 3 === 0) ? 'modern' : ((i % 3 === 1) ? 'traditional' : 'colonial');
            
            RealisticElements.createRealisticHouse({
                style: style,
                scale: 0.8 * scaleFactor,
                position: { x: x, y: 0, z: z },
                rotation: { x: 0, y: angle + Math.PI, z: 0 }
            }, (house) => {
                house.userData = { type: 'residential' };
                parent.add(house);
            });
        }
    }
}

/**
 * Creates the facilities ring (schools, markets, etc.)
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} innerRadius - Inner radius of the ring
 * @param {number} outerRadius - Outer radius of the ring
 */
function createFacilitiesRing(parent, innerRadius, outerRadius) {
    // Create a circular platform for the facilities area
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 1);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDDDDD, // Very light gray
        roughness: 0.8,
        metalness: 0.1
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2; // Rotate to horizontal
    ring.position.y = 0.05; // Slightly above ground
    ring.receiveShadow = true;
    parent.add(ring);
    
    // Scale factor based on inner radius
    const scaleFactor = innerRadius / 60;
    
    // Add facility buildings at strategic locations
    const facilityCount = Math.floor(8 * scaleFactor);
    for (let i = 0; i < facilityCount; i++) {
        const angle = (i / facilityCount) * Math.PI * 2;
        const distance = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Create larger buildings for facilities
        RealisticElements.createRealisticHouse({
            style: 'modern',
            scale: 1.5 * scaleFactor,
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: angle + Math.PI, z: 0 }
        }, (building) => {
            building.userData = { type: 'facility' };
            parent.add(building);
        });
    }
    
    // Add trees around facilities
    const treeCount = Math.floor(30 * scaleFactor);
    for (let i = 0; i < treeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radiusVariation = innerRadius + (outerRadius - innerRadius) * Math.random();
        const x = Math.cos(angle) * radiusVariation;
        const z = Math.sin(angle) * radiusVariation;
        
        // Random tree type
        const treeTypes = ['maple', 'oak', 'pine'];
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
        
        RealisticElements.createRealisticTree({
            type: treeType,
            scale: (0.8 + Math.random() * 0.4) * scaleFactor,
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
            detail: 'medium'
        }, (tree) => {
            parent.add(tree);
        });
    }
}

/**
 * Creates agricultural fields in a radial pattern
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} innerRadius - Inner radius of agricultural area
 * @param {number} outerRadius - Outer radius of agricultural area
 */
function createAgriculturalFields(parent, innerRadius, outerRadius) {
    // Number of sectors (pie slices)
    const sectorCount = 12;
    
    // Create agricultural sectors
    for (let i = 0; i < sectorCount; i++) {
        const startAngle = (i / sectorCount) * Math.PI * 2;
        const endAngle = ((i + 1) / sectorCount) * Math.PI * 2;
        
        // Create sector geometry
        const sectorShape = new THREE.Shape();
        sectorShape.moveTo(0, 0);
        sectorShape.lineTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
        
        // Create arc
        const arcCurve = new THREE.EllipseCurve(
            0, 0,                                  // Center
            innerRadius, innerRadius,              // X and Y radius
            startAngle, endAngle,                  // Start and end angle
            false                                  // Clockwise
        );
        
        const arcPoints = arcCurve.getPoints(10);
        for (let j = 0; j < arcPoints.length; j++) {
            sectorShape.lineTo(arcPoints[j].x, arcPoints[j].y);
        }
        
        sectorShape.lineTo(0, 0);
        
        // Create geometry and material
        const sectorGeometry = new THREE.ShapeGeometry(sectorShape);
        
        // Different colors for different field types
        let fieldColor;
        switch (i % 4) {
            case 0: fieldColor = 0x7CFC00; break; // Light green (vegetables)
            case 1: fieldColor = 0xFFD700; break; // Gold (wheat/corn)
            case 2: fieldColor = 0x32CD32; break; // Green (rice)
            case 3: fieldColor = 0x8B4513; break; // Brown (plowed field)
        }
        
        const sectorMaterial = new THREE.MeshStandardMaterial({
            color: fieldColor,
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const sector = new THREE.Mesh(sectorGeometry, sectorMaterial);
        sector.rotation.x = -Math.PI / 2; // Rotate to horizontal
        sector.position.y = 0.02; // Slightly above ground
        sector.receiveShadow = true;
        
        // Add field to parent
        parent.add(sector);
        
        // Create outer agricultural fields (larger sectors)
        const outerSectorShape = new THREE.Shape();
        outerSectorShape.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
        
        // Inner arc
        const innerArcCurve = new THREE.EllipseCurve(
            0, 0,                                  // Center
            innerRadius, innerRadius,              // X and Y radius
            startAngle, endAngle,                  // Start and end angle
            false                                  // Clockwise
        );
        
        const innerArcPoints = innerArcCurve.getPoints(10);
        for (let j = 0; j < innerArcPoints.length; j++) {
            outerSectorShape.lineTo(innerArcPoints[j].x, innerArcPoints[j].y);
        }
        
        // Outer arc
        const outerArcCurve = new THREE.EllipseCurve(
            0, 0,                                  // Center
            outerRadius, outerRadius,              // X and Y radius
            endAngle, startAngle,                  // Start and end angle (reversed)
            true                                   // Clockwise
        );
        
        const outerArcPoints = outerArcCurve.getPoints(10);
        for (let j = 0; j < outerArcPoints.length; j++) {
            outerSectorShape.lineTo(outerArcPoints[j].x, outerArcPoints[j].y);
        }
        
        outerSectorShape.closePath();
        
        // Create geometry and material for outer sector
        const outerSectorGeometry = new THREE.ShapeGeometry(outerSectorShape);
        
        // Different color for outer fields
        let outerFieldColor;
        switch ((i + 2) % 4) {
            case 0: outerFieldColor = 0x7CFC00; break; // Light green (vegetables)
            case 1: outerFieldColor = 0xFFD700; break; // Gold (wheat/corn)
            case 2: outerFieldColor = 0x32CD32; break; // Green (rice)
            case 3: outerFieldColor = 0x8B4513; break; // Brown (plowed field)
        }
        
        const outerSectorMaterial = new THREE.MeshStandardMaterial({
            color: outerFieldColor,
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const outerSector = new THREE.Mesh(outerSectorGeometry, outerSectorMaterial);
        outerSector.rotation.x = -Math.PI / 2; // Rotate to horizontal
        outerSector.position.y = 0.01; // Slightly above ground
        outerSector.receiveShadow = true;
        
        // Add outer field to parent
        parent.add(outerSector);
    }
}

/**
 * Creates scattered settlements in the outer ring
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} innerRadius - Inner radius of outer ring
 * @param {number} outerRadius - Outer radius of outer ring
 */
function createOuterSettlements(parent, innerRadius, outerRadius) {
    // Scale factor based on inner radius
    const scaleFactor = innerRadius / 200;
    
    // Add scattered houses in the outer ring
    const houseCount = Math.floor(30 * scaleFactor);
    
    for (let i = 0; i < houseCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = innerRadius + (outerRadius - innerRadius) * Math.random();
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Random house style
        const styles = ['traditional', 'colonial', 'modern'];
        const style = styles[Math.floor(Math.random() * styles.length)];
        
        RealisticElements.createRealisticHouse({
            style: style,
            scale: 0.7 * scaleFactor,
            position: { x: x, y: 0, z: z },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
        }, (house) => {
            house.userData = { type: 'outer_residential' };
            parent.add(house);
        });
        
        // Add some trees near houses
        const treeCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < treeCount; j++) {
            const treeX = x + (Math.random() * 10 - 5) * scaleFactor;
            const treeZ = z + (Math.random() * 10 - 5) * scaleFactor;
            
            // Random tree type
            const treeTypes = ['maple', 'oak', 'pine', 'palm'];
            const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            
            RealisticElements.createRealisticTree({
                type: treeType,
                scale: (0.6 + Math.random() * 0.4) * scaleFactor,
                position: { x: treeX, y: 0, z: treeZ },
                rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
                detail: 'medium'
            }, (tree) => {
                parent.add(tree);
            });
        }
    }
}

/**
 * Creates the road network (radial and concentric)
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} centerRadius - Radius of central area
 * @param {number} maxRadius - Maximum radius of settlement
 */
function createRoadNetwork(parent, centerRadius, maxRadius) {
    // Scale factor based on center radius
    const scaleFactor = centerRadius / 30;
    
    // Road material
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, // Dark gray for asphalt
        roughness: 0.8,
        metalness: 0.1
    });
    
    // Create concentric circular roads
    const circularRoadRadii = [
        centerRadius, 
        centerRadius * 2, 
        centerRadius * 4, 
        centerRadius * 6.67
    ];
    const circularRoadWidth = 4 * scaleFactor;
    
    for (let i = 0; i < circularRoadRadii.length; i++) {
        const radius = circularRoadRadii[i];
        const roadGeometry = new THREE.RingGeometry(
            radius - circularRoadWidth/2, 
            radius + circularRoadWidth/2, 
            64, 1
        );
        
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2; // Rotate to horizontal
        road.position.y = 0.1; // Slightly above ground to prevent z-fighting
        road.receiveShadow = true;
        parent.add(road);
    }
    
    // Create radial roads
    const radialRoadCount = 12;
    
    for (let i = 0; i < radialRoadCount; i++) {
        const angle = (i / radialRoadCount) * Math.PI * 2;
        
        // Create a rectangular shape for the road
        const roadShape = new THREE.Shape();
        
        // Width of road at angle (in radians)
        const roadWidthAngle = 0.02 * (1 / scaleFactor);
        
        // Calculate corners of the rectangle
        const x1 = Math.cos(angle - roadWidthAngle) * centerRadius;
        const z1 = Math.sin(angle - roadWidthAngle) * centerRadius;
        const x2 = Math.cos(angle + roadWidthAngle) * centerRadius;
        const z2 = Math.sin(angle + roadWidthAngle) * centerRadius;
        const x3 = Math.cos(angle + roadWidthAngle) * maxRadius;
        const z3 = Math.sin(angle + roadWidthAngle) * maxRadius;
        const x4 = Math.cos(angle - roadWidthAngle) * maxRadius;
        const z4 = Math.sin(angle - roadWidthAngle) * maxRadius;
        
        // Draw the road shape
        roadShape.moveTo(x1, z1);
        roadShape.lineTo(x2, z2);
        roadShape.lineTo(x3, z3);
        roadShape.lineTo(x4, z4);
        roadShape.closePath();
        
        const roadGeometry = new THREE.ShapeGeometry(roadShape);
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2; // Rotate to horizontal
        road.position.y = 0.1; // Slightly above ground
        road.receiveShadow = true;
        parent.add(road);
    }
}

/**
 * Creates moving vehicles on the roads
 * @param {THREE.Group} parent - Parent group to add to
 * @param {number} centerRadius - Radius of central area
 * @param {number} maxRadius - Maximum radius of settlement
 */
function createMovingVehicles(parent, centerRadius, maxRadius) {
    // Scale factor based on center radius
    const scaleFactor = centerRadius / 30;
    
    // Number of vehicles
    const vehicleCount = Math.floor(20 * scaleFactor);
    
    // Vehicle properties
    const vehicleGroup = new THREE.Group();
    vehicleGroup.userData = { type: 'vehicles' };
    
    // Create vehicles on circular roads
    const circularRoadRadii = [
        centerRadius * 2, 
        centerRadius * 4, 
        centerRadius * 6.67
    ];
    
    for (let i = 0; i < vehicleCount; i++) {
        // Random road selection
        const roadIndex = Math.floor(Math.random() * circularRoadRadii.length);
        const radius = circularRoadRadii[roadIndex];
        
        // Random position on road
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Create simple vehicle
        const vehicleType = Math.random() > 0.7 ? 'truck' : 'car';
        const vehicle = createVehicle(vehicleType, scaleFactor);
        
        // Position vehicle
        vehicle.position.set(x, 0.5 * scaleFactor, z);
        vehicle.rotation.y = angle + Math.PI / 2; // Face tangent to circle
        
        // Add vehicle data for animation
        vehicle.userData = {
            road: 'circular',
            radius: radius,
            angle: angle,
            speed: 0.0005 + Math.random() * 0.001,
            direction: Math.random() > 0.5 ? 1 : -1, // Clockwise or counterclockwise
        };
        
        vehicleGroup.add(vehicle);
    }
    
    // Create vehicles on radial roads
    const radialVehicleCount = Math.floor(10 * scaleFactor);
    
    for (let i = 0; i < radialVehicleCount; i++) {
        // Random radial angle
        const roadAngle = Math.floor(Math.random() * 12) * (Math.PI / 6);
        
        // Random distance along road
        const minRadius = centerRadius * 1.2;
        const distanceFromCenter = minRadius + Math.random() * (maxRadius - minRadius);
        
        const x = Math.cos(roadAngle) * distanceFromCenter;
        const z = Math.sin(roadAngle) * distanceFromCenter;
        
        // Create simple vehicle
        const vehicleType = Math.random() > 0.8 ? 'truck' : 'car';
        const vehicle = createVehicle(vehicleType, scaleFactor);
        
        // Position vehicle
        vehicle.position.set(x, 0.5 * scaleFactor, z);
        vehicle.rotation.y = roadAngle; // Face along the road
        
        // Add vehicle data for animation
        vehicle.userData = {
            road: 'radial',
            angle: roadAngle,
            distance: distanceFromCenter,
            minRadius: minRadius,
            maxRadius: maxRadius * 0.95,
            speed: 0.2 + Math.random() * 0.3,
            direction: Math.random() > 0.5 ? 1 : -1, // Inward or outward
        };
        
        vehicleGroup.add(vehicle);
    }
    
    parent.add(vehicleGroup);
}

/**
 * Creates a simple vehicle
 * @param {string} type - Type of vehicle ('car' or 'truck')
 * @param {number} scale - Scale factor
 * @returns {THREE.Group} The vehicle group
 */
function createVehicle(type, scale) {
    const vehicle = new THREE.Group();
    
    if (type === 'car') {
        // Simple car body
        const bodyGeometry = new THREE.BoxGeometry(4 * scale, 1.5 * scale, 2 * scale);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0xff0000 : (Math.random() > 0.5 ? 0x0000ff : 0xffff00),
            roughness: 0.5,
            metalness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75 * scale;
        body.castShadow = true;
        vehicle.add(body);
        
        // Add car roof
        const roofGeometry = new THREE.BoxGeometry(2 * scale, 1 * scale, 1.8 * scale);
        const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
        roof.position.y = 2 * scale;
        roof.position.x = -0.5 * scale;
        roof.castShadow = true;
        vehicle.add(roof);
        
        // Add wheel placeholders
        const wheelGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.5 * scale, 0.4 * scale, 8);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.7,
            metalness: 0.2
        });
        
        const wheelPositions = [
            { x: 1.5, y: 0.5, z: 1.1 },
            { x: 1.5, y: 0.5, z: -1.1 },
            { x: -1.5, y: 0.5, z: 1.1 },
            { x: -1.5, y: 0.5, z: -1.1 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
            wheel.rotation.x = Math.PI / 2;
            wheel.castShadow = true;
            vehicle.add(wheel);
        });
    } else {
        // Truck body (larger)
        const bodyGeometry = new THREE.BoxGeometry(6 * scale, 2.5 * scale, 2.5 * scale);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x22cc44 : 0x444444,
            roughness: 0.6,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.25 * scale;
        body.castShadow = true;
        vehicle.add(body);
        
        // Add cab
        const cabGeometry = new THREE.BoxGeometry(2 * scale, 2 * scale, 2.5 * scale);
        const cabMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? bodyMaterial.color : 0xcccccc,
            roughness: 0.5,
            metalness: 0.5
        });
        const cab = new THREE.Mesh(cabGeometry, cabMaterial);
        cab.position.x = -2 * scale;
        cab.position.y = 1 * scale;
        cab.castShadow = true;
        vehicle.add(cab);
        
        // Add wheel placeholders (more wheels for truck)
        const wheelGeometry = new THREE.CylinderGeometry(0.6 * scale, 0.6 * scale, 0.5 * scale, 8);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.7,
            metalness: 0.2
        });
        
        const wheelPositions = [
            { x: 2, y: 0.6, z: 1.3 },
            { x: 2, y: 0.6, z: -1.3 },
            { x: 0, y: 0.6, z: 1.3 },
            { x: 0, y: 0.6, z: -1.3 },
            { x: -2, y: 0.6, z: 1.3 },
            { x: -2, y: 0.6, z: -1.3 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
            wheel.rotation.x = Math.PI / 2;
            wheel.castShadow = true;
            vehicle.add(wheel);
        });
    }
    
    return vehicle;
}

/**
 * Animates all vehicles in the scene
 * @param {number} deltaTime - Time since last frame in seconds
 */
function animateVehicles(deltaTime) {
    if (!settlement) return;
    
    // Find vehicle group and animate each vehicle
    settlement.traverse(object => {
        if (object.userData && object.userData.type === 'vehicles') {
            object.children.forEach(vehicle => {
                if (vehicle.userData.road === 'circular') {
                    // Update angle for circular road
                    vehicle.userData.angle += vehicle.userData.speed * vehicle.userData.direction * deltaTime;
                    
                    // Calculate new position
                    const radius = vehicle.userData.radius;
                    const angle = vehicle.userData.angle;
                    
                    vehicle.position.x = Math.cos(angle) * radius;
                    vehicle.position.z = Math.sin(angle) * radius;
                    
                    // Update rotation to face tangent to circle
                    vehicle.rotation.y = angle + Math.PI / 2;
                    
                } else if (vehicle.userData.road === 'radial') {
                    // Update distance for radial road
                    vehicle.userData.distance += vehicle.userData.speed * vehicle.userData.direction * deltaTime;
                    
                    // Check bounds and reverse direction if needed
                    if (vehicle.userData.distance > vehicle.userData.maxRadius) {
                        vehicle.userData.distance = vehicle.userData.maxRadius;
                        vehicle.userData.direction *= -1;
                    } else if (vehicle.userData.distance < vehicle.userData.minRadius) {
                        vehicle.userData.distance = vehicle.userData.minRadius;
                        vehicle.userData.direction *= -1;
                    }
                    
                    // Calculate new position
                    const angle = vehicle.userData.angle;
                    const distance = vehicle.userData.distance;
                    
                    vehicle.position.x = Math.cos(angle) * distance;
                    vehicle.position.z = Math.sin(angle) * distance;
                    
                    // Update rotation based on direction
                    if (vehicle.userData.direction > 0) {
                        vehicle.rotation.y = angle;
                    } else {
                        vehicle.rotation.y = angle + Math.PI;
                    }
                }
            });
        }
    });
}

/**
 * Creates text labels for different areas
 * @param {THREE.Group} parent - Parent group to add to
 */
function createLabels(parent) {
    // Create a canvas-based texture for text
    function createTextTexture(text, width, height, fontSize, bgColor, textColor) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        // Background
        context.fillStyle = bgColor;
        context.fillRect(0, 0, width, height);
        
        // Text
        context.font = `${fontSize}px Arial`;
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, width / 2, height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // Create a label
    function createLabel(text, position, rotation = { x: -Math.PI / 2, y: 0, z: 0 }) {
        const width = 100;
        const height = 40;
        const texture = createTextTexture(text, width, height, 20, 'rgba(0, 0, 0, 0.7)', 'white');
        
        const geometry = new THREE.PlaneGeometry(20, 8);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const label = new THREE.Mesh(geometry, material);
        label.position.set(position.x, position.y, position.z);
        label.rotation.set(rotation.x, rotation.y, rotation.z);
        
        // Mark as label for toggle visibility
        label.userData = { isLabel: true };
        
        return label;
    }
    
    // Add labels for different areas
    const labels = [
        { text: "Pusat Administrasi", position: { x: 0, y: 5, z: 0 } },
        { text: "Perumahan", position: { x: 0, y: 5, z: 45 } },
        { text: "Fasilitas Umum", position: { x: 0, y: 5, z: 90 } },
        { text: "Lahan Pertanian", position: { x: 0, y: 5, z: 160 } },
        { text: "Pemukiman Luar", position: { x: 0, y: 5, z: 250 } }
    ];
    
    // Add all labels to parent
    labels.forEach(labelInfo => {
        const label = createLabel(labelInfo.text, labelInfo.position);
        parent.add(label);
    });
} 