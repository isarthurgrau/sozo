import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Global variables
let scene, camera, renderer, controls, labelRenderer;
let planets = [];
let spaceship;
let raycaster, mouse;
let animationId;
let trailEffect = true;
let orbitSpeed = 1.0;
let spaceshipMode = 'auto';
let selectedNode = null;
let isInitialized = false;
let communicationLines = null;
let communicationTarget = null;
let communicationBalls = [];
let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 3000; // 3 seconds

// Mind mapping data structure
let mindMapData = {
    nodes: [],
    connections: [],
    settings: {
        galaxyTheme: 'spiral',
        orbitSpeed: 1.0,
        spaceshipMode: 'auto',
        trailEffect: true
    }
};

// Initialize the application
function init() {
    console.log('Initializing CosmoMind...');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // Create CSS2D renderer for labels
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(labelRenderer.domElement);
    
    // Create controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 200;
    controls.minDistance = 10;
    
    // Setup lighting
    setupLighting();
    
    // Create starfield
    createStarfield();
    
    // Create sun (central node)
    createCentralNode();
    
    // Create initial mind map nodes
    createInitialNodes();
    
    // Create spaceship
    createSpaceship();
    
    // Setup interactions
    setupInteractions();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup UI
    setupUI();
    
    // Load saved data
    loadFromLocalStorage();
    
    // Load saved settings
    loadSavedSettings();
    
    // Setup auto-save
    setupAutoSave();
    
    // Start animation loop
    animate();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 2000);
    
    isInitialized = true;
    console.log('CosmoMind initialized successfully!');
}

// Setup lighting
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);
    
    // Add colored lights for atmosphere
    const blueLight = new THREE.PointLight(0x0088ff, 0.5);
    blueLight.position.set(-20, 10, 20);
    scene.add(blueLight);
    
    const purpleLight = new THREE.PointLight(0x8800ff, 0.5);
    purpleLight.position.set(20, -10, -20);
    scene.add(purpleLight);
}

// Create starfield
function createStarfield() {
    const starCount = 2000;
    const starGroup = new THREE.Group();
    
    for (let i = 0; i < starCount; i++) {
        // Create individual star sphere
        const starSize = Math.random() * 0.5 + 0.1; // Random size between 0.1 and 0.6
        const starGeometry = new THREE.SphereGeometry(starSize, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.3 // Random opacity between 0.3 and 0.8
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        // Random position
        star.position.set(
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1500
        );
        
        // Add some stars with different colors
        if (Math.random() < 0.1) { // 10% chance for colored stars
            const colors = [0xffcccc, 0xccffcc, 0xccccff, 0xffffcc, 0xffccff];
            star.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
        }
        
        starGroup.add(star);
    }
    
    scene.add(starGroup);
}

// Create central node (sun)
function createCentralNode() {
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffcc00
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = {
        id: 'central',
        type: 'central',
        title: 'Central Idea',
        content: 'Your main thought or project',
        children: []
    };
    scene.add(sun);
    planets.push(sun);
    
    // Add sun glow effect
    const sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(6, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.3
        })
    );
    scene.add(sunGlow);
    
    // Add central node label
    createNodeLabel(sun, 'Central Idea');
    
    // Add to mind map data
    mindMapData.nodes.push(sun.userData);
    
    console.log('Central node created');
}

// Create initial mind map nodes
function createInitialNodes() {
    const initialNodes = [
        { title: "Research", content: "Gather information and data", color: 0x88ccff, distance: 15, size: 2 },
        { title: "Planning", content: "Create strategies and timelines", color: 0xff88cc, distance: 25, size: 2.2 },
        { title: "Development", content: "Build and implement solutions", color: 0x66ff88, distance: 35, size: 2.5 },
        { title: "Testing", content: "Validate and refine", color: 0xff6666, distance: 45, size: 2.1 }
    ];
    
    initialNodes.forEach((nodeData, i) => {
        createMindMapNode(nodeData, i, initialNodes.length);
    });
    
    updateNodeCount();
}

// Create a mind map node
function createMindMapNode(nodeData, index, totalNodes = 4) {
    const angle = (index / totalNodes) * Math.PI * 2;
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(nodeData.size, 32, 32),
        new THREE.MeshStandardMaterial({ 
            color: nodeData.color,
            roughness: 0.7,
            metalness: 0.1
        })
    );
    
    planet.position.set(
        Math.cos(angle) * nodeData.distance,
        0,
        Math.sin(angle) * nodeData.distance
    );
    
    planet.userData = { 
        id: `node_${Date.now()}_${index}`,
        type: 'planet',
        title: nodeData.title,
        content: nodeData.content,
        distance: nodeData.distance,
        originalAngle: angle,
        children: []
    };
    
    scene.add(planet);
    planets.push(planet);
    
    // Create orbit ring
    createOrbitRing(nodeData.distance);
    
    // Add node label
    createNodeLabel(planet, nodeData.title);
    
    // Add to mind map data
    mindMapData.nodes.push(planet.userData);
    
    // Trigger auto-save event
    document.dispatchEvent(new CustomEvent('nodeCreated'));
}

// Create orbit ring
function createOrbitRing(distance) {
    // Create main orbit ring
    const ringGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 128);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.userData = { type: 'orbit', distance: distance };
    scene.add(ringMesh);
    
    // Create outer glow ring
    const glowGeometry = new THREE.RingGeometry(distance - 0.15, distance + 0.15, 128);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.rotation.x = -Math.PI / 2;
    scene.add(glowMesh);
    
    // Create orbit markers (small dots along the ring)
    const markerCount = 12;
    for (let i = 0; i < markerCount; i++) {
        const angle = (i / markerCount) * Math.PI * 2;
        const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.6
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        marker.position.set(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
        
        scene.add(marker);
    }
}

// Create node label
function createNodeLabel(node, title) {
    const div = document.createElement('div');
    div.className = 'planet-label';
    div.textContent = title;
    
    const label = new CSS2DObject(div);
    label.position.set(0, node.geometry.parameters.radius + 1, 0);
    node.add(label);
    
    // Hide asteroid labels by default
    if (node.userData.type === 'asteroid') {
        label.element.style.display = 'none';
    }
    
    // Update moon label if it has asteroids
    if (node.userData.type === 'moon' && node.userData.children && node.userData.children.length > 0) {
        updateMoonLabel(node, false); // Initially asteroids are hidden
    }
}

