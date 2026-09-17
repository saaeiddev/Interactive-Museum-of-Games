import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const root = document.querySelector('#webgl');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 860px)').matches;
const lowPower = isMobile || ((navigator.deviceMemory || 8) <= 4);
const maxDpr = lowPower ? 1.35 : 1.75;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07101d, isMobile ? 0.037 : 0.024);

const camera = new THREE.PerspectiveCamera(isMobile ? 54 : 46, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, isMobile ? 5.6 : 5.1, isMobile ? 18.8 : 20.5);
camera.lookAt(0, 4.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !lowPower;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.setClearColor(0x050911, 0);
root.appendChild(renderer.domElement);

const world = new THREE.Group();
scene.add(world);

function makeMicroTexture(size=96, base=190, variance=24, repeatX=8, repeatY=8){
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const c=canvas.getContext('2d');const image=c.createImageData(size,size);
  for(let i=0;i<image.data.length;i+=4){
    const grain=Math.max(0,Math.min(255,base+(Math.random()-.5)*variance));
    image.data[i]=grain;image.data[i+1]=grain;image.data[i+2]=grain;image.data[i+3]=255;
  }
  c.putImageData(image,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeatX,repeatY);
  texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  return texture;
}

const floorMicro=makeMicroTexture(96,188,20,10,12);
const wallMicro=makeMicroTexture(96,218,14,7,7);
const metalMicro=makeMicroTexture(64,205,18,12,3);

const mats = {
  marble: new THREE.MeshPhysicalMaterial({ color: 0x171f2a, metalness: .16, roughness: .64, roughnessMap: floorMicro, bumpMap: floorMicro, bumpScale: .014, clearcoat: .42, clearcoatRoughness: .28 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x111820, metalness: .08, roughness: .74, roughnessMap: floorMicro, bumpMap: floorMicro, bumpScale: .009 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x202733, roughness: .94, roughnessMap: wallMicro, bumpMap: wallMicro, bumpScale: .012 }),
  acoustic: new THREE.MeshStandardMaterial({ color: 0x141b25, roughness: .98, roughnessMap: wallMicro, bumpMap: wallMicro, bumpScale: .018 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x090d14, roughness: .88 }),
  trim: new THREE.MeshStandardMaterial({ color: 0x785332, metalness: .7, roughness: .38, roughnessMap: metalMicro, emissive: 0x120a04, emissiveIntensity: .12 }),
  brushed: new THREE.MeshStandardMaterial({ color: 0x6f7882, metalness: .82, roughness: .34, roughnessMap: metalMicro }),
  black: new THREE.MeshStandardMaterial({ color: 0x090d13, metalness: .3, roughness: .44, roughnessMap: metalMicro }),
  dark: new THREE.MeshStandardMaterial({ color: 0x121a24, metalness: .16, roughness: .5 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xc9c2b1, roughness: .64, roughnessMap: wallMicro }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x17191c, metalness: .02, roughness: .86, roughnessMap: wallMicro }),
  red: new THREE.MeshStandardMaterial({ color: 0xb61e2b, emissive: 0x160205, emissiveIntensity: .18, roughness: .42 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x318fbd, emissive: 0x082c46, emissiveIntensity: .34, roughness: .3 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xb92f8b, emissive: 0x3b082b, emissiveIntensity: .4, roughness: .3 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xe0f4ff, transparent: true, opacity: lowPower ? .12 : .2, transmission: lowPower ? .62 : .9, thickness: .28, ior: 1.45, roughness: .075, metalness: 0, side: THREE.DoubleSide, depthWrite: false }),
  screenGlass: new THREE.MeshPhysicalMaterial({ color: 0xb9dcff, transparent: true, opacity: .18, transmission: lowPower ? .25 : .56, thickness: .08, roughness: .12, clearcoat: .72, clearcoatRoughness: .12, depthWrite: false }),
  screen: new THREE.MeshStandardMaterial({ color: 0x6bb8e8, emissive: 0x1e76aa, emissiveIntensity: .52, roughness: .18, metalness: .02 }),
};

