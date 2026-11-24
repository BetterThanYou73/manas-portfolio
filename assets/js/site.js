/* manasjoshi.site · Vice OS 86. Content lives in MISSIONS, JOBS and KIT below. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const deskMQ=matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
let isDesk=deskMQ.matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function fit(c){const r=c.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,2);c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return [x,r.width,r.height];}
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};}
// mottled grey slab from the classic menu: two octaves of value noise, thresholded, half resolution
function camoPaint(c){if(!c)return;const r=c.getBoundingClientRect();const Wd=Math.max(2,Math.round(r.width/2)),Hd=Math.max(2,Math.round(r.height/2));
  c.width=Wd;c.height=Hd;const x=c.getContext('2d');const rand=rng(23);
  function layer(cell,alpha){const n=document.createElement('canvas');n.width=Math.ceil(Wd/cell)+2;n.height=Math.ceil(Hd/cell)+2;const nx=n.getContext('2d');const d=nx.createImageData(n.width,n.height);
    for(let i=0;i<d.data.length;i+=4){const v=rand()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}
    nx.putImageData(d,0,0);x.globalAlpha=alpha;x.imageSmoothingEnabled=true;x.drawImage(n,-cell,-cell,n.width*cell,n.height*cell);}
  layer(13,1);layer(5,.45);x.globalAlpha=1;const img=x.getImageData(0,0,Wd,Hd),p=img.data;
  for(let i=0;i<p.length;i+=4){const on=p[i]>134;p[i]=on?121:88;p[i+1]=on?115:82;p[i+2]=on?129:96;p[i+3]=255;}x.putImageData(img,0,0);}
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};

/* ================= system sounds (all synthesized, no audio files) ================= */
const Sfx=(()=>{
  let ac=null,out=null,enabled=store.get('mj-sfx','1')==='1';
  function ctx(){if(!ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ac=new AC();out=ac.createGain();out.gain.value=.5;out.connect(ac.destination);}return ac;}
  const live=()=>enabled&&ac&&ac.state==='running';
  function unlocked(){const c=ctx();if(!c)return Promise.resolve(false);if(c.state==='running')return Promise.resolve(true);
    return Promise.race([c.resume().then(()=>c.state==='running').catch(()=>false),new Promise(r=>setTimeout(()=>r(false),250))]);}
  function unlock(){const c=ctx();if(!c)return Promise.resolve();return c.state==='running'?Promise.resolve():c.resume().catch(()=>{});}
  function noise(d){const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*d),ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;const s=ac.createBufferSource();s.buffer=b;return s;}
  function tone(type,f,t,peak,a,dec,dest){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);o.connect(g);g.connect(dest||out);o.start(t);o.stop(t+a+dec+.05);return o;}
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  function logo(){if(!live())return;const t=ac.currentTime+.02,h=t+.5;
    const n=noise(.55),bp=ac.createBiquadFilter(),g=ac.createGain();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(250,t);bp.frequency.exponentialRampToValueAtTime(5000,t+.48);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.45);g.gain.exponentialRampToValueAtTime(0.0001,t+.52);n.connect(bp);bp.connect(g);g.connect(out);n.start(t);n.stop(t+.55);
    const s=ac.createOscillator(),sg=ac.createGain();s.frequency.setValueAtTime(90,h);s.frequency.exponentialRampToValueAtTime(36,h+.9);sg.gain.setValueAtTime(0.0001,h);sg.gain.exponentialRampToValueAtTime(.9,h+.01);sg.gain.exponentialRampToValueAtTime(0.0001,h+1.4);s.connect(sg);sg.connect(out);s.start(h);s.stop(h+1.5);
    const k=noise(.3),lp=ac.createBiquadFilter(),kg=ac.createGain();lp.type='lowpass';lp.frequency.value=1800;kg.gain.setValueAtTime(.5,h);kg.gain.exponentialRampToValueAtTime(0.0001,h+.3);k.connect(lp);lp.connect(kg);kg.connect(out);k.start(h);k.stop(h+.3);
    const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(4200,h);f.frequency.exponentialRampToValueAtTime(500,h+1.8);f.connect(out);
    [45,52,57,59,64].forEach(m=>[-8,8].forEach(d=>{const o=tone('sawtooth',mtof(m),h,.05,.01,1.9,f);o.detune.value=d;}));
    [88,95,100].forEach((m,i)=>tone('sine',mtof(m),h+.05+i*.07,.05,.005,1.1));}
  function chime(){if(!live())return;const t=ac.currentTime+.05;[60,64,67,71,76].forEach((m,i)=>{tone('triangle',mtof(m),t+i*.09,.09,.01,1.6);tone('sine',mtof(m+12),t+i*.09,.03,.01,1.2);});}
  function ding(){if(!live())return;const t=ac.currentTime+.01;tone('sine',mtof(88),t,.07,.005,.35);tone('sine',mtof(84),t+.11,.07,.005,.5);}
  function swoosh(){if(!live())return;const t=ac.currentTime+.005,n=noise(.2),f=ac.createBiquadFilter(),g=ac.createGain();f.type='bandpass';f.Q.value=.8;f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(3500,t+.18);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.05);g.gain.exponentialRampToValueAtTime(0.0001,t+.2);n.connect(f);f.connect(g);g.connect(out);n.start(t);n.stop(t+.21);}
  function flip(){if(!live())return;const t=ac.currentTime+.005,n=noise(.12),f=ac.createBiquadFilter(),g=ac.createGain();f.type='highpass';f.frequency.value=2500;g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.12);n.connect(f);f.connect(g);g.connect(out);n.start(t);n.stop(t+.12);}
  // intro: can rattle, spray hiss per stroke, then a bass thump with a closing synth chord
  function thump(h){const s=ac.createOscillator(),sg=ac.createGain();s.frequency.setValueAtTime(95,h);s.frequency.exponentialRampToValueAtTime(38,h+.8);sg.gain.setValueAtTime(0.0001,h);sg.gain.exponentialRampToValueAtTime(.85,h+.01);sg.gain.exponentialRampToValueAtTime(0.0001,h+1.2);s.connect(sg);sg.connect(out);s.start(h);s.stop(h+1.3);
    const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(3600,h);f.frequency.exponentialRampToValueAtTime(450,h+1.5);f.connect(out);
    [45,52,57,60,64].forEach(m=>[-9,9].forEach(d=>{const o=tone('sawtooth',mtof(m),h,.04,.01,1.6,f);o.detune.value=d;}));}
  function rattle(t){[0,.085,.17,.255,.4,.485].forEach(dt=>{const n=noise(.05),f=ac.createBiquadFilter(),g=ac.createGain();f.type='bandpass';f.frequency.value=2800+Math.random()*1200;f.Q.value=5;
      g.gain.setValueAtTime(.5,t+dt);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+.04);n.connect(f);f.connect(g);g.connect(out);n.start(t+dt);n.stop(t+dt+.05);
      tone('triangle',1700+Math.random()*500,t+dt,.05,.001,.03);});}
  function hiss(t,s,e){const n=noise(e-s+.15),hp=ac.createBiquadFilter(),pk=ac.createBiquadFilter(),g=ac.createGain();hp.type='highpass';hp.frequency.value=2400;pk.type='peaking';pk.frequency.value=6500;pk.gain.value=6;
    g.gain.setValueAtTime(0.0001,t+s);g.gain.exponentialRampToValueAtTime(.3,t+s+.03);g.gain.setValueAtTime(.3,t+e);g.gain.exponentialRampToValueAtTime(0.0001,t+e+.06);n.connect(hp);hp.connect(pk);pk.connect(g);g.connect(out);n.start(t+s);n.stop(t+e+.12);}
  function tag(sched,end,t){if(!live())return;if(t==null)t=ac.currentTime+.02;rattle(t);sched.forEach(st=>hiss(t,st.s,st.e));thump(t+end+.08);}
  // The first sound after the audio device wakes up can land late. Wait until the audio clock is
  // really moving, pick a start time just ahead of it, and report how long until it reaches the
  // speakers, so the paint can start at the same moment as the hiss.
  function clock(){return new Promise(res=>{if(!live()){res(null);return;}const c0=ac.currentTime,b=performance.now();
    (function wait(){if(ac.currentTime>c0+.01||performance.now()-b>600){const lead=.08,lat=(ac.outputLatency||0)+(ac.baseLatency||0);
      res({t:ac.currentTime+lead,ms:Math.round((lead+lat)*1000)});}else setTimeout(wait,6);})();});}
  function blip(){if(!live())return;tone('square',mtof(84),ac.currentTime+.005,.03,.003,.06);}
  function beep(){if(!live())return;const t=ac.currentTime+.01;[0,.14].forEach(d=>tone('square',2093,t+d,.045,.003,.08));}
  const btn=$('#sfx-btn');
  function paint(){btn.setAttribute('aria-pressed',String(enabled));btn.title='Sounds: '+(enabled?'on':'off');}
  function toggle(){enabled=!enabled;store.set('mj-sfx',enabled?'1':'0');paint();if(enabled)unlock().then(()=>ding());}
  btn.addEventListener('click',toggle);paint();
  // phones only count a finished tap (touchend/click) as permission to play sound, not the first touch
  ['pointerdown','touchend','click','keydown'].forEach(ev=>addEventListener(ev,()=>{if(!ac||ac.state!=='running')unlock();},{capture:true,passive:true}));
  return {logo,chime,ding,swoosh,flip,tag,clock,blip,beep,unlocked,unlock,toggle,get enabled(){return enabled;}};
})();

