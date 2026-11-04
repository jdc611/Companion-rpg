/* Experimental art integration: derives crops from the user-approved reference board.
   All crops are temporary until true transparent production assets are available. */
(()=>{'use strict';
const pieces={tree:[405,129,113,128],autumn:[527,130,110,125],pine:[760,131,88,124],bush:[403,270,91,65],rock:[674,266,95,65],flower:[597,391,73,77],crate:[546,505,54,62],grass:[18,139,69,69],dirt:[239,139,69,69]};
const sprites={};const hero={};const village={};const seamless={};let ready=false,enabled=true;
const KEY='lings-art-preview-enabled';
try{enabled=localStorage.getItem(KEY)!=='false'}catch{}
function crop(img,box,transparent){const [sx,sy,w,h]=box,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,sx,sy,w,h,0,0,w,h);
if(transparent){const data=g.getImageData(0,0,w,h),a=data.data;for(let i=0;i<a.length;i+=4){const r=a[i],gr=a[i+1],b=a[i+2],mx=Math.max(r,gr,b);if(mx<38){a[i+3]=0}else if(mx<68&&Math.abs(r-gr)<21&&Math.abs(gr-b)<22){a[i+3]=Math.min(a[i+3],Math.round((mx-38)/30*255))}}g.putImageData(data,0,0)}
return c}
async function load(){try{const res=await fetch('lings-art-preview.html',{cache:'force-cache'});if(!res.ok)throw Error('preview unavailable');const html=await res.text();const match=html.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);if(!match)throw Error('embedded image missing');const img=new Image();img.onload=()=>{for(const [k,box] of Object.entries(pieces))sprites[k]=crop(img,box,!['grass','dirt'].includes(k));for(const [dir,row] of Object.entries({down:0,right:1,up:2,left:3})){hero[dir]=[];for(let frame=0;frame<4;frame++){hero[dir].push(crop(img,[95+frame*53,750+row*58,47,57],true))}}ready=true;update()};img.src='data:image/jpeg;base64,'+match[1]}catch(e){console.warn('Lings concept-art overlay unavailable:',e)}}
function loadVillage(){const img=new Image();img.onload=()=>{
 const terrain={grassA:[15,140,64,64],grassB:[83,140,64,64],grassC:[150,140,64,64],grassD:[218,140,64,64],dirtA:[284,140,64,64],dirtB:[217,211,64,64],dirtEdge:[83,211,64,64],stone:[350,211,64,64],road:[350,283,64,64]};
 for(const [k,b] of Object.entries(terrain))village[k]=crop(img,b,false);
 // Mirror the central texture in a 2x2 block so opposite edges match exactly.
 for(const [name,source] of Object.entries({grass:village.grassA,dirt:village.dirtA})){
  const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');
  for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){g.save();g.translate(xx*32+(xx?32:0),yy*32+(yy?32:0));g.scale(xx?-1:1,yy?-1:1);g.drawImage(source,16,16,32,32,0,0,32,32);g.restore()}
  seamless[name]=c;
 }
 const structures={
 'Your Home':{damaged:[531,150,155,98],mid:[691,149,158,100],done:[857,148,169,102]},
 'Willowmere Hall':{damaged:[531,255,155,102],mid:[692,253,160,106],done:[857,251,169,109]},
 'The Workshop':{damaged:[531,365,155,99],mid:[692,363,160,105],done:[857,361,169,108]},
 'The Inn':{damaged:[531,469,155,104],mid:[692,466,160,110],done:[857,464,169,112]}
 };
 for(const [name,stages] of Object.entries(structures))for(const [stage,b] of Object.entries(stages))village[name+':'+stage]=crop(img,b,true);
 village.loaded=true;update();
 };img.onerror=()=>console.warn('West Village pack could not load');img.src='assets/west_village_asset_pack_v1.png';}
