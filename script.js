import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  CSS2DRenderer,
  CSS2DObject
} from 'three/addons/renderers/CSS2DRenderer.js';

// Core globals
let scene, camera, renderer, controls, labelRenderer;
let planets = [];
// let explorer;
// let raycaster, mouse;
let raycaster, mouse;
let animationId;
let orbitSpeed = 0.3;         // base speed, don’t change
let orbitSpeedMultiplier = 1.0; // controlled by slider
let isInitialized = false;
// let explorerTargetNode = null;   // last-clicked node
// let explorerLine = null;         // line connecting node → explorer

// Basic data model (minimal)
const mindMapData = {
  nodes: []
};

// --- Init -------------------------------------------------------

function init() {
  console.log('Initializing CosmoMind minimal...');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 50);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(0x000011);
  document.body.appendChild(renderer.domElement);

  // Label renderer
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(labelRenderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 200;
  controls.minDistance = 5;

  // Lighting & environment
  setupLighting();
  createStarfield();

  // Core nodes
  createCentralNode();
  createInitialPlanets();
  // createExplorer();

  // Interaction
  setupInteractions();
  setupEventListeners();

  // Start loop
  animate();

  // Hide loading after a short delay
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => {
        loading.style.display = 'none';
      }, 500);
    }
  }, 1200);

  isInitialized = true;
  console.log('CosmoMind minimal initialized.');
}

// --- Scene setup ------------------------------------------------

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const sunLight = new THREE.PointLight(0xffffff, 2, 0);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
}

function createStarfield() {
  const starCount = 800;
  const group = new THREE.Group();

  for (let i = 0; i < starCount; i++) {
    const size = Math.random() * 0.3 + 0.05;
    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.5 + 0.3
    });
    const star = new THREE.Mesh(geo, mat);
    star.position.set(
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800
    );
    group.add(star);
  }

  scene.add(group);
}

// --- Nodes ------------------------------------------------------

function createCentralNode() {
  const geo = new THREE.SphereGeometry(4, 32, 32);
  const mat = new THREE.MeshBasicMaterial({ color: 0xdedede });
  const sun = new THREE.Mesh(geo, mat);
  sun.position.set(0, 0, 0);
  sun.userData = {
    id: 'central',
    type: 'central',
    title: 'System Center',
    content: 'Your main thought or concept goes here.'
  };
  scene.add(sun);
  planets.push(sun);

  // Glow
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(4.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xdedede,
      transparent: true,
      opacity: 0.2
    })
  );
  glow.position.copy(sun.position);
  scene.add(glow);

  createNodeLabel(sun, 'Central Idea');
  mindMapData.nodes.push(sun.userData);

  updateNodeCount();
}

function createInitialPlanets() {
  const palette = [
    0x645394,
    0xa44242,
    0xa47342,
    0xa4a442,
    0x42a442,
    0x42a4a4,
    0x4273a4
  ];

  const nodes = [
    {
      title: 'Related Idea',
      content: 'Short description here',
      color: palette[1],
      distance: 14,
      size: 2
    },
    {
      title: 'Next Related Idea',
      content: 'Short description here',
      color: palette[2],
      distance: 18,
      size: 2.2
    },
    {
      title: 'Another Related Item',
      content: 'Short description here',
      color: palette[3],
      distance: 24,
      size: 2.2
    },
    {
      title: 'Something Else',
      content: 'Short description here',
      color: palette[5],
      distance: 30,
      size: 2.1
    }
  ];

  nodes.forEach((node, i) => {
    createPlanet(node, i, nodes.length);
  });

  updateNodeCount();
}

function createPlanet(nodeData, index, total) {
  const angle = (index / total) * Math.PI * 2;
  const geo = new THREE.SphereGeometry(nodeData.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: nodeData.color,
    roughness: 0.7,
    metalness: 0.1
  });
  const planet = new THREE.Mesh(geo, mat);
  planet.position.set(
    Math.cos(angle) * nodeData.distance,
    0,
    Math.sin(angle) * nodeData.distance
  );
  planet.userData = {
    id: `planet_${Date.now()}_${index}`,
    type: 'planet',
    title: nodeData.title,
    content: nodeData.content,
    distance: nodeData.distance,
    angle
  };
  scene.add(planet);
  planets.push(planet);

  createOrbitRing(nodeData.distance);
  createNodeLabel(planet, nodeData.title);
  mindMapData.nodes.push(planet.userData);
}