/* ================= spray-painted MJ tag for the intro ================= */
const Spray=(()=>{
  const S=[[[12,52],[16,12],[29,38],[42,12],[46,52]],[[62,12],[90,12]],[[78,12],[78,43],[74,51],[65,53],[58,45]],[[6,62],[50,59],[95,63]]];
  const len=p=>{let s=0;for(let i=1;i<p.length;i++)s+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return s;};
  const lens=S.map(len),tot=lens.reduce((a,b)=>a+b,0),T0=.62,DUR=1.3,GAP=.09,sched=[];
  let tt=T0;S.forEach((p,i)=>{const d=DUR*lens[i]/tot;sched.push({s:tt,e:tt+d,p,L:lens[i],under:i===3});tt+=d+GAP;});
  const END=tt-GAP;
  const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
  function at(st,f){const tgt=f*st.L;let acc=0;const p=st.p;for(let i=1;i<p.length;i++){const sl=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(acc+sl>=tgt){const k=sl?(tgt-acc)/sl:0;return [p[i-1][0]+(p[i][0]-p[i-1][0])*k,p[i-1][1]+(p[i][1]-p[i-1][1])*k];}acc+=sl;}return p[p.length-1];}
  function draw(c){const [x,w,h]=fit(c);const sc=Math.min(w/100,h/70),ox=(w-100*sc)/2,oy=(h-70*sc)/2;const drips=[],done=new Set();let last=0;const t0=performance.now();
    function puff(px,py,under){const n=under?18:44,R=under?2.8:5.4;for(let i=0;i<n;i++){const a=Math.random()*6.283,r=Math.abs(gauss())*R*.6,core=r<R*.45;
      const X=ox+(px+Math.cos(a)*r)*sc,Y=oy+(py+Math.sin(a)*r)*sc;
      x.fillStyle=under?(core?'rgba(63,224,208,.85)':'rgba(63,224,208,.3)'):(core?'rgba(255,95,162,.9)':'rgba(255,140,190,.32)');const s=(core?1.25:.8)*Math.max(1,sc*.32);x.fillRect(X,Y,s,s);}}
    function step(el){
      for(const st of sched){if(el<st.s||done.has(st))continue;const f0=Math.max(0,(last-st.s)/(st.e-st.s)),f1=Math.min(1,(el-st.s)/(st.e-st.s));
        const n=Math.max(1,Math.ceil((f1-f0)*st.L/.5));
        for(let k=1;k<=n;k++){const [px,py]=at(st,f0+(f1-f0)*k/n);puff(px,py,st.under);if(!st.under&&Math.random()<.01)drips.push({x:px,y:py+1.2,l:0,m:4+Math.random()*9});}
        if(f1>=1){done.add(st);const e=st.p[st.p.length-1];if(!st.under)drips.push({x:e[0],y:e[1]+1.2,l:0,m:6+Math.random()*9});}}
      x.strokeStyle='rgba(255,95,162,.85)';x.fillStyle='rgba(255,95,162,.9)';x.lineCap='round';x.lineWidth=Math.max(1,sc*.5);
      drips.forEach(d=>{if(d.l>=d.m)return;const nl=Math.min(d.m,d.l+.22);x.beginPath();x.moveTo(ox+d.x*sc,oy+(d.y+d.l)*sc);x.lineTo(ox+d.x*sc,oy+(d.y+nl)*sc);x.stroke();d.l=nl;
        if(d.l>=d.m){x.beginPath();x.arc(ox+d.x*sc,oy+(d.y+d.l)*sc,Math.max(1.2,sc*.6),0,6.283);x.fill();}});
      last=el;}
    if(reduce){for(let e=0;e<=END+1;e+=.02)step(e);return;}
    (function f(now){const el=(now-t0)/1000;step(el);if(el<END+1)requestAnimationFrame(f);})(t0);}
  return {draw,sched,END};
})();

/* ================= MJ logo sting: plays every time the site opens; any key skips =================
   Browsers block sound until the visitor interacts. The first time in a browser session, if sound
   is blocked, it waits on "Press any key" so the spray can is heard; after that it plays straight away. */
const Intro=(()=>{
  const el=$('#intro'),press=el.querySelector('.press');let res=()=>{},skipOn=false,tm,running=false;
  const gated=()=>{try{return sessionStorage.getItem('mj-intro')==='1';}catch(e){return false;}};
  function unhook(){removeEventListener('keydown',skip,true);el.removeEventListener('pointerdown',skip);removeEventListener('keydown',start,true);el.removeEventListener('click',start);}
  function finish(){if(!running)return;running=false;clearTimeout(tm);try{sessionStorage.setItem('mj-intro','1');}catch(e){}unhook();
    el.classList.add('out');setTimeout(()=>{el.hidden=true;el.classList.remove('out','play');mount(false);res();},reduce?0:350);}
  function skip(e){if(!skipOn)return;e.preventDefault();e.stopPropagation();finish();}
  // start the paint and the sound together: the visual waits for the audio clock (see Sfx.clock)
  function play(){press.hidden=true;skipOn=false;
    Sfx.clock().then(c=>{if(!running)return;if(c)Sfx.tag(Spray.sched,Spray.END,c.t);
      setTimeout(()=>{if(!running)return;el.classList.remove('play');void el.offsetWidth;el.classList.add('play');Spray.draw($('#spray'));
        tm=setTimeout(finish,reduce?1200:Math.round((Spray.END+1.05)*1000));setTimeout(()=>{skipOn=true;},400);},c?c.ms:0);});}
  // started by a key or a full tap; the paint never waits more than a moment for the sound to unlock
  let started=false;
  function start(e){if(started)return;started=true;if(e){e.preventDefault();e.stopPropagation();}removeEventListener('keydown',start,true);el.removeEventListener('click',start);
    Promise.race([Sfx.unlock(),new Promise(r=>setTimeout(r,350))]).then(play);}
  // full screen when the site first opens; inside the browser window's page area when the portfolio is reopened
  function mount(inWin){const page=$('#page'),win=$('#w-browser');
    if(inWin&&page&&win){win.appendChild(el);el.classList.add('in-win');
      Object.assign(el.style,{top:page.offsetTop+'px',left:page.offsetLeft+'px',width:page.offsetWidth+'px',height:page.offsetHeight+'px'});}
    else{if(el.parentNode!==document.body)document.body.appendChild(el);el.classList.remove('in-win');el.removeAttribute('style');}}
  function run(opts){return new Promise(r=>{if(running){r();return;}res=r;running=true;el.classList.remove('out','play');
    const c=$('#spray');c.width=c.width; // wipe last time's tag so it can't flash before the new one is painted
    mount(!!(opts&&opts.inWindow));el.hidden=false;
    addEventListener('keydown',skip,true);el.addEventListener('pointerdown',skip);
    // browsers only allow sound after a click or key press: when it's blocked, show a game-style start screen
    Sfx.unlocked().then(ok=>{if(ok)play();else{press.textContent=isDesk?'Press any key':'Tap to start';press.hidden=false;started=false;addEventListener('keydown',start,true);el.addEventListener('click',start);}});});}
  return {run,get on(){return !el.hidden;}};
})();

/* ================= wallpaper ================= */
const wallPhoto=$('#wall-photo');
wallPhoto.addEventListener('load',()=>{if(isDesk)wallpaper();});
function wallpaper(){
  const c=$('#wall');const [x,w,h]=fit(c);
  if(wallPhoto.complete&&wallPhoto.naturalWidth){
    const iw=wallPhoto.naturalWidth,ih=wallPhoto.naturalHeight,sc=Math.max(w/iw,h/ih),dw=iw*sc,dh=ih*sc;
    x.drawImage(wallPhoto,(w-dw)*.4,(h-dh)*.5,dw,dh);
  }else{
    const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1b1036');g.addColorStop(.6,'#c9426a');g.addColorStop(1,'#2a1238');x.fillStyle=g;x.fillRect(0,0,w,h);
  }
  const l=x.createLinearGradient(0,0,130,0);l.addColorStop(0,'rgba(10,6,20,.45)');l.addColorStop(1,'rgba(10,6,20,0)');x.fillStyle=l;x.fillRect(0,0,130,h);
}