// Create communication lines between spaceship and target
function createCommunicationLines(spaceship, targetNode) {
    // Remove existing communication lines and balls
    if (communicationLines) {
        scene.remove(communicationLines);
    }
    removeCommunicationBalls();
    
    // Create a group to hold both lines
    communicationLines = new THREE.Group();
    
    // Get positions
    const shipPos = spaceship.position.clone();
    const targetPos = targetNode.position.clone();
    
    // Calculate midpoint for convergence
    const midpoint = new THREE.Vector3();
    midpoint.addVectors(shipPos, targetPos);
    midpoint.multiplyScalar(0.5);
    
    // Create first line from spaceship to midpoint
    const line1Geometry = new THREE.BufferGeometry().setFromPoints([
        shipPos,
        midpoint
    ]);
    const line1Material = new THREE.LineBasicMaterial({ 
        color: 0x00ffcc, 
        transparent: true, 
        opacity: 0.8,
        linewidth: 2
    });
    const line1 = new THREE.Line(line1Geometry, line1Material);
    
    // Create second line from midpoint to target
    const line2Geometry = new THREE.BufferGeometry().setFromPoints([
        midpoint,
        targetPos
    ]);
    const line2Material = new THREE.LineBasicMaterial({ 
        color: 0x00ffcc, 
        transparent: true, 
        opacity: 0.8,
        linewidth: 2
    });
    const line2 = new THREE.Line(line2Geometry, line2Material);
    
    // Add lines to group
    communicationLines.add(line1);
    communicationLines.add(line2);
    
    // Add to scene
    scene.add(communicationLines);
    
    // Create communication balls
    createCommunicationBalls(shipPos, midpoint, targetPos);
    
    // Store target reference
    communicationTarget = targetNode;
    
    console.log(`Communication lines created to ${targetNode.userData.title}`);
}

// Create communication balls
function createCommunicationBalls(shipPos, midpoint, targetPos) {
    // Remove existing balls
    removeCommunicationBalls();
    
    // Create multiple balls for visual effect
    const ballCount = 3;
    
    for (let i = 0; i < ballCount; i++) {
        // Create ball geometry and material
        const ballGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const ballMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        
        // Set initial position and animation data
        ball.userData = {
            startPos: shipPos.clone(),
            endPos: targetPos.clone(),
            midpoint: midpoint.clone(),
            progress: (i / ballCount) * 2, // Stagger the balls
            direction: 1, // 1 = ship to target, -1 = target to ship
            speed: 0.02 + (Math.random() * 0.01), // Slightly different speeds
            phase: i * 0.3 // Different starting phases
        };
        
        // Set initial position
        ball.position.copy(shipPos);
        
        // Add to scene and tracking array
        scene.add(ball);
        communicationBalls.push(ball);
    }
    
    console.log(`Created ${ballCount} communication balls`);
}

// Update communication balls animation
function updateCommunicationBalls(shipPos, midpoint, targetPos) {
    communicationBalls.forEach(ball => {
        const data = ball.userData;
        
        // Update progress
        data.progress += data.speed * data.direction;
        
        // Reverse direction when reaching endpoints
        if (data.progress >= 2) {
            data.progress = 2;
            data.direction = -1;
        } else if (data.progress <= 0) {
            data.progress = 0;
            data.direction = 1;
        }
        
        // Calculate position based on progress
        let currentPos;
        if (data.progress <= 1) {
            // First half: ship to midpoint
            const t = data.progress;
            currentPos = new THREE.Vector3();
            currentPos.lerpVectors(data.startPos, data.midpoint, t);
        } else {
            // Second half: midpoint to target
            const t = data.progress - 1;
            currentPos = new THREE.Vector3();
            currentPos.lerpVectors(data.midpoint, data.endPos, t);
        }
        
        // Update ball position
        ball.position.copy(currentPos);
        
        // Add subtle pulsing effect
        const time = Date.now() * 0.005;
        const pulse = 0.8 + Math.sin(time + data.phase) * 0.2;
        ball.scale.setScalar(pulse);
        
        // Update opacity for fade effect at endpoints
        if (data.progress < 0.1 || data.progress > 1.9) {
            ball.material.opacity = data.progress < 0.1 ? data.progress * 10 : (2 - data.progress) * 10;
        } else {
            ball.material.opacity = 0.9;
        }
    });
}

// Remove communication balls
function removeCommunicationBalls() {
    communicationBalls.forEach(ball => {
        scene.remove(ball);
        ball.geometry.dispose();
        ball.material.dispose();
    });
    communicationBalls = [];
}

// Remove communication lines
function removeCommunicationLines() {
    if (communicationLines) {
        scene.remove(communicationLines);
        communicationLines = null;
        communicationTarget = null;
    }
    removeCommunicationBalls();
    console.log('Communication lines and balls removed');
}

// Create spaceship
function createSpaceship() {
    spaceship = new THREE.Group();
    
    // Ship body (cylinder)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 2, 16),
        new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            roughness: 0.8,
            metalness: 0.2
        })
    );
    
    // Ship nose (cone)
    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(1, 3, 8),
        new THREE.MeshStandardMaterial({ 
            color: 0x00ffcc
        })
    );
    nose.rotation.x = Math.PI;
    nose.position.y = 2.5;
    
    // Ship wings
    const wingGeometry = new THREE.BoxGeometry(4, 0.2, 1);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-2, 0, 0);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(2, 0, 0);
    
    spaceship.add(body);
    spaceship.add(nose);
    spaceship.add(leftWing);
    spaceship.add(rightWing);
    
    spaceship.position.set(0, 0, 15);
    scene.add(spaceship);
    
    console.log('Spaceship created');
}

// Setup interactions
function setupInteractions() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
}

// Setup event listeners
function setupEventListeners() {
    // Click event for node selection
    window.addEventListener('click', onNodeClick);
    
    // Resize event
    window.addEventListener('resize', onWindowResize);
    
    // Keyboard controls
    window.addEventListener('keydown', onKeyDown);
}