loadVillage();
// Production terrain preview sourced from the newly uploaded West Village art sheet.
// Use mirrored central samples to remove the original sheet's tile frames and seams.
const terrainArt={loaded:false};
function loadTerrainArt(){
 const img=new Image();
 img.onload=()=>{
  const make=(sx,sy)=>{
   const c=document.createElement('canvas');c.width=80;c.height=80;
   const g=c.getContext('2d');g.imageSmoothingEnabled=false;
   // Four mirrored quadrants: all outer edges and internal joins match.
   for(let row=0;row<2;row++)for(let col=0;col<2;col++){
    g.save();g.translate(col*40+(col?40:0),row*40+(row?40:0));
    g.scale(col?-1:1,row?-1:1);
    g.drawImage(img,sx+12,sy+12,40,40,0,0,40,40);g.restore();
   }
   return c;
  };
  terrainArt.grass=[make(1081,35)]; // Grass-only third tile from uploaded asset sheet, no flower/fence tiles.
  terrainArt.dirt=[make(924,111),make(1003,111),make(1081,111)];
  terrainArt.loaded=true;
 };
 img.onerror=()=>console.warn('West Village terrain reference missing');
 img.src='assets/a_detailed_top_down_pixel_art_game_scene_and_asset.png';
}
loadTerrainArt(); // Dirt only; grass uses a clean generated illustrated texture.