/* ================= window manager ================= */
const desk=$('#desk'),fx=$('#fx'),tasks=$('#tasks');
const W={};let Z=10;
const area=()=>({w:desk.clientWidth,h:desk.clientHeight-$('#taskbar').offsetHeight});
const rectEl=el=>{const r=el.getBoundingClientRect(),d=desk.getBoundingClientRect();return {x:r.left-d.left,y:r.top-d.top,w:r.width,h:r.height};};
const dot=r=>({x:r.x+r.w/2,y:r.y+r.h/2,w:0,h:0});
const ICON_MAX='<svg width="9" height="9"><rect x=".5" y=".5" width="8" height="8" fill="none" stroke="currentColor"/><rect width="9" height="2"/></svg>';
const ICON_RES='<svg width="9" height="9"><rect x="2.5" y=".5" width="6" height="6" fill="none" stroke="currentColor"/><rect x="2" width="7" height="2"/><rect x=".5" y="3.5" width="6" height="5" style="fill:#cbc3cf" stroke="currentColor"/><rect y="3" width="7" height="2"/></svg>';
const DEF={
  'w-browser':a=>{const left=a.w>1000?100:14;return {x:left,y:12,w:a.w-left-16,h:a.h-24};},
  'w-game':a=>{const s=Sweeper.dims();const w=Math.min(a.w-20,Math.max(260,s.c*22+44)),h=Math.min(a.h-20,s.r*22+168);return {x:Math.round((a.w-w)/2+60),y:Math.max(10,Math.round((a.h-h)/2)),w,h};},
  'w-notes':a=>({x:Math.max(10,Math.min(150,a.w-430)),y:60,w:Math.min(420,a.w-20),h:Math.min(440,a.h-80)}),
  'w-bin':a=>({x:Math.max(10,Math.min(190,a.w-490)),y:110,w:Math.min(470,a.w-20),h:Math.min(290,a.h-130)})
};
function zoom(from,to,opt={}){
  if(isDesk)Sfx.swoosh();
  if(reduce||!isDesk)return Promise.resolve();
  const {caption=true,trail=3,dur=240}=opt;
  const kf=(a,b)=>[{left:a.x+'px',top:a.y+'px',width:a.w+'px',height:a.h+'px'},{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'}];
  const made=[],done=[];
  for(let i=0;i<trail;i++){const d=document.createElement('div');d.className='zoom-outline';fx.appendChild(d);made.push(d);
    done.push(d.animate(kf(from,to),{duration:dur,delay:i*45,easing:'steps(8,end)',fill:'both'}).finished);}
  if(caption){const c=document.createElement('div');c.className='zoom-cap';fx.appendChild(c);made.push(c);
    done.push(c.animate(kf({...from,h:Math.min(22,from.h)},{...to,h:Math.min(22,to.h)}),{duration:dur,easing:'steps(8,end)',fill:'both'}).finished);}
  return Promise.all(done).catch(()=>{}).then(()=>made.forEach(e=>e.remove()));
}
function place(w){const r=w.max?{x:0,y:0,...area()}:w.rect;Object.assign(w.el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  const mx=w.el.querySelector('.mx');mx.setAttribute('aria-label',w.max?'Restore':'Maximize');mx.innerHTML=w.max?ICON_RES:ICON_MAX;}
function clampRect(w){const a=area(),r=w.rect;r.w=Math.min(r.w,a.w);r.h=Math.min(r.h,a.h);r.x=clamp(r.x,-r.w+80,a.w-80);r.y=clamp(r.y,0,Math.max(0,a.h-24));}
function setTitle(w,t){w.title=t;w.el.querySelector('.tt').textContent=t;if(w.task)w.task.querySelector('span').textContent=t;}
function addTask(w){if(w.task)return;const b=document.createElement('button');b.className='task out';
  b.innerHTML='<svg><use href="#'+w.el.dataset.icon+'"/></svg><span></span>';b.querySelector('span').textContent=w.title;
  b.addEventListener('click',()=>{if(w.busy)return;if(w.state==='min')restore(w.id);else if(w.el.classList.contains('active'))minimize(w.id);else focus(w.id);});
  tasks.appendChild(b);w.task=b;}
function paintTasks(){Object.values(W).forEach(w=>{if(!w.task)return;const on=w.state==='open'&&w.el.classList.contains('active');
  w.task.classList.toggle('on',on);w.task.classList.toggle('in',on);w.task.classList.toggle('out',!on);});}
function focus(id){const w=W[id];if(!w||w.state!=='open')return;w.el.style.zIndex=++Z;
  Object.values(W).forEach(o=>o.el.classList.toggle('active',o===w));paintTasks();}
function focusTop(){const open=Object.values(W).filter(w=>w.state==='open').sort((a,b)=>(+b.el.style.zIndex||0)-(+a.el.style.zIndex||0));
  if(open[0])focus(open[0].id);else{Object.values(W).forEach(o=>o.el.classList.remove('active'));paintTasks();}}
async function openWin(id,from){const w=W[id];if(!w||w.busy)return;
  if(w.state==='min')return restore(id);if(w.state==='open'){focus(id);return;}
  w.busy=true;if(!w.rect)w.rect=DEF[id](area());clampRect(w);addTask(w);
  const to=w.max?{x:0,y:0,...area()}:w.rect;
  await zoom(from?(from.nodeType?rectEl(from):from):dot(to),to);
  w.state='open';w.el.hidden=false;place(w);focus(id);w.busy=false;w.onopen&&w.onopen();}
async function minimize(id){const w=W[id];if(!w||w.busy||w.state!=='open')return;w.busy=true;
  const from=rectEl(w.el);w.el.hidden=true;w.state='min';w.el.classList.remove('active');paintTasks();w.onhide&&w.onhide();
  await zoom(from,rectEl(w.task));w.busy=false;focusTop();w.onmin&&w.onmin();}
async function restore(id){const w=W[id];if(!w||w.busy)return;w.busy=true;
  await zoom(rectEl(w.task),w.max?{x:0,y:0,...area()}:w.rect);
  w.state='open';w.el.hidden=false;place(w);focus(id);w.busy=false;w.onopen&&w.onopen();}
async function closeWin(id){const w=W[id];if(!w||w.busy||w.state==='closed')return;w.busy=true;
  const from=rectEl(w.el);const wasMin=w.state==='min';w.el.hidden=true;w.state='closed';w.el.classList.remove('active');
  if(w.task){w.task.remove();w.task=null;}w.onhide&&w.onhide();
  if(!wasMin)await zoom(from,dot(from),{caption:false,trail:4,dur:300});
  w.busy=false;focusTop();w.onclose&&w.onclose();}
async function toggleMax(id){const w=W[id];if(!w||w.busy||w.state!=='open')return;w.busy=true;
  const from=rectEl(w.el);w.max=!w.max;const to=w.max?{x:0,y:0,...area()}:w.rect;
  w.el.style.visibility='hidden';await zoom(from,to);place(w);w.el.style.visibility='';w.busy=false;focus(id);}
$$('.win').forEach(el=>{
  const w={id:el.id,el,state:'closed',max:false,rect:null,task:null,busy:false,title:el.dataset.title};W[el.id]=w;setTitle(w,w.title);
  el.querySelector('.mx').innerHTML=ICON_MAX;
  el.querySelector('.m').addEventListener('click',e=>{e.stopPropagation();minimize(w.id);});
  el.querySelector('.mx').addEventListener('click',e=>{e.stopPropagation();toggleMax(w.id);});
  el.querySelector('.x').addEventListener('click',e=>{e.stopPropagation();closeWin(w.id);});
  el.addEventListener('pointerdown',()=>{if(!el.classList.contains('active'))focus(w.id);},true);
  const tb=el.querySelector('.tb');
  tb.addEventListener('dblclick',e=>{if(!e.target.closest('button'))toggleMax(w.id);});
  tb.addEventListener('pointerdown',e=>{
    if(!isDesk||w.max||e.button!==0||e.target.closest('button'))return;
    e.preventDefault();const start=rectEl(el),ox=e.clientX,oy=e.clientY;
    const o=document.createElement('div');o.className='drag-outline';Object.assign(o.style,{left:start.x+'px',top:start.y+'px',width:start.w+'px',height:start.h+'px'});desk.appendChild(o);
    let nx=start.x,ny=start.y;tb.setPointerCapture(e.pointerId);
    const mv=ev=>{const a=area();nx=clamp(start.x+ev.clientX-ox,-start.w+80,a.w-80);ny=clamp(start.y+ev.clientY-oy,0,a.h-24);o.style.left=nx+'px';o.style.top=ny+'px';};
    const up=()=>{tb.removeEventListener('pointermove',mv);tb.removeEventListener('pointerup',up);tb.removeEventListener('pointercancel',up);o.remove();w.rect={...w.rect,x:nx,y:ny};place(w);};
    tb.addEventListener('pointermove',mv);tb.addEventListener('pointerup',up);tb.addEventListener('pointercancel',up);
  });
});

/* ================= balloon, start menu, clock, shutdown ================= */
const balloon=$('#balloon');let balloonT;
function tipOnce(key,t,m,ms){try{if(sessionStorage.getItem('mj-tip-'+key))return;sessionStorage.setItem('mj-tip-'+key,'1');}catch(e){}say(t,m,ms);}
function say(t,m,ms=6500){Sfx.ding();$('#balloon-t').textContent=t;$('#balloon-m').textContent=m;balloon.hidden=false;clearTimeout(balloonT);balloonT=setTimeout(()=>balloon.hidden=true,ms);}
balloon.querySelector('button').addEventListener('click',()=>balloon.hidden=true);
const sm=$('#startmenu'),startBtn=$('#start');
function menu(open){sm.hidden=!open;startBtn.setAttribute('aria-expanded',String(open));startBtn.classList.toggle('in',open);startBtn.classList.toggle('out',!open);if(open){const f=sm.querySelector('button');f&&f.focus();}}
startBtn.addEventListener('click',e=>{e.stopPropagation();menu(sm.hidden);});
document.addEventListener('pointerdown',e=>{if(!sm.hidden&&!sm.contains(e.target)&&!startBtn.contains(e.target))menu(false);});
const clockFmt=new Intl.DateTimeFormat('en-CA',{hour:'numeric',minute:'2-digit',timeZone:'America/Edmonton'});
function tick(){$('#clock').textContent=clockFmt.format(new Date());$('#clock').title='Edmonton time';}
tick();setInterval(tick,15000);
const shut=$('#shut');
function shutdown(){menu(false);Radio.stop();
  shut.className='';shut.hidden=false;shut.innerHTML='<div class="a">Vice OS is shutting down<small>Saving your progress…</small></div>';
  setTimeout(()=>{shut.innerHTML='<div class="b">It’s now safe to turn off your computer.<small>Click anywhere to turn it back on.</small></div>';shut.dataset.ready='1';},reduce?300:1700);}
// power on: BIOS memory test, then the Vice OS splash, then the desktop and the portfolio
function boot(){
  Object.values(W).forEach(w=>{w.el.hidden=true;w.state='closed';w.el.classList.remove('active');if(w.task){w.task.remove();w.task=null;}});
  shut.className='boot';shut.innerHTML='<pre class="bios"></pre>';const pre=shut.querySelector('.bios');
  const L=['<b>VICE BIOS v1.986</b>   (C) 1986 MJ Systems Inc.','','CPU    : Brain, 4th year @ University of Alberta','Clock  : 2027 MHz (turbo)','Memory : <span id="mem">0</span>K OK','',
    'Detecting drives...','  C:  portfolio.exe ......... OK','  D:  bugsweeper.exe ........ OK','  E:  mj_fm.wav ............. OK','','Press DEL to enter setup. Please don’t.'];
  let i=0;const step=reduce?0:105;
  (function next(){if(i>=L.length){setTimeout(splash,reduce?100:450);return;}pre.innerHTML+=L[i]+'\n';
    if(L[i].includes('id="mem"')&&!reduce){const m=$('#mem');let k=0;const t=setInterval(()=>{k=Math.min(640,k+32);m.textContent=k;if(k>=640)clearInterval(t);},28);}else if(reduce&&$('#mem'))$('#mem').textContent='640';
    i++;setTimeout(next,step);})();
  function splash(){shut.innerHTML='<div class="splash"><div class="sp-logo">Vice OS</div><div class="sp-86">86</div><div class="sp-bar"><i></i></div><small>Starting Vice OS…</small></div>';Sfx.chime();
    setTimeout(()=>{shut.classList.add('fade');setTimeout(()=>{shut.hidden=true;shut.className='';shut.innerHTML='';browserClosed=true;openWin('w-browser');},reduce?0:400);},reduce?400:2000);}
}
shut.addEventListener('click',()=>{if(!shut.dataset.ready)return;delete shut.dataset.ready;Sfx.unlock();boot();});
function run(btn){const o=btn.dataset.open,a=btn.dataset.act,r=rectEl(btn);menu(false);
  if(o){if(o==='w-game')gameClosedByUser=false;openWin(o,r);}else if(a==='radio')Radio.toggle();else if(a==='shutdown')shutdown();}
$$('#startmenu [data-open],#startmenu [data-act]').forEach(b=>b.addEventListener('click',()=>run(b)));
$$('.icon').forEach(b=>{
  b.addEventListener('click',()=>$$('.icon').forEach(i=>i.classList.toggle('sel',i===b)));
  b.addEventListener('dblclick',()=>run(b));
  b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run(b);}});
});
$('#wall').addEventListener('pointerdown',()=>$$('.icon').forEach(i=>i.classList.remove('sel')));
$('#bin-empty').addEventListener('click',()=>{const tb=$('#bin-body');if(!tb.children.length)return;tb.innerHTML='';$('#bin-count').textContent='0 object(s)';say('Recycle Bin emptied','Freed up 2.3 GB. It was mostly node_modules.',4000);});

/* ================= MJ FM ================= */
const Radio=(()=>{
  let ac=null,master,delay,timer=null,step=0,next=0,on=false,noise;
  const bpm=104,s16=60/bpm/4,mtof=m=>440*Math.pow(2,(m-69)/12);
  const chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],roots=[45,41,48,43];
  const btn=$('#radio-btn');
  function init(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ac=new AC();
    master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
    delay=ac.createDelay();delay.delayTime.value=s16*3;const fb=ac.createGain();fb.gain.value=.32;const dl=ac.createGain();dl.gain.value=.5;
    delay.connect(fb);fb.connect(delay);delay.connect(dl);dl.connect(master);
    noise=ac.createBuffer(1,ac.sampleRate*.5,ac.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true;}
  function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
  function kick(t){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);env(g,t,.002,.9,.28);o.connect(g);g.connect(master);o.start(t);o.stop(t+.35);}
  function hit(t,type,freq,peak,dec){const s=ac.createBufferSource();s.buffer=noise;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=ac.createGain();env(g,t,.001,peak,dec);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dec+.05);}
  function bass(t,m){const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o.frequency.value=mtof(m);f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(220,t+s16*1.6);env(g,t,.004,.32,s16*1.7);o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+s16*2);}
  function arp(t,m){const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type='square';o.frequency.value=mtof(m);f.type='lowpass';f.frequency.value=2600;env(g,t,.003,.07,.14);o.connect(f);f.connect(g);g.connect(master);g.connect(delay);o.start(t);o.stop(t+.2);}
  function pad(t,ch){const len=s16*16;ch.forEach(m=>[-7,7].forEach(det=>{const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=det;f.type='lowpass';f.frequency.value=1300;
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(.028,t+.35);g.gain.setValueAtTime(.028,t+len-.25);g.gain.linearRampToValueAtTime(0.0001,t+len);o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+len+.05);}));}
  function sched(){while(next<ac.currentTime+.15){const bar=Math.floor(step/16)%4,s=step%16;
    if(s===0)pad(next,chords[bar]);if(s%8===0)kick(next);if(s%8===4)hit(next,'bandpass',1800,.45,.2);if(s%2===1)hit(next,'highpass',7000,.12,.04);
    if(s%2===0)bass(next,roots[bar]+(s%4===2?12:0));arp(next,chords[bar][[0,1,2,1][s%4]]+12+(s>=8?12:0));step++;next+=s16;}}
  function paint(){btn.setAttribute('aria-pressed',String(on));btn.title='Music: '+(on?'on':'off');}
  function start(){if(!ac&&!init())return;ac.resume();master.gain.cancelScheduledValues(ac.currentTime);master.gain.setTargetAtTime(.2,ac.currentTime,.08);
    next=ac.currentTime+.06;timer=setInterval(sched,25);on=true;paint();say('MJ FM 86.1','Synthwave, made live in your browser. '+(isDesk?'Click the radio again to turn it off.':'Tap MJ FM again to turn it off.'),4500);}
  function stop(){if(!on)return;on=false;clearInterval(timer);master.gain.setTargetAtTime(0,ac.currentTime,.06);setTimeout(()=>{if(!on)ac.suspend();},400);paint();}
  btn.addEventListener('click',()=>on?stop():start());
  return {toggle(){on?stop():start();},stop,get on(){return on;}};
})();