// Setup UI event listeners
function setupUI() {
    // Close instructions
    document.getElementById('closeInstructions').addEventListener('click', () => {
        document.getElementById('instructions').classList.add('hidden');
    });
    
    // Add node button
    document.getElementById('addNodeBtn').addEventListener('click', () => {
        document.getElementById('addNodePanel').classList.remove('hidden');
        // Reset form and hide parent node selection for regular nodes
        document.getElementById('newNodeType').value = 'planet';
        document.getElementById('parentNodeGroup').style.display = 'none';
        updateParentNodeOptions();
    });
    
    // Add subnode button
    document.getElementById('addSubNodeBtn').addEventListener('click', () => {
        if (planets.length === 0) {
            alert('Please create at least one main node before adding subnodes.');
            return;
        }
        document.getElementById('addNodePanel').classList.remove('hidden');
        // Set form for subnode creation
        document.getElementById('newNodeType').value = 'moon';
        document.getElementById('parentNodeGroup').style.display = 'block';
        updateParentNodeOptions();
    });
    
    // Close add panel
    document.getElementById('closeAddPanel').addEventListener('click', () => {
        document.getElementById('addNodePanel').classList.add('hidden');
    });
    
    // Create node button
    document.getElementById('createNodeBtn').addEventListener('click', createNewNode);
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.remove('hidden');
    });
    
    // Save/Export buttons
    document.getElementById('saveBtn').addEventListener('click', saveToLocalStorage);
    document.getElementById('exportBtn').addEventListener('click', exportToFile);
    document.getElementById('screenshotBtn').addEventListener('click', exportAsImage);
    
    // Import button
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    
    // File import handler
    document.getElementById('importFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importFromFile(file);
        }
        // Reset input
        e.target.value = '';
    });
    
    // Close settings
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.add('hidden');
    });
    
    // Apply settings
    document.getElementById('applySettings').addEventListener('click', applySettings);
    
    // Reset to default settings
    document.getElementById('resetSettings').addEventListener('click', resetToDefaultSettings);
    
    // Node info panel buttons
    document.getElementById('closeNodeInfo').addEventListener('click', () => {
        document.getElementById('nodeInfo').classList.add('hidden');
    });
    
    document.getElementById('saveChangesBtn').addEventListener('click', saveNodeChanges);
    
    document.getElementById('deleteNodeBtn').addEventListener('click', deleteCurrentNode);
    
    // View full content button
    document.getElementById('viewFullContentBtn').addEventListener('click', viewFullContent);
    
    // Close full content modal
    document.getElementById('closeFullContentModal').addEventListener('click', () => {
        document.getElementById('fullContentModal').classList.add('hidden');
    });
    
    // Navigation buttons
    document.getElementById('homeBtn').addEventListener('click', goHome);
    document.getElementById('resetBtn').addEventListener('click', resetCamera);
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Orbit speed slider
    document.getElementById('orbitSpeed').addEventListener('input', (e) => {
        orbitSpeed = parseFloat(e.target.value);
        document.getElementById('orbitSpeedValue').textContent = orbitSpeed.toFixed(1);
        
        // Update mind map data
        mindMapData.settings.orbitSpeed = orbitSpeed;
    });
    
    // Node type change handler
    document.getElementById('newNodeType').addEventListener('change', (e) => {
        const nodeType = e.target.value;
        const parentNodeGroup = document.getElementById('parentNodeGroup');
        
        if (nodeType === 'moon') {
            if (planets.length === 0) {
                alert('Please create at least one main node before adding moons.');
                e.target.value = 'planet';
                parentNodeGroup.style.display = 'none';
                return;
            }
            parentNodeGroup.style.display = 'block';
            updateParentNodeOptions('planet'); // Only show planets as parents for moons
        } else if (nodeType === 'asteroid') {
            const moons = planets.filter(planet => planet.userData.type === 'moon');
            if (moons.length === 0) {
                alert('Please create at least one moon before adding asteroids.');
                e.target.value = 'planet';
                parentNodeGroup.style.display = 'none';
                return;
            }
            parentNodeGroup.style.display = 'block';
            updateParentNodeOptions('moon'); // Only show moons as parents for asteroids
        } else {
            parentNodeGroup.style.display = 'none';
        }
    });
}

// Handle node clicks
function onNodeClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);
    
    if (intersects.length > 0) {
        const targetNode = intersects[0].object;
        selectedNode = targetNode;
        
        // Create communication lines
        createCommunicationLines(spaceship, targetNode);
        
        // Handle moon clicks - toggle asteroid visibility
        if (targetNode.userData.type === 'moon') {
            toggleAsteroidVisibility(targetNode);
        }
        
        // Show node info panel
        showNodeInfo(targetNode);
        
        // Navigate spaceship if in auto mode
        if (spaceshipMode === 'auto') {
            navigateToNode(targetNode);
        }
    }
}

// Show node info panel
function showNodeInfo(node) {
    const nodeInfo = document.getElementById('nodeInfo');
    const nodeTitleInput = document.getElementById('nodeTitleInput');
    const nodeContent = document.getElementById('nodeContent');
    const deleteBtn = document.getElementById('deleteNodeBtn');
    
    nodeTitleInput.value = node.userData.title;
    nodeContent.value = node.userData.content;
    
    // Store reference to current node
    nodeInfo.dataset.nodeId = node.userData.id;
    
    // Hide delete button for central node
    if (node.userData.type === 'central') {
        deleteBtn.style.display = 'none';
    } else {
        deleteBtn.style.display = 'inline-flex';
    }
    
    nodeInfo.classList.remove('hidden');
}

// Navigate spaceship to node
function navigateToNode(targetNode) {
    const target = targetNode.position.clone();
    target.y += 3;
    
    updateSpaceshipStatus('Traveling...');
    
    // Animate spaceship to node
    gsap.to(spaceship.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
            spaceship.lookAt(targetNode.position);
        },
        onComplete: () => {
            updateSpaceshipStatus('Arrived');
            setTimeout(() => updateSpaceshipStatus('Idle'), 2000);
        }
    });
    
    console.log(`Flying to ${targetNode.userData.title}`);
}