const addBox = (parent, size, pos, mat, rot=[0,0,0], cast=true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); m.position.set(...pos); m.rotation.set(...rot); m.castShadow=cast&&!lowPower; m.receiveShadow=true; parent.add(m); return m;
};
const addCylinder = (parent, rt, rb, h, pos, mat, radial=48) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,radial),mat);m.position.set(...pos);m.castShadow=!lowPower;m.receiveShadow=true;parent.add(m);return m;
};
const addSphere = (parent,r,pos,mat,segments=20) => {
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,segments,Math.max(10,Math.floor(segments*.7))),mat);m.position.set(...pos);m.castShadow=!lowPower;m.receiveShadow=true;parent.add(m);return m;
};
const addContactShadow=(parent,radius=.9,y=.012,opacity=.2)=>{
  const m=new THREE.Mesh(new THREE.CircleGeometry(radius,40),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:lowPower?opacity*.7:opacity,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.y=y;m.renderOrder=1;parent.add(m);return m;
};
const addCable=(parent,points,radius=.026)=>{
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,22,radius,8,false),mats.rubber);mesh.castShadow=!lowPower;parent.add(mesh);return mesh;
};

// Floor and architectural shell — existing layout retained, geometry refined.
addBox(world,[34,.3,38],[0,-.18,0],mats.marble,[0,0,0],false);
addBox(world,[15.8,.035,37],[0,-.008,0],mats.stone,[0,0,0],false);
addBox(world,[.12,.045,37],[-8.05,.006,0],mats.trim,[0,0,0],false);
addBox(world,[.12,.045,37],[8.05,.006,0],mats.trim,[0,0,0],false);
for(let i=-16;i<=16;i+=2){ const line=addBox(world,[.014,.012,38],[i,.014,0],new THREE.MeshBasicMaterial({color:0x708095,transparent:true,opacity:.08}),[0,0,0],false); line.material.depthWrite=false; }
for(let z=-16;z<=16;z+=2){ const line=addBox(world,[34,.012,.014],[0,.016,z],new THREE.MeshBasicMaterial({color:0x708095,transparent:true,opacity:.065}),[0,0,0],false);line.material.depthWrite=false; }

// Side museum walls, columns, recessed panels and realistic trim.
[-1,1].forEach(side=>{
  addBox(world,[6,10,30],[side*14,5,-1],mats.wall);
  addBox(world,[.22,.34,30],[side*10.88,.17,-1],mats.trim);
  for(let z=-10;z<=8;z+=6){
    addBox(world,[1.05,8.5,1.05],[side*10.5,4.25,z],mats.cream);
    addBox(world,[1.35,.35,1.35],[side*10.5,8.1,z],mats.trim);
    addCylinder(world,.22,.28,1.2,[side*10.5,8.7,z],mats.trim,20);
  }
  [-7,-1,5].forEach(z=>{
    addBox(world,[.18,3.55,3.9],[side*10.94,4.15,z],mats.acoustic);
    addBox(world,[.21,.09,4.02],[side*10.82,5.95,z],mats.brushed);
    addBox(world,[.21,.09,4.02],[side*10.82,2.34,z],mats.brushed);
  });
  addBox(world,[.18,1.1,23],[side*9.45,7.0,-1],mats.trim);
  addBox(world,[.35,.23,23],[side*9.45,7.7,-1],mats.trim);
  addBox(world,[.35,.23,23],[side*9.45,6.35,-1],mats.trim);
});

// Ceiling, track lighting and restrained service details.
addBox(world,[22,.22,30],[0,10.18,-1],mats.ceiling,[0,0,0],false);
[-5.1,5.1].forEach(x=>addBox(world,[.09,.09,24],[x,9.78,-1],mats.black,[0,0,0],false));
[-8,-2,4,10].forEach(z=>{
  addBox(world,[20,.18,.32],[0,9.93,z],mats.dark,[0,0,0],false);
  [-5.1,5.1].forEach(x=>addCylinder(world,.12,.16,.28,[x,9.58,z],mats.black,16));
});
[-7.2,7.2].forEach(x=>[-5.5,4.5].forEach(z=>{
  const vent=addBox(world,[2.25,.035,.72],[x,10.04,z],mats.brushed,[0,0,0],false);vent.material=vent.material;
  for(let n=-4;n<=4;n++)addBox(world,[.035,.018,.58],[x+n*.22,10.066,z],mats.black,[0,0,0],false);
}));