/* ================= Bugsweeper ================= */
const Sweeper=(()=>{
  const grid=$('#bs-grid'),cnt=$('#bs-count'),tm=$('#bs-time'),face=$('#bs-face'),msg=$('#bs-msg'),st=$('#bs-status'),bestEl=$('#bs-best');
  const F=(m)=>'<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="9.5" fill="#ffd84d" stroke="#1b1420" stroke-width="1.4"/>'+m+'</svg>';
  const FACE={
    smile:F('<circle cx="7.8" cy="9" r="1.3"/><circle cx="14.2" cy="9" r="1.3"/><path d="M7 13.5q4 3.5 8 0" fill="none" stroke="#1b1420" stroke-width="1.4"/>'),
    oh:F('<circle cx="7.8" cy="9" r="1.3"/><circle cx="14.2" cy="9" r="1.3"/><circle cx="11" cy="14.6" r="2" fill="none" stroke="#1b1420" stroke-width="1.4"/>'),
    cool:F('<path d="M4.5 8.5h13" stroke="#1b1420" stroke-width="1.2"/><rect x="5" y="8" width="5" height="3.4" rx="1" fill="#1b1420"/><rect x="12" y="8" width="5" height="3.4" rx="1" fill="#1b1420"/><path d="M7 14q4 3.5 8 0" fill="none" stroke="#1b1420" stroke-width="1.4"/>'),
    dead:F('<path d="M6.5 7.5l2.6 2.6M9.1 7.5l-2.6 2.6M12.9 7.5l2.6 2.6M15.5 7.5l-2.6 2.6" stroke="#1b1420" stroke-width="1.3"/><path d="M7 16q4-3 8 0" fill="none" stroke="#1b1420" stroke-width="1.4"/>')};
  const BUG='<svg viewBox="0 0 16 16"><ellipse cx="8" cy="9.5" rx="3.6" ry="4.6" fill="#1b1420"/><circle cx="8" cy="4.2" r="2.1" fill="#1b1420"/><path d="M4.6 7.5L1.5 5.5M4.4 10H1M4.6 12.5L1.5 14.5M11.4 7.5l3.1-2M11.6 10H15M11.4 12.5l3.1 2" stroke="#1b1420" stroke-width="1.2" stroke-linecap="round"/><path d="M8 6v8" stroke="#ff5fa2" stroke-width=".9"/></svg>';
  const FLAG='<svg viewBox="0 0 16 16"><path d="M7.5 2v10" stroke="#1b1420" stroke-width="1.5"/><path d="M7.5 2.2L2.5 4.8 7.5 7.4z" fill="#e0245e"/><rect x="4" y="12" width="7.5" height="2" fill="#1b1420"/></svg>';
  const WRONG='<svg viewBox="0 0 16 16"><path d="M7.5 2v10" stroke="#1b1420" stroke-width="1.5"/><path d="M7.5 2.2L2.5 4.8 7.5 7.4z" fill="#e0245e"/><path d="M2 2l12 12M14 2L2 14" stroke="#d6243a" stroke-width="2"/></svg>';
  let C=9,R=9,N=10,cells=[],started=false,over=false,flags=0,opened=0,secs=0,timer=null,faceNow='smile',paused=false,best={};
  try{best=JSON.parse(store.get('bs-best','{}'))||{};}catch(e){best={};}
  const pad=n=>String(clamp(n,-99,999)).padStart(3,'0');
  function nb(i){const x=i%C,y=Math.floor(i/C),o=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<C&&ny<R)o.push(ny*C+nx);}return o;}
  function setFace(k){faceNow=k;face.innerHTML=FACE[k];}
  function showBest(){const b=best[C+'x'+R];bestEl.textContent='Best: '+(b!=null?b+'s':'–');}
  function startTimer(){clearInterval(timer);timer=setInterval(()=>{if(!paused){secs++;tm.textContent=pad(secs);}},1000);}
  function newGame(c,r,n){if(c){C=c;R=r;N=n;}clearInterval(timer);started=over=false;flags=opened=secs=0;
    cells=Array.from({length:C*R},()=>({bug:false,adj:0,open:false,flag:false,el:null}));
    grid.style.gridTemplateColumns='repeat('+C+',22px)';grid.innerHTML='';
    cells.forEach((c,i)=>{const b=document.createElement('button');b.className='cell';b.type='button';b.dataset.i=i;b.setAttribute('aria-label','Hidden cell');grid.appendChild(b);c.el=b;});
    cnt.textContent=pad(N);tm.textContent=pad(0);setFace('smile');msg.hidden=true;st.textContent='Ready';showBest();}
  function plant(safe){const no=new Set([safe,...nb(safe)]);let k=0;while(k<N){const i=Math.floor(Math.random()*C*R);if(no.has(i)||cells[i].bug)continue;cells[i].bug=true;k++;}
    cells.forEach((c,i)=>{c.adj=nb(i).filter(j=>cells[j].bug).length;});started=true;startTimer();}
  function paint(i){const c=cells[i],b=c.el;b.className='cell'+(c.open?' open':'');b.innerHTML='';
    if(c.open){if(c.bug)b.innerHTML=BUG;else if(c.adj){b.textContent=c.adj;b.classList.add('n'+c.adj);}b.setAttribute('aria-label',c.bug?'Bug':c.adj?c.adj+' bugs nearby':'Empty');}
    else if(c.flag){b.innerHTML=FLAG;b.setAttribute('aria-label','Flagged');}else b.setAttribute('aria-label','Hidden cell');}
  function open(i){const stack=[i];while(stack.length){const j=stack.pop(),c=cells[j];if(c.open||c.flag)continue;c.open=true;opened++;paint(j);
      if(c.bug){lose(j);return;}if(c.adj===0)nb(j).forEach(k=>{if(!cells[k].open)stack.push(k);});}
    if(opened===C*R-N)win();}
  function lose(i){over=true;clearInterval(timer);
    cells.forEach((c,j)=>{if(c.bug&&!c.flag){c.open=true;paint(j);}else if(!c.bug&&c.flag)c.el.innerHTML=WRONG;});
    cells[i].el.classList.add('boom');setFace('dead');
    msg.className='bs-msg lose';msg.innerHTML='<b>Wasted</b><span>You shipped a bug to production.<br>Click to try again.</span>';msg.hidden=false;st.textContent='Wasted after '+secs+'s.';}
  function win(){over=true;clearInterval(timer);cells.forEach((c,j)=>{if(c.bug&&!c.flag){c.flag=true;paint(j);}});cnt.textContent=pad(0);setFace('cool');
    const k=C+'x'+R;if(best[k]==null||secs<best[k]){best[k]=secs;store.set('bs-best',JSON.stringify(best));}showBest();
    msg.className='bs-msg win';msg.innerHTML='<b>Mission passed</b><span>All bugs squashed in '+secs+'s<br>Respect +</span>';msg.hidden=false;st.textContent='Cleared in '+secs+'s.';}
  function flag(i){const c=cells[i];if(over||c.open)return;c.flag=!c.flag;flags+=c.flag?1:-1;cnt.textContent=pad(N-flags);paint(i);}
  grid.addEventListener('click',e=>{const b=e.target.closest('.cell');if(!b||over)return;const i=+b.dataset.i,c=cells[i];
    if(!started)plant(i);
    if(c.open&&c.adj){const ns=nb(i);if(ns.filter(k=>cells[k].flag).length===c.adj)ns.forEach(k=>{if(!over&&!cells[k].open&&!cells[k].flag)open(k);});return;}
    open(i);});
  grid.addEventListener('contextmenu',e=>{const b=e.target.closest('.cell');e.preventDefault();if(b)flag(+b.dataset.i);});
  grid.addEventListener('keydown',e=>{const b=e.target.closest('.cell');if(!b)return;const i=+b.dataset.i;
    if(e.key==='f'||e.key==='F'){e.preventDefault();flag(i);return;}
    const mv={ArrowLeft:-1,ArrowRight:1,ArrowUp:-C,ArrowDown:C}[e.key];if(mv!==undefined){e.preventDefault();const n=i+mv;if(n>=0&&n<C*R&&!(Math.abs(mv)===1&&Math.floor(n/C)!==Math.floor(i/C)))cells[n].el.focus();}});
  grid.addEventListener('pointerdown',e=>{if(e.button===0&&!over&&e.target.closest('.cell'))setFace('oh');});
  addEventListener('pointerup',()=>{if(faceNow==='oh')setFace(over?'dead':'smile');});
  face.addEventListener('click',()=>newGame());
  msg.addEventListener('click',()=>newGame());
  function resizeWin(){const w=W['w-game'];if(!w||!w.rect)return;const d=DEF['w-game'](area());w.rect.w=d.w;w.rect.h=d.h;clampRect(w);if(w.state==='open'&&!w.max)place(w);}
  $$('[data-bs]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.bs;if(v==='9'){newGame(9,9,10);resizeWin();}else if(v==='16'){newGame(16,16,40);resizeWin();}else newGame();}));
  addEventListener('keydown',e=>{if(e.key==='F2'&&W['w-game'].el.classList.contains('active')){e.preventDefault();newGame();}});
  newGame(9,9,10);
  return {
    dims:()=>({c:C,r:R}),
    pause(){paused=true;},resume(){paused=false;},
    cheat(){if(over||!started)return false;cells.forEach((c,j)=>{if(c.bug){c.flag=true;paint(j);}else if(!c.open){c.open=true;opened++;paint(j);}});win();return true;}
  };
})();

let gameClosedByUser=false;
let browserClosed=false;
const BUG_TIP='Left click checks a cell. Right click flags a bug. Numbers count the bugs touching that cell.';
W['w-game'].onopen=()=>{Sweeper.resume();setTimeout(()=>tipOnce('bugs','Bugsweeper',BUG_TIP,8000),200);};
W['w-game'].onhide=()=>Sweeper.pause();
W['w-game'].onclose=()=>{gameClosedByUser=true;};
W['w-browser'].onmin=()=>{if(W['w-game'].state!=='open'&&!gameClosedByUser){try{sessionStorage.setItem('mj-tip-bugs','1');}catch(e){}openWin('w-game',W['w-browser'].task);say('While you wait…','Bugsweeper is open. '+BUG_TIP+' Click the portfolio in the taskbar to go back.',9000);}};
W['w-browser'].onclose=()=>{browserClosed=true;say('Portfolio closed','Double-click My Portfolio to open it again. MJ FM is down here if you want music.',8000);};
// reopening the portfolio (not restoring it from the taskbar) replays the MJ intro, like opening the site fresh
W['w-browser'].onopen=()=>{if(!browserClosed)return;browserClosed=false;balloon.hidden=true;
  const pg=$('.pg[data-page="'+cur+'"]');unarm(pg); // hide the page's text under the intro so it drops in once, afterwards
  Intro.run({inWindow:isDesk}).then(()=>{arm(pg);if(cur==='home')showObjective();});};