// Save node changes
function saveNodeChanges() {
    const nodeInfo = document.getElementById('nodeInfo');
    const nodeId = nodeInfo.dataset.nodeId;
    const nodeTitleInput = document.getElementById('nodeTitleInput');
    const nodeContent = document.getElementById('nodeContent').value;
    
    // Find the node in the scene
    const node = planets.find(planet => planet.userData.id === nodeId);
    
    if (node) {
        const newTitle = nodeTitleInput.value.trim();
        
        // Validate title
        if (!newTitle) {
            alert('Please enter a valid title for the node.');
            return;
        }
        
        // Update node title and content
        const oldTitle = node.userData.title;
        node.userData.title = newTitle;
        node.userData.content = nodeContent;
        
        // Update the label in the scene
        updateNodeLabel(node, newTitle);
        
        // Update mind map data
        const mindMapNode = mindMapData.nodes.find(n => n.id === nodeId);
        if (mindMapNode) {
            mindMapNode.title = newTitle;
            mindMapNode.content = nodeContent;
        }
        
        // Trigger auto-save event
        document.dispatchEvent(new CustomEvent('nodeUpdated'));
        
        console.log(`Saved changes to ${newTitle} (was: ${oldTitle})`);
        
        // Show success feedback
        const saveBtn = document.getElementById('saveChangesBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveBtn.style.background = 'rgba(0, 255, 0, 0.2)';
        saveBtn.style.borderColor = '#00ff00';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
            saveBtn.style.borderColor = '';
        }, 2000);
    }
}

// View full content of a node
function viewFullContent() {
    const nodeInfo = document.getElementById('nodeInfo');
    const nodeId = nodeInfo.dataset.nodeId;
    
    // Find the node in the scene
    const node = planets.find(planet => planet.userData.id === nodeId);
    
    if (node) {
        const modal = document.getElementById('fullContentModal');
        const titleElement = document.getElementById('fullContentTitle');
        const contentElement = document.getElementById('fullContentText');
        
        // Set modal title
        titleElement.textContent = `Content: ${node.userData.title}`;
        
        // Set content text
        const content = node.userData.content || 'No content available';
        contentElement.textContent = content;
        
        // Show modal
        modal.classList.remove('hidden');
        
        console.log(`Viewing full content for node: ${node.userData.title}`);
    }
}

// Update node label in the scene
function updateNodeLabel(node, newTitle) {
    // Remove old label
    const oldLabel = node.children.find(child => child instanceof CSS2DObject);
    if (oldLabel) {
        node.remove(oldLabel);
    }
    
    // Create new label
    const div = document.createElement('div');
    div.className = 'planet-label';
    div.textContent = newTitle;
    
    const label = new CSS2DObject(div);
    label.position.set(0, node.geometry.parameters.radius + 1, 0);
    node.add(label);
}

