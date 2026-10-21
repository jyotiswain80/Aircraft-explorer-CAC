import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Aircraft Explorer: all geometry is procedural so the project needs no assets.
const sceneHost = document.querySelector('#scene');
const info = document.querySelector('#info');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe4f2fc);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
const defaultCamera = new THREE.Vector3(19, 12, 20);
camera.position.copy(defaultCamera);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
sceneHost.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 9; controls.maxDistance = 55;
controls.target.set(0, 0, 0);
scene.add(new THREE.HemisphereLight(0xffffff, 0x74889a, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(12, 20, 14); scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 1.0); fill.position.set(-15, 5, -8); scene.add(fill);

const PARTS = {
 nose:{title:'Nose / radome',description:'The rounded nose fairing, called a radome, lets radio waves pass through to the weather radar. Its smooth shape reduces drag.'},
 cockpit:{title:'Cockpit windshield / flight deck',description:'The reinforced windshield gives pilots a forward view, while the flight deck contains the controls and displays used to operate the aircraft.'},
 fuselage:{title:'Fuselage',description:'The fuselage is the main body of the aircraft. It carries passengers, cargo, and systems while its pressurized shell maintains a comfortable cabin altitude.'},
 windows:{title:'Cabin windows',description:'Passenger windows provide outside views and admit daylight. Their rounded shape helps distribute stress in the pressurized fuselage.'},
 wing:{title:'Main wing',description:'The swept wings generate most of the lift. Their shape balances efficient cruise flight with controllability at lower speeds.'},
 winglet:{title:'Winglet',description:'The upturned wingtip helps weaken the swirling vortices that form behind a wing, reducing some induced drag.'},
 engine:{title:'Turbofan engine',description:'A turbofan draws in a large mass of air, accelerates it, and produces thrust. The fan supplies much of the thrust efficiently at typical airliner speeds.'},
 pylon:{title:'Engine pylon',description:'The pylon attaches the engine to the wing and transfers thrust and other loads into the airframe. It also routes services between the engine and aircraft.'},
 fan:{title:'Fan and exhaust',description:'The large front fan moves air into the engine core and around it. Hot core gases leave through the rear nozzle to contribute to thrust.'},
 fin:{title:'Vertical stabilizer / rudder area',description:'The vertical tail helps keep the aircraft pointed into the airflow. Its movable rudder controls yaw, or side-to-side nose motion.'},
 tailplane:{title:'Horizontal stabilizer',description:'The horizontal tail balances pitching forces. Its elevator or movable stabilizer helps control the aircraft nose-up and nose-down.'},
 flaps:{title:'Wing flaps',description:'Flaps extend from the rear of the wing for takeoff and landing. They increase lift at lower speeds, with added drag.'},
 fuel:{title:'Wing fuel tanks',description:'Fuel is commonly stored in sealed spaces within the wings. Keeping fuel near the wing structure helps manage loads as fuel is used.'},
 apu:{title:'Auxiliary power unit (APU)',description:'The APU is a small turbine in the tail that can provide electrical power and compressed air on the ground, and may serve as a backup in flight.'},
 avionics:{title:'Avionics bay',description:'Avionics are electronic systems for communication, navigation, monitoring, and flight management. This highlighted forward compartment is illustrative.'},
 hydraulics:{title:'Hydraulic system',description:'Pressurized hydraulic fluid powers high-force equipment such as flight controls and landing gear. The colored lines here indicate representative routing.'},
 electrical:{title:'Electrical system / generators',description:'Generators supply electrical power for aircraft systems. Power is distributed through protected circuits to instruments, lighting, and equipment.'},
 ecs:{title:'Environmental control system',description:'The environmental control system conditions and circulates cabin air, helping regulate temperature and pressure.'},
 cabin:{title:'Passenger cabin',description:'The passenger cabin contains seating and an aisle. In cutaway view, the floor, seats, flight deck, and rear service area are visible.'},
 cargo:{title:'Cargo hold',description:'The space beneath the passenger floor carries baggage and freight in secured compartments.'},
 nosegear:{title:'Nose landing gear',description:'The nose gear supports the forward fuselage on the ground and usually steers the aircraft during taxi.'},
 maingear:{title:'Main landing gear',description:'The main gear carries most of the aircraft weight during landing and taxi. Its wheels and tires absorb substantial impact loads.'},
 brakes:{title:'Wheel brakes',description:'Brakes slow the wheels after touchdown and during taxi. They work with other deceleration systems to help stop the aircraft.'},
 tailcone:{title:'Tail cone',description:'The tail cone smoothly closes the aft fuselage and reduces aerodynamic drag around the tail.'}
};
const white = new THREE.MeshStandardMaterial({color:0xf4f6f5, metalness:.22, roughness:.48});
const panel = new THREE.MeshStandardMaterial({color:0xcbd5dc, metalness:.25, roughness:.58});
const red = new THREE.MeshStandardMaterial({color:0xb83a45, roughness:.45});
const glass = new THREE.MeshStandardMaterial({color:0x183d55, metalness:.18, roughness:.22});
const dark = new THREE.MeshStandardMaterial({color:0x263947, metalness:.35, roughness:.38});
const gold = new THREE.MeshStandardMaterial({color:0xd2a84d, metalness:.55, roughness:.35});
const blue = new THREE.MeshStandardMaterial({color:0x3f96a8, metalness:.15, roughness:.4, transparent:true, opacity:.48});
const cabinMat = new THREE.MeshStandardMaterial({color:0xe8edf0, roughness:.8});
const outside = new THREE.Group(), inside = new THREE.Group(); scene.add(outside, inside); inside.visible = false;
const clickables = [];
function register(mesh, id) { mesh.userData.partId=id; clickables.push(mesh); return mesh; }
function mesh(group, geometry, material, pos, id, rot) { const m=new THREE.Mesh(geometry,material); m.position.set(...pos); if(rot)m.rotation.set(...rot); group.add(m); if(id)register(m,id); return m; }
function box(group,size,pos,material,id,rot) { return mesh(group,new THREE.BoxGeometry(...size),material,pos,id,rot); }
function cylinder(group,r1,r2,len,pos,material,id,axis='z') { const m=mesh(group,new THREE.CylinderGeometry(r1,r2,len,32,1,false),material,pos,id); if(axis==='z')m.rotation.x=Math.PI/2; else if(axis==='x')m.rotation.z=Math.PI/2; return m; }
function lineTube(group, points, radius, material, id) { const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))); return mesh(group,new THREE.TubeGeometry(curve,32,radius,8,false),material,id?[0,0,0]:[0,0,0],id); }
function createFuselage() {
 // Lathe profile is closed at both ends and gives the nose and tail a rounded taper.
 const profile=[[-7.9,.03],[-7.75,.34],[-7.4,.68],[-6.9,.91],[-6.2,1.03],[-5.3,1.08],[4.9,1.08],[5.8,1.01],[6.5,.83],[7.1,.55],[7.65,.22],[7.8,.03]].map(([z,r])=>new THREE.Vector2(r,z));
 const g=new THREE.LatheGeometry(profile,64); g.rotateX(Math.PI/2); // lathe axis Y becomes aircraft Z
 mesh(outside,g,white,[0,0,0],'fuselage');
 // radome overlay is subtly tinted and overlaps the front profile smoothly
 const rad=mesh(outside,new THREE.SphereGeometry(1,32,24),white,[0,0,0],'nose');
 rad.scale.set(.72,.72,1.48); rad.position.set(0,-.08,-7.05);
 // cockpit glazing follows curved front surface via small angled individual panes
 const paneGeo=new THREE.SphereGeometry(1,20,12);
 for(const side of [-1,1]) for(let i=0;i<2;i++) { const p=mesh(outside,paneGeo,glass,[side*(.22+i*.27),.49,-6.65+i*.12],'cockpit'); p.scale.set(.23,.27,.15); p.rotation.x=-.25; p.rotation.z=side*.12; }
 // simple highlighted avionics bay visible just behind the radome
 const av=mesh(outside,new THREE.SphereGeometry(.28,20,14),gold,[0,-.38,-6.02],'avionics'); av.scale.set(1,.7,1.35);
 // Window rows on both sides
 for(const s of [-1,1]) for(let z=-4.9;z<=4.45;z+=.57) { const w=mesh(outside,new THREE.SphereGeometry(.105,12,10),glass,[s*1.035,.34,z],'windows'); w.scale.set(.25,.8,1); }
 // fine belly service line and subtle red access marker
 box(outside,[.055,.025,8.8],[0,-1.065,-.1],panel,'fuselage');
}
function createWings() {
  // Define the right-wing swept planform in X/Z, then mirror its X coordinates
  // before creating each side's independent positive-depth extrusion.
  const planform = [[1.0,-1.6],[11.6,1.0],[11.6,1.9],[1.0,0.2]];
  for (const side of [-1,1]) {
    const points = planform.map(([x,z]) => [side*x,z]);
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i=1; i<points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth:.22, bevelEnabled:true, bevelSegments:2, steps:1,
      bevelSize:.08, bevelThickness:.06
    });
    // Shape's second coordinate becomes aircraft Z; extrusion thickness is vertical.
    geometry.rotateX(Math.PI/2);
    mesh(outside, geometry, white, [0,.02,0], 'wing');

   box(outside, [6.5,.12,.5], [5.5*side,-.16,.9], panel, 'flaps', [0,0,0]);
    const winglet = box(outside, [.4,1.05,.7], [11.5*side,.55,1.45], white, 'winglet', [0,0,-.12*side]);
    winglet.rotation.z = -.12*side;
    lineTube(outside, [[1.5*side,-.23,-1.0],[4*side,-.23,-.1],[7*side,-.23,.7],[10.4*side,-.2,1.2]], .035, red, 'hydraulics');
  }
}
function createEngines() {
 for(const s of [-1,1]) { const x=s*3.0, z=-1.4;
  // pylon is ahead of wing mid-chord and carries the nacelle below it
  box(outside,[.78,1.03,.42],[x,.05,z],white,'pylon',[0,0,-.18*s]);
  const nac=cylinder(outside,.72,.72,2.55,[x,-.94,z-.05],white,'engine'); nac.scale.set(1,1,.9);
  // visible front intake, fan hub and blades
  cylinder(outside,.57,.57,.08,[x,-.94,z-1.22],dark,'fan');
  cylinder(outside,.14,.14,.12,[x,-.94,z-1.29],panel,'fan');
  for(let b=0;b<9;b++){const a=b*Math.PI*2/9; const blade=box(outside,[.48,.045,.04],[x+Math.cos(a)*.34,-.94+Math.sin(a)*.34,z-1.30],panel,'fan'); blade.rotation.z=a;}
  cylinder(outside,.31,.31,.1,[x,-.94,z+1.14],dark,'fan');
  const cone=mesh(outside,new THREE.ConeGeometry(.26,.72,24),panel,[x,-.94,z+1.25],'fan'); cone.rotation.x=Math.PI/2;
  // nacelle lip detail
  const lip=new THREE.Mesh(new THREE.TorusGeometry(.62,.055,10,32),panel); lip.position.set(x,-.94,z-1.26); lip.rotation.x=Math.PI/2; outside.add(lip); register(lip,'engine');
 }
}
function createTail() {
 // Tailplanes span across the aft fuselage, swept toward the rear.
 for(const s of [-1,1]) { const h=box(outside,[4.1,.18,1.15],[1.85,.18,6.15],white,'tailplane',[0,0,-.12]); if(s<0){h.position.x=-1.85;h.rotation.z=.12;} }
 const fin=box(outside,[.2,3.45,3.15],[0,1.65,5.6],white,'fin',[.12,0,0]);
 // red fin-tip panel accent, no marks or lettering
 box(outside,[.22,.34,1.0],[0,3.25,6.35],red,'fin',[.12,0,0]);
 const apu=cylinder(outside,.25,.32,.95,[0,.15,7.15],dark,'apu');
 const cone=mesh(outside,new THREE.ConeGeometry(.36,1.1,28),white,[0,0,7.55],'tailcone'); cone.rotation.x=-Math.PI/2;
}
let noseGear, mainGear = [];
function createGear() {
 

noseGear = new THREE.Group();
noseGear.position.set(0, -1.02, -5.8);
outside.add(noseGear);
cylinder(noseGear, .075, .095, .9, [0, -.45, 0], panel, 'nosegear', 'y');
for (const s of [-1, 1]) cylinder(noseGear, .31, .31, .17, [s * .23, -.91, 0], dark, 'nosegear', 'x');

for (const s of [-1, 1]) {
const x = s * .72, z = .55;
const g = new THREE.Group();
g.position.set(x, -.9, z);
outside.add(g);
mainGear.push(g);
cylinder(g, .09, .13, 1.18, [0, -.58, 0], panel, 'maingear', 'y');
cylinder(g, .30, .30, .16, [-.20, -1.18, 0], dark, 'maingear', 'x');
cylinder(g, .30, .30, .16, [.20, -1.18, 0], dark, 'maingear', 'x');
cylinder(g, .13, .13, .21, [-.21, -1.18, 0], gold, 'brakes', 'x');
cylinder(g, .13, .13, .21, [.21, -1.18, 0], gold, 'brakes', 'x');
box(outside, [.7, .1, .85], [x, -1.05, z + .45], panel, 'maingear');
}
}

