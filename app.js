import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const root = document.querySelector('#webgl');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 860px)').matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07101d, isMobile ? 0.037 : 0.027);

const camera = new THREE.PerspectiveCamera(isMobile ? 54 : 46, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, isMobile ? 5.6 : 5.1, isMobile ? 18.8 : 20.5);
camera.lookAt(0, 4.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.45 : 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !isMobile;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;
root.appendChild(renderer.domElement);

const world = new THREE.Group();
scene.add(world);

const mats = {
  marble: new THREE.MeshPhysicalMaterial({ color: 0x182237, metalness: .35, roughness: .18, clearcoat: 1, clearcoatRoughness: .1 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x20283a, roughness: .82 }),
  trim: new THREE.MeshStandardMaterial({ color: 0x7d542c, metalness: .62, roughness: .28, emissive: 0x1a0e05, emissiveIntensity: .25 }),
  black: new THREE.MeshStandardMaterial({ color: 0x080d15, metalness: .38, roughness: .35 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x111926, metalness: .2, roughness: .46 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xd7c8aa, roughness: .56 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc3202d, emissive: 0x240309, emissiveIntensity: .4, roughness: .32 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x2aa2d6, emissive: 0x0d4f8a, emissiveIntensity: .8, roughness: .24 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xdc3aa5, emissive: 0x8b0f64, emissiveIntensity: 1.1, roughness: .22 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xbce6ff, transparent: true, opacity: .14, transmission: .76, thickness: .18, roughness: .08, metalness: 0, side: THREE.DoubleSide, depthWrite: false }),
  screen: new THREE.MeshBasicMaterial({ color: 0x56bfff }),
};

const addBox = (parent, size, pos, mat, rot=[0,0,0], cast=true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); m.position.set(...pos); m.rotation.set(...rot); m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m;
};
const addCylinder = (parent, rt, rb, h, pos, mat, radial=48) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,radial),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
};

// Floor and distant architecture
addBox(world,[34,.3,38],[0,-.18,0],mats.marble,[0,0,0],false);
for(let i=-16;i<=16;i+=2){ const line=addBox(world,[.018,.012,38],[i,.005,0],new THREE.MeshBasicMaterial({color:0x4a5d74,transparent:true,opacity:.13}),[0,0,0],false); line.material.depthWrite=false; }
for(let z=-16;z<=16;z+=2){ const line=addBox(world,[34,.012,.018],[0,.008,z],new THREE.MeshBasicMaterial({color:0x4a5d74,transparent:true,opacity:.1}),[0,0,0],false);line.material.depthWrite=false; }

// Side museum walls, columns and arches
[-1,1].forEach(side=>{
  addBox(world,[6,10,30],[side*14,5,-1],mats.wall);
  for(let z=-10;z<=8;z+=6){
    addBox(world,[1.05,8.5,1.05],[side*10.5,4.25,z],mats.cream);
    addBox(world,[1.35,.35,1.35],[side*10.5,8.1,z],mats.trim);
    addCylinder(world,.22,.28,1.2,[side*10.5,8.7,z],mats.trim,20);
  }
  addBox(world,[.18,1.1,23],[side*9.45,7.0,-1],mats.trim);
  addBox(world,[.35,.23,23],[side*9.45,7.7,-1],mats.trim);
  addBox(world,[.35,.23,23],[side*9.45,6.35,-1],mats.trim);
});

// Rear portal/screen
const rear = new THREE.Group(); rear.position.set(0,3.9,-8.2); world.add(rear);
addBox(rear,[8.5,6.6,.45],[0,0,0],mats.trim);
addBox(rear,[7.65,5.85,.52],[0,0,.05],new THREE.MeshStandardMaterial({color:0x151c2d,roughness:.3}));
const screen = addBox(rear,[7.08,5.23,.12],[0,0,.38],new THREE.MeshBasicMaterial({color:0x6c4bba}));
const screenCanvas=document.createElement('canvas');screenCanvas.width=512;screenCanvas.height=384;const ctx=screenCanvas.getContext('2d');
const grd=ctx.createLinearGradient(0,0,0,384);grd.addColorStop(0,'#5a67d8');grd.addColorStop(.5,'#a35cce');grd.addColorStop(1,'#213a79');ctx.fillStyle=grd;ctx.fillRect(0,0,512,384);
ctx.fillStyle='#f2b16d';ctx.beginPath();ctx.arc(380,90,38,0,Math.PI*2);ctx.fill();ctx.fillStyle='#303b7e';ctx.beginPath();ctx.moveTo(0,320);ctx.lineTo(95,205);ctx.lineTo(165,284);ctx.lineTo(260,175);ctx.lineTo(360,295);ctx.lineTo(440,210);ctx.lineTo(512,310);ctx.lineTo(512,384);ctx.lineTo(0,384);ctx.fill();ctx.fillStyle='#86d5ff';ctx.font='700 28px DM Sans';ctx.fillText('PLAY',38,70);ctx.fillText('EXPLORE',38,106);ctx.fillText('PRESERVE',38,142);const tex=new THREE.CanvasTexture(screenCanvas);tex.colorSpace=THREE.SRGBColorSpace;screen.material.map=tex;screen.material.needsUpdate=true;

