/* ═══════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════ */
const CUR=document.getElementById('CUR'), CURR=document.getElementById('CUR_R');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  CUR.style.left=mx+'px';CUR.style.top=my+'px';
});
(function trail(){
  rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
  CURR.style.left=rx+'px';CURR.style.top=ry+'px';
  requestAnimationFrame(trail);
})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>{CUR.style.transform='translate(-50%,-50%) scale(2.5)';CUR.style.background='var(--c3)';CURR.style.opacity='0'});
  el.addEventListener('mouseleave',()=>{CUR.style.transform='translate(-50%,-50%) scale(1)';CUR.style.background='var(--c1)';CURR.style.opacity='1'});
});

/* ═══════════════════════════════════════════
   SCROLL PROGRESS + NAV BLUR
═══════════════════════════════════════════ */
const pbar=document.getElementById('pbar');
const tnav=document.getElementById('topnav');
window.addEventListener('scroll',()=>{
  const pct=window.scrollY/(document.body.scrollHeight-window.innerHeight)*100;
  pbar.style.width=pct+'%';
  tnav.classList.toggle('scrolled',window.scrollY>60);
},{passive:true});

/* ═══════════════════════════════════════════
   HERO CANVAS — MATRIX DATA RAIN + PARTICLES
═══════════════════════════════════════════ */
const hc=document.getElementById('hero-c');
const hx=hc.getContext('2d');
let HW,HH;
function resizeH(){HW=hc.width=window.innerWidth;HH=hc.height=window.innerHeight}
resizeH();window.addEventListener('resize',resizeH);

const AI_CHARS='01∑∇∂αβγδεζλμπστωABCDEFMLAI→←∫∮'.split('');
const COL_W=22;
const cols=[];
function initCols(){cols.length=0;for(let x=0;x<Math.floor(HW/COL_W);x++)cols.push({y:Math.random()*-80,speed:Math.random()*.4+.2,bright:Math.random()>.88})}
initCols();window.addEventListener('resize',initCols);

const PARTS=Array.from({length:70},()=>({
  x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
  vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,
  r:Math.random()*1.2+.3,
  c:Math.random()>.55?'0,255,225':Math.random()>.5?'94,43,255':'255,37,82',
  a:Math.random()*.4+.08
}));

let hmx=window.innerWidth/2,hmy=window.innerHeight/2;
document.addEventListener('mousemove',e=>{hmx=e.clientX;hmy=e.clientY});

function drawHero(){
  // Slow fade for trail effect
  hx.fillStyle='rgba(2,4,9,.14)';
  hx.fillRect(0,0,HW,HH);

  // Matrix rain
  hx.font=`12px 'JetBrains Mono',monospace`;
  cols.forEach((col,i)=>{
    const ch=AI_CHARS[Math.floor(Math.random()*AI_CHARS.length)];
    const x=i*COL_W, y=col.y*14;
    const alpha=col.bright?Math.random()*.25+.08:Math.random()*.12+.03;
    hx.fillStyle=`rgba(0,255,225,${alpha})`;
    hx.fillText(ch,x,y);
    if(y>HH&&Math.random()>.97)col.y=0;
    col.y+=col.speed;
  });

  // Particles
  PARTS.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>HW)p.vx*=-1;
    if(p.y<0||p.y>HH)p.vy*=-1;
    hx.beginPath();hx.arc(p.x,p.y,p.r,0,Math.PI*2);
    hx.fillStyle=`rgba(${p.c},${p.a})`;hx.fill();
    const dx=p.x-hmx,dy=p.y-hmy,d=Math.sqrt(dx*dx+dy*dy);
    if(d<190){
      hx.beginPath();hx.moveTo(p.x,p.y);hx.lineTo(hmx,hmy);
      hx.strokeStyle=`rgba(0,255,225,${.18*(1-d/190)})`;
      hx.lineWidth=.7;hx.stroke();
    }
  });
  // Mouse glow
  const mg=hx.createRadialGradient(hmx,hmy,0,hmx,hmy,80);
  mg.addColorStop(0,'rgba(0,255,225,.06)');mg.addColorStop(1,'transparent');
  hx.fillStyle=mg;hx.fillRect(hmx-80,hmy-80,160,160);

  requestAnimationFrame(drawHero);
}
drawHero();