function createOrbitRing(distance) {
  const ringGeo = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
}

function createNodeLabel(node, title) {
  const div = document.createElement('div');
  div.className = 'planet-label';
  div.textContent = title;
  const label = new CSS2DObject(div);
  const radius = node.geometry.parameters.radius || 1;
  label.position.set(0, radius + 1, 0);
  node.add(label);
}

// --- Explorer ---------------------------------------------------

// function createExplorer() {
//  const div = document.createElement('div');
//  div.className = 'explorer-icon';
//  div.innerHTML = '<i class="fa-solid fa-user-astronaut"></i>';
//  const label = new CSS2DObject(div);

//  explorer = new THREE.Object3D();
//  explorer.position.set(0, 0, 15);
//  explorer.add(label);
//  scene.add(explorer);

//  updateExplorerStatus('Idle');
// }

// Move explorer in a simple linear interpolation
// function moveExplorerTo(target) {
//  const start = explorer.position.clone();
//  const end = target.clone();
//  const duration = 1.5;
//  const startTime = performance.now();

  // updateExplorerStatus('Traveling...');

//  function step(now) {
//    const t = Math.min((now - startTime) / (duration * 1000), 1);
//    explorer.position.lerpVectors(start, end, t);

//    if (t < 1) {
//     requestAnimationFrame(step);
//    } else {
//      updateExplorerStatus('Arrived');
//      setTimeout(() => updateExplorerStatus('Idle'), 1000);
//    }
////  }

//  requestAnimationFrame(step);
//}

// --- Interaction ------------------------------------------------

function setupInteractions() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

function setupEventListeners() {
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onClick);

  const closeInstructions = document.getElementById('closeInstructions');
  if (closeInstructions) {
    closeInstructions.addEventListener('click', () => {
      document.getElementById('instructions').classList.add('hidden');
    });
  }
}
// Slider controls only the multiplier
  const speedSlider = document.getElementById('orbitSpeed');
  const speedValue = document.getElementById('orbitSpeedValue');
  if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', (e) => {
      orbitSpeedMultiplier = parseFloat(e.target.value);
      speedValue.textContent = `${orbitSpeedMultiplier.toFixed(1)}x`;
    });
  }

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  if (!isInitialized) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const targetNode = intersects[0].object;
    // Placeholder: later we’ll open an edit panel here.
    console.log('Clicked node:', targetNode.userData.title);
  }
}

// --- UI helpers -------------------------------------------------

function updateNodeCount() {
  const el = document.getElementById('nodeCount');
  if (el) {
    const count = mindMapData.nodes.length;
    el.textContent = `${count} Node${count === 1 ? '' : 's'}`;
  }
}

function updateExplorerStatus(status) {
  const el = document.getElementById('explorerStatus');
  if (el) el.textContent = status;
}

function updateCameraInfo() {
  const el = document.getElementById('cameraInfo');
  if (!el) return;
  const pos = camera.position;
  el.textContent = `Camera: ${pos.x.toFixed(1)}, ${pos.y.toFixed(
    1
  )}, ${pos.z.toFixed(1)}`;
}

// --- Animation loop ---------------------------------------------

function animate() {
  animationId = requestAnimationFrame(animate);

  const time = performance.now() * 0.001 * orbitSpeed * orbitSpeedMultiplier;

  planets.forEach((p) => {
    if (p.userData.type === 'planet') {
      const dist = p.userData.distance;
      const baseAngle = p.userData.angle;
      const angle = baseAngle + time;
      p.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    }
  });

  controls.update();
  updateCameraInfo();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// --- Bootstrapping ----------------------------------------------

window.addEventListener('load', () => {
  try {
    init();
  } catch (e) {
    console.error('Init failed', e);
    const loading = document.getElementById('loading');
    if (loading) {
      loading.querySelector('.loading-text').textContent =
        'Error initializing (see console)';
    }
  }
});