function pedestal(x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  addCylinder(g,2.15*scale,2.4*scale,.5,[0,.25,0],mats.black,64);
  addCylinder(g,2.28*scale,2.28*scale,.08,[0,.54,0],new THREE.MeshStandardMaterial({color:0xd49a45,emissive:0x5a2d08,emissiveIntensity:.45,metalness:.6,roughness:.25}),64);
  return g;
}
function glassCase(parent,w,h,d,y){
  const caseMesh=addBox(parent,[w,h,d],[0,y,0],mats.glass,[0,0,0],false);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(caseMesh.geometry),new THREE.LineBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.34}));edges.position.copy(caseMesh.position);parent.add(edges);return caseMesh;
}

const exhibits = new Map();
function register(name, group){ group.userData.exhibit=name; exhibits.set(name,group); }

// Center home console
const center=pedestal(0,2.2,1.18);register('console',center);
addCylinder(center,2.7,2.7,.12,[0,.66,0],new THREE.MeshStandardMaterial({color:0xe0ad5c,metalness:.72,roughness:.2}),64);
glassCase(center,5.0,3.25,3.5,2.3);
addBox(center,[3.25,.68,1.85],[.18,1.28,0],mats.cream);
addBox(center,[3.29,.12,1.89],[.18,1.62,0],mats.dark);
addBox(center,[.38,.12,.12],[-.95,1.7,.92],mats.red);
addBox(center,[1.1,.12,.12],[.55,1.7,.92],mats.black);
addBox(center,[1.95,.23,.72],[-1.35,1.02,1.05],mats.dark,[0,.05,0]);addCylinder(center,.13,.13,.08,[-1.72,1.18,1.35],mats.red,20);addCylinder(center,.13,.13,.08,[-1.4,1.18,1.35],mats.red,20);

// Handheld
const hh=pedestal(-7.4,2.8,.72);register('handhelds',hh);glassCase(hh,3,4.7,2.4,2.85);addBox(hh,[1.75,3,.52],[0,2.2,0],mats.cream);addBox(hh,[1.25,1.05,.08],[0,2.82,.28],mats.dark);addBox(hh,[1.02,.81,.04],[0,2.82,.34],mats.screen);addBox(hh,[.55,.16,.08],[-.43,1.72,.3],mats.dark);addBox(hh,[.16,.55,.08],[-.43,1.72,.3],mats.dark);addCylinder(hh,.13,.13,.08,[.43,1.82,.31],mats.red,20);addCylinder(hh,.13,.13,.08,[.68,1.6,.31],mats.red,20);

// Arcade
const arcade=pedestal(-4.25,.15,.75);register('arcade',arcade);glassCase(arcade,3.4,6.2,3,3.5);const cab=new THREE.Group();cab.position.y=.75;arcade.add(cab);addBox(cab,[2.2,4.4,1.75],[0,2.4,0],mats.black,[0,0,0]);addBox(cab,[2.24,.55,1.8],[0,4.65,0],mats.pink);addBox(cab,[1.6,1.15,.1],[0,3.15,.92],mats.screen,[0,0,0],false);addBox(cab,[1.9,.28,1.35],[0,2.25,.6],mats.dark,[-.18,0,0]);addCylinder(cab,.1,.1,.65,[-.45,2.65,1.05],mats.red,18);addCylinder(cab,.22,.22,.1,[-.45,2.99,1.05],mats.red,18);

// Joystick
const joy=pedestal(3.55,2.9,.6);register('controllers',joy);glassCase(joy,2.7,3.8,2.6,2.45);addBox(joy,[1.8,.35,1.35],[0,1.25,0],mats.black);addCylinder(joy,.09,.12,1.35,[0,2.02,0],mats.black,18);const ball=new THREE.Mesh(new THREE.SphereGeometry(.28,24,24),mats.red);ball.position.set(0,2.72,0);joy.add(ball);

