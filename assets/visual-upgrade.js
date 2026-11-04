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
 function smooth(t){return t*t*(3-2*t)}
 function periodic(x,y,scale){
  const u=x/scale,v=y/scale,ix=Math.floor(u),iy=Math.floor(v),fx=smooth(u-ix),fy=smooth(v-iy),period=256/scale;
  const h=(a,b)=>noise(((a%period)+period)%period+900,((b%period)+period)%period+400);
  const a=h(ix,iy)*(1-fx)+h(ix+1,iy)*fx,b=h(ix,iy+1)*(1-fx)+h(ix+1,iy+1)*fx;
  return a*(1-fy)+b*fy;
 }
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const broad=periodic(x,y,64),mid=periodic(x,y,16),fine=noise(x+200,y+300);
  const v=(broad-.5)*37+(mid-.5)*29+(fine-.5)*20;
  const i=(y*256+x)*4;
  d[i]=Math.max(25,Math.min(160,79+v*.76));
  d[i+1]=Math.max(55,Math.min(180,116+v));
  d[i+2]=Math.max(18,Math.min(105,49+v*.47));
  d[i+3]=255;
 }
 g.putImageData(im,0,0);
 // Many tiny tapered blade clusters. Wrap every stroke across boundaries.
 for(let i=0;i<3900;i++){
  const x=Math.floor(noise(i+391,28)*256),y=Math.floor(noise(i+201,63)*256);
  const h=2+Math.floor(noise(i+109,82)*5),n=noise(i+42,51);
  const col=n<.25?'#315e30':n<.5?'#4d833b':n<.75?'#85a84c':'#b0bb65';
  for(const dx of [-256,0,256])for(const dy of [-256,0,256]){
   g.fillStyle='rgba(25,57,25,.26)';g.fillRect(x+dx+1,y+dy,5,2);
   g.fillStyle=col;g.fillRect(x+dx+2,y+dy-h,1,h);
   g.fillRect(x+dx+4,y+dy-h+2,1,Math.max(1,h-2));
   if(n>.53){g.fillStyle='#b6c774';g.fillRect(x+dx+2,y+dy-h,1,1)}
  }
 }
 grassTexture.canvas=c;
}
function ground(ctx,type,x,y,size){
 if(!enabled)return false;
 const path=type==='p',gx=Math.round(x),gy=Math.round(y);
 if(!path){
  // Directly use the grass-only crop from the user's uploaded art sheet.
  if(terrainArt.loaded&&terrainArt.grass.length){
   const tex=terrainArt.grass[0],sx=(gx%80+80)%80,sy=(gy%80+80)%80;
   for(let oy=0;oy<size;){const sh=Math.min(size-oy,80-((sy+oy)%80));
    for(let ox=0;ox<size;){const sw=Math.min(size-ox,80-((sx+ox)%80));
     ctx.drawImage(tex,(sx+ox)%80,(sy+oy)%80,sw,sh,x+ox,y+oy,sw,sh);ox+=sw;
    }oy+=sh;
   }
   return true;
  }
  if(!grassTexture.canvas)makeGrassTexture();
  ctx.drawImage(grassTexture.canvas,(gx%256+256)%256,(gy%256+256)%256,size,size,x,y,size,size);
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
window.LingsArt={draw,drawHero,drawBuilding,ground,terrainDepth,buildingBase,trees,decor,get ready(){return ready},get enabled(){return enabled}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();load();
})();