// Delete current node
function deleteCurrentNode() {
    const nodeInfo = document.getElementById('nodeInfo');
    const nodeId = nodeInfo.dataset.nodeId;
    
    // Find the node in the scene
    const nodeIndex = planets.findIndex(planet => planet.userData.id === nodeId);
    
    if (nodeIndex !== -1) {
        const node = planets[nodeIndex];
        
        // Prevent deletion of central node
        if (node.userData.type === 'central') {
            alert('The central node cannot be deleted. You can only edit its content.');
            return;
        }
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete "${node.userData.title}"?`)) {
            // Handle hierarchical deletion
            if (node.userData.type === 'moon' && node.userData.children && node.userData.children.length > 0) {
                // Delete all child asteroids first
                node.userData.children.forEach(asteroidId => {
                    const asteroidIndex = planets.findIndex(p => p.userData.id === asteroidId);
                    if (asteroidIndex !== -1) {
                        const asteroid = planets[asteroidIndex];
                        // Remove asteroid label
                        const asteroidLabel = asteroid.children.find(child => child instanceof CSS2DObject);
                        if (asteroidLabel) {
                            asteroid.remove(asteroidLabel);
                        }
                        // Remove from scene
                        scene.remove(asteroid);
                        // Remove from planets array
                        planets.splice(asteroidIndex, 1);
                        // Remove from mind map data
                        const asteroidMindMapIndex = mindMapData.nodes.findIndex(n => n.id === asteroidId);
                        if (asteroidMindMapIndex !== -1) {
                            mindMapData.nodes.splice(asteroidMindMapIndex, 1);
                        }
                    }
                });
            }
            
            // If deleting an asteroid, update parent moon's label
            if (node.userData.type === 'asteroid' && node.userData.parentId) {
                const parentMoon = planets.find(p => p.userData.id === node.userData.parentId);
                if (parentMoon) {
                    updateMoonLabel(parentMoon, false);
                }
            }
            
            // Remove node label (CSS2DObject)
            const label = node.children.find(child => child instanceof CSS2DObject);
            if (label) {
                node.remove(label);
            }
            
            // Remove from scene
            scene.remove(node);
            
            // Remove orbit ring and markers
            removeOrbitRing(node.userData.distance);
            
            // Remove from planets array
            planets.splice(nodeIndex, 1);
            
            // Remove from mind map data
            const mindMapIndex = mindMapData.nodes.findIndex(n => n.id === nodeId);
            if (mindMapIndex !== -1) {
                mindMapData.nodes.splice(mindMapIndex, 1);
            }
            
            // Remove communication lines if this was the target
            if (communicationTarget && communicationTarget.userData.id === nodeId) {
                removeCommunicationLines();
            }
            
            // Return spaceship to center
            goHome();
            
            // Close the panel
            nodeInfo.classList.add('hidden');
            
            // Update node count
            updateNodeCount();
            
            // Trigger auto-save event
            document.dispatchEvent(new CustomEvent('nodeDeleted'));
            
            console.log(`Deleted node: ${node.userData.title}`);
        }
    }
}

// Remove orbit ring and markers for a specific distance
function removeOrbitRing(distance) {
    const objectsToRemove = [];
    
    // Find all objects at this orbit distance
    scene.children.forEach(child => {
        // Find main orbit ring
        if (child.userData && child.userData.type === 'orbit' && child.userData.distance === distance) {
            objectsToRemove.push(child);
        }
        
        // Find outer glow ring (RingGeometry at this distance)
        if (child.geometry && child.geometry.type === 'RingGeometry') {
            const innerRadius = child.geometry.parameters.innerRadius;
            const outerRadius = child.geometry.parameters.outerRadius;
            const ringDistance = (innerRadius + outerRadius) / 2;
            if (Math.abs(ringDistance - distance) < 0.2) {
                objectsToRemove.push(child);
            }
        }
        
        // Find orbit markers (small spheres at this distance)
        if (child.geometry && child.geometry.type === 'SphereGeometry' && child.geometry.parameters.radius === 0.1) {
            const distanceFromCenter = Math.sqrt(child.position.x ** 2 + child.position.z ** 2);
            if (Math.abs(distanceFromCenter - distance) < 0.1) {
                objectsToRemove.push(child);
            }
        }
    });
    
    // Remove all found objects
    objectsToRemove.forEach(obj => {
        scene.remove(obj);
    });
    
    console.log(`Removed orbit ring and markers at distance ${distance}`);
}

// Create new node
function createNewNode() {
    const title = document.getElementById('newNodeTitle').value;
    const content = document.getElementById('newNodeContent').value;
    const type = document.getElementById('newNodeType').value;
    const color = document.getElementById('newNodeColor').value;
    const parentNodeId = document.getElementById('parentNodeSelect').value;
    
    if (!title.trim()) {
        alert('Please enter a node title');
        return;
    }
    
    // Validate parent node selection for subnodes
    if (type === 'moon' && !parentNodeId) {
        alert('Please select a planet as parent for the moon');
        return;
    }
    
    if (type === 'asteroid' && !parentNodeId) {
        alert('Please select a moon as parent for the asteroid');
        return;
    }
    
    const nodeData = {
        title: title,
        content: content,
        color: parseInt(color.replace('#', '0x')),
        type: type,
        parentId: parentNodeId || null,
        distance: type === 'planet' ? 15 + (planets.length * 10) : (type === 'moon' ? 8 : 4), // Different distances for each level
        size: type === 'planet' ? 3 : type === 'moon' ? 1.8 : 0.6 // Ensures proper size hierarchy
    };
    
    if (type === 'planet') {
        createMindMapNode(nodeData, planets.length, planets.length + 1);
    } else {
        createSubNode(nodeData, parentNodeId);
    }
    
    // Close panel and clear form
    document.getElementById('addNodePanel').classList.add('hidden');
    document.getElementById('newNodeTitle').value = '';
    document.getElementById('newNodeContent').value = '';
    document.getElementById('parentNodeSelect').value = '';
    document.getElementById('parentNodeGroup').style.display = 'none';
    
    updateNodeCount();
}

// Create subnode
function createSubNode(nodeData, parentNodeId) {
    // Find parent node
    const parentNode = planets.find(planet => planet.userData.id === parentNodeId);
    
    if (!parentNode) {
        console.error('Parent node not found');
        return;
    }
    
    // Create subnode mesh
    let subNode;
    if (nodeData.type === 'asteroid') {
        // Create asteroid as a smaller, irregular shape
        subNode = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.size, 12, 12),
            new THREE.MeshStandardMaterial({ 
                color: nodeData.color,
                roughness: 0.9,
                metalness: 0.0
            })
        );
    } else {
        // Create moon as regular sphere
        subNode = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.size, 32, 32),
            new THREE.MeshStandardMaterial({ 
                color: nodeData.color,
                roughness: 0.7,
                metalness: 0.1
            })
        );
    }
    
    // Position subnode near parent
    const parentPosition = parentNode.position;
    const offset = nodeData.distance; // Use the distance from nodeData
    const angle = Math.random() * Math.PI * 2; // Random angle around parent
    
    // Different positioning based on type
    if (nodeData.type === 'moon') {
        // Moons orbit around planets
        subNode.position.set(
            parentPosition.x + Math.cos(angle) * offset,
            parentPosition.y, // Same level as parent
            parentPosition.z + Math.sin(angle) * offset
        );
    } else if (nodeData.type === 'asteroid') {
        // Asteroids orbit around their moon parent
        subNode.position.set(
            parentPosition.x + Math.cos(angle) * offset,
            parentPosition.y, // Same level as moon
            parentPosition.z + Math.sin(angle) * offset
        );
    }
    
    // Set user data
    subNode.userData = {
        id: `subnode_${Date.now()}_${Math.random()}`,
        type: nodeData.type,
        title: nodeData.title,
        content: nodeData.content,
        parentId: parentNodeId,
        parentNode: parentNode,
        distance: offset,
        originalAngle: angle
    };
    
    // Add to scene and planets array
    scene.add(subNode);
    planets.push(subNode);
    
    // Create label
    createNodeLabel(subNode, nodeData.title);
    
    // Make asteroids initially invisible
    if (nodeData.type === 'asteroid') {
        subNode.visible = false;
    }
    
    // Update parent moon's label to show asteroid count
    if (nodeData.type === 'asteroid' && parentNode) {
        updateMoonLabel(parentNode, false);
    }
    
    // Add to mind map data
    mindMapData.nodes.push(subNode.userData);
    
    // Trigger auto-save event
    document.dispatchEvent(new CustomEvent('nodeCreated'));
    
    // Update parent's children array
    if (!parentNode.userData.children) {
        parentNode.userData.children = [];
    }
    parentNode.userData.children.push(subNode.userData.id);
    
    console.log(`Created ${nodeData.type} "${nodeData.title}" for parent "${parentNode.userData.title}"`);
}

// Toggle asteroid visibility for a moon
function toggleAsteroidVisibility(moonNode) {
    if (!moonNode.userData.children) {
        return; // No asteroids to toggle
    }
    
    // Check if any asteroids are currently visible
    let anyVisible = false;
    moonNode.userData.children.forEach(asteroidId => {
        const asteroid = planets.find(p => p.userData.id === asteroidId);
        if (asteroid && asteroid.userData.type === 'asteroid' && asteroid.visible) {
            anyVisible = true;
        }
    });
    
    // Toggle all asteroids for this moon
    moonNode.userData.children.forEach(asteroidId => {
        const asteroid = planets.find(p => p.userData.id === asteroidId);
        if (asteroid && asteroid.userData.type === 'asteroid') {
            const newVisibility = !anyVisible; // Show if none visible, hide if any visible
            asteroid.visible = newVisibility;
            
            // Toggle label visibility
            const label = asteroid.children.find(child => child instanceof CSS2DObject);
            if (label) {
                label.element.style.display = newVisibility ? 'block' : 'none';
            }
        }
    });
    
    // Show feedback to user
    const action = anyVisible ? 'hidden' : 'shown';
    console.log(`Asteroids ${action} for moon "${moonNode.userData.title}"`);
    
    // Update moon label to indicate asteroid status
    updateMoonLabel(moonNode, anyVisible);
}

// Update moon label to show asteroid status
function updateMoonLabel(moonNode, asteroidsVisible) {
    const label = moonNode.children.find(child => child instanceof CSS2DObject);
    if (label) {
        // Count only asteroids (tertiary nodes)
        const asteroidCount = moonNode.userData.children ? 
            moonNode.userData.children.filter(childId => {
                const child = planets.find(p => p.userData.id === childId);
                return child && child.userData.type === 'asteroid';
            }).length : 0;
            
        if (asteroidCount > 0) {
            const status = asteroidsVisible ? '🔽' : '🔼';
            label.element.textContent = `${moonNode.userData.title} ${status} (${asteroidCount})`;
        } else {
            label.element.textContent = moonNode.userData.title;
        }
    }
}

// Apply settings
function applySettings() {
    const theme = document.getElementById('galaxyTheme').value;
    const mode = document.getElementById('spaceshipMode').value;
    const trail = document.getElementById('trailEffect').checked;
    const speed = parseFloat(document.getElementById('orbitSpeed').value);
    
    // Update global variables
    spaceshipMode = mode;
    trailEffect = trail;
    orbitSpeed = speed;
    
    // Update mind map data
    mindMapData.settings = {
        galaxyTheme: theme,
        orbitSpeed: speed,
        spaceshipMode: mode,
        trailEffect: trail
    };
    
    // Trigger auto-save event
    document.dispatchEvent(new CustomEvent('settingsChanged'));
    
    document.getElementById('settingsPanel').classList.add('hidden');
    console.log('Settings applied');
}

// Reset to default settings
function resetToDefaultSettings() {
    // Default values
    const defaultSettings = {
        galaxyTheme: 'spiral',
        orbitSpeed: 1.0,
        spaceshipMode: 'auto',
        trailEffect: true
    };
    
    // Reset form values
    document.getElementById('galaxyTheme').value = defaultSettings.galaxyTheme;
    document.getElementById('orbitSpeed').value = defaultSettings.orbitSpeed;
    document.getElementById('orbitSpeedValue').textContent = defaultSettings.orbitSpeed.toFixed(1);
    document.getElementById('spaceshipMode').value = defaultSettings.spaceshipMode;
    document.getElementById('trailEffect').checked = defaultSettings.trailEffect;
    
    // Reset global variables
    orbitSpeed = defaultSettings.orbitSpeed;
    spaceshipMode = defaultSettings.spaceshipMode;
    trailEffect = defaultSettings.trailEffect;
    
    // Update mind map data
    mindMapData.settings = { ...defaultSettings };
    
    console.log('Settings reset to default');
}

// Load saved settings
function loadSavedSettings() {
    // Check if there are saved settings in mindMapData
    if (mindMapData.settings) {
        const settings = mindMapData.settings;
        
        // Update form values
        if (settings.galaxyTheme) {
            document.getElementById('galaxyTheme').value = settings.galaxyTheme;
        }
        if (settings.orbitSpeed) {
            document.getElementById('orbitSpeed').value = settings.orbitSpeed;
            document.getElementById('orbitSpeedValue').textContent = settings.orbitSpeed.toFixed(1);
            orbitSpeed = settings.orbitSpeed;
        }
        if (settings.spaceshipMode) {
            document.getElementById('spaceshipMode').value = settings.spaceshipMode;
            spaceshipMode = settings.spaceshipMode;
        }
        if (settings.trailEffect !== undefined) {
            document.getElementById('trailEffect').checked = settings.trailEffect;
            trailEffect = settings.trailEffect;
        }
        
        console.log('Saved settings loaded');
    } else {
        // Set default values if no saved settings
        resetToDefaultSettings();
    }
}

// Save to local storage
function saveToLocalStorage() {
    try {
        const saveData = {
            nodes: mindMapData.nodes,
            settings: mindMapData.settings,
            metadata: {
                name: 'CosmoMind Project',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                version: '1.0',
                nodeCount: mindMapData.nodes.length
            }
        };
        
        localStorage.setItem('cosmoMind_data', JSON.stringify(saveData));
        updateSaveStatus('Auto-saved', 'success');
        console.log('Mind map saved to local storage');
    } catch (error) {
        console.error('Error saving to local storage:', error);
        updateSaveStatus('Save failed', 'error');
    }
}

// Load from local storage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('cosmoMind_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            mindMapData = data;
            
            // Rebuild scene from saved data
            rebuildSceneFromData();
            
            updateSaveStatus('Project loaded', 'success');
            console.log('Mind map loaded from local storage');
        } else {
            console.log('No saved data found - using default scene');
        }
    } catch (error) {
        console.error('Error loading from local storage:', error);
        updateSaveStatus('Load failed', 'error');
    }
}

// Export to JSON file
function exportToFile() {
    try {
        const exportData = {
            nodes: mindMapData.nodes,
            settings: mindMapData.settings,
            metadata: {
                name: 'CosmoMind Project',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                version: '1.0',
                nodeCount: mindMapData.nodes.length
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cosmoMind_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        updateSaveStatus('Exported to file', 'success');
        console.log('Project exported to file');
    } catch (error) {
        console.error('Error exporting to file:', error);
        updateSaveStatus('Export failed', 'error');
    }
}

// Import from JSON file
function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            mindMapData = data;
            
            // Rebuild scene from imported data
            rebuildSceneFromData();
            
            updateSaveStatus('Project imported', 'success');
            console.log('Project imported successfully');
        } catch (error) {
            console.error('Error importing file:', error);
            updateSaveStatus('Import failed - invalid file', 'error');
        }
    };
    reader.readAsText(file);
}

// Export as image
function exportAsImage() {
    try {
        // Render current scene
        renderer.render(scene, camera);
        
        // Capture canvas as image
        const canvas = renderer.domElement;
        const dataURL = canvas.toDataURL('image/png');
        
        // Download image
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `cosmoMind_screenshot_${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        
        updateSaveStatus('Image exported', 'success');
        console.log('Screenshot exported');
    } catch (error) {
        console.error('Error exporting image:', error);
        updateSaveStatus('Image export failed', 'error');
    }
}

// Rebuild scene from saved data
function rebuildSceneFromData() {
    // Clear existing scene
    planets.forEach(planet => {
        scene.remove(planet);
        // Remove labels
        const label = planet.children.find(child => child instanceof CSS2DObject);
        if (label) {
            planet.remove(label);
        }
    });
    planets = [];
    
    // Remove orbit rings and other scene objects
    const objectsToRemove = [];
    scene.children.forEach(child => {
        if (child.userData && child.userData.type === 'orbit') {
            objectsToRemove.push(child);
        }
        // Remove sun glow effects
        if (child.geometry && child.geometry.type === 'SphereGeometry' && 
            child.geometry.parameters.radius === 6) {
            objectsToRemove.push(child);
        }
    });
    
    objectsToRemove.forEach(obj => scene.remove(obj));
    
    // Rebuild nodes from saved data
    if (mindMapData.nodes && mindMapData.nodes.length > 0) {
        mindMapData.nodes.forEach(nodeData => {
            if (nodeData.type === 'central') {
                createCentralNodeFromData(nodeData);
            } else if (nodeData.type === 'planet') {
                createPlanetFromData(nodeData);
            } else if (nodeData.type === 'moon') {
                createMoonFromData(nodeData);
            } else if (nodeData.type === 'asteroid') {
                createAsteroidFromData(nodeData);
            }
        });
    } else {
        // If no saved data, create default scene
        createCentralNode();
        createInitialNodes();
    }
    
    // Update UI
    updateNodeCount();
    updateSaveStatus('Scene rebuilt', 'success');
}

// Create central node from saved data
function createCentralNodeFromData(nodeData) {
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffcc00,
        transparent: true,
        opacity: 0.9
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    sun.userData = { ...nodeData };
    
    scene.add(sun);
    planets.push(sun);
    
    // Create label
    createNodeLabel(sun, nodeData.title);
    
    // Add glow effect
    const sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(6, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.3
        })
    );
    scene.add(sunGlow);
}