function setGear(t) {
if (noseGear) noseGear.rotation.x = -Math.PI / 2 * t;
for (const g of mainGear) g.rotation.z = -Math.sign(g.position.x) * (Math.PI / 2) * t;
}
function createSystems() {
 // ECS duct beneath the floor and additional fine hydraulic runs to gear/surfaces.
 lineTube(outside,[[0,-.88,-4.5],[0,-.92,-2],[0,-.92,2],[0,-.9,5.4]],.055,blue,'ecs');
 for(const s of [-1,1]) lineTube(outside,[[0,-.94,0],[s*.65,-1.2,.55],[s*1.15,-1.8,.55]],.035,red,'hydraulics');
}
function createInterior() {
 box(inside,[1.75,.12,11.4],[0,-.32,-.05],cabinMat,'cabin');
 // central aisle strip
 box(inside,[.44,.025,10.5],[0,-.24,.15],panel,'cabin');
 // seats, paired across the aisle, in simple rows
 for(let row=0;row<8;row++) for(const s of [-1,1]) { const z=-4.35+row*1.13; const x=s*.53;
   box(inside,[.42,.65,.48],[x,.05,z],red,'cabin'); box(inside,[.44,.12,.13],[x,.39,z-.13],panel,'cabin');
 }
 // flight deck with instrument panel and two pilot seats
 box(inside,[1.42,.5,.65],[0,.13,-5.72],dark,'cockpit');
 for(const s of [-1,1]) { box(inside,[.42,.58,.42],[s*.38,-.02,-6.48],red,'cockpit'); box(inside,[.36,.14,.28],[s*.38,.3,-6.55],panel,'cockpit'); }
 // rear galley and service modules
 box(inside,[1.45,.72,.75],[0,.02,5.3],panel,'cabin');
 for(const s of [-1,1]) box(inside,[.18,.58,.62],[s*.68,.02,4.72],white,'cabin');
 // cargo compartment and fuel/electrical system indicators outlined in cutaway
 box(inside,[1.35,.42,4.2],[0,-.82,.4],new THREE.MeshStandardMaterial({color:0x788b98,transparent:true,opacity:.72}), 'cargo');
 box(inside,[.24,.2,1.15],[0,.1,-6.02],gold,'avionics');
 box(inside,[.36,.2,1.0],[0,.1,6.65],dark,'apu');
 // translucent interior shell, intentionally subtle to reveal cabin contents
 const shell=mesh(inside,new THREE.CylinderGeometry(1.0,1.0,10.9,48,1,true),new THREE.MeshStandardMaterial({color:0xa9c8d6,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}),[0,0,0],'fuselage'); shell.rotation.x=Math.PI/2;
}
createFuselage(); createWings(); createEngines(); createTail(); createGear(); createSystems(); createInterior();

