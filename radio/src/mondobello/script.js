import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, earth, marker;

function init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Create a sphere (world)
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const texture = new THREE.TextureLoader().load('mappa.jpg');
    const material = new THREE.MeshPhongMaterial({ map: texture });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Define initial coordinates for the marker (Central Italy)
    const initialLongitude = 12 + (34 / 60) + (21.5 / 3600); // Longitude for Central Italy
    const initialLatitude = 42 + (30 / 60) + (15.5 / 3600); // Latitude for Central Italy

    // Convert geographic coordinates to 3D coordinates
    const markerPosition = convertGeoTo3D(initialLongitude, initialLatitude);

    // Create a marker
    const markerGeometry = new THREE.SphereGeometry(0.01, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(markerPosition);
    marker.position.normalize(); // Normalize the position to keep the marker on the surface of the sphere
    marker.position.multiplyScalar(1); // Adjust the radius of the sphere (1 in this case)
    scene.add(marker);

    // Add an ambient light to illuminate the scene
    const ambientLight = new THREE.AmbientLight(0xffffff); // White light
    scene.add(ambientLight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function convertGeoTo3D(longitude, latitude) {
    const phi = (90 - latitude) * Math.PI / 180;
    const theta = (360 - longitude) * Math.PI / 180;

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

try {
    init();
    animate();
} catch (error) {
    console.error(error);
}