/* ═══════════════════════════════════════════
   NEURAL NET CANVAS
═══════════════════════════════════════════ */
const nnC=document.getElementById('nn-c');
const nnX=nnC.getContext('2d');
let nnT=0;

const LAYERS=[
  {label:'INPUT',nodes:4,cols:['#00ffe1','#00ffe1','#00ffe1','#00ffe1'],names:['Token 1','Token 2','Token 3','Token N']},
  {label:'EMBEDDING',nodes:5,cols:Array(5).fill('#5e2bff'),names:['Dim 1','Dim 2','Dim 3','Dim 4','Dim 5']},
  {label:'ATTENTION',nodes:7,cols:Array(7).fill('#00ffe1'),names:['Head 1','Head 2','Head 3','Head 4','Head 5','Head 6','Head 7']},
  {label:'FEED FWD',nodes:7,cols:Array(7).fill('#5e2bff'),names:[]},
  {label:'HIDDEN',nodes:5,cols:Array(5).fill('#ff2552'),names:[]},
  {label:'OUTPUT',nodes:3,cols:['#ffc700','#ffc700','#ffc700'],names:['NLP','CV','MLOps']},
];

let nnNodes=[];
function buildNN(){
  nnC.width=nnC.offsetWidth||1200;
  nnC.height=280;
  const W=nnC.width,H=nnC.height;
  nnNodes=LAYERS.map((layer,li)=>{
    const x=W/(LAYERS.length+1)*(li+1);
    return layer.nodes===0?[]:(()=>{
      const nodeH=H/(layer.nodes+1);
      return Array.from({length:layer.nodes},(_,ni)=>({
        x,y:nodeH*(ni+1),color:layer.cols[ni]||'#00ffe1',name:layer.names[ni]||''
      }));
    })();
  });
}

function drawNN(){
  if(!nnC.offsetWidth)return;
  if(!nnNodes.length)buildNN();
  const W=nnC.width,H=nnC.height;
  nnX.clearRect(0,0,W,H);

  // Connections
  for(let li=0;li<nnNodes.length-1;li++){
    nnNodes[li].forEach(fn=>{
      nnNodes[li+1].forEach(tn=>{
        const pulse=(Math.sin(nnT*.035+(fn.y+tn.x)*.009)+1)*.5;
        nnX.beginPath();nnX.moveTo(fn.x,fn.y);nnX.lineTo(tn.x,tn.y);
        nnX.strokeStyle=`rgba(0,255,225,${.025+pulse*.06})`;
        nnX.lineWidth=.6;nnX.stroke();
      });
    });
  }

  // Layer labels
  LAYERS.forEach((layer,li)=>{
    if(!nnNodes[li].length)return;
    const x=nnNodes[li][0].x;
    nnX.fillStyle=li===0?'rgba(0,255,225,.5)':li===5?'rgba(255,199,0,.5)':'rgba(255,255,255,.2)';
    nnX.font=`bold 8px 'JetBrains Mono',monospace`;nnX.textAlign='center';
    nnX.fillText(layer.label,x,H-6);
  });

  // Traveling signals
  for(let li=0;li<nnNodes.length-1;li++){
    const fromL=nnNodes[li],toL=nnNodes[li+1];
    if(!fromL.length||!toL.length)continue;
    const fi=Math.floor(nnT*.18+li*3.7)%fromL.length;
    const ti=Math.floor(nnT*.14+li*2.3)%toL.length;
    const prog=((nnT*.025+li*.55)%1);
    const sx=fromL[fi].x+(toL[ti].x-fromL[fi].x)*prog;
    const sy=fromL[fi].y+(toL[ti].y-fromL[fi].y)*prog;
    const sg=nnX.createRadialGradient(sx,sy,0,sx,sy,7);
    sg.addColorStop(0,'rgba(255,255,255,.9)');sg.addColorStop(.4,fromL[fi].color+'99');sg.addColorStop(1,'transparent');
    nnX.beginPath();nnX.arc(sx,sy,7,0,Math.PI*2);nnX.fillStyle=sg;nnX.fill();
    nnX.beginPath();nnX.arc(sx,sy,2.5,0,Math.PI*2);nnX.fillStyle='#fff';nnX.fill();
  }

  // Nodes
  nnNodes.forEach((layer)=>{
    layer.forEach(n=>{
      const pulse=(Math.sin(nnT*.07+n.x*.015+n.y*.008)+1)*.5;
      const r=4+pulse*2.5;
      // glow
      const g=nnX.createRadialGradient(n.x,n.y,0,n.x,n.y,r*3.5);
      g.addColorStop(0,n.color+'55');g.addColorStop(1,'transparent');
      nnX.beginPath();nnX.arc(n.x,n.y,r*3.5,0,Math.PI*2);nnX.fillStyle=g;nnX.fill();
      // core
      nnX.beginPath();nnX.arc(n.x,n.y,r,0,Math.PI*2);nnX.fillStyle=n.color;nnX.fill();
      // label
      if(n.name&&W>500){
        nnX.fillStyle='rgba(255,255,255,.35)';
        nnX.font=`8px 'JetBrains Mono',monospace`;nnX.textAlign='center';
        nnX.fillText(n.name,n.x,n.y-r-5);
      }
    });
  });

  nnT++;requestAnimationFrame(drawNN);
}
window.addEventListener('resize',buildNN);
setTimeout(()=>{buildNN();drawNN();},200);

