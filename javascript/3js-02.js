// 3D Canvas 2: Material, Light, and Fog
// A simple atmospheric version of the primitive mark.

var container = document.getElementById("three-container-2");

var width = 600;
var height = 300;

// scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f0e9);
scene.fog = new THREE.Fog(0xf2f0e9, 4, 9);

// camera
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

// renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// lights
var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(3, 4, 5);
scene.add(directionalLight);

// materials
var blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.35,
    metalness: 0.25
});

var grayMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8,
    roughness: 0.8,
    metalness: 0.05
});

var redMaterial = new THREE.LineBasicMaterial({
    color: 0xaa3c2d
});

// group
var group = new THREE.Group();
scene.add(group);

// black horizontal block
var barGeometry = new THREE.BoxGeometry(3.8, 0.35, 0.35);
var bar = new THREE.Mesh(barGeometry, blackMaterial);
bar.position.y = 0;
group.add(bar);

// gray block behind it
var backGeometry = new THREE.BoxGeometry(2.4, 0.35, 0.35);
var backBar = new THREE.Mesh(backGeometry, grayMaterial);
backBar.position.set(0, -0.8, -1.2);
group.add(backBar);

// vertical black block
var verticalGeometry = new THREE.BoxGeometry(0.45, 1.5, 0.35);
var vertical = new THREE.Mesh(verticalGeometry, blackMaterial);
vertical.position.set(0, 0.45, 0);
group.add(vertical);

// circular ring
var ringGeometry = new THREE.TorusGeometry(0.7, 0.1, 16, 48);
var ring = new THREE.Mesh(ringGeometry, blackMaterial);
ring.position.set(0, 0.1, 0.45);
group.add(ring);

// red construction line
var points = [];
points.push(new THREE.Vector3(-2.5, -0.45, 0.1));
points.push(new THREE.Vector3(2.5, -0.45, 0.1));

var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
var line = new THREE.Line(lineGeometry, redMaterial);
scene.add(line);

// camera orbit variable
var angle = 0;

// animation
function animate() {
    requestAnimationFrame(animate);

    angle += 0.006;

    camera.position.x = Math.sin(angle) * 4.8;
    camera.position.z = Math.cos(angle) * 4.8;
    camera.position.y = 1.8;

    camera.lookAt(0, 0, 0);

    group.rotation.y += 0.004;

    renderer.render(scene, camera);
}

animate();