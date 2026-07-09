// 3D Canvas 1: Simple Orbiting Geometry
// This version does not use OrbitControls.
// The camera moves around the object automatically.

var container = document.getElementById("three-container-1");

var width = 600;
var height = 300;

// scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f0e9);

// camera
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

// renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// material
var blackMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
var redMaterial = new THREE.LineBasicMaterial({ color: 0xaa3c2d });

// group
var group = new THREE.Group();
scene.add(group);

// horizontal block
var barGeometry = new THREE.BoxGeometry(3.5, 0.4, 0.4);
var bar = new THREE.Mesh(barGeometry, blackMaterial);
group.add(bar);

// vertical block
var verticalGeometry = new THREE.BoxGeometry(0.5, 1.6, 0.4);
var vertical = new THREE.Mesh(verticalGeometry, blackMaterial);
vertical.position.y = 0.4;
group.add(vertical);

// ring
var ringGeometry = new THREE.TorusGeometry(0.55, 0.12, 16, 40);
var ring = new THREE.Mesh(ringGeometry, blackMaterial);
ring.position.z = 0.3;
group.add(ring);

// red guide line
var points = [];
points.push(new THREE.Vector3(-2.5, -0.5, 0));
points.push(new THREE.Vector3(2.5, -0.5, 0));

var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
var line = new THREE.Line(lineGeometry, redMaterial);
scene.add(line);

// time variable
var angle = 0;

// animation
function animate() {
    requestAnimationFrame(animate);

    // slowly rotate the group
    group.rotation.y += 0.01;

    // move the camera in a circular orbit
    angle += 0.01;
    camera.position.x = Math.sin(angle) * 5;
    camera.position.z = Math.cos(angle) * 5;
    camera.position.y = 2;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();