/* ═══════════════════════════════════════════
   CONTACT CANVAS — OSCILLATING WAVEFORMS
═══════════════════════════════════════════ */
const cc=document.getElementById('contact-c');
const cx=cc.getContext('2d');
let wt=0;
function resizeContact(){cc.width=cc.offsetWidth||window.innerWidth;cc.height=cc.offsetHeight||window.innerHeight}
resizeContact();window.addEventListener('resize',resizeContact);
function drawContact(){
  const W=cc.offsetWidth,H=cc.offsetHeight;
  if(cc.width!==W||cc.height!==H){cc.width=W;cc.height=H;}
  cx.clearRect(0,0,W,H);
  [[0,255,225,.1],[94,43,255,.07],[255,37,82,.05]].forEach(([r,g,b,a],wi)=>{
    cx.beginPath();
    for(let x=0;x<=W;x++){
      const y=H/2+Math.sin((x*.006)+(wt*.02)+(wi*1.3))*70+
                    Math.sin((x*.018)+(wt*.04)+(wi*.9))*30+
                    Math.sin((x*.04)+(wt*.015))*15;
      x===0?cx.moveTo(x,y):cx.lineTo(x,y);
    }
    cx.strokeStyle=`rgba(${r},${g},${b},${a})`;cx.lineWidth=1.5;cx.stroke();
  });
  wt++;requestAnimationFrame(drawContact);
}
drawContact();

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')});
},{threshold:.1,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

// Cinematic word-by-word
const wordObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.cine-word').forEach((w,i)=>{
        setTimeout(()=>w.classList.add('in'),i*120);
      });
    }
  });
},{threshold:.2});
document.querySelectorAll('.cine-block').forEach(el=>wordObs.observe(el));

/* ═══════════════════════════════════════════
   EXP CARDS — top bar trigger
═══════════════════════════════════════════ */
const cardObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')});
},{threshold:.15});
document.querySelectorAll('.exp-card').forEach(el=>cardObs.observe(el));

/* ═══════════════════════════════════════════
   SIDE NAV + TOP NAV ACTIVE
═══════════════════════════════════════════ */
const sideItems=document.querySelectorAll('.si');
const topLinks=document.querySelectorAll('.nlinks a');
const secObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id=entry.target.id;
      sideItems.forEach(a=>a.classList.toggle('act',a.dataset.s===id));
      topLinks.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+id));
    }
  });
},{threshold:.35});
document.querySelectorAll('section[id]').forEach(s=>secObs.observe(s));