// Rear portal/screen with a layered frame and real screen-glass surface.
const rear = new THREE.Group(); rear.position.set(0,3.9,-8.2); world.add(rear);
addBox(rear,[8.75,6.85,.5],[0,0,0],mats.trim);
addBox(rear,[8.28,6.38,.55],[0,0,.045],mats.brushed);
addBox(rear,[7.72,5.92,.58],[0,0,.08],new THREE.MeshStandardMaterial({color:0x111722,roughness:.42,metalness:.18}));
const screen = addBox(rear,[7.08,5.23,.12],[0,0,.39],new THREE.MeshStandardMaterial({color:0x6c4bba,roughness:.28,emissive:0x1b103f,emissiveIntensity:.24}),[0,0,0],false);
const screenCanvas=document.createElement('canvas');screenCanvas.width=512;screenCanvas.height=384;const ctx=screenCanvas.getContext('2d');
const grd=ctx.createLinearGradient(0,0,0,384);grd.addColorStop(0,'#5a67d8');grd.addColorStop(.5,'#a35cce');grd.addColorStop(1,'#213a79');ctx.fillStyle=grd;ctx.fillRect(0,0,512,384);
ctx.fillStyle='#f2b16d';ctx.beginPath();ctx.arc(380,90,38,0,Math.PI*2);ctx.fill();ctx.fillStyle='#303b7e';ctx.beginPath();ctx.moveTo(0,320);ctx.lineTo(95,205);ctx.lineTo(165,284);ctx.lineTo(260,175);ctx.lineTo(360,295);ctx.lineTo(440,210);ctx.lineTo(512,310);ctx.lineTo(512,384);ctx.lineTo(0,384);ctx.fill();ctx.fillStyle='#86d5ff';ctx.font='700 28px DM Sans';ctx.fillText('PLAY',38,70);ctx.fillText('EXPLORE',38,106);ctx.fillText('PRESERVE',38,142);const tex=new THREE.CanvasTexture(screenCanvas);tex.colorSpace=THREE.SRGBColorSpace;screen.material.map=tex;screen.material.needsUpdate=true;
addBox(rear,[7.12,5.27,.035],[0,0,.47],mats.screenGlass,[0,0,0],false);

function pedestal(x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  addContactShadow(g,2.58*scale,.018,.27);
  addCylinder(g,2.24*scale,2.46*scale,.18,[0,.09,0],mats.rubber,64);
  addCylinder(g,2.15*scale,2.4*scale,.42,[0,.36,0],mats.black,64);
  addCylinder(g,2.22*scale,2.22*scale,.07,[0,.59,0],mats.brushed,64);
  addCylinder(g,2.28*scale,2.28*scale,.055,[0,.65,0],new THREE.MeshStandardMaterial({color:0xb88443,emissive:0x221005,emissiveIntensity:.18,metalness:.72,roughness:.33}),64);
  return g;
}
function glassCase(parent,w,h,d,y){
  const caseMesh=addBox(parent,[w,h,d],[0,y,0],mats.glass,[0,0,0],false);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(caseMesh.geometry),new THREE.LineBasicMaterial({color:0xd9f2ff,transparent:true,opacity:lowPower?.17:.25,depthWrite:false}));edges.position.copy(caseMesh.position);parent.add(edges);
  const bottom=y-h/2, top=y+h/2, t=.045;
  addBox(parent,[w+.12,.055,d+.12],[0,bottom,0],mats.brushed,[0,0,0],false);
  if(!lowPower){
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz])=>addBox(parent,[t,h,t],[sx*(w/2+.01),y,sz*(d/2+.01)],mats.brushed,[0,0,0],false));
    addBox(parent,[w+.08,.035,d+.08],[0,top,0],mats.brushed,[0,0,0],false);
  }
  return caseMesh;
}

const exhibits = new Map();
function register(name, group){ group.userData.exhibit=name; exhibits.set(name,group); }

