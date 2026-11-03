/* Lings settlement progression v0.1: isolated, persistent, no external dependencies. */
(()=>{'use strict';
const KEY='lings-settlement-v1';
const defaults={scrap:0,timber:0,flags:{},built:{},quests:{}};
let state;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');state={...defaults,...saved,flags:{...defaults.flags,...saved?.flags},built:{...defaults.built,...saved?.built},quests:{...defaults.quests,...saved?.quests}}}catch{state=structuredClone(defaults)}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const stages=[
{id:'notice',name:'A Place Worth Saving',desc:'Speak to Elder Rowan and learn what Willowmere needs.',done:()=>!!state.flags.metRowan},
{id:'salvage',name:'What the Ruins Left Behind',desc:'Recover 3 scrap from the abandoned vehicle and 2 timber from the eastern road.',done:()=>!!state.flags.vehicle&&!!state.flags.sign},
{id:'workshop',name:'Light the Workshop',desc:'Bring supplies to Tobin and restore the workshop (3 scrap, 2 timber).',done:()=>!!state.built.workshop},
{id:'beacon',name:'A Light for Travelers',desc:'Help Mira repair the roadside beacon (2 scrap, 1 timber).',done:()=>!!state.built.beacon}
];
function active(){return stages.find(q=>!q.done())||null}
function completed(){return stages.filter(q=>q.done()).length}
function panel(){let p=document.getElementById('lings-quest-panel');if(p)return p;
p=document.createElement('section');p.id='lings-quest-panel';p.style.cssText='margin-top:12px;padding:12px;border:2px solid #6f887b;border-radius:12px;background:#203436;color:#f2e9d6;font:14px system-ui;line-height:1.5';
const dialog=document.getElementById('dialog');dialog.insertAdjacentElement('afterend',p);return p}
function render(){const p=panel(),q=active(),n=completed();p.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong>Willowmere · Rebuilding</strong><span>'+n+'/'+stages.length+' milestones</span></div><div style="margin:6px 0;color:#d9cda9">Scrap: '+state.scrap+' · Timber: '+state.timber+'</div><div><strong>'+(q?q.name:'First repairs complete')+'</strong> — '+(q?q.desc:'The settlement has a working workshop and a repaired beacon. More rebuilding will follow.')+'</div><div style="margin-top:8px;background:#3d514e;height:7px;border-radius:8px;overflow:hidden"><div style="background:#c5a76c;width:'+(n/stages.length*100)+'%;height:100%"></div></div>'}
function message(title,body){render();return {title,body}}
function collect(type,count,label,flag){if(state.flags[flag])return message(label,'You already salvaged what was usable here.');state.flags[flag]=true;state[type]+=count;save();return message(label,'Recovered '+count+' '+type+'. Supplies: '+state.scrap+' scrap, '+state.timber+' timber.')}
function repair(id,cost,who,desc){if(state.built[id])return message(who,desc+' The repairs are holding.');if(state.scrap<cost.scrap||state.timber<cost.timber)return message(who,'We need '+cost.scrap+' scrap and '+cost.timber+' timber. You currently have '+state.scrap+' scrap and '+state.timber+' timber.');state.scrap-=cost.scrap;state.timber-=cost.timber;state.built[id]=true;save();return message(who,'Repairs completed! '+desc)}
function interact(name){
switch(name){
case 'Elder Rowan':if(!state.flags.metRowan){state.flags.metRowan=true;save();return message('Elder Rowan','The Shattering left us isolated. If we can repair the workshop and guide travelers home, this place might grow again. Search the eastern road for supplies.')}return message('Elder Rowan',state.built.workshop?'You have given this settlement its first real chance. Keep rebuilding.':'Tobin can rebuild the workshop, but we need scrap and timber from the eastern road.');
case 'Tobin':return repair('workshop',{scrap:3,timber:2},'Tobin','The workshop is operational again. We can repair tools and shelter for new arrivals.');
case 'Mira':return repair('beacon',{scrap:2,timber:1},'Mira','The beacon shines again. Travelers will be able to find the settlement after dark.');
case 'Abandoned Vehicle':return collect('scrap',3,'Abandoned Vehicle','vehicle');
case 'Collapsed Transit Entrance':return collect('scrap',2,'Collapsed Transit Entrance','transit');
case 'Old Highway Sign':return collect('timber',2,'Old Highway Sign','sign');
case 'Ruins Sign':return collect('timber',1,'Ruins Sign','ruinsSign');
case 'Notice Board':{const q=active();return message('Notice Board',q?q.name+': '+q.desc:'The first rebuilding notices have been completed.')}
case 'Lantern':return message('Roadside Beacon',state.built.beacon?'A steady light guides travelers toward Willowmere.':'Mira wants to repair this beacon. Speak to her when you have 2 scrap and 1 timber.');
default:return null;
}}
function building(name){if(name==='The Workshop')return message(name,state.built.workshop?'The repaired workshop is humming with activity.':'The roof leaks and the workbenches are broken. Speak with Tobin to restore it.');return null}
function decorations(ctx,tile){if(state.built.beacon){const x=30*tile,y=23*tile;ctx.fillStyle='#f3ce75';ctx.fillRect(x+9,y-18,15,6);ctx.fillStyle='#ffe9a0';ctx.fillRect(x+13,y-14,7,17)}if(state.built.workshop){const x=24*tile,y=15*tile;ctx.fillStyle='#d7bd78';ctx.fillRect(x+30,y+63,14,12);ctx.fillStyle='#91b5a4';ctx.fillRect(x+33,y+66,8,6)}}
window.LingsRebuild={interact,building,decorations,render,getState:()=>JSON.parse(JSON.stringify(state))};
document.addEventListener('DOMContentLoaded',render);
})();