let selected=null;
function clearSelection() { if(selected){selected.material.emissive?.setHex(0x000000); selected.material.emissiveIntensity=0; selected=null;} info.innerHTML='<strong>Aircraft anatomy</strong><p>Click a part to learn about it. Drag to rotate; scroll to zoom.</p>'; }
function choose(hit) {
 const id=hit?.object?.userData?.partId;
 if(!id || (selected===hit.object)){ clearSelection(); return; }
 clearSelection(); selected=hit.object;
 if(selected.material && selected.material.emissive){selected.material.emissive.setHex(0x5b9eb5); selected.material.emissiveIntensity=.85;}
 const part=PARTS[id]; if(part) info.innerHTML=`<strong>${part.title}</strong><p>${part.description}</p>`;
}
const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
function cast(event){const r=renderer.domElement.getBoundingClientRect(); pointer.x=((event.clientX-r.left)/r.width)*2-1; pointer.y=-((event.clientY-r.top)/r.height)*2+1; raycaster.setFromCamera(pointer,camera); return raycaster.intersectObjects(clickables,true).find(h=>h.object.userData.partId);}
renderer.domElement.addEventListener('click',e=>{ if(controls.dragging) return; choose(cast(e)); });
renderer.domElement.addEventListener('pointermove',e=>{renderer.domElement.style.cursor=cast(e)?'pointer':'grab';});
function resize(){const w=sceneHost.clientWidth,h=sceneHost.clientHeight; if(!w||!h)return; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);}
window.addEventListener('resize',resize); resize();
// runway, grass, and the takeoff animation
const grass = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({color:0x5f9e4a, roughness:.95}));
grass.rotation.x = -Math.PI / 2; grass.position.y = -2.42; scene.add(grass);
const runway = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 44), new THREE.MeshStandardMaterial({color:0x8a8f94, roughness:.9}));
runway.rotation.x = -Math.PI / 2; runway.position.set(0, -2.41, 0); scene.add(runway);
const stripe = new THREE.MeshStandardMaterial({color:0xf2f2ef, roughness:.8});
for (let z = -19; z <= 19.1; z += 3.2) {
const d = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1.7), stripe);
d.rotation.x = -Math.PI / 2; d.position.set(0, -2.40, z); scene.add(d);
}

