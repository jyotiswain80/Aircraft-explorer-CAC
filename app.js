import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
const mount=document.querySelector('#scene'), info=document.querySelector('#info');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x83c9f5);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,1000);camera.position.set(15,10,19);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);mount.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x688bb0,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(10,20,15);scene.add(sun);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=8;controls.maxDistance=55;
const white=new THREE.MeshStandardMaterial({color:0xf4f6f8,metalness:.25,roughness:.5}),red=new THREE.MeshStandardMaterial({color:0xc71932}),dark=new THREE.MeshStandardMaterial({color:0x23465f}),glass=new THREE.MeshStandardMaterial({color:0x3e8bb3,transparent:true,opacity:.72}),gold=new THREE.MeshStandardMaterial({color:0xe8bb60}),seatMat=new THREE.MeshStandardMaterial({color:0x6e2635});
const outside=new THREE.Group(),inside=new THREE.Group();scene.add(outside,inside);
const targets=[];function add(group,mesh,title,description){group.add(mesh);if(title){mesh.userData={title,description};targets.push(mesh)}return mesh}
function box(group,w,h,d,x,y,z,mat,title,description){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return add(group,m,title,description)}
function tube(group,r1,r2,length,x,y,z,mat,title,description){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,length,32),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);return add(group,m,title,description)}
// Aircraft longitudinal axis is Z. This is an original, simplified widebody concept.
tube(outside,1.45,1.45,13,0,0,0,white,'Fuselage','The main aircraft body carries passengers, crew, cargo, and aircraft systems.');
     const noseGeometry = new THREE.SphereGeometry(1, 32, 24);
    const nosePositions = noseGeometry.attributes.position;
for (let i = 0; i < nosePositions.count; i++) {
  const x = nosePositions.getX(i);
  const y = nosePositions.getY(i);
  const z = nosePositions.getZ(i);

  const taper = 0.18 + 0.82 * ((z+1)/2);
  nosePositions.setXYZ(i, x * taper, y * taper, z * 2.2);
}

noseGeometry.computeVertexNormals();

const nose = new THREE.Mesh(noseGeometry, white);
nose.position.set(0,0, -6.5);
add(outside, nose, 'Nose', '');
const tail=new THREE.Mesh(new THREE.ConeGeometry(1.45,3.5,32),white);tail.rotation.x=Math.PI/2;tail.position.z=7.8;add(outside,tail,'Tail cone','The rear fuselage tapers to reduce aerodynamic drag.');
for(const side of [-1,1]){const wing=box(outside,7,.16,2.7,side*4.1,-.25,.7,white,'Main wing','The wings generate lift as air flows around their airfoil surfaces.');wing.rotation.y=side*.16;
const engine=tube(outside,.65,.65,2.3,side*3.5,-1.05,-.4,white,'Turbofan engine','A turbofan provides thrust by accelerating air through its fan and core.');tube(outside,.52,.52,.08,side*3.5,-1.05,-1.59,dark);
const stabilizer=box(outside,2.6,.12,1.2,side*1.8,.2,6.3,white,'Horizontal stabilizer','Helps maintain pitch stability and supports pitch control.');
for(let z=-5.8;z<5.8;z+=.48){const win=new THREE.Mesh(new THREE.SphereGeometry(.085,8,8),glass);win.position.set(side*1.42,.3,z);add(outside,win,'Cabin window','Passenger windows use multiple panes designed for pressurized flight.');}}
const fin=box(outside,.17,2.6,2.2,0,1.65,6.1,red,'Vertical stabilizer','The vertical tail provides directional stability; its rudder controls yaw.');
box(outside,1.6,.32,.75,0,.55,-6.8,dark,'Cockpit windows','The flight deck is where pilots monitor and control the aircraft.');
// Interior cutaway: floor, overhead ceiling ribs, rows of seats, cockpit and cargo area.
box(inside,2.7,.12,12.8,0,-.6,0,white,'Cabin floor','The cabin floor supports seating, aisles, passengers and equipment.');
box(inside,2.7,.09,12.8,0,1.05,0,white,'Cabin ceiling','Panels above the cabin conceal lighting, ventilation and other systems.');
for(let z=-4.7;z<=4.8;z+=.72){for(const x of [-.95,-.55,.55,.95]){box(inside,.32,.48,.4,x,-.25,z,seatMat,'Passenger seat','Passenger seating is arranged around a central aisle in this illustrative cabin.');}}
box(inside,2.3,.8,1.3,0,-.05,-5.75,dark,'Flight deck','Pilots operate the aircraft from the forward flight deck.');
box(inside,2.2,.65,1.4,0,-.23,5.7,gold,'Rear service area','A simplified representation of space used for onboard service and equipment.');
const shell=tube(inside,1.45,1.45,13,0,0,0,new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.12,side:THREE.DoubleSide}),'Cabin shell','The fuselage encloses a pressurized passenger cabin.');shell.material.depthWrite=false;
inside.visible=false;
function mode(interior){outside.visible=!interior;inside.visible=interior;info.textContent=interior?'Interior cutaway: hover over seats, flight deck, floor or ceiling.':'Exterior: hover over the fuselage, wings, engines and tail.';}
document.querySelector('#outside').onclick=()=>mode(false);document.querySelector('#inside').onclick=()=>mode(true);document.querySelector('#reset').onclick=()=>{camera.position.set(15,10,19);controls.target.set(0,0,0);controls.update()};
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();renderer.domElement.addEventListener('pointermove',e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets.filter(m=>m.parent?.visible),false)[0];info.textContent=hit?hit.object.userData.title+': '+hit.object.userData.description:(inside.visible?'Interior cutaway: hover over a part to learn more.':'Exterior: hover over a part to learn more.');renderer.domElement.style.cursor=hit?'help':'grab'});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
