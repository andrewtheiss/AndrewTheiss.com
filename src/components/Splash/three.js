import * as THREE from 'three';

window.THREE = THREE; // THREE.OrbitControls expects THREE to be a global object



export default {...THREE, OrbitControls:{}};