let rolling = false, startTime = 0;
function setPhase(p) {
const clamp = Math.min(1, Math.max(0, p));
const climb = Math.max(0, (clamp - .45) / .55);
outside.position.y = climb * 11;
outside.position.z = -clamp * 30;
outside.rotation.x = climb * .22;
setGear(Math.min(1, Math.max(0, (clamp - .5) / .3)));
}
function takeoff() { rolling = true; startTime = performance.now(); setPhase(0); }
document.querySelector('#takeoff').addEventListener('click', takeoff);
function resetAnim(){ rolling = false; setPhase(0); }
document.querySelector('#resetAnim').addEventListener('click', resetAnim);

let hovered = null;
function setFade(mesh, on) {
if (!mesh) return;
if (on) { if (!mesh.userData.m0) mesh.userData.m0 = mesh.material;
const m = mesh.userData.m0.clone(); m.transparent = true; m.opacity = .15; m.depthWrite = false; mesh.material = m; }
else if (mesh.userData.m0) mesh.material = mesh.userData.m0;
}
renderer.domElement.addEventListener('mousemove',(e)=>{
if (!inside.visible) { setFade(hovered,false); hovered=null; return; }
const r = renderer.domElement.getBoundingClientRect();
pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
raycaster.setFromCamera(pointer, camera);
const hits = raycaster.intersectObjects(outside.children, true);
const hit = hits.length ? hits[0].object : null;
if (hit !== hovered) { setFade(hovered,false); setFade(hit,true); hovered = hit; }
});function animate(){requestAnimationFrame(animate); controls.update(); if (rolling) { const t = (performance.now() - startTime) / 7000; setPhase(t); const camShift = outside.position.clone().sub(controls.target); controls.target.add(camShift); camera.position.add(camShift); if (t >= 1) rolling = false; } updateHUD(); renderer.render(scene, camera);} animate();