// Sprite-sheet crops from the user's committed environment atlas.
// Each crop is independently keyed against the dark atlas backing; no full sheet tiles.
const atlasProps={};
function loadPropAtlas(){
 const img=new Image();
 img.onload=()=>{
  const defs={
   fence:[22,386,143,75],
   sign:[402,383,69,87],
   lantern:[941,388,69,90],
   crate:[1195,384,71,80],
   barrel:[1458,387,66,79]
  };
  for(const [name,rect] of Object.entries(defs)){
   const [sx,sy,w,h]=rect,c=document.createElement('canvas');c.width=w;c.height=h;
   const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,sx,sy,w,h,0,0,w,h);
   const pixels=g.getImageData(0,0,w,h),d=pixels.data;
   // Remove the dark charcoal sheet background with a soft color key.
   for(let i=0;i<d.length;i+=4){
    const r=d[i],gr=d[i+1],b=d[i+2],max=Math.max(r,gr,b),min=Math.min(r,gr,b);
    if(max<52 || (max<104&&max-min<25&&b>=r*.72)){
     d[i+3]=max<48?0:Math.round(Math.max(0,Math.min(255,(max-48)*4)));
    }
   }
   g.putImageData(pixels,0,0);atlasProps[name]=c;
  }
 };
 img.onerror=()=>console.warn('Ground prop atlas not available');
 img.src='assets/AE22465E-0004-479B-AFF5-E55BC0395AD0.png';
}
loadPropAtlas();
// Bridge and villagers from the user's second committed atlas.
const worldAtlas={bridge:null,npcs:{}};
function loadWorldAtlas(){
 const im=new Image();
 im.onload=()=>{
  function crop(sx,sy,w,h){
   const c=document.createElement('canvas');c.width=w;c.height=h;
   const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,sx,sy,w,h,0,0,w,h);
   const a=g.getImageData(0,0,w,h),d=a.data;
   for(let k=0;k<d.length;k+=4){
    const r=d[k],v=d[k+1],b=d[k+2],hi=Math.max(r,v,b),lo=Math.min(r,v,b);
    if(hi<48||(hi<85&&hi-lo<18)){d[k+3]=hi<44?0:Math.round((hi-44)*6)}
   }
   g.putImageData(a,0,0);return c;
  }
  // First wooden bridge and individual 32px-style villagers; avoid text labels.
  worldAtlas.bridge=crop(29,55,337,107);
  // The atlas bridge has its own painted blue/teal water backdrop.
  // Remove that backdrop so the same animated river tiles show through everywhere.
  {
   const c=worldAtlas.bridge,g=c.getContext('2d',{willReadFrequently:true});
   const img=g.getImageData(0,0,c.width,c.height),d=img.data;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
    const k=(y*c.width+x)*4,r=d[k],gr=d[k+1],b=d[k+2];
    // Water is blue/cyan. Timber is warm brown/orange, so preserve it.
    const blue= b>r*1.13 && gr>r*1.10 && b>45;
    const cyan=gr>r*1.35 && b>r*1.23 && b>42;
    if(blue||cyan)d[k+3]=0;
   }
   g.putImageData(img,0,0);
  }
  const rows={villager:78,merchant:204,blacksmith:269,healer:335,guard:466,ranger:530};
  for(const [role,cy] of Object.entries(rows)){
   worldAtlas.npcs[role]=[];
   for(const cx of [849,907,962,1017]){
    worldAtlas.npcs[role].push(crop(cx-19,cy-22,39,46));
   }
  }
 };
 im.onerror=()=>console.warn('Bridge and NPC atlas missing');
 im.src='assets/FEB28115-BEED-43F9-B68F-06D9BB9024DA.png';
}
loadWorldAtlas();
function bridge(ctx,x,y,w,h){
 if(!enabled||!worldAtlas.bridge)return false;
 ctx.drawImage(worldAtlas.bridge,Math.round(x),Math.round(y-7),w,h+14);return true;
}
function npc(ctx,role,x,y,face='down',walking=false,clock=0){
 if(!enabled||!worldAtlas.npcs[role])return false;
 const frames=worldAtlas.npcs[role],dir={down:0,left:1,right:2,up:3}[face]??0;
 const bob=walking?Math.round(Math.abs(Math.sin(clock*.02))*2):0;
 ctx.drawImage(frames[dir],Math.round(x)-3,Math.round(y)-12-bob,39,46);return true;
}
function prop(ctx,kind,x,y,clock=0){
 if(!enabled)return false;
 if(atlasProps[kind]){
  const sprite=atlasProps[kind],width=kind==='fence'?44:kind==='sign'?32:kind==='lantern'?30:kind==='crate'?30:28;
  const height=kind==='fence'?32:kind==='sign'?40:kind==='lantern'?42:32;
  ctx.drawImage(sprite,Math.round(x+(32-width)/2),Math.round(y+32-height),width,height);
  return true;
 }
 const p=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+a),Math.round(y+b),w,h)};
 const shadow=()=>{ctx.fillStyle='rgba(23,39,26,.28)';ctx.beginPath();ctx.ellipse(x+16,y+29,14,3,0,0,Math.PI*2);ctx.fill()};
 shadow();
 if(kind==='fence'){
  for(const xx of [2,25]){p(xx+1,7,7,23,'#4d392c');p(xx,5,7,23,'#98734b');p(xx+1,5,4,3,'#d6b57d');p(xx+5,9,1,17,'#614731')}
  for(const yy of [12,22]){p(0,yy+2,32,5,'#503b2e');p(0,yy,32,5,'#a78256');p(1,yy,29,1,'#e0bc80');p(5,yy+4,23,1,'#624a34')}
  p(10,24,2,5,'#5a8545');p(11,23,1,4,'#8cab59');
 }else if(kind==='lantern'){
  p(13,10,5,20,'#493b30');p(14,9,3,20,'#96764c');
  p(13,9,14,3,'#9d7850');p(23,10,4,4,'#5e4635');
  p(23,13,2,7,'#43372d');p(19,19,10,3,'#382e2b');p(20,15,8,7,'#b57738');
  p(21,16,6,5,Math.sin(clock/260)>.1?'#ffe49a':'#f8c776');
  p(23,14,2,10,'#42372f');p(19,13,10,2,'#514037');p(21,11,6,3,'#ac8557');
  ctx.fillStyle='rgba(255,190,90,.09)';ctx.beginPath();ctx.arc(x+24,y+19,15,0,Math.PI*2);ctx.fill();
 }else if(kind==='sign'){
  p(13,9,6,21,'#513c2d');p(14,7,4,23,'#9e754a');p(15,8,1,20,'#d0a16a');
  p(1,6,30,13,'#4d3b2c');p(2,4,27,13,'#aa8151');p(4,5,23,2,'#e2bd7c');
  p(5,14,20,1,'#61492f');p(6,8,3,3,'#60472f');p(24,8,2,3,'#60472f');
  p(9,9,13,2,'#5d4730');p(12,12,9,2,'#5d4730');
  p(11,27,11,3,'#4b5036');
 }else if(kind==='crate'){
  p(5,13,24,17,'#47392e');p(6,11,22,17,'#9b734b');p(8,13,18,12,'#b98c56');
  p(9,14,3,11,'#705034');p(22,14,3,11,'#705034');p(8,18,18,3,'#6d5036');
  p(10,14,13,2,'#d7ad72');p(10,25,13,2,'#5b4534');
 }else if(kind==='barrel'){
  p(9,10,16,19,'#493a30');p(11,9,13,20,'#91683e');p(13,10,9,18,'#b48650');
  p(9,13,16,3,'#454c4c');p(9,24,16,3,'#454c4c');p(11,8,13,3,'#c09a61');
  p(14,16,2,8,'#d5a66b');
 }else return false;
 return true;
}
function drawBuilding(ctx,b,TILE,state){
 // Source concept crops include incompatible baked-in ground and hard rectangular edges.
 // Disable these building crops until clean transparent silhouettes are supplied.
 // Fall back to the original aligned building renderer in index.html.
 return false;
}
function draw(ctx,key,x,y,w,h){if(!enabled||!ready||!sprites[key])return false;ctx.drawImage(sprites[key],x,y,w,h);return true}
function drawHero(ctx,x,y,face,walking,clock){if(!enabled||!ready)return false;const frames=hero[face]||hero.down;if(!frames?.length)return false;const frame=walking?Math.floor(clock/155)%frames.length:0;ctx.drawImage(frames[frame],Math.round(x)-3,Math.round(y)-22,40,53);return true}
const grassTexture={canvas:null};
function makeGrassTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=256;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const im=g.createImageData(256,256),d=im.data;
 const fade=t=>t*t*(3-2*t);
 function field(x,y,scale){
  const u=x/scale,v=y/scale,ix=Math.floor(u),iy=Math.floor(v),fx=fade(u-ix),fy=fade(v-iy),period=256/scale;
  const h=(a,b)=>noise(((a%period)+period)%period+1601,((b%period)+period)%period+1703);
  return (h(ix,iy)*(1-fx)+h(ix+1,iy)*fx)*(1-fy)+(h(ix,iy+1)*(1-fx)+h(ix+1,iy+1)*fx)*fy;
 }
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const broad=field(x,y,64),mid=field(x,y,16),fine=noise(x+2011,y+2081);
  const n=(broad-.5)*44+(mid-.5)*27+(fine-.5)*14;
  const i=(y*256+x)*4;
  d[i]=Math.round(Math.max(28,Math.min(135,72+n*.7)));
  d[i+1]=Math.round(Math.max(60,Math.min(175,115+n)));
  d[i+2]=Math.round(Math.max(18,Math.min(105,44+n*.48)));
  d[i+3]=255;
 }
 g.putImageData(im,0,0);
 // World-periodic but never mirror-reflected; tiny blades, not symmetric rosettes.
 for(let i=0;i<5900;i++){
  const x=Math.floor(noise(i+1201,151)*256),y=Math.floor(noise(i+1811,159)*256);
  const n=noise(i+1921,169),h=2+Math.floor(noise(i+2101,179)*4);
  const shade=n<.22?'#2d5a2e':n<.5?'#427a35':n<.8?'#80a84b':'#a7bd65';
  for(const dx of [-256,0,256])for(const dy of [-256,0,256]){
   g.fillStyle='rgba(24,55,22,.19)';g.fillRect(x+dx,y+dy,3,1);
   g.fillStyle=shade;g.fillRect(x+dx+1,y+dy-h,1,h);
   if(n>.45)g.fillRect(x+dx+3,y+dy-h+2,1,Math.max(1,h-2));
  }
 }
 grassTexture.canvas=c;
}
function ground(ctx,type,x,y,size){
 if(!enabled)return false;
 const path=type==='p',gx=Math.round(x),gy=Math.round(y);
 if(!path){
  if(!grassTexture.canvas)makeGrassTexture();
  const tex=grassTexture.canvas,sx=(gx%256+256)%256,sy=(gy%256+256)%256;
  for(let oy=0;oy<size;){const sh=Math.min(size-oy,256-((sy+oy)%256));
   for(let ox=0;ox<size;){const sw=Math.min(size-ox,256-((sx+ox)%256));
    ctx.drawImage(tex,(sx+ox)%256,(sy+oy)%256,sw,sh,x+ox,y+oy,sw,sh);ox+=sw;
   }oy+=sh;
  }
  return true;
 }
 // Keep the detailed illustrated dirt road, without using its floral grass crop.
 if(terrainArt.loaded&&terrainArt.dirt.length){
  const tex=terrainArt.dirt[0],sx=(gx%80+80)%80,sy=(gy%80+80)%80;
  for(let oy=0;oy<size;){const sh=Math.min(size-oy,80-((sy+oy)%80));
   for(let ox=0;ox<size;){const sw=Math.min(size-ox,80-((sx+ox)%80));
    ctx.drawImage(tex,(sx+ox)%80,(sy+oy)%80,sw,sh,x+ox,y+oy,sw,sh);ox+=sw;
   }oy+=sh;
  }return true;
 }
 ctx.fillStyle='#a68761';ctx.fillRect(x,y,size,size);
 return true;
}
function terrainDepth(ctx,map,TILE,x0,y0,x1,y1){
 if(!enabled)return;
 ctx.save();
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const t=map[y]?.[x],path=t==='p',grass=t==='g'||t==='f'||t==='m';
  if(!path&&!grass)continue;
  const px=x*TILE,py=y*TILE;
  // Irregular, low-contrast patches: no per-tile stroke or rectangular outlines.
  if(noise(Math.floor(x/3)+81,Math.floor(y/3)+19)>.42){
   const n=noise(x+18,y+47);
   ctx.fillStyle=path?'rgba(83,57,40,.10)':'rgba(30,67,29,.13)';
   ctx.beginPath();ctx.ellipse(px+8+n*18,py+9+n*13,12+n*7,5+n*4,n,0,Math.PI*2);ctx.fill();
  }
  if(grass&&noise(x+31,y+92)>.63){
   const ox=px+4+Math.floor(noise(x+5,y+11)*20),oy=py+8+Math.floor(noise(x+17,y+13)*16);
   ctx.fillStyle='#3d7039';for(let k=0;k<3;k++){ctx.fillRect(ox+k*3,oy-k%2*2,2,5);ctx.fillRect(ox+k*3-1,oy+4,3,1)}
   ctx.fillStyle='#a1b86d';ctx.fillRect(ox+4,oy-3,2,3);
  }
  if(path){
   // Edge vegetation intrudes into dirt only where neighboring map cells are grassy.
   const sides=[[-1,0,0],[1,0,1],[0,-1,2],[0,1,3]];
   for(const [dx,dy,side] of sides){
    const other=map[y+dy]?.[x+dx];if(!['g','f','m'].includes(other))continue;
    ctx.fillStyle='#648d3c';ctx.beginPath();
    if(side===0){ctx.moveTo(px,py);for(let j=0;j<=32;j+=4)ctx.lineTo(px+2+noise(x*31+j,y*17)*6,py+j);ctx.lineTo(px,py+32)}
    if(side===1){ctx.moveTo(px+32,py);for(let j=0;j<=32;j+=4)ctx.lineTo(px+30-noise(x*17+j,y*29)*6,py+j);ctx.lineTo(px+32,py+32)}
    if(side===2){ctx.moveTo(px,py);for(let j=0;j<=32;j+=4)ctx.lineTo(px+j,py+2+noise(x*19+j,y*37)*6);ctx.lineTo(px+32,py)}
    if(side===3){ctx.moveTo(px,py+32);for(let j=0;j<=32;j+=4)ctx.lineTo(px+j,py+30-noise(x*23+j,y*11)*6);ctx.lineTo(px+32,py+32)}
    ctx.closePath();ctx.fill();
   }
  }
 }
 ctx.restore();
}
function buildingBase(ctx,b,TILE){
 if(!enabled)return;
 const x=b.x*TILE,y=b.y*TILE,w=b.w*TILE,h=b.h*TILE;
 ctx.fillStyle='rgba(24,35,26,.25)';
 ctx.beginPath();ctx.ellipse(x+w/2,y+h+5,w*.55,12,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#796d55';ctx.fillRect(x+7,y+h-9,w-14,10);
 ctx.fillStyle='#a89a75';ctx.fillRect(x+9,y+h-9,w-18,3);
 const door=(b.x+Math.floor(b.w/2))*TILE+15;
 ctx.fillStyle='#95856b';ctx.fillRect(door-17,y+h+1,34,9);
 ctx.fillStyle='#b4a083';ctx.fillRect(door-14,y+h+1,28,3);
}
function noise(x,y){let n=Math.imul(x+129,374761393)+Math.imul(y+71,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295}
function trees(ctx,map,TILE,x0,y0,x1,y1){
 if(!enabled||!ready)return;
 // Sparse, irregular canopy clusters rather than a repeating diagonal grid.
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  if(map[y]?.[x]!=='t'||noise(x,y)>.13)continue;
  if(noise(x-1,y)<.13||noise(x,y-1)<.13)continue;
  const r=noise(x+311,y+79),key=r<.16?'autumn':r<.37?'pine':'tree';
  const dx=Math.round((noise(x+4,y+2)-.5)*19),dy=Math.round((noise(x+7,y+5)-.5)*12);
  const scale=.85+noise(x+13,y+17)*.3;
  draw(ctx,key,x*TILE-27+dx,y*TILE-65+dy,Math.round(88*scale),Math.round(100*scale));
 }
}
function decor(ctx,items,TILE){
 if(!enabled||!ready)return false;
 for(const d of items){
  // Avoid cluttered overlaps: only draw one in roughly every three generated decorations.
  if(noise(d.x+103,d.y+43)>.35)continue;
  const key=d.type==='bush'?'bush':'flower';
  const offsetX=Math.round((noise(d.x+5,d.y+9)-.5)*12);
  const offsetY=Math.round((noise(d.x+11,d.y+3)-.5)*10);
  const size=key==='bush'?34:28;
  draw(ctx,key,d.x*TILE+offsetX,d.y*TILE+offsetY-9,size,size);
 }
 return true;
}
function update(){let b=document.getElementById('art-toggle');if(b)b.textContent=enabled?'Art: NEW':'Art: ORIGINAL'}
function setup(){const bar=document.querySelector('.top');if(!bar)return;const b=document.createElement('button');b.id='art-toggle';b.className='reset';b.style.marginLeft='auto';b.textContent='Art: loading';b.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem(KEY,String(enabled))}catch{}update()});bar.insertBefore(b,document.getElementById('reset'));update()}
window.LingsArt={draw,drawHero,drawBuilding,prop,bridge,npc,ground,terrainDepth,buildingBase,trees,decor,get ready(){return ready},get enabled(){return enabled}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();load();
})();