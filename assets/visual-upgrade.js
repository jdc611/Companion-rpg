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
 if(!village.loaded&&!ready)return false;
 // Edge-free procedural ground: no shaded borders from the concept sheet.
 // Details are positioned in world coordinates and never draw tile outlines.
 const path=type==='p';
 ctx.fillStyle=path?'#a17b51':'#648d3c';
 ctx.fillRect(x,y,size,size);
 const gx=Math.round(x),gy=Math.round(y);
 for(let i=0;i<(path?44:65);i++){
  const rx=Math.floor(noise(gx+i*17,gy+i*29)*size);
  const ry=Math.floor(noise(gx+i*37,gy+i*13)*size);
  const n=noise(gx+i*7,gy+i*41);
  ctx.fillStyle=path?(n<.3?'#c6a178':n<.7?'#8e6d4b':'#b28b5c'):(n<.25?'#395f31':n<.6?'#7fa64b':'#9bb65b');
  ctx.fillRect(x+rx,y+ry,n>.8?2:1,n<.18?3:1);
 }
 if(path&&noise(gx+501,gy+73)>.79){
  const rx=Math.floor(noise(gx+9,gy+7)*24)+3,ry=Math.floor(noise(gx+4,gy+11)*24)+3;
  ctx.fillStyle='#d5b18a';ctx.fillRect(x+rx,y+ry,4,2);
  ctx.fillStyle='#705b47';ctx.fillRect(x+rx+1,y+ry+2,3,1);
 }
 return true;
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
window.LingsArt={draw,drawHero,drawBuilding,ground,trees,decor,get ready(){return ready},get enabled(){return enabled}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();load();
})();