document.querySelector('#outside').addEventListener('click',()=>{inside.visible=false;outside.visible=true;clearSelection();});
document.querySelector('#inside').addEventListener('click',()=>{inside.visible=true;outside.visible=true;clearSelection();});
document.querySelector('#reset').addEventListener('click',()=>{inside.visible=false;outside.visible=true;camera.position.copy(defaultCamera);controls.target.set(0,0,0);controls.update();clearSelection();});




const cruiseBtn   = document.getElementById('cruise');
const landBtn     = document.getElementById('land');
const sizeSlider  = document.getElementById('sizeSlider');
const speedSlider = document.getElementById('speedSlider');
const takeoffBtn = document.getElementById('takeoff');
const resetBtn = document.getElementById('resetAnim');
const H = {
speed: document.getElementById('hSpeed'), alt: document.getElementById('hAlt'),
thrust: document.getElementById('hThrust'), lift: document.getElementById('hLift'),
weight: document.getElementById('hWeight'), drag: document.getElementById('hDrag'),
grav: document.getElementById('hGrav')
};

let sizeFactor = 1, speedFactor = 1, inCruise = false, isLanding = false;
let hudSpeed = 0, hudAlt = 0;



sizeSlider.addEventListener('input', () => {
  sizeFactor = parseFloat(sizeSlider.value);
  outside.scale.setScalar(sizeFactor);
});