// Create planet from saved data
function createPlanetFromData(nodeData) {
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(nodeData.size || 2, 32, 32),
        new THREE.MeshStandardMaterial({ 
            color: nodeData.color || 0x88ccff,
            roughness: 0.7,
            metalness: 0.1
        })
    );
    
    planet.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
    planet.userData = { ...nodeData };
    
    scene.add(planet);
    planets.push(planet);
    
    // Create orbit ring
    createOrbitRing(nodeData.distance);
    
    // Create label
    createNodeLabel(planet, nodeData.title);
}

// Create moon from saved data
function createMoonFromData(nodeData) {
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(nodeData.size || 1.8, 32, 32),
        new THREE.MeshStandardMaterial({ 
            color: nodeData.color || 0x88ccff,
            roughness: 0.7,
            metalness: 0.1
        })
    );
    
    moon.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
    moon.userData = { ...nodeData };
    
    scene.add(moon);
    planets.push(moon);
    
    // Create label
    createNodeLabel(moon, nodeData.title);
}

// Create asteroid from saved data
function createAsteroidFromData(nodeData) {
    const asteroid = new THREE.Mesh(
        new THREE.SphereGeometry(nodeData.size || 0.6, 12, 12),
        new THREE.MeshStandardMaterial({ 
            color: nodeData.color || 0x88ccff,
            roughness: 0.9,
            metalness: 0.0
        })
    );
    
    asteroid.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
    asteroid.userData = { ...nodeData };
    
    // Make asteroids initially invisible
    asteroid.visible = false;
    
    scene.add(asteroid);
    planets.push(asteroid);
    
    // Create label (initially hidden)
    createNodeLabel(asteroid, nodeData.title);
}

