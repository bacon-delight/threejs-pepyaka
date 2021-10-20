// Imports
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";
import fragmentParticles from "./shaders/fragmentParticles.glsl";
import vertexParticles from "./shaders/vertexParticles.glsl";

// -------------------------------------------------------------------------------------------------------------------------

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.01, 100);
camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3())

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
});

// Time
let time = 0;

// -------------------------------------------------------------------------------------------------------------------------

// Lights
// const ambient = new THREE.AmbientLight(0xcccccc, 1.3);
// scene.add(ambient);
// const light = new THREE.DirectionalLight(0xffffff, 3);
// light.position.set(5, 5, 10);
// scene.add(light);

// Light Helpers
// const lightHelper = new THREE.DirectionalLightHelper(light);
// scene.add(lightHelper);

// -------------------------------------------------------------------------------------------------------------------------

const material = new THREE.ShaderMaterial({
	extensions: {
		derivatives: "#extension GL_OES_standard_derivatives : enable"
	},
	side: THREE.DoubleSide,
	uniforms: {
		time: {
			type: "f",
			value: 0
		},
		resolution: {
			type: "v4",
			value: new THREE.Vector4()
		},
		uvRate1: {
			value: new THREE.Vector2(1, 1)
		},
	},
	// wireframe: true,
	vertexShader: vertex,
	fragmentShader: fragment,
});
const geometry = new THREE.SphereBufferGeometry(1, 128, 128);
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// -------------------------------------------------------------------------------------------------------------------------

const particleMaterial = new THREE.ShaderMaterial({
	extensions: {
		derivatives: "#extension GL_OES_standard_derivatives : enable"
	},
	side: THREE.DoubleSide,
	uniforms: {
		time: {
			type: "f",
			value: 0
		},
		resolution: {
			type: "v4",
			value: new THREE.Vector4()
		},
		uvRate1: {
			value: new THREE.Vector2(1, 1)
		},
	},
	// wireframe: true,
	transparent: true,
	vertexShader: vertexParticles,
	fragmentShader: fragmentParticles,
});

// Distribute Particles in a Sphere
const N = 8000;
const particlePositions = new Float32Array(N*3);
let increment = Math.PI*(3-Math.sqrt(5));
let offset = 2/N;
let radius = 1.6;

for (let i=0; i<N; i++) {

	let y = i * offset - 1 + (offset/2);
	let r = Math.sqrt(1-y*y);
	let phi = i*increment;
	particlePositions[3*i] = radius * Math.cos(phi)*r;
	particlePositions[3*i+1] = radius * y;
	particlePositions[3*i+2] = radius * Math.sin(phi)*r;

	// particlePositions[3*i] = 2*Math.random();
	// particlePositions[3*i+1] = 2*Math.random();
	// particlePositions[3*i+2] = 2*Math.random();
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const points = new THREE.Points(particleGeometry, particleMaterial);
scene.add(points);

// -------------------------------------------------------------------------------------------------------------------------

// Game Loop
function animate() {
	time += 0.05;
	material.uniforms.time.value = time;
	particleMaterial.uniforms.time.value = time;
	points.rotation.y = time/10;
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();