<template>
    <div>
      <div ref="container"></div> <!-- Visualizzazione del mondo -->
  
      <!-- Mini card -->
      <div class="radio-card punk-card" v-if="selectedRadio">
        <img :src="selectedRadio.favicon ? selectedRadio.favicon : defaultImage" class="radio-logo" alt="Radio logo">
        <div class="radio-details">
          <h4>{{ selectedRadio.name }}</h4>
          <v-btn :icon="selectedRadio.playing ? 'mdi-stop' : 'mdi-play'" @click="togglePlayPause(selectedRadio)"></v-btn>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { useRouter } from 'vue-router'; // Importa useRouter dal vue-router
  import Hls from 'hls.js';
  import defaultImage from '../assets/no immage.png';
  import earthTexture from '../assets/mappa.jpg'; // Aggiungi questo import
  
  export default {
    name: 'WorldView',
    data() {
      return {
        camera: null,
        renderer: null,
        controls: null,
        earthRadius: 1,
        radio: [],
        selectedRadio: null,
        defaultImage,
        isFavorite: false,
        router: null,
      };
    },
    mounted() {
      this.router = useRouter();
      this.init();
      this.animate();
      this.getRadios();
      window.addEventListener('resize', this.handleWindowResize);
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      window.addEventListener('click', this.onDocumentMouseClick);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleWindowResize);
      window.removeEventListener('click', this.onDocumentMouseClick);
    },
    methods: {
      init() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 2;
  
        this.renderer = new THREE.WebGLRenderer();
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.$refs.container.appendChild(this.renderer.domElement);
  
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
  
        const scene = new THREE.Scene();
  
        const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
        const texture = new THREE.TextureLoader().load(earthTexture);
        const material = new THREE.MeshPhongMaterial({ map: texture });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);
  
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
  
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);
  
        this.scene = scene;
  
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.05;
      },
      onDocumentMouseClick(event) {
        event.preventDefault();
        this.mouse.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
  
        if (intersects.length > 0) {
          console.log('Clicked on:', intersects[0].object.userData);
          this.handleMarkerClick(intersects[0]);
        }
      },
      handleMarkerClick(intersectedObject) {
        if (intersectedObject.object.onClick) {
          intersectedObject.object.onClick();
          const previousRadio = this.selectedRadio;
          this.selectedRadio = intersectedObject.object.userData;
          this.$nextTick(() => {
            if (this.selectedRadio.url_resolved || this.selectedRadio.url) {
              this.lazyLoadAudio(this.selectedRadio);
              if (previousRadio && previousRadio !== this.selectedRadio) {
                this.pauseRadio(previousRadio);
              }
            }
          });
        }
      },
      lazyLoadAudio(radio) {
        console.log('Lazy loading audio for:', radio);
        if (!radio.audioPlayer) {
          console.log('Creating new audio player');
          radio.audioPlayer = new Audio(radio.url_resolved || radio.url);
          console.log('Audio player:', radio.audioPlayer);
          radio.audioPlayer.onloadeddata = () => {
            console.log('Audio loaded');
          };
          radio.audioPlayer.onerror = () => {
            console.error('Error loading audio');
          };
        }
        else {
          console.log('Audio player already exists');
        }
      },
      addMarker(longitude, latitude, radio) {
        if (longitude !== null && latitude !== null) {
          const phi = (90 - latitude) * (Math.PI / 180);
          const theta = (longitude + 180) * (Math.PI / 180);
          const x = -this.earthRadius * Math.sin(phi) * Math.cos(theta);
          const y = this.earthRadius * Math.cos(phi);
          const z = this.earthRadius * Math.sin(phi) * Math.sin(theta);
  
          const geometry = new THREE.SphereGeometry(0.01, 32, 32);
          const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const marker = new THREE.Mesh(geometry, material);
          marker.position.set(x, y, z);
          marker.userData = radio;
          marker.onClick = () => {
            console.log('Clicked on marker:', marker.userData);
          };
          this.scene.add(marker);
  
          const invisibleSphereGeometry = new THREE.SphereGeometry(0.015, 32, 32);
          const invisibleSphereMaterial = new THREE.MeshBasicMaterial({ visible: false });
          const invisibleSphere = new THREE.Mesh(invisibleSphereGeometry, invisibleSphereMaterial);
          invisibleSphere.position.set(x, y, z);
          invisibleSphere.userData = radio;
          invisibleSphere.onClick = marker.onClick;
          this.scene.add(invisibleSphere);
        } else {
          console.error('Longitude or latitude is null');
        }
      },
      animate() {
        requestAnimationFrame(this.animate);
  
        if (this.controls) {
          this.controls.update();
        }
  
        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      },
      handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      },
      async fetchRadios() {
        const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=400&hidebroken=true&has_geo_info=true&order=clickcount&reverse=true');
        const data = await response.json();
        return data;
      },
      async getRadios() {
        try {
          this.radio = await this.fetchRadios();
          this.radio.forEach(radio => {
            this.addMarker(radio.geo_long, radio.geo_lat, radio);
            radio.playing = false;
            radio.audioPlayer = new Audio();
          });
        } catch (error) {
          console.error('Error fetching radios:', error);
        }
      },
      togglePlayPause(radio) {
        if (radio.playing) {
          this.pauseRadio(radio);
        } else {
          this.pauseAllRadios();
          this.playRadio(radio);
        }
      },
      playRadio(radio) {
        console.log('playRadio called', radio);
        const audioUrl = radio.url_resolved || radio.url;
        console.log('Audio URL:', audioUrl);
        if (audioUrl.includes('m3u8')) {
          if (Hls.isSupported()) {
            console.log('HLS is supported');
            const hls = new Hls();
            hls.loadSource(audioUrl);
            hls.attachMedia(radio.audioPlayer);
          } else {
            console.error('HLS is not supported in this browser.');
          }
        } else {
          console.log('Setting audio source:', audioUrl);
          radio.audioPlayer.src = audioUrl;
        }
        radio.audioPlayer.play()
          .then(() => {
            console.log('Audio started playing');
            radio.playing = true;
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            if (error.name === 'NotAllowedError') {
              console.error('Please ensure that the audio playback is allowed in your browser settings.');
            }
          });
      },
      getRadioImage(radio) {
        if (radio.playing) {
          return 'https://whiz-kid.de/images/sound.gif';
        } else {
          return radio.favicon ? radio.favicon : "https://cdn-icons-png.freepik.com/256/508/508206.png?semt=ais_hybrid";
        }
      },
      pauseRadio(radio) {
        radio.audioPlayer.pause();
        radio.playing = false;
      },
      pauseAllRadios() {
        this.radio.forEach(radio => {
          if (radio.playing) {
            this.pauseRadio(radio);
          }
        });
      },
    },
    beforeRouteLeave(to, from, next) {
      this.pauseAllRadios();
      next();
    },
  };
  </script>
  
  <style scoped>
  .radio-card {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #fff;
    border: 2px solid #1976D2;
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  
  .radio-logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 20px;
  }
  
  .radio-details {
    flex-grow: 1;
  }
  
  .radio-details h4 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  
  .btn-container {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1;
  }
  
  .play-button-container {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    transition: background-color 0.3s;
    cursor: pointer;
  }
  
  .play-button-container:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .play-button-container:active {
    background-color: rgba(255, 255, 255, 0.4);
  }
  
  .punk-card {
    background: linear-gradient(45deg, #ff69b4, #8a2be2);
  }
  </style>
  