/* ================= site data ================= */
const GROUPS={ml:'Machine learning',signal:'Signal processing',web:'Backend & web',data:'Data & databases',sec:'Security & infra'};
/* ================= dropping headlines + scroll reveals ================= */
if(!reduce&&'IntersectionObserver' in window)document.documentElement.classList.add('armed');
const revealIO='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('shown');revealIO.unobserve(e.target);}}),{root:$('#page'),threshold:.12,rootMargin:'0px 0px -6% 0px'}):null;
function splitDrop(el){if(el.dataset.split)return;el.dataset.split='1';const text=el.textContent.trim();el.setAttribute('aria-label',text);el.textContent='';let k=0;
  text.split(/\s+/).forEach((w,wi,arr)=>{
    if(el.dataset.drop==='letters'){const wrap=document.createElement('span');wrap.className='dwrap';wrap.setAttribute('aria-hidden','true');
      [...w].forEach(ch=>{const s=document.createElement('span');s.className='dl';s.textContent=ch;s.style.setProperty('--d',(k++*55)+'ms');wrap.appendChild(s);});el.appendChild(wrap);}
    else{const s=document.createElement('span');s.className='dw';s.setAttribute('aria-hidden','true');s.textContent=w;s.style.setProperty('--d',(wi*75)+'ms');el.appendChild(s);if(wi<arr.length-1)el.appendChild(document.createTextNode(' '));}});}
function arm(pg){if(!pg)return;pg.querySelectorAll('[data-drop]').forEach(splitDrop);
  pg.querySelectorAll('[data-drop],[data-reveal]').forEach(el=>{el.classList.remove('shown');if(revealIO)revealIO.observe(el);else el.classList.add('shown');});}
function unarm(pg){if(!pg||!revealIO)return;pg.querySelectorAll('[data-drop]').forEach(splitDrop);
  pg.querySelectorAll('[data-drop],[data-reveal]').forEach(el=>{revealIO.unobserve(el);el.classList.remove('shown');});}

const MISSIONS=[
  {medal:'gold',kind:'Production SaaS',date:'Apr 2026',title:'QuantDash',sub:'Equity analytics platform, live at quantdash.tech',g:['web','data','sec'],
   text:'Ranks the S&P 500 on momentum, value, quality and low volatility, with pair-trading hedge ratios and VaR/CVaR risk. I run the whole security surface alone: authentication, a Cloudflare TLS edge, isolated secrets and structured incident logging.',
   stack:['Python','FastAPI','PostgreSQL','Docker','Fly.io','Cloudflare','pytest'],stats:[['16+','REST endpoints tested on every push'],['0','outages since the April launch']],
   links:[['Visit quantdash.tech','https://quantdash.tech'],['GitHub','https://github.com/BetterThanYou73/quant-dash']]},
  {medal:'gold',kind:'Audio ML',date:'Aug 2026',title:'Backline',sub:'AI karaoke studio',g:['ml','signal','web'],
   text:'Rerenders any song into six genres with melody-conditioned generation, then follows the singer live. Pitch detection and time-stretching run in AudioWorklets, so a take never touches the network.',
   stack:['MusicGen','PyTorch','CUDA','FastAPI','Next.js','Web Audio'],stats:[['+0.53','chroma correlation with the source'],['+0.29','for a time-reversed control']],
   links:[['GitHub','https://github.com/BetterThanYou73/backline-ai-karaoke']]},
  {medal:'gold',kind:'Computer vision',date:'Jul 2026',title:'Kinetica',sub:'Pose-driven strength coach',g:['ml'],
   text:'Classifies the exercise, counts reps and checks form from pose estimation. Form rules live in a JSON ruleset, so adding a lift is a config entry instead of new code.',
   stack:['Python','MediaPipe','OpenCV'],stats:[],links:[['GitHub','https://github.com/BetterThanYou73/Kinetica']]},
  {medal:'silver',kind:'Deep learning',date:'Jan 2026',title:'Math Vision',sub:'Handwritten symbol classifier',g:['ml'],
   text:'ResNet-based classifier for handwritten math symbols on EMNIST, with augmentation, class-balanced sampling and a reproducible PyTorch training pipeline for fast sweeps.',
   stack:['Python','PyTorch','Scikit-learn'],stats:[['88%','validation accuracy'],['89','symbol classes']],links:[['GitHub','https://github.com/BetterThanYou73/math-vision']]},
  {medal:'silver',kind:'EEG · NatHacks 2025',date:'Nov 2025',title:'Neuromotion',sub:'Live motor-imagery decoder',g:['ml','signal'],
   text:'Real-time 4-class motor-imagery classification from an OpenBCI headset, using CSP, band-power and asymmetry features, with live neurofeedback. 2nd place in the MedTech division.',
   stack:['EEG','CSP','PyTorch','OpenBCI'],stats:[['2nd','place, NatHacks MedTech'],['4','classes decoded live']],links:[['GitHub','https://github.com/Alberta-Bionix-natHacks-2025/natHacks2025']]},
  {medal:'silver',kind:'Navigation · HackED',date:'Feb 2025',title:'SkyNav',sub:'Weather-aware drone routing',g:['ml','web'],
   text:'Routes small drones and light aircraft around no-fly zones and bad weather, using A* search with a random-forest weather model.',
   stack:['Python','A*','Random forest','Flask'],stats:[],links:[['Live demo','https://skynav.pythonanywhere.com/']]},
  {medal:'bronze',kind:'Speech',date:'Apr 2025',title:'XTTS + Wav2Lip',sub:'Voice clone and lip-sync pipeline',g:['ml','signal'],
   text:'Clones a voice in English or Hindi from reference audio with XTTS v2, normalises loudness, then lip-syncs a face to it with Wav2Lip-GAN.',
   stack:['XTTS v2','Wav2Lip-GAN','FFmpeg'],stats:[],links:[['GitHub','https://github.com/BetterThanYou73/GenAI_Task']]},
  {medal:'bronze',kind:'Biofeedback game',date:'Nov 2023',title:'Nightmares',sub:'EMG-driven horror game',g:['signal'],
   text:'A horror prototype that reads muscle activation in real time and changes pacing and encounters to match.',
   stack:['EMG','Game engine'],stats:[],links:[['GitHub','https://github.com/GOATMaxwellN/Nightmares']]},
  {medal:'bronze',kind:'Automation',date:'Mar 2021',title:'Ultron 2.0',sub:'Where it started',g:[],
   text:'An early Python assistant for scripting and automation. The first thing I built.',
   stack:['Python'],stats:[],links:[['GitHub','https://github.com/BetterThanYou73/Ultron2.0']]}
];
const JOBS=[
  {st:'active',label:'Active · Aug 2026',title:'Undergraduate Researcher, ECG Signal Analysis',org:"Dr. Dongsheng Xiao's group, NeuroPrior AI",g:['signal','ml','data'],
   pts:['Built an end-to-end ECG pipeline in Python: ingestion, filtering, baseline-wander removal, signal-quality scoring and Pan-Tompkins R-peak detection written from scratch.','98.4% sensitivity and 99.3% precision on 18,552 annotated MIT-BIH beats, ahead of NeuroKit2’s 98.10 F1 on the same data.','93.2% / 78.0% inter-patient PVC classification, 24-hour recordings in bounded memory, 181 automated tests.']},
  {st:'passed',label:'Passed · Jul–Sep 2026',title:'Frontend & Product Engineering Intern',org:'Orbitra Cybersecurity · remote',g:['web','sec'],
   pts:['Built the orbitrasecurity.com product site and its business dashboards in HTML, CSS and JavaScript.','Security-tested the server infrastructure and found gaps in authentication, session handling and data flow.','Shipped Slack and email notification APIs.']},
  {st:'passed',label:'Passed · Jul 2026',title:'AI & Analytics Lead',org:'Take THE Cake Patisserie · remote',g:['ml','data'],
   pts:['Deployed an AI customer assistant built on Claude across 40+ menu, order and custom-cake inquiry types, handing high-touch conversations to staff.','Benchmarked pricing against 15+ Metro Vancouver competitors and forecast demand from 12+ months of sales to set product and monthly pricing.']},
  {st:'passed',label:'Volunteer · Oct 2025',title:'EMG & RL Systems',org:'Bionix, University of Alberta',g:['ml','signal'],
   pts:['Reinforcement-learning control for prosthetic legs driven by EMG signals, from data collection to processing.']},
  {st:'passed',label:'Passed · 2nd place',title:'NatHacks 2025, MedTech division',org:'Hackathon, with Bionix',g:['ml','signal'],
   pts:['Built a live 4-class EEG motor-imagery decoder on OpenBCI with real-time neurofeedback.']}
];
const KIT={Languages:['Python','C','C++','JavaScript','TypeScript','SQL','Bash'],'ML & data':['PyTorch','TensorFlow','Scikit-learn','XGBoost','pandas','NumPy','SciPy'],'Backend & infra':['FastAPI','Flask','PostgreSQL','MySQL','Docker','Fly.io','Cloudflare','Linux'],'Tooling':['Git','pytest','CI/CD','Claude Code','GSAP','LeafletJS']};

/* missions page */
const mlist=$('#mlist'),mdetail=$('#mdetail');let msel=0;
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
MISSIONS.forEach((m,i)=>{const b=document.createElement('button');b.className='mrow';b.dataset.aim='';b.setAttribute('role','option');b.id='m-'+i;
  b.innerHTML='<i class="medal '+m.medal+'"></i>'+esc(m.title);b.addEventListener('click',()=>{pickMission(i);if(!isDesk)mdetail.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});});mlist.appendChild(b);});
const STAMP={gold:['Mission passed','respect +'],silver:['Mission passed',''],bronze:['Side mission','']};
function pickMission(i,focusIt,quiet){const changed=i!==msel;msel=i;const m=MISSIONS[i],s=STAMP[m.medal];
  $$('.mrow').forEach((r,j)=>{r.setAttribute('aria-selected',String(j===i));r.tabIndex=j===i?0:-1;});
  mdetail.innerHTML='<span class="stamp">'+esc(s[0])+(s[1]?'<small>'+esc(s[1])+'</small>':'')+'</span><div class="brief-in"><span class="tag kind">'+esc(m.kind)+' · '+esc(m.date)+'</span><h3>'+esc(m.title)+'<small>'+esc(m.sub)+'</small></h3><p>'+esc(m.text)+'</p>'+
    '<div class="chips">'+m.stack.map(x=>'<i>'+esc(x)+'</i>').join('')+'</div>'+
    (m.stats.length?'<div class="mstats">'+m.stats.map(x=>'<div><b>'+esc(x[0])+'</b>'+esc(x[1])+'</div>').join('')+'</div>':'')+
    '<div class="mlinks">'+m.links.map(l=>'<a class="vbtn" href="'+esc(l[1])+'" target="_blank" rel="noopener">'+esc(l[0])+'</a>').join('')+'</div></div>';
  mdetail.classList.remove('swap');void mdetail.offsetWidth;mdetail.classList.add('swap');
  if(changed&&!quiet)Sfx.blip();
  if(focusIt)$('#m-'+i).focus({preventScroll:true});}