// Center home console — same exhibit and interactions, higher physical detail.
const center=pedestal(0,2.2,1.18);register('console',center);
addCylinder(center,2.7,2.7,.12,[0,.72,0],new THREE.MeshStandardMaterial({color:0xb58a50,metalness:.76,roughness:.31,roughnessMap:metalMicro}),64);
glassCase(center,5.0,3.25,3.5,2.36);
addBox(center,[3.25,.68,1.85],[.18,1.34,0],mats.cream);
addBox(center,[3.29,.12,1.89],[.18,1.68,0],mats.dark);
addBox(center,[2.82,.17,.07],[.18,1.26,.96],mats.dark);
addBox(center,[.38,.12,.12],[-.95,1.76,.92],mats.red);
addBox(center,[1.1,.12,.12],[.55,1.76,.92],mats.black);
for(let i=-4;i<=4;i++)addBox(center,[.055,.035,.34],[i*.27+.18,1.73,-.82],mats.black,[0,0,0],false);
addSphere(center,.045,[1.35,1.48,.94],new THREE.MeshStandardMaterial({color:0x78d9a5,emissive:0x2b8a5c,emissiveIntensity:1.2,roughness:.35}),14);
addBox(center,[1.95,.23,.72],[-1.35,1.08,1.05],mats.dark,[0,.05,0]);
addCylinder(center,.13,.13,.08,[-1.72,1.24,1.35],mats.red,20);addCylinder(center,.13,.13,.08,[-1.4,1.24,1.35],mats.red,20);
addCable(center,[[-.56,1.1,.78],[-.25,1.07,.8],[.05,1.12,.55],[.14,1.28,.8]],.022);

// Handheld — screen glass, shell seam, speaker and port detail.
const hh=pedestal(-7.4,2.8,.72);register('handhelds',hh);glassCase(hh,3,4.7,2.4,2.91);
addBox(hh,[1.75,3,.52],[0,2.26,0],mats.cream);addBox(hh,[1.79,.045,.55],[0,2.26,.01],mats.brushed,[0,0,0],false);
addBox(hh,[1.25,1.05,.08],[0,2.88,.28],mats.dark);addBox(hh,[1.02,.81,.04],[0,2.88,.34],mats.screen,[0,0,0],false);addBox(hh,[1.05,.84,.025],[0,2.88,.39],mats.screenGlass,[0,0,0],false);
addBox(hh,[.55,.16,.08],[-.43,1.78,.3],mats.dark);addBox(hh,[.16,.55,.08],[-.43,1.78,.3],mats.dark);addCylinder(hh,.13,.13,.08,[.43,1.88,.31],mats.red,20);addCylinder(hh,.13,.13,.08,[.68,1.66,.31],mats.red,20);
for(let i=0;i<5;i++)addSphere(hh,.027,[.26+i*.12,1.42,.305],mats.black,10);
addBox(hh,[.46,.055,.04],[0,3.69,.29],mats.black,[0,0,0],false);

// Arcade cabinet — denser cabinet construction without changing exhibit behavior.
const arcade=pedestal(-4.25,.15,.75);register('arcade',arcade);glassCase(arcade,3.4,6.2,3,3.56);const cab=new THREE.Group();cab.position.y=.81;arcade.add(cab);
addBox(cab,[2.2,4.4,1.75],[0,2.4,0],mats.black,[0,0,0]);
addBox(cab,[2.24,.55,1.8],[0,4.65,0],mats.pink);addBox(cab,[1.72,1.27,.12],[0,3.15,.9],mats.dark,[0,0,0],false);addBox(cab,[1.6,1.15,.055],[0,3.15,.97],mats.screen,[0,0,0],false);addBox(cab,[1.63,1.18,.025],[0,3.15,1.015],mats.screenGlass,[0,0,0],false);
addBox(cab,[1.9,.28,1.35],[0,2.25,.6],mats.dark,[-.18,0,0]);addCylinder(cab,.1,.1,.65,[-.45,2.65,1.05],mats.red,18);addCylinder(cab,.22,.22,.1,[-.45,2.99,1.05],mats.red,18);
[-.02,.28,.58].forEach(x=>addCylinder(cab,.085,.085,.07,[x,2.62,1.13],x<.2?mats.blue:mats.red,16));
addBox(cab,[.82,.72,.08],[0,1.18,.91],mats.dark,[0,0,0],false);addBox(cab,[.34,.2,.035],[0,1.32,.96],mats.brushed,[0,0,0],false);addBox(cab,[.22,.07,.035],[0,.99,.96],mats.black,[0,0,0],false);
addBox(cab,[.18,.1,1.62],[-1.12,2.42,0],mats.brushed,[0,0,0],false);addBox(cab,[.18,.1,1.62],[1.12,2.42,0],mats.brushed,[0,0,0],false);