// Game library
const lib=pedestal(6.4,.55,.7);register('library',lib);glassCase(lib,3.9,4.5,2.9,2.7);for(let i=-2;i<=2;i++){const c=addBox(lib,[.52,2.1,1],[i*.55,2.0,0],new THREE.MeshStandardMaterial({color:[0x342b2d,0x6b3930,0x33445d,0x70512d,0x2d5068][i+2],roughness:.5}));c.rotation.y=i*.045;addBox(lib,[.38,.5,.02],[i*.55,2.1,.515],new THREE.MeshBasicMaterial({color:[0xf6a56c,0x6ed2f4,0xf1d066,0xeb6b7c,0xb6e26d][i+2]}),[0,i*.045,0],false)}

// CRT
const crt=pedestal(9.1,3.25,.72);register('display',crt);glassCase(crt,3.6,4.9,3.1,2.95);addBox(crt,[2.6,2.55,1.65],[0,2.15,0],mats.dark);addBox(crt,[2.05,1.62,.06],[0,2.28,.85],mats.screen,[0,0,0],false);addBox(crt,[2.8,.24,1.8],[0,.9,0],mats.black);

addCylinder(center,3.16,3.16,.035,[0,.74,0],new THREE.MeshBasicMaterial({color:0xf1b85b}),80);
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.15,.045,12,80),new THREE.MeshBasicMaterial({color:0xffcf77}));ring.rotation.x=Math.PI/2;ring.position.set(0,.79,0);center.add(ring);

// Lights
scene.add(new THREE.HemisphereLight(0x5b86bf,0x2f1c0e,1.55));
const key=new THREE.DirectionalLight(0xffd394,3.2);key.position.set(-5,14,8);key.castShadow=!isMobile;key.shadow.mapSize.set(1024,1024);scene.add(key);
const cool=new THREE.PointLight(0x2f8fe9,52,34,1.8);cool.position.set(0,5,-7);scene.add(cool);
const warm1=new THREE.PointLight(0xffa83e,58,26,1.9);warm1.position.set(-9,5,4);scene.add(warm1);
const warm2=new THREE.PointLight(0xffa83e,58,26,1.9);warm2.position.set(9,5,4);scene.add(warm2);
const heroLight=new THREE.PointLight(0xffd390,62,22,1.8);heroLight.position.set(0,7,6);scene.add(heroLight);

// Dust particles
const count=isMobile?260:620;const dustGeo=new THREE.BufferGeometry();const dustPos=new Float32Array(count*3);for(let i=0;i<count;i++){dustPos[i*3]=(Math.random()-.5)*30;dustPos[i*3+1]=Math.random()*11;dustPos[i*3+2]=(Math.random()-.5)*25}dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffd99a,size:.026,transparent:true,opacity:.47,depthWrite:false}));scene.add(dust);

let pointer={x:0,y:0}, targetCamera={x:0,y:0};
addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=(e.clientY/innerHeight-.5)*2;targetCamera.x=pointer.x*(isMobile?.15:.62);targetCamera.y=-pointer.y*(isMobile?.08:.32)});

const raycaster=new THREE.Raycaster();const mouse=new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(world.children,true);let o=hits[0]?.object;while(o&&!o.userData.exhibit)o=o.parent;if(o?.userData.exhibit)openExhibit(o.userData.exhibit)});

const exhibitCopy={
  handhelds:['Handhelds','Big adventures. Small screens. Portable systems turned everyday moments into pocket-sized worlds.'],
  arcade:['Arcade Machines','Where legends were born. Neon cabinets, score chases and the social energy of one more coin.'],
  console:['Home Consoles','The heart of home gaming. A centerpiece celebrating the machines that brought play into the living room.'],
  controllers:['Controllers','Feel the connection. From joysticks to modern pads, input devices made digital worlds tactile.'],
  library:['Game Library','Stories in every cartridge. Physical media became shelves of memory, art and adventure.'],
  display:['Iconic Displays','A window to other worlds. CRT glow and early display technology shaped the visual language of games.']
};
const dialog=document.querySelector('#exhibitDialog');const dialogTitle=document.querySelector('#dialogTitle');const dialogBody=document.querySelector('#dialogBody');
function focusExhibit(name){const g=exhibits.get(name);if(!g)return;const p=new THREE.Vector3();g.getWorldPosition(p);focusTarget.copy(p);focusTarget.y=2.3;focusTarget.z+=.3;focusStrength=1;setTimeout(()=>focusStrength=0,900)}
function openExhibit(name){const copy=exhibitCopy[name];if(!copy)return;dialogTitle.textContent=copy[0];dialogBody.textContent=copy[1];focusExhibit(name);dialog.showModal()}
document.querySelectorAll('[data-exhibit]').forEach(btn=>btn.addEventListener('click',()=>openExhibit(btn.dataset.exhibit)));
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>dialog.close()));

