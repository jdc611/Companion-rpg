/* Experimental art integration: derives crops from the user-approved reference board.
   All crops are temporary until true transparent production assets are available. */
(()=>{'use strict';
const pieces={tree:[405,129,113,128],autumn:[527,130,110,125],pine:[760,131,88,124],bush:[403,270,91,65],rock:[674,266,95,65],flower:[597,391,73,77],crate:[546,505,54,62],grass:[18,139,69,69],dirt:[239,139,69,69]};
const sprites={};const hero={};let ready=false,enabled=true;
const KEY='lings-art-preview-enabled';
try{enabled=localStorage.getItem(KEY)!=='false'}catch{}
function crop(img,box,transparent){const [sx,sy,w,h]=box,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,sx,sy,w,h,0,0,w,h);
if(transparent){const data=g.getImageData(0,0,w,h),a=data.data;for(let i=0;i<a.length;i+=4){const r=a[i],gr=a[i+1],b=a[i+2],mx=Math.max(r,gr,b);if(mx<38){a[i+3]=0}else if(mx<68&&Math.abs(r-gr)<21&&Math.abs(gr-b)<22){a[i+3]=Math.min(a[i+3],Math.round((mx-38)/30*255))}}g.putImageData(data,0,0)}
return c}
async function load(){try{const res=await fetch('lings-art-preview.html',{cache:'force-cache'});if(!res.ok)throw Error('preview unavailable');const html=await res.text();const match=html.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);if(!match)throw Error('embedded image missing');const img=new Image();img.onload=()=>{for(const [k,box] of Object.entries(pieces))sprites[k]=crop(img,box,!['grass','dirt'].includes(k));for(const [dir,row] of Object.entries({down:0,right:1,up:2,left:3})){hero[dir]=[];for(let frame=0;frame<4;frame++){hero[dir].push(crop(img,[95+frame*53,750+row*58,47,57],true))}}ready=true;update()};img.src='data:image/jpeg;base64,'+match[1]}catch(e){console.warn('Lings concept-art overlay unavailable:',e)}}
function draw(ctx,key,x,y,w,h){if(!enabled||!ready||!sprites[key])return false;ctx.drawImage(sprites[key],x,y,w,h);return true}
function drawHero(ctx,x,y,face,walking,clock){if(!enabled||!ready)return false;const frames=hero[face]||hero.down;if(!frames?.length)return false;const frame=walking?Math.floor(clock/155)%frames.length:0;ctx.drawImage(frames[frame],Math.round(x)-3,Math.round(y)-22,40,53);return true}
function ground(ctx,type,x,y,size){if(!enabled||!ready)return false;const key=type==='p'?'dirt':type==='g'?'grass':null;if(!key)return false;ctx.drawImage(sprites[key],x,y,size,size);return true}
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
window.LingsArt={draw,drawHero,ground,trees,decor,get ready(){return ready},get enabled(){return enabled}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();load();
})();