// Update save status
function updateSaveStatus(message, type = 'info') {
    const statusBar = document.querySelector('.status-bar');
    let statusElement = statusBar.querySelector('.save-status');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'status-item save-status';
        statusElement.innerHTML = '<i class="fas fa-save"></i><span></span>';
        statusBar.appendChild(statusElement);
    }
    
    const span = statusElement.querySelector('span');
    span.textContent = message;
    
    // Update styling based on type
    statusElement.className = `status-item save-status ${type}`;
    
    // Auto-clear success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            span.textContent = '';
        }, 3000);
    }
}

// Setup auto-save
function setupAutoSave() {
    const autoSave = () => {
        saveToLocalStorage();
    };
    
    const debouncedAutoSave = () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(autoSave, AUTO_SAVE_DELAY);
    };
    
    // Auto-save on various events
    document.addEventListener('nodeCreated', debouncedAutoSave);
    document.addEventListener('nodeUpdated', debouncedAutoSave);
    document.addEventListener('nodeDeleted', debouncedAutoSave);
    document.addEventListener('settingsChanged', debouncedAutoSave);
}

// Navigation functions
function goHome() {
    // Remove communication lines
    removeCommunicationLines();
    
    gsap.to(spaceship.position, {
        x: 0,
        y: 0,
        z: 15,
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
            // Create communication with sun when home
            const sun = planets.find(p => p.userData.type === 'central');
            if (sun) {
                createCommunicationLines(spaceship, sun);
            }
            updateSpaceshipStatus('Idle');
        }
    });
    updateSpaceshipStatus('Returning Home');
}

function resetCamera() {
    gsap.to(camera.position, {
        x: 0,
        y: 20,
        z: 50,
        duration: 2,
        ease: "power2.out"
    });
}