speedSlider.addEventListener('input', () => {
  speedFactor = parseFloat(speedSlider.value);
});

cruiseBtn.addEventListener('click', () => {
  if (inCruise || isLanding) return;
  inCruise = true;
  cruiseBtn.disabled = true;
  landBtn.disabled = false;
  setPhase(0.45);
});

landBtn.addEventListener('click', () => {
  if (!inCruise) return;
  inCruise = false;
  isLanding = true;
  landBtn.disabled = true;
  setPhase(0.8);
  setTimeout(() => setPhase(1), 3000);
  setTimeout(() => { isLanding = false; cruiseBtn.disabled = false; }, 6000);
});

takeoffBtn.addEventListener('click', () => {
  cruiseBtn.disabled = true;
  landBtn.disabled = true;
  setTimeout(() => { if (!isLanding) cruiseBtn.disabled = false; }, 7000);
});

resetBtn.addEventListener('click', () => {
  inCruise = false;
  isLanding = false;
  hudSpeed = 0;
  hudAlt = 0;
  cruiseBtn.disabled = true;
  landBtn.disabled = true;
  sizeFactor = 1;
  speedFactor = 1;
  sizeSlider.value = 1;
  speedSlider.value = 1;
  outside.scale.setScalar(1);
});

function updateHUD() {
  const wantSpeed = inCruise ? 250 : (isLanding ? 70 : 0);
  const wantAlt = inCruise ? 35000 : 0;
  hudSpeed += (wantSpeed * speedFactor - hudSpeed) * 0.05;
  hudAlt += (wantAlt - hudAlt) * 0.03;
  const V = Math.max(0, hudSpeed), A = Math.max(0, hudAlt), s = sizeFactor;
  const weight = 780 * s * s;
  const thrust = inCruise ? 220 * s : (isLanding ? 70 * s : 0);
  const area = s * s;
  const lift = 780 * area * Math.pow(V / 200, 2);
  const drag = 0.6 * area * Math.pow(V / 100, 2) * 10;
  if (H.speed) H.speed.textContent = 'Speed: ' + V.toFixed(0) + ' kt';
  if (H.alt) H.alt.textContent = 'Altitude: ' + A.toFixed(0) + ' ft';
  if (H.thrust) H.thrust.textContent = 'Thrust: ' + thrust.toFixed(0) + '%';
  if (H.lift) H.lift.textContent = 'Lift: ' + lift.toFixed(0);
  if (H.weight) H.weight.textContent = 'Weight: ' + weight.toFixed(0);
  if (H.drag) H.drag.textContent = 'Drag: ' + drag.toFixed(0);
  if (H.grav) H.grav.textContent = 'Gravity: ' + weight.toFixed(0);
}

updateHUD();
