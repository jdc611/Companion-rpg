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
  terrainArt.grass=[]; // Illustrated sheet contains decorative flowers, not clean repeatable grass.
  terrainArt.dirt=[make(924,111),make(1003,111),make(1081,111)];
  terrainArt.loaded=true;
 };
 img.onerror=()=>console.warn('West Village terrain reference missing');
 img.src='assets/a_detailed_top_down_pixel_art_game_scene_and_asset.png';
}
loadTerrainArt();

function drawBuilding(ctx,b,TILE,state){
 // Source concept crops include incompatible baked-in ground and hard rectangular edges.
 // Disable these building crops until clean transparent silhouettes are supplied.
 // Fall back to the original aligned building renderer in index.html.
 return false;
}
function draw(ctx,key,x,y,w,h){if(!enabled||!ready||!sprites[key])return false;ctx.drawImage(sprites[key],x,y,w,h);return true}
function drawHero(ctx,x,y,face,walking,clock){if(!enabled||!ready)return false;const frames=hero[face]||hero.down;if(!frames?.length)return false;const frame=walking?Math.floor(clock/155)%frames.length:0;ctx.drawImage(frames[frame],Math.round(x)-3,Math.round(y)-22,40,53);return true}
function ground(ctx,type,x,y,size){
 if(!enabled)return false;
 const path=type==='p',gx=Math.round(x),gy=Math.round(y);
 if(terrainArt.loaded&&path){
  const variants=path?terrainArt.dirt:terrainArt.grass;
  const pick=0; // One continuous texture; no abrupt biome patch seams.
  const tex=variants[Math.min(pick,variants.length-1)];
  // World-aligned sampling keeps the texture stationary during camera movement.
  const sx=(gx%80+80)%80,sy=(gy%80+80)%80;
  for(let oy=0;oy<size;){const sh=Math.min(size-oy,80-((sy+oy)%80));
   for(let ox=0;ox<size;){const sw=Math.min(size-ox,80-((sx+ox)%80));
    ctx.drawImage(tex,(sx+ox)%80,(sy+oy)%80,sw,sh,x+ox,y+oy,sw,sh);
    ox+=sw;
   }oy+=sh;
  }
  return true;
 }
 ctx.fillStyle=path?'#a68761':'#648d3c';ctx.fillRect(x,y,size,size);
 // Dense hand-shaped micro-clumps; no per-tile borders or hard outlines.
 for(let i=0;i<(path?35:36);i++){
  const rx=Math.floor(noise(gx+i*17,gy+i*29)*size),ry=Math.floor(noise(gx+i*37,gy+i*13)*size);
  const n=noise(gx+i*7,gy+i*41);
  if(path){
   ctx.fillStyle=n<.34?'#8c7153':n<.7?'#c0a17a':'#725e49';
   ctx.fillRect(x+rx,y+ry,n>.8?3:2,1);
   if(n>.88){ctx.fillStyle='#d7c09b';ctx.fillRect(x+rx,y+ry-1,2,1)}
  }else{
   const h=2+Math.floor(noise(gx+i*23,gy+i*47)*5);
   ctx.fillStyle=n<.28?'#315d32':n<.62?'#477a3c':'#83a94e';
   ctx.fillRect(x+rx,y+ry-h,1,h);
   ctx.fillRect(x+rx+2,y+ry-h+2,1,Math.max(2,h-2));
   ctx.fillStyle=n>.65?'#a1b86b':'#5c913e';
   ctx.fillRect(x+rx+1,y+ry-h-1,1,2);
  }
 }
 if(path){
  // Light travel wear and gravel: varied by world position, not tile borders.
  const wear=noise(Math.floor(gx/96)+17,Math.floor(gy/96)+33);
  if(wear>.43){ctx.fillStyle='rgba(74,54,37,.13)';for(let j=0;j<2;j++){
   const rx=7+j*15+Math.floor(noise(gx+j,gy+9)*4);
   ctx.fillRect(x+rx,y+Math.floor(noise(gx+23,gy+j)*10),2,9);
  }}
  if(noise(gx+501,gy+73)>.72){const rx=4+Math.floor(noise(gx+9,gy+7)*24),ry=4+Math.floor(noise(gx+4,gy+11)*24);
   ctx.fillStyle='#e0cba6';ctx.fillRect(x+rx,y+ry,4,2);ctx.fillStyle='#766047';ctx.fillRect(x+rx+1,y+ry+2,3,1)}
 }
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