function zoomIn() {
    const currentDistance = camera.position.length();
    const newDistance = Math.max(currentDistance - 10, 10);
    gsap.to(camera.position, {
        x: camera.position.x * (newDistance / currentDistance),
        y: camera.position.y * (newDistance / currentDistance),
        z: camera.position.z * (newDistance / currentDistance),
        duration: 1,
        ease: "power2.out"
    });
}

function zoomOut() {
    const currentDistance = camera.position.length();
    const newDistance = Math.min(currentDistance + 10, 200);
    gsap.to(camera.position, {
        x: camera.position.x * (newDistance / currentDistance),
        y: camera.position.y * (newDistance / currentDistance),
        z: camera.position.z * (newDistance / currentDistance),
        duration: 1,
        ease: "power2.out"
    });
}

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm.trim()) return;
    
    const foundNode = planets.find(planet => 
        planet.userData.title.toLowerCase().includes(searchTerm) ||
        planet.userData.content.toLowerCase().includes(searchTerm)
    );
    
    if (foundNode) {
        navigateToNode(foundNode);
        showNodeInfo(foundNode);
    } else {
        alert('No nodes found matching your search');
    }
}

// Update UI elements
function updateNodeCount() {
    document.getElementById('nodeCount').textContent = `${planets.length} Nodes`;
}

// Update parent node options in dropdown
function updateParentNodeOptions(parentType = 'planet') {
    const parentSelect = document.getElementById('parentNodeSelect');
    const currentValue = parentSelect.value;
    
    // Clear existing options except the first placeholder
    parentSelect.innerHTML = '<option value="">Select a parent node...</option>';
    
    // Filter nodes based on parent type
    let availableParents = [];
    if (parentType === 'planet') {
        availableParents = planets.filter(planet => planet.userData.type === 'planet');
    } else if (parentType === 'moon') {
        availableParents = planets.filter(planet => planet.userData.type === 'moon');
    }
    
    // Add filtered nodes as parent options
    availableParents.forEach(node => {
        const option = document.createElement('option');
        option.value = node.userData.id;
        option.textContent = node.userData.title;
        parentSelect.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (currentValue) {
        parentSelect.value = currentValue;
    }
}

function updateSpaceshipStatus(status) {
    document.getElementById('spaceshipStatus').textContent = status;
}

function updateCameraInfo() {
    const pos = camera.position;
    document.getElementById('cameraInfo').textContent = 
        `Camera: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle keyboard input
function onKeyDown(event) {
    switch(event.key) {
        case 'r':
        case 'R':
            resetCamera();
            break;
        case 'h':
        case 'H':
            goHome();
            break;
        case 'Escape':
            // Close all panels
            document.querySelectorAll('.panel, .node-info').forEach(panel => {
                panel.classList.add('hidden');
            });
            break;
    }
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Animate planets and subnodes
    planets.forEach((planet, index) => {
        const time = Date.now() * 0.0001 * orbitSpeed;
        
        if (planet.userData.type === 'planet') {
            // Animate planets around the sun
            const angle = planet.userData.originalAngle + time * (0.5 + index * 0.2);
            planet.position.x = Math.cos(angle) * planet.userData.distance;
            planet.position.z = Math.sin(angle) * planet.userData.distance;
            
            // Animate moons around this planet
            if (planet.userData.children) {
                planet.userData.children.forEach(childId => {
                    const moon = planets.find(p => p.userData.id === childId);
                    if (moon && moon.userData.type === 'moon') {
                        const moonTime = Date.now() * 0.0002 * orbitSpeed; // Faster moon rotation
                        const moonAngle = moon.userData.originalAngle + moonTime;
                        moon.position.x = planet.position.x + Math.cos(moonAngle) * moon.userData.distance;
                        moon.position.z = planet.position.z + Math.sin(moonAngle) * moon.userData.distance;
                        moon.position.y = planet.position.y; // Keep same Y level as parent
                        
                        // Animate asteroids around this moon
                        if (moon.userData.children) {
                            moon.userData.children.forEach(asteroidId => {
                                const asteroid = planets.find(p => p.userData.id === asteroidId);
                                if (asteroid && asteroid.userData.type === 'asteroid') {
                                    const asteroidTime = Date.now() * 0.0003 * orbitSpeed; // Even faster asteroid rotation
                                    const asteroidAngle = asteroid.userData.originalAngle + asteroidTime;
                                    asteroid.position.x = moon.position.x + Math.cos(asteroidAngle) * asteroid.userData.distance;
                                    asteroid.position.z = moon.position.z + Math.sin(asteroidAngle) * asteroid.userData.distance;
                                    asteroid.position.y = moon.position.y; // Same level as moon
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    
    // Animate orbit rings (subtle pulsing effect)
    scene.children.forEach(child => {
        if (child.userData && child.userData.type === 'orbit') {
            const time = Date.now() * 0.001;
            child.material.opacity = 0.3 + Math.sin(time) * 0.1;
        }
    });
    
    // Update communication lines and balls if they exist
    if (communicationLines && communicationTarget) {
        const shipPos = spaceship.position.clone();
        const targetPos = communicationTarget.position.clone();
        
        // Calculate midpoint for convergence
        const midpoint = new THREE.Vector3();
        midpoint.addVectors(shipPos, targetPos);
        midpoint.multiplyScalar(0.5);
        
        // Update first line (spaceship to midpoint)
        const line1 = communicationLines.children[0];
        if (line1 && line1.geometry) {
            const points1 = [shipPos, midpoint];
            line1.geometry.setFromPoints(points1);
        }
        
        // Update second line (midpoint to target)
        const line2 = communicationLines.children[1];
        if (line2 && line2.geometry) {
            const points2 = [midpoint, targetPos];
            line2.geometry.setFromPoints(points2);
        }
        
        // Update communication balls
        updateCommunicationBalls(shipPos, midpoint, targetPos);
    }
    
    // Update UI
    if (isInitialized) {
        updateCameraInfo();
    }
    
    // Render scene
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Cleanup function
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Remove event listeners
    window.removeEventListener('click', onNodeClick);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('keydown', onKeyDown);
    
    // Dispose of Three.js resources
    if (renderer) {
        renderer.dispose();
    }
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Start the application when the page loads
window.addEventListener('load', init); 