pickMission(0,false,true);
// ↑ ↓ switch missions anywhere on the Missions page, not only when the list has focus
addEventListener('keydown',e=>{
  if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
  if(cur!=='missions'||VC.open||Intro.on)return;
  if(isDesk&&!W['w-browser'].el.classList.contains('active'))return;
  e.preventDefault();pickMission((msel+(e.key==='ArrowDown'?1:-1)+MISSIONS.length)%MISSIONS.length,mlist.contains(document.activeElement));});

/* career page: neon signs, details on a pager */
const NEON=['#ff5fa2','#3fe0d0','#ffb347','#b48cff','#ff5fa2'],SIGN=['ECG Research Lab','Orbitra','Take THE Cake','Bionix','NatHacks 2025'];
const TUBE={active:['open','now open'],passed:['done','complete'],incoming:['soon','soon']};
$('#log').innerHTML=JOBS.map((j,i)=>{const t=TUBE[j.st];
  return '<article class="sign" data-reveal style="--c:'+NEON[i%NEON.length]+';--rd:'+(i*110)+'ms">'+
    '<button class="sign-head" type="button" data-job="'+i+'" aria-expanded="false" aria-controls="sb-'+i+'">'+
    '<span class="org">'+esc(SIGN[i]||j.org)+'</span><span class="tube '+t[0]+'">'+t[1]+'</span><span class="role">'+esc(j.title)+'</span><span class="when">'+esc(j.org)+' · '+esc(j.label.replace(/^[^·]*·\s*/,''))+'</span></button>'+
    '<div class="sign-body" id="sb-'+i+'" hidden><ul>'+j.pts.map((p,k)=>'<li style="--i:'+k+'">'+esc(p)+'</li>').join('')+'</ul></div></article>';}).join('');
function openSign(i,quiet){$$('#log .sign-body').forEach(b=>b.hidden=true);$$('#log .sign-head').forEach(h=>h.setAttribute('aria-expanded','false'));
  if(i<0)return;const b=$('#sb-'+i);b.hidden=false;b.querySelectorAll('li').forEach(li=>{li.style.animation='none';void li.offsetWidth;li.style.animation='';});
  $('#log .sign-head[data-job="'+i+'"]').setAttribute('aria-expanded','true');if(!quiet)Sfx.blip();}
$('#log').addEventListener('click',e=>{const h=e.target.closest('.sign-head');if(!h)return;const i=+h.dataset.job;openSign($('#sb-'+i).hidden?i:-1);});

/* stats page */
const ALL=[...MISSIONS,...JOBS],TOTAL=ALL.length;
$('#bars').innerHTML=Object.entries(GROUPS).map(([k,name])=>{const n=ALL.filter(x=>x.g.includes(k)).length;
  return '<div class="srow" title="Used in '+n+' of '+TOTAL+' missions and jobs"><span class="sname">'+esc(name.toLowerCase())+'</span><div class="sbar"><i data-w="'+Math.round(n/TOTAL*100)+'"></i></div><span class="sval">'+n+'/'+TOTAL+'</span></div>';}).join('');
let slot=0;
$('#kit').innerHTML='<h3 class="sub-h">loadout</h3>'+Object.entries(KIT).map(([k,v])=>'<div class="lo-group"><span class="lo-name">'+esc(k.toLowerCase())+'</span><div class="tiles">'+v.map(s=>'<span class="tile"><b>'+(++slot)+'</b>'+esc(s)+'</span>').join('')+'</div></div>').join('');

/* ================= HUD: commits + wanted level ================= */
const COMMITS_FALLBACK=488; // public commits by BetterThanYou73 from the GitHub search API, Nov 2026 (used when the live call is blocked)
const commitEl=$('#commit-n');let commits=0;
function countTo(n){const from=commits;commits=n;if(reduce){commitEl.textContent=n.toLocaleString();return;}
  const t0=performance.now(),dur=1400;(function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);commitEl.textContent=Math.round(from+(n-from)*e).toLocaleString();if(p<1)requestAnimationFrame(f);})(t0);}
async function loadCommits(){
  try{const c=JSON.parse(store.get('mj-commits','null'));if(c&&Date.now()-c.t<3600e3){countTo(c.n);return;}}catch(e){}
  try{const r=await fetch('https://api.github.com/search/commits?q=author:BetterThanYou73&per_page=1',{headers:{Accept:'application/vnd.github+json'}});
    if(!r.ok)throw 0;const j=await r.json();if(typeof j.total_count!=='number')throw 0;store.set('mj-commits',JSON.stringify({n:j.total_count,t:Date.now()}));countTo(j.total_count);}
  catch(e){countTo(COMMITS_FALLBACK);}
}
let visits=1;
// every visit to the site from this browser counts, reloads included
try{visits=(+localStorage.getItem('mj-visits')||0)+1;localStorage.setItem('mj-visits',String(visits));}catch(e){visits=1;}
const wanted=clamp(visits-1,0,5);
function paintStars(fresh){const s=$('#stars');s.innerHTML='';for(let i=0;i<5;i++){const e=document.createElement('span');e.textContent='★';if(i<wanted)e.className='on'+(fresh&&i===wanted-1?' new':'');s.appendChild(e);}
  s.title='Wanted level '+wanted+'/5 · visit #'+visits+' from this browser. Come back to raise it.';s.setAttribute('aria-label','Wanted level '+wanted+' of 5');}
paintStars(visits>1);
function welcome(){if(visits<=1)return;
  if(wanted>=5)say('Maximum wanted level','Visit #'+visits+'. You keep coming back. At this point, just hire him.',7000);
  else say('Welcome back','Visit #'+visits+' from this browser. Wanted level is now '+wanted+' star'+(wanted>1?'s':'')+'.',6000);}

/* ================= router: separate pages with history ================= */
const PAGES={home:'Home',missions:'Missions',career:'Career',stats:'Stats',brief:'Brief',contact:'Contact'};
const page=$('#page'),urlEl=$('#url'),statusEl=$('#status'),bw=W['w-browser'];
let hist=[],hi=-1,cur=null,loadT;
function render(id,instant){
  $$('.pg').forEach(p=>{const on=p.dataset.page===id;p.hidden=!on;p.classList.remove('enter');});
  const pg=$('.pg[data-page="'+id+'"]');Array.from(pg.children).forEach((c,i)=>c.style.setProperty('--i',i));
  Array.from(pg.querySelectorAll('.wrap-p > *')).forEach((c,i)=>c.style.setProperty('--i',i));
  if(!Intro.on)arm(pg);
  requestAnimationFrame(()=>pg.querySelectorAll('.slab canvas').forEach(camoPaint));
  if(id==='career'&&$$('#log .sign-body').every(b=>b.hidden))openSign(0,true);
  page.scrollTop=0;cur=id;PhoneOS.sync();
  urlEl.textContent='https://manasjoshi.site'+(id==='home'?'/':'/'+id);
  setTitle(bw,PAGES[id]+' · Manas Joshi');document.title=PAGES[id]+' · Manas Joshi';
  $$('.site-nav .lnk').forEach(l=>l.setAttribute('aria-current',l.dataset.go===id?'page':'false'));
  $('#b-back').disabled=hi<=0;$('#b-fwd').disabled=hi>=hist.length-1;
  if(id==='stats')requestAnimationFrame(()=>$$('#bars i').forEach(b=>{b.style.width='0';requestAnimationFrame(()=>b.style.width=b.dataset.w+'%');}));
  if(id==='home'&&!Intro.on)showObjective();
}
function load(id,instant){clearTimeout(loadT);
  if(instant||reduce){render(id,true);statusEl.textContent='Document: Done';return;}
  bw.el.classList.add('loading');statusEl.textContent='Connecting to manasjoshi.site…';
  loadT=setTimeout(()=>{statusEl.textContent='Transferring data from manasjoshi.site…';
    loadT=setTimeout(()=>{bw.el.classList.remove('loading');render(id);statusEl.textContent='Document: Done';pageTip(id);},140);},160);}
function showObjective(){const o=$('.objective');if(!o)return;o.classList.remove('show');void o.offsetWidth;o.classList.add('show');}
const TIPS={
  missions:()=>['Mission select',isDesk?'Use ↑ ↓ to switch missions. Gold medals are the best ones.':'Tap a mission to open it. Gold medals are the best ones.'],
  career:()=>['Career log',isDesk?'Click a sign to read what I did there.':'Tap a sign to read what I did there.'],
  stats:()=>['Player stats','Each bar counts how many missions and jobs used that skill. No made-up percentages.'],
  contact:()=>['Business card',isDesk?'Drag the card to tilt it. Double-click to flip it. Press and hold to check the watermark.':'Drag the card to tilt it. Tap to flip it. Press and hold for the watermark.']};
function pageTip(id){if(!TIPS[id])return;const [t,m]=TIPS[id]();setTimeout(()=>tipOnce('page-'+id,t,m,7000),300);}
// Real paths (/missions, /stats…) kept in sync with the browser's own history,
// so the window's Back/Forward and the browser's Back/Forward do the same thing.
const PATH=id=>id==='home'?'/':'/'+id;
function go(id,instant,replace){if(!PAGES[id])id='home';if(id===cur&&!instant)return;
  if(replace){if(hi<0)hi=0;hist[hi]=id;}else{hist=hist.slice(0,hi+1);hist.push(id);hi=hist.length-1;}
  try{history[replace?'replaceState':'pushState']({id,i:hi},'',PATH(id));}catch(e){}
  load(id,instant);}
addEventListener('popstate',e=>{const s=e.state;const id=s&&PAGES[s.id]?s.id:routeFromURL();if(s&&typeof s.i==='number')hi=s.i;ensureBrowser();load(id);});
function routeFromURL(){
  const r=new URLSearchParams(location.search).get('r');if(r&&PAGES[r])return r;
  const seg=location.pathname.replace(/^\/+|\/+$/g,'').replace(/\.html$/,'').toLowerCase();if(PAGES[seg])return seg;
  const h=location.hash.slice(1);if(PAGES[h])return h;
  return 'home';}
$('#b-back').addEventListener('click',()=>{if(hi>0)history.back();});
$('#b-fwd').addEventListener('click',()=>{if(hi<hist.length-1)history.forward();});
$('#b-reload').addEventListener('click',()=>load(cur||'home'));
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(!g)return;e.preventDefault();ensureBrowser();go(g.dataset.go);});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(PAGES[id]&&id!==cur)go(id,false,true);});
page.addEventListener('mouseover',e=>{const a=e.target.closest('a[href],[data-go]');statusEl.textContent=a?(a.dataset.go?'https://manasjoshi.site/'+(a.dataset.go==='home'?'':a.dataset.go):a.href):'Document: Done';});
function ensureBrowser(){if(!isDesk)return;const w=W['w-browser'];if(w.state==='closed')openWin('w-browser');else if(w.state==='min')restore('w-browser');}

/* ================= phone OS: on phones the site is an in-game phone with apps ================= */
/* ---------- Snake '86: the phone-only game. Eat commits, don't hit the walls or yourself ---------- */
const Snake=(()=>{
  const cv=$('#sn-cv'),ctx=cv.getContext('2d'),msg=$('#sn-msg'),scoreEl=$('#sn-score'),bestEl=$('#sn-best'),N=16;
  let snake=[],dir={x:1,y:0},next=dir,food={x:10,y:8},score=0,best=+store.get('sn-best','0')||0,timer=null,state='title',speed=170,px=1;
  bestEl.textContent='best '+best;
  const open=()=>!$('#po-sheet').hidden&&!$('[data-sheet="snake"]').hidden;
  function size(){const r=cv.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,2);cv.width=Math.max(1,Math.round(r.width*d));cv.height=cv.width;px=cv.width/N;draw();}
  function reset(){snake=[{x:7,y:8},{x:6,y:8},{x:5,y:8}];dir={x:1,y:0};next=dir;score=0;speed=170;scoreEl.textContent='0';placeFood();}
  function placeFood(){do{food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};}while(snake.some(s=>s.x===food.x&&s.y===food.y));}
  function tickOn(){clearInterval(timer);timer=setInterval(step,speed);}
  function say2(t,s,cls){msg.className='sn-msg'+(cls?' '+cls:'');msg.innerHTML='<b>'+t+'</b><span>'+s+'</span>';msg.hidden=false;}
  function step(){dir=next;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some((s,i)=>i<snake.length-1&&s.x===h.x&&s.y===h.y)){die();return;}
    snake.unshift(h);
    if(h.x===food.x&&h.y===food.y){score++;scoreEl.textContent=score;Sfx.blip();placeFood();if(speed>75){speed-=6;tickOn();}}else snake.pop();
    draw();}
  function die(){state='over';clearInterval(timer);timer=null;Sfx.flip();
    if(score>best){best=score;store.set('sn-best',String(best));bestEl.textContent='best '+best;}
    say2('wasted',score+' commits · tap to respawn','lose');draw();}
  function begin(){reset();state='play';msg.hidden=true;tickOn();draw();}
  function resume(){state='play';msg.hidden=true;tickOn();}
  function poke(){if(state==='play')return;if(state==='paused')resume();else begin();}
  function turn(d){const m={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[d];if(!m)return;
    if(state!=='play'){poke();if(state!=='play')return;}if(m.x===-dir.x&&m.y===-dir.y)return;next=m;}
  function draw(){const w=cv.width;ctx.fillStyle='#0b0814';ctx.fillRect(0,0,w,w);
    ctx.strokeStyle='rgba(63,224,208,.09)';ctx.lineWidth=1;for(let i=1;i<N;i++){ctx.beginPath();ctx.moveTo(i*px,0);ctx.lineTo(i*px,w);ctx.moveTo(0,i*px);ctx.lineTo(w,i*px);ctx.stroke();}
    // food: a git commit
    const fx=(food.x+.5)*px,fy=(food.y+.5)*px;ctx.shadowColor='#7cc46a';ctx.shadowBlur=px*.6;ctx.strokeStyle='#7cc46a';ctx.lineWidth=px*.14;
    ctx.beginPath();ctx.arc(fx,fy,px*.22,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(fx-px*.45,fy);ctx.lineTo(fx-px*.22,fy);ctx.moveTo(fx+px*.22,fy);ctx.lineTo(fx+px*.45,fy);ctx.stroke();
    ctx.shadowColor='#ff5fa2';ctx.shadowBlur=px*.5;
    snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#ffd1ef':'#ff5fa2';const g=px*.08;ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(s.x*px+g,s.y*px+g,px-g*2,px-g*2,px*.22);else ctx.rect(s.x*px+g,s.y*px+g,px-g*2,px-g*2);ctx.fill();});
    ctx.shadowBlur=0;
    if(snake[0]){const h=snake[0];ctx.fillStyle='#2d0f28';const ex=dir.y!==0?.22:0,ey=dir.x!==0?.22:0;
      [[-1],[1]].forEach(([k])=>{ctx.beginPath();ctx.arc((h.x+.5+dir.x*.18+ex*k)*px,(h.y+.5+dir.y*.18+ey*k)*px,px*.08,0,7);ctx.fill();});}}
  // swipe anywhere on the board, or use the pad
  let sx=0,sy=0;const wrap=$('.sn-wrap');
  wrap.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(state==='play')e.preventDefault();},{passive:false});
  wrap.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<24){poke();return;}turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
  wrap.addEventListener('click',e=>{if(e.pointerType!=='touch')poke();});
  $$('.sn-pad [data-dir]').forEach(b=>b.addEventListener('click',()=>turn(b.dataset.dir)));
  addEventListener('keydown',e=>{if(!open())return;const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];
    if(d){e.preventDefault();turn(d);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();poke();}});
  reset();
  return {show(){size();if(state==='title')say2('snake ’86','swipe or use the pad · eat commits');else if(state==='paused')say2('paused','tap to keep going');},
    pause(){if(state==='play'){clearInterval(timer);timer=null;state='paused';}}};
})();

const PhoneOS=(()=>{
  const os=$('#phoneos'),bar=$('#appbar'),title=$('#ab-title'),homeBtn=$('#apphome'),radioApp=$('#po-radio'),sheet=$('#po-sheet');
  let about=false,wasLauncher=null,lastIcon=null,lastBg='#c9426a',sheetOpen=null;
  const NAMES={home:'about',missions:'projects',career:'experience',stats:'skills',brief:'education',contact:'contact'};
  const SHEETS={snake:"snake '86",notes:'notes',settings:'settings'};
  // apps grow out of their icon and shrink back into it, like a real phone
  const zoomEl=document.createElement('div');zoomEl.id='po-zoom';zoomEl.hidden=true;document.body.appendChild(zoomEl);
  const bgOf=i=>(i&&getComputedStyle(i).getPropertyValue('--bg').trim())||'#2a1238';
  const full=()=>({left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'});
  const at=i=>{const r=i.getBoundingClientRect();return {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'17px'};};
  function zoomOpen(icon,cb){if(reduce||!icon){cb();return;}lastIcon=icon;lastBg=bgOf(icon);zoomEl.style.background=lastBg;zoomEl.hidden=false;
    const a=zoomEl.animate([at(icon),full()],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    a.finished.then(()=>{cb();const f=zoomEl.animate([{opacity:1},{opacity:0}],{duration:240,fill:'forwards'});f.finished.then(()=>{zoomEl.hidden=true;a.cancel();f.cancel();});});}
  function zoomClose(){if(reduce||!lastIcon||os.hidden)return;zoomEl.style.background=lastBg;zoomEl.hidden=false;
    const a=zoomEl.animate([{...full(),opacity:1},{...at(lastIcon),opacity:.15}],{duration:300,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
    a.finished.then(()=>{zoomEl.hidden=true;a.cancel();});}
  function sync(){
    if(isDesk){os.hidden=true;bar.hidden=true;homeBtn.hidden=true;sheet.hidden=true;sheetOpen=null;wasLauncher=null;return;}
    if(cur!=='home')about=false;
    const launcher=cur==='home'&&!about;
    os.hidden=!launcher;bar.hidden=launcher;homeBtn.hidden=launcher&&!sheetOpen;title.textContent=NAMES[cur]||'';
    if(!launcher){const i=os.querySelector('[data-app="'+(about?'home':cur)+'"] i');if(i){lastIcon=i;lastBg=bgOf(i);}}
    if(wasLauncher===false&&launcher)zoomClose();
    wasLauncher=launcher;}
  function open(app,icon){
    if(app==='radio'){Radio.toggle();paintRadio();return;}
    if(app==='menu'){VC.show();return;}
    if(SHEETS[app]){openSheet(app,icon);return;}
    zoomOpen(icon,()=>{
      if(app==='home'){about=true;if(cur==='home'){sync();arm($('.pg[data-page="home"]'));showObjective();}else go('home');return;}
      about=false;go(app);});}
  function openSheet(name,icon){zoomOpen(icon,()=>{sheetOpen=name;sheet.hidden=false;homeBtn.hidden=false;$('#sh-title').textContent=SHEETS[name];
    $$('#po-sheet [data-sheet]').forEach(s=>s.hidden=s.dataset.sheet!==name);if(name==='snake')Snake.show();if(name==='settings')paintSettings();});}
  function closeSheet(){if(!sheetOpen)return;if(sheetOpen==='snake')Snake.pause();sheet.hidden=true;sheetOpen=null;homeBtn.hidden=true;zoomClose();}
  function toLauncher(){if(sheetOpen){closeSheet();return;}about=false;if(cur!=='home')go('home');else sync();}
  function paintRadio(){radioApp.classList.toggle('po-on',Radio.on);}
  function paintSettings(){$('#set-sfx .tg').classList.toggle('on',Sfx.enabled);$('#set-music .tg').classList.toggle('on',Radio.on);
    const v=+store.get('mj-visits','0')||0;$('#set-visits').textContent=v+(v===1?' visit':' visits');}
  sheet.addEventListener('click',e=>{const r=e.target.closest('[data-set]');if(!r)return;const k=r.dataset.set;
    if(k==='sfx')Sfx.toggle();
    if(k==='music'){Radio.toggle();paintRadio();}
    if(k==='intro'){closeSheet();Intro.run();return;}
    if(k==='wanted'){store.set('mj-visits','0');say('Wanted level cleared','The cops forgot about you. It starts again from zero on your next visit.',5000);}
    paintSettings();});
  os.addEventListener('click',e=>{const b=e.target.closest('[data-app]');if(b)open(b.dataset.app,b.querySelector('i'));});
  $('#ab-back').addEventListener('click',toLauncher);$('#sh-back').addEventListener('click',toLauncher);homeBtn.addEventListener('click',toLauncher);
  // mirror the commit counter and wanted stars into the home-screen widget and the app bar
  const commitSrc=$('#commit-n'),poC=$('#po-commits');new MutationObserver(()=>{poC.textContent=commitSrc.textContent;}).observe(commitSrc,{childList:true,characterData:true,subtree:true});
  const starsSrc=$('#stars');const copyStars=()=>{$('#po-stars').innerHTML=starsSrc.innerHTML;$('#ab-stars').innerHTML=starsSrc.innerHTML;};copyStars();
  const fmt=new Intl.DateTimeFormat('en-CA',{hour:'numeric',minute:'2-digit',timeZone:'America/Edmonton'});
  const tickP=()=>{$('#po-time').textContent=fmt.format(new Date()).replace(/\s?[ap]\.?m\.?/i,'');};tickP();setInterval(tickP,15000);
  return {sync,paintRadio};
})();

/* ================= business card (eggshell) ================= */
(function(){
  const card=$('#card');let flipped=false,rx=0,ry=0,drag=null,hold=null,moved=false,wmT,wmSaid=false,t0=0,ptype='mouse';
  function apply(){card.style.transform='rotateX('+rx.toFixed(2)+'deg) rotateY('+(ry+(flipped?180:0)).toFixed(2)+'deg)';card.style.setProperty('--mx',(50+ry*3)+'%');card.style.setProperty('--my',(40-rx*3)+'%');}
  function flip(){flipped=!flipped;card.classList.toggle('flipped',flipped);apply();Sfx.flip();
    if(flipped)tipOnce('card-back','Flip side','The back has my links. Pick one.',5000);}
  card.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;e.preventDefault();ptype=e.pointerType;t0=performance.now();drag={x:e.clientX,y:e.clientY};moved=false;card.classList.add('dragging');try{card.setPointerCapture(e.pointerId);}catch(_){}
    clearTimeout(hold);hold=setTimeout(()=>{if(!moved&&!flipped){card.classList.add('wm-on');if(!wmSaid){wmSaid=true;say('Watermark','MJ, pressed into the stock. Of course it has a watermark.',4500);}}},650);});
  card.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6){moved=true;clearTimeout(hold);}ry=clamp(dx*.12,-18,18);rx=clamp(-dy*.12,-14,14);apply();});
  const end=()=>{if(!drag)return;const tap=!moved&&ptype!=='mouse'&&performance.now()-t0<300;drag=null;clearTimeout(hold);card.classList.remove('dragging');rx=ry=0;apply();clearTimeout(wmT);wmT=setTimeout(()=>card.classList.remove('wm-on'),1400);if(tap)flip();};
  card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
  card.addEventListener('dblclick',e=>{if(ptype==='mouse'&&!e.target.closest('a,button')){const s=getSelection&&getSelection();if(s)s.removeAllRanges();flip();}});
  card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();flip();}});
  $$('[data-copy]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const v=b.dataset.copy,old=b.textContent;
    const ok=()=>{b.textContent='Copied';setTimeout(()=>b.textContent=old,1400);};
    try{navigator.clipboard.writeText(v).then(ok,()=>say('Email',v,8000));}catch(_){say('Email',v,8000);}}));
  apply();
})();

/* ================= hidden classic main menu (Esc / triple-tap MJ) ================= */
const VC=(()=>{
  const root=$('#vcm'),ul=root.querySelector('.vc-items'),title=root.querySelector('.vc-title'),hint=root.querySelector('.vc-hint'),sayEl=root.querySelector('.vc-say'),black=root.querySelector('.vc-black');
  let view='main',sel=0,list=[],lastFocus=null;
  const TITLES={main:'main menu',options:'options',quit:'quit game'};
  function items(){
    if(view==='options')return [['music: '+(Radio.on?'on':'off'),'MJ FM synth radio','music'],['sounds: '+(Sfx.enabled?'on':'off'),'logo, chimes and window sounds','sfx'],['back','return to the main menu','to:main']];
    if(view==='quit')return [['no','stay and keep looking','to:main'],['yes','close the portfolio window','quit']];
    return [['resume','back to the site','close'],['start game','projects','go:missions'],['career','experience','go:career'],['stats','skills','go:stats'],['brief','education','go:brief'],['phone','contact','go:contact'],['options','music','to:options'],['quit game','close the portfolio','to:quit']];}
  function camo(){camoPaint(root.querySelector('canvas'));}
  function camoUnused(){const c=root.querySelector('canvas');const r=c.getBoundingClientRect();const Wd=Math.max(2,Math.round(r.width/2)),Hd=Math.max(2,Math.round(r.height/2));
    c.width=Wd;c.height=Hd;const x=c.getContext('2d');const rand=rng(23);
    function layer(cell,alpha){const n=document.createElement('canvas');n.width=Math.ceil(Wd/cell)+2;n.height=Math.ceil(Hd/cell)+2;const nx=n.getContext('2d');const d=nx.createImageData(n.width,n.height);
      for(let i=0;i<d.data.length;i+=4){const v=rand()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}
      nx.putImageData(d,0,0);x.globalAlpha=alpha;x.imageSmoothingEnabled=true;x.drawImage(n,-cell,-cell,n.width*cell,n.height*cell);}
    layer(13,1);layer(5,.45);x.globalAlpha=1;const img=x.getImageData(0,0,Wd,Hd),p=img.data;
    for(let i=0;i<p.length;i+=4){const on=p[i]>134;p[i]=on?121:88;p[i+1]=on?115:82;p[i+2]=on?129:96;p[i+3]=255;}x.putImageData(img,0,0);}
  const btns=()=>ul.querySelectorAll('button');
  function select(i){sel=i;btns().forEach((b,j)=>b.setAttribute('aria-current',j===i?'true':'false'));
    hint.innerHTML='';const b=document.createElement('b');b.textContent=list[i][0];hint.append(b,' · '+list[i][1]);hint.append(document.createElement('br'),isDesk?'↑ ↓ select · enter confirm · esc close':'tap an item');}
  function draw(refocus){list=items();title.textContent=TITLES[view];ul.innerHTML='';
    list.forEach((it,i)=>{const li=document.createElement('li');li.setAttribute('role','none');const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.textContent=it[0];
      b.addEventListener('pointerenter',()=>select(i));b.addEventListener('focus',()=>select(i));b.addEventListener('click',()=>act(i));li.appendChild(b);ul.appendChild(li);});
    sayEl.textContent=view==='quit'?'Are you sure you want to quit? Unsaved progress will be lost.':'';
    select(Math.min(sel,list.length-1));if(refocus)btns()[sel].focus({preventScroll:true});}
  function act(i){const a=list[i][2];
    if(a==='close')return hide();
    if(a.startsWith('to:')){view=a.slice(3);sel=0;draw(true);return;}
    if(a.startsWith('go:')){hide();ensureBrowser();go(a.slice(3));return;}
    if(a==='music'){Radio.toggle();draw(true);return;}
    if(a==='sfx'){Sfx.toggle();draw(true);return;}
    if(a==='quit'){black.textContent='saving is for quitters.';black.classList.add('on');
      setTimeout(()=>{black.classList.remove('on');hide();if(isDesk)closeWin('w-browser');else go('home');},reduce?600:1500);}}
  function show(){if(!root.hidden)return;lastFocus=document.activeElement;menu(false);root.classList.toggle('phone',innerWidth<760);root.hidden=false;view='main';sel=0;
    requestAnimationFrame(()=>{camo();draw(true);});}
  function hide(){if(root.hidden)return;root.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}
  root.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();btns()[(sel+(e.key==='ArrowDown'?1:-1)+list.length)%list.length].focus({preventScroll:true});}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(view!=='main'){view='main';sel=0;draw(true);}else hide();}});
  return {show,hide,get open(){return !root.hidden;}};
})();
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||VC.open||Intro.on)return;
  if(!sm.hidden){menu(false);startBtn.focus();return;}
  if(!$('#shut').hidden)return;
  VC.show();});
let taps=[];
$('#mj-mark').addEventListener('click',()=>{const now=performance.now();taps=taps.filter(t=>now-t<700);taps.push(now);if(taps.length>=3){taps=[];VC.show();}});

/* ================= HESOYAM ================= */
let buf='';
addEventListener('keydown',e=>{if(e.key.length!==1)return;buf=(buf+e.key.toUpperCase()).slice(-7);
  if(buf==='HESOYAM'){buf='';countTo(commits+250000);const sw=W['w-game'].state==='open'&&Sweeper.cheat();
    say('Cheat activated',sw?'+250,000 commits (not real ones), and every bug in Bugsweeper flagged.':'+250,000 commits. Not real ones. Reload to undo.',5000);}});

/* ================= custom cursor: leans as it moves, pink on hover, reticle on missions ================= */
(function(){
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const el=document.createElement('div');el.id='cur';el.hidden=true;el.setAttribute('aria-hidden','true');
  const P='M5 5v20l5-4.6 3.6 8 3.4-1.5-3.5-7.8h7z';
  el.innerHTML='<svg class="arrow" viewBox="0 0 26 32" width="26" height="32"><path d="'+P+'" fill="rgba(0,0,0,.4)" transform="translate(3 3)"/><path class="fill" d="'+P+'" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>'+
    '<svg class="ret" viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="11" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 2v9M20 29v9M2 20h9M29 20h9" stroke="#fff" stroke-width="2"/><circle cx="20" cy="20" r="2" fill="#ff5a5a"/></svg>';
  document.body.appendChild(el);
  const arrow=el.querySelector('.arrow');
  let x=-100,y=-100,px=x,lean=0,scale=1,raf=0,pressed=false,big=0,lastDir=0,flips=[];
  const on=()=>fine.matches&&isDesk;
  function apply(){document.documentElement.classList.toggle('has-cur',on());if(!on())el.hidden=true;}
  function tick(){raf=0;const dx=x-px;px=x;
    if(!reduce)lean+=(clamp(dx*1.6,-30,30)-lean)*.25;else lean=0;
    const s=(big>performance.now()?2.6:1)*(pressed?.82:1);scale+=(s-scale)*.3;
    el.style.transform='translate3d('+x+'px,'+y+'px,0)';arrow.style.transform='rotate('+lean.toFixed(2)+'deg) scale('+scale.toFixed(3)+')';
    if(Math.abs(lean)>.1||Math.abs(s-scale)>.01||dx!==0)raf=requestAnimationFrame(tick);}
  const kick=()=>{if(!raf)raf=requestAnimationFrame(tick);};
  addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!on())return;el.hidden=false;x=e.clientX;y=e.clientY;
    const d=Math.sign(e.movementX||0),now=performance.now();
    if(!reduce&&d&&d!==lastDir&&Math.abs(e.movementX)>10){flips.push(now);flips=flips.filter(t=>now-t<700);if(flips.length>=6){big=now+1200;flips=[];setTimeout(kick,1250);}}
    if(d)lastDir=d;kick();},{passive:true});
  document.addEventListener('pointerover',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;const aim=!!t.closest('[data-aim]');
    el.classList.toggle('aim',aim);el.classList.toggle('hot',!aim&&!!t.closest('a,button,summary,[role="menuitem"],[data-go],.card3d'));});
  document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||!on())return;pressed=true;kick();
    if(!reduce){const r=document.createElement('div');r.className='cur-ring';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),500);}},true);
  addEventListener('pointerup',()=>{pressed=false;kick();});
  document.addEventListener('mouseout',e=>{if(!e.relatedTarget)el.hidden=true;});
  if(fine.addEventListener)fine.addEventListener('change',apply);
  deskMQ.addEventListener&&deskMQ.addEventListener('change',()=>setTimeout(apply,0));
  apply();
})();

/* ================= boot ================= */
function layout(){
  isDesk=deskMQ.matches;document.documentElement.classList.toggle('solo',!isDesk);
  if(!isDesk){const w=W['w-browser'];w.el.hidden=false;w.state='open';if(cur)PhoneOS.sync();return;}
  wallpaper();
  Object.values(W).forEach(w=>{if(w.state==='open'&&!w.rect){w.rect=DEF[w.id](area());addTask(w);}if(w.rect)clampRect(w);if(w.state==='open')place(w);});
  focusTop();if(cur)PhoneOS.sync();
}
deskMQ.addEventListener&&deskMQ.addEventListener('change',layout);
let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(layout,120);});
layout();
const startPage=routeFromURL();
go(startPage,true,true);
Intro.run().then(()=>{
  loadCommits();Sfx.chime();arm($('.pg[data-page="'+cur+'"]'));
  const hello=()=>{if(visits>1)welcome();else say('Welcome to Vice OS 86',isDesk?'This is the portfolio. Try minimize or close, or press Esc for the classic menu.':'This is the portfolio. Tap the MJ logo three times for the classic menu.',8000);
    setTimeout(()=>pageTip(cur),visits>1?6500:8500);};
  if(isDesk)openWin('w-browser').then(()=>{if(cur==='home')showObjective();setTimeout(hello,reduce?0:400);});
  else{if(cur==='home')showObjective();hello();}
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(isDesk)wallpaper();});
})();