// Joystick — rubber feet, button and cable detail.
const joy=pedestal(3.55,2.9,.6);register('controllers',joy);glassCase(joy,2.7,3.8,2.6,2.51);
addBox(joy,[1.8,.35,1.35],[0,1.31,0],mats.black);addBox(joy,[1.86,.05,1.41],[0,1.49,0],mats.brushed,[0,0,0],false);
addCylinder(joy,.09,.12,1.35,[0,2.08,0],mats.black,18);const ball=addSphere(joy,.28,[0,2.78,0],mats.red,24);
addCylinder(joy,.115,.115,.075,[.55,1.58,.22],mats.red,18);addCylinder(joy,.115,.115,.075,[.82,1.58,.1],mats.blue,18);
addCable(joy,[[.8,1.28,-.5],[1.02,1.18,-.7],[1.2,1.02,-.56],[1.26,.9,-.18]],.02);

// Game library — physical cases with thickness, edge strips and varied roughness.
const lib=pedestal(6.4,.55,.7);register('library',lib);glassCase(lib,3.9,4.5,2.9,2.76);
const caseColors=[0x342b2d,0x6b3930,0x33445d,0x70512d,0x2d5068];const artColors=[0xf6a56c,0x6ed2f4,0xf1d066,0xeb6b7c,0xb6e26d];
for(let i=-2;i<=2;i++){
  const caseMat=new THREE.MeshStandardMaterial({color:caseColors[i+2],roughness:.5,metalness:.04});
  const c=addBox(lib,[.52,2.1,1],[i*.55,2.06,0],caseMat);c.rotation.y=i*.045;
  addBox(lib,[.38,.5,.025],[i*.55,2.16,.515],new THREE.MeshStandardMaterial({color:artColors[i+2],roughness:.38,clearcoat:.18}),[0,i*.045,0],false);
  addBox(lib,[.055,2.02,.035],[i*.55-.225,2.06,.5],mats.brushed,[0,i*.045,0],false);
  addBox(lib,[.4,.045,1.02],[i*.55,3.07,0],mats.brushed,[0,i*.045,0],false);
}

// CRT — layered bezel, screen glass, controls and ventilation.
const crt=pedestal(9.1,3.25,.72);register('display',crt);glassCase(crt,3.6,4.9,3.1,3.01);
addBox(crt,[2.6,2.55,1.65],[0,2.21,0],mats.dark);addBox(crt,[2.28,1.86,.12],[0,2.31,.83],mats.black,[0,0,0],false);addBox(crt,[2.05,1.62,.045],[0,2.31,.9],mats.screen,[0,0,0],false);addBox(crt,[2.08,1.65,.02],[0,2.31,.94],mats.screenGlass,[0,0,0],false);addBox(crt,[2.8,.24,1.8],[0,.96,0],mats.black);
[-.48,-.22,.04].forEach(x=>addCylinder(crt,.06,.06,.055,[x,1.38,.86],mats.brushed,14));
for(let i=-4;i<=4;i++)addBox(crt,[.1,.035,.42],[i*.2,3.46,-.55],mats.black,[0,0,0],false);

addCylinder(center,3.16,3.16,.035,[0,.8,0],new THREE.MeshBasicMaterial({color:0xc99955,transparent:true,opacity:.72}),80);
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.15,.045,12,80),new THREE.MeshBasicMaterial({color:0xecc071,transparent:true,opacity:.72}));ring.rotation.x=Math.PI/2;ring.position.set(0,.85,0);center.add(ring);

// Small secondary museum details: benches and wayfinding forms, kept outside interaction/data logic.
function addBench(x,z,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;world.add(g);addContactShadow(g,1.45,.015,.14);
  addBox(g,[2.5,.22,.72],[0,.74,0],new THREE.MeshStandardMaterial({color:0x30241d,roughness:.58,metalness:.05}),[0,0,0]);
  [-.9,.9].forEach(px=>{addBox(g,[.11,.68,.5],[px,.36,0],mats.brushed);});
}
addBench(-7.2,-5.3,.12);addBench(7.4,-4.6,-.16);

// Lighting — exhibition-focused and restrained, with physically believable falloff.
scene.add(new THREE.HemisphereLight(0x6a88ab,0x24170f,.92));
const key=new THREE.DirectionalLight(0xffd7a3,2.55);key.position.set(-5,14,8);key.castShadow=!lowPower;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.00035;key.shadow.normalBias=.035;key.shadow.camera.left=-16;key.shadow.camera.right=16;key.shadow.camera.top=14;key.shadow.camera.bottom=-8;scene.add(key);
const cool=new THREE.PointLight(0x3b86d2,34,32,2);cool.position.set(0,5,-7);scene.add(cool);
const warm1=new THREE.PointLight(0xffae55,38,23,2);warm1.position.set(-9,5,4);scene.add(warm1);
const warm2=new THREE.PointLight(0xffae55,38,23,2);warm2.position.set(9,5,4);scene.add(warm2);
const heroLight=new THREE.PointLight(0xffd7a0,42,20,2);heroLight.position.set(0,7,6);scene.add(heroLight);

function addMuseumSpot(x,z,tx,tz,intensity=165,color=0xffe1b0){
  if(lowPower)return;
  const light=new THREE.SpotLight(color,intensity,18,THREE.MathUtils.degToRad(24),.58,2);light.position.set(x,9.45,z);light.castShadow=false;
  const target=new THREE.Object3D();target.position.set(tx,1.2,tz);scene.add(target);light.target=target;scene.add(light);
}
addMuseumSpot(-5.1,-2,-4.25,.15,155,0xffd6a0);
addMuseumSpot(-5.1,4,-7.4,2.8,145,0xffe2bd);
addMuseumSpot(5.1,-2,6.4,.55,150,0xd5e8ff);
addMuseumSpot(5.1,4,3.55,2.9,145,0xffdeb0);
addMuseumSpot(0,-8,0,-5.8,190,0xd9e9ff);

// Atmospheric particles kept subtle so the room reads as a real museum, not a nightclub.
const count=lowPower?110:280;const dustGeo=new THREE.BufferGeometry();const dustPos=new Float32Array(count*3);for(let i=0;i<count;i++){dustPos[i*3]=(Math.random()-.5)*30;dustPos[i*3+1]=Math.random()*10;dustPos[i*3+2]=(Math.random()-.5)*25}dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffe5b5,size:.018,transparent:true,opacity:.2,depthWrite:false}));scene.add(dust);

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
function animate(){const t=clock.getElapsedTime();dust.rotation.y=t*.009; if(!reducedMotion){ring.material.opacity=.62+.08*Math.sin(t*1.8);mats.screen.emissiveIntensity=.5+.035*Math.sin(t*1.25);center.position.y=Math.sin(t*.72)*.03;arcade.position.y=Math.sin(t*.62+1)*.02;hh.position.y=Math.sin(t*.55+2)*.025;lib.position.y=Math.sin(t*.66+3)*.02;}
  const scrollY=window.scrollY;const heroFade=Math.max(0,1-scrollY/(innerHeight*.75));world.visible=heroFade>.03;
  if(world.visible){const desired=baseCam.clone();desired.x+=targetCamera.x*heroFade;desired.y+=targetCamera.y*heroFade;desired.z-=Math.min(scrollY/innerHeight,1)*3.5; if(focusStrength>0){const fp=focusTarget.clone();desired.x=THREE.MathUtils.lerp(desired.x,fp.x*.18,focusStrength*.75);desired.y=THREE.MathUtils.lerp(desired.y,5.0,focusStrength*.45);desired.z=THREE.MathUtils.lerp(desired.z,16.2,focusStrength*.7)} camera.position.lerp(desired,reducedMotion?.18:.045);camera.lookAt(0,4.1-scrollY/innerHeight*.6,-.6);renderer.render(scene,camera)} requestAnimationFrame(animate)}animate();

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);const mobileNow=matchMedia('(max-width:860px)').matches;const lowPowerNow=mobileNow||((navigator.deviceMemory||8)<=4);renderer.setPixelRatio(Math.min(devicePixelRatio,lowPowerNow?1.35:1.75))}addEventListener('resize',resize);

document.addEventListener('keydown',e=>{if(e.key==='Escape'){[dialog,trailer,visit,search].forEach(d=>d.open&&d.close())}if(e.key.toLowerCase()==='m'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))audioBtn.click()});
