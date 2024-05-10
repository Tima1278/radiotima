<template>
  <div ref="container"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import earthTexture from '../assets/mappa.jpg';

export default {
  name: 'ThreeDModelView',
  data() {
    return {
      camera: null,
      renderer: null,
      controls: null,
      earthRadius: 1, // Radius of the Earth model
      stations: []
    };
  },
  mounted() {
    this.init();
    this.fetchRadioStations();
    this.animate();
  },
  beforeUnmount() {
    // Remove the window resize event listener when component is destroyed
    window.removeEventListener('resize', this.handleWindowResize);
  },
  methods: {
    async fetchRadioStations() {
      try {
        const response = await fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true');
        const data = await response.json();
        this.stations = data;
        console.log('Radio stations data:', this.stations); // Controlla i dati delle stazioni radio ottenute
        this.addMarkers();
      } catch (error) {
        console.error('Error fetching radio stations:', error);
      }
    },
    addMarkers() {
      const scene = this.scene;
      const stations = this.stations;

      stations.forEach(station => {
        // Controlla se le coordinate sono definite e non null
        if (station.geo_lat !== null && station.geo_long !== null) {
          // Effettua la conversione delle coordinate e posiziona i marker sulla sfera del globo
          const latitude = parseFloat(station.geo_lat);
          const longitude = parseFloat(station.geo_long);
          const markerPosition = this.convertGeoTo3D(longitude, latitude);

          // Imposta un raggio più piccolo per i marker
          const markerGeometry = new THREE.SphereGeometry(0.003, 16, 16); // Raggio più piccolo
          const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.copy(markerPosition);
          marker.position.normalize();
          marker.position.multiplyScalar(1);
          scene.add(marker);
        } else {
          console.warn('Invalid coordinates for station:', station);
        }
      });
    },
    init() {
      // Create a camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 2;

      // Create renderer
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.renderer.domElement);

      // Add OrbitControls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;

      // Create a scene
      const scene = new THREE.Scene();

      // Create a more accurate Earth model
      const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
      const texture = new THREE.TextureLoader().load(earthTexture);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const earth = new THREE.Mesh(geometry, material);
      scene.add(earth);

      // Add an ambient light to illuminate the scene
      const ambientLight = new THREE.AmbientLight(0xffffff);
      scene.add(ambientLight);

      // Set the scene to component data
      this.scene = scene;
    },
    animate() {
      requestAnimationFrame(this.animate);

      // Update OrbitControls
      if (this.controls) {
        this.controls.update();
      }

      // Render the scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },
    convertGeoTo3D(longitude, latitude) {
      const phi = (90 - latitude) * Math.PI / 180;
      const theta = (360 - longitude) * Math.PI / 180;

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);

      return new THREE.Vector3(x, y, z);
    }
  }
};
</script>

<style>
/* Add any necessary styles here */
</style>