document.querySelector('#exploreBtn').addEventListener('click',()=>{focusExhibit('console');document.querySelector('.home-console').focus({preventScroll:true})});
document.querySelector('#learnMoreBtn').addEventListener('click',()=>document.querySelector('#exhibits').scrollIntoView({behavior:reducedMotion?'auto':'smooth'}));

const trailer=document.querySelector('#trailerDialog');document.querySelector('#trailerBtn').addEventListener('click',()=>trailer.showModal());document.querySelectorAll('[data-close-trailer]').forEach(b=>b.addEventListener('click',()=>trailer.close()));

const visit=document.querySelector('#visitDialog');document.querySelector('#visitBtn').addEventListener('click',()=>visit.showModal());document.querySelectorAll('[data-close-visit]').forEach(b=>b.addEventListener('click',()=>visit.close()));document.querySelectorAll('[data-visit]').forEach(b=>b.addEventListener('click',()=>{visit.close();openExhibit(b.dataset.visit)}));

const search=document.querySelector('#searchDialog'),input=document.querySelector('#museumSearch'),results=document.querySelector('#searchResults');document.querySelector('#searchBtn').addEventListener('click',()=>{search.showModal();setTimeout(()=>input.focus(),80)});document.querySelectorAll('[data-close-search]').forEach(b=>b.addEventListener('click',()=>search.close()));
input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();results.innerHTML='';if(!q)return;Object.entries(exhibitCopy).filter(([,v])=>v.join(' ').toLowerCase().includes(q)).forEach(([key,v])=>{const b=document.createElement('button');b.textContent=`${v[0]} — ${v[1].split('.')[0]}.`;b.addEventListener('click',()=>{search.close();openExhibit(key)});results.appendChild(b)});if(!results.children.length)results.innerHTML='<small>No matching exhibit yet.</small>'});

const audioBtn=document.querySelector('#audioToggle');let ac,osc1,osc2,gain;
audioBtn.addEventListener('click',async()=>{const on=audioBtn.getAttribute('aria-pressed')==='true';if(!ac){ac=new AudioContext();gain=ac.createGain();gain.gain.value=.018;gain.connect(ac.destination);osc1=ac.createOscillator();osc2=ac.createOscillator();osc1.type='sine';osc2.type='triangle';osc1.frequency.value=82;osc2.frequency.value=123;osc1.connect(gain);osc2.connect(gain);osc1.start();osc2.start()}if(ac.state==='suspended')await ac.resume();gain.gain.setTargetAtTime(on?0:.018,ac.currentTime,.15);audioBtn.setAttribute('aria-pressed',String(!on));audioBtn.textContent=on?'♫':'♬'});

const navLinks=[...document.querySelectorAll('.nav-pill a')];const sections=['home','exhibits','consoles','games','timeline','about'].map(id=>document.getElementById(id)).filter(Boolean);const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-35% 0px -55%',threshold:.01});sections.forEach(s=>io.observe(s));

const clock=new THREE.Clock();let focusStrength=0;const focusTarget=new THREE.Vector3(0,2.8,0);const baseCam=new THREE.Vector3().copy(camera.position);
function animate(){const t=clock.getElapsedTime();dust.rotation.y=t*.012; if(!reducedMotion){ring.material.opacity=.68+.25*Math.sin(t*2.2);ring.material.transparent=true;center.position.y=Math.sin(t*.72)*.03;arcade.position.y=Math.sin(t*.62+1)*.02;hh.position.y=Math.sin(t*.55+2)*.025;lib.position.y=Math.sin(t*.66+3)*.02;}
  const scrollY=window.scrollY;const heroFade=Math.max(0,1-scrollY/(innerHeight*.75));world.visible=heroFade>.03;
  if(world.visible){const desired=baseCam.clone();desired.x+=targetCamera.x*heroFade;desired.y+=targetCamera.y*heroFade;desired.z-=Math.min(scrollY/innerHeight,1)*3.5; if(focusStrength>0){const fp=focusTarget.clone();desired.x=THREE.MathUtils.lerp(desired.x,fp.x*.18,focusStrength*.75);desired.y=THREE.MathUtils.lerp(desired.y,5.0,focusStrength*.45);desired.z=THREE.MathUtils.lerp(desired.z,16.2,focusStrength*.7)} camera.position.lerp(desired,reducedMotion?.18:.045);camera.lookAt(0,4.1-scrollY/innerHeight*.6,-.6);renderer.render(scene,camera)} requestAnimationFrame(animate)}animate();

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width:860px)').matches?1.45:1.8))}addEventListener('resize',resize);

document.addEventListener('keydown',e=>{if(e.key==='Escape'){[dialog,trailer,visit,search].forEach(d=>d.open&&d.close())}if(e.key.toLowerCase()==='m'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))audioBtn.click()});
