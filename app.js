/* ================================================================
   MISI HIDUP FAREL v3.0 — Life OS
   4 tab: Home | Deck | Stats | Badges
   Tree 4 level: Drive Utama -> Drive Besar -> Bidang -> Planner
   TO = drive bidang SEJAJAR (bukan nempel di tiap bidang)
   Data: localStorage auto-save + Export/Import JSON
   ================================================================ */
'use strict';

/* ---------------- Utils ---------------- */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const p2=n=>String(n).padStart(2,'0');
const fmt=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const todayStr=()=>fmt(new Date());
const DAYS=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAYS3=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const MONTHS=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function niceDate(s){if(!s)return'—';const d=new Date(s+'T00:00:00');if(isNaN(d))return s;return DAYS[d.getDay()]+', '+d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();}
function daysLeft(s){return Math.round((new Date(s+'T00:00:00')-new Date(todayStr()+'T00:00:00'))/864e5);}
function durJam(a,b){if(!a||!b)return 0;const x=a.split(':'),y=b.split(':');let t=(+y[0]*60+(+y[1]))-(+x[0]*60+(+x[1]));if(t<0)t+=1440;return t/60;}
function weekStart(d){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
function isoWeek(t){const d=new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()));d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)+3);const f=new Date(Date.UTC(d.getUTCFullYear(),0,4));f.setUTCDate(f.getUTCDate()-((f.getUTCDay()+6)%7)+3);return 1+Math.round((d-f)/6048e5);}
const weekKeyNow=()=>{const w=weekStart(new Date());return w.getFullYear()+'-W'+p2(isoWeek(w));};
const monthKeyNow=()=>todayStr().slice(0,7);
function weekLabelOf(ws){const a=new Date(ws+'T00:00:00');const b=new Date(a.getTime()+6*864e5);const f=d=>d.getDate()+' '+MONTHS[d.getMonth()];return f(a)+' – '+f(b)+' '+b.getFullYear();}
const monthLabelOf=k=>{const y=+k.slice(0,4),m=+k.slice(5,7);return MONTHS[m-1]+' '+y;};
function rangeOf(period){const n=new Date();
 if(period==='day')return[todayStr(),todayStr()];
 if(period==='week'){const a=fmt(weekStart(n));const b=fmt(new Date(weekStart(n).getTime()+6*864e5));return[a,b];}
 if(period==='month'){const a=n.getFullYear()+'-'+p2(n.getMonth()+1)+'-01';const b=fmt(new Date(n.getFullYear(),n.getMonth()+1,0));return[a,b];}
 const y=n.getFullYear();return[y+'-01-01',y+'-12-31'];}
const yesterdayStr=()=>{const d=new Date();d.setDate(d.getDate()-1);return fmt(d);};

/* ---------------- Bank ide hukuman ---------------- */
const PUNISH=[
 ['💸 Finansial',['Setor Rp25.000 ke orang tua, tidak boleh diminta balik','Traktir satu teman makan siang (min. Rp30.000)','Belikan sesuatu untuk adik/keluarga — bukan untuk dirimu sendiri','Tabung Rp50.000 ke rekening khusus "dana gagal"']],
 ['⏰ Waktu & Tubuh',['Bangun jam 04.00 selama 3 hari berturut-turut','Lari 3 km besok pagi SEBELUM belajar','Hapus 1 aplikasi game, baru install lagi setelah target tercapai','No HP & media sosial 24 jam penuh']],
 ['📚 Belajar Ekstra',['Ulang materi minggu ini dari nol + 1 paket latsol tambahan','Tulis rangkuman tangan 5 halaman tentang materi yang terlewat','Kerjakan 1 try out tambahan di hari libur','Bikin flashcard 20 kartu dari materi yang kamu bolongi']],
 ['📣 Sosial',['Lapor jujur ke penjaga komitmen & jalani konsekuensi yang disepakati','Posting story jujur: "Minggu ini saya gagal komitmen, evaluasi diri"','Minta sahabat mengecek progres setiap malam selama 1 minggu','Ceritakan ke orang tua target minggu ini yang gagal + alasannya']]
];

/* ---------------- Seed ---------------- */
function seed(){return {
 version:3,
 lifeGoal:{
  fiveTitle:'S2 ke Luar Negeri (beasiswa penuh)',
  fiveDesc:'Lulus ITB → IPK tinggi → IELTS 7.0 → beasiswa S2. Setiap sesi belajar hari ini menambah persentase mimpi ini.',
  dep:'UNNES (sekarang) → UTBK ulang → ITB → S2 Luar Negeri',
  year:'2027: Lolos ITB, IELTS 7.0, IPK 4.0 semester 1',
  month:'September: selesaikan PK & PBM Bab 1–3, IELTS Reading 7.0, semua PR tepat waktu'
 },
 drives:[
  {id:'utbk',icon:'🎓',title:'Lolos UTBK',target:'Masuk ITB 2027 — skor 750+',
   punishment:{text:'Traktir 3 teman + setor Rp50.000 ke Ibu',keeper:'Ibu'},subs:[
    {id:'pk',title:'PK — Penalaran Kuantitatif',targetJam:9,
     routine:{days:['Senin','Kamis'],fases:[
      {name:'Pagi',mulai:'06:00',selesai:'08:00',fokus:'Materi baru'},
      {name:'Siang',mulai:'13:00',selesai:'15:00',fokus:'Latsol'},
      {name:'Malam',mulai:'19:00',selesai:'21:00',fokus:'Review'}]},
     punishment:'',
     planColumns:['Big Book PK','Bank Soal Alpha'],
     plan:[{id:uid(),tanggal:'2026-09-28',deadline:'2026-10-02',materi:'Eksponen & Logaritma',latsols:[{nama:'Big Book PK',jumlah:20},{nama:'Alpha',jumlah:15}],done:false,catatan:''}]},
    {id:'ppu',title:'PPU — Pengetahuan Umum',targetJam:4,
     routine:{days:['Selasa'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},
     punishment:'',planColumns:['Latsol 1'],plan:[],},
    {id:'pbm',title:'PBM — Pemahaman Bacaan',targetJam:6,
     routine:{days:['Rabu','Sabtu'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},
     punishment:'',planColumns:['Latsol 1'],
     plan:[{id:uid(),tanggal:'2026-09-25',deadline:'2026-09-27',materi:'Inference & Main Idea',latsols:[{nama:'Bank Soal PBM',jumlah:30}],done:false,catatan:''}]},
    {id:'pu',title:'PU — Penalaran Umum',targetJam:4,routine:{days:['Jumat'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},punishment:'',planColumns:['Latsol 1'],plan:[]},
    {id:'pm',title:'PM — Penalaran Matematika',targetJam:6,routine:{days:['Minggu'],fases:[{name:'Pagi',mulai:'08:00',selesai:'11:00',fokus:''}]},punishment:'',planColumns:['Latsol 1'],plan:[]},
    {id:'to',title:'Try Out',kind:'to',toTarget:750,toRecords:[
      {id:uid(),tanggal:'2026-09-20',nama:'TO #1',skor:612,total:{benar:58,salah:52,kosong:0},
       perSubtes:{pk:{b:12,s:8},ppu:{b:10,s:10},pbm:{b:14,s:6},pu:{b:9,s:11},pm:{b:13,s:7}}}]}]},
  {id:'ielts',icon:'🌍',title:'IELTS 7.0+',target:'Overall 7.0 (min. 6.5 tiap band)',
   punishment:{text:'No YouTube 3 hari + speaking practice 2x sehari',keeper:'Sahabat'},subs:[
    {id:'reading',title:'Reading',targetJam:5,routine:{days:['Senin','Kamis'],fases:[{name:'Pagi',mulai:'06:00',selesai:'08:00',fokus:''}]},punishment:'',planColumns:['Cambridge'],plan:[
      {id:uid(),tanggal:'2026-09-26',deadline:'2026-09-29',materi:'Cambridge 18 Test 1',latsols:[{nama:'C18 T1',jumlah:40}],done:false,catatan:''}]},
    {id:'listening',title:'Listening',targetJam:4,routine:{days:['Selasa','Jumat'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},punishment:'',planColumns:['Cambridge'],plan:[]},
    {id:'speaking',title:'Speaking',targetJam:3,routine:{days:['Rabu'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},punishment:'',planColumns:['Practice'],plan:[]},
    {id:'writing',title:'Writing',targetJam:4,routine:{days:['Sabtu'],fases:[{name:'Pagi',mulai:'08:00',selesai:'10:00',fokus:''}]},punishment:'',planColumns:['Task'],plan:[]}]},
  {id:'ipk',icon:'📚',title:'IPK 4.0 Semester 1',target:'Semua mata kuliah dapat A',
   punishment:{text:'Setor Rp50.000 + rangkum ulang materi 10 halaman',keeper:'Orang tua'},subs:[
    {id:'kalkulus',title:'Kalkulus',targetJam:6,routine:{days:['Senin','Kamis'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},punishment:'',planColumns:['Latihan'],plan:[]},
    {id:'fisika',title:'Fisika Dasar',targetJam:4,routine:{days:['Selasa'],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},punishment:'',planColumns:['Latihan'],plan:[]}]}
 ],
 goals:{daily:[{id:uid(),text:'Baca Bab 1 PK + 35 soal',done:false},{id:uid(),text:'Review flashcard 32 kartu',done:false}],
        weekly:[{id:uid(),text:'Selesaikan 1 paket TO mini',done:false}],
        monthly:[{id:uid(),text:'Tuntas PK Bab 1–3',done:false}],
        yearly:[{id:uid(),text:'Lolos UTBK 2027 skor 750+',done:false}]},
 habits:[
  {id:uid(),title:'Bangun 04.00',driveId:'utbk',log:{}},
  {id:uid(),title:'1 paket latsol PK',driveId:'pk',log:{}},
  {id:uid(),title:'Review flashcard',driveId:'ielts',log:{}}],
 daily:[
  {id:uid(),date:'2026-09-25',driveId:'utbk',subId:'pk',mulai:'04:00',selesai:'06:00',kegiatan:'Eksponen — materi + Big Book PK',done:false},
  {id:uid(),date:'2026-09-25',driveId:'utbk',subId:'pbm',mulai:'18:30',selesai:'21:00',kegiatan:'Inference — baca + 30 soal',done:false}],
 assignments:[
  {id:uid(),driveId:'ipk',matkul:'Kalkulus',tugas:'Latihan Bab 2 no 1-20',deadline:'2026-09-28',done:false},
  {id:uid(),driveId:'ipk',matkul:'Fisika Dasar',tugas:'Tugas / PR minggu ini',deadline:'2026-10-01',done:false}],
 history:{weeks:{},months:{}},
 meta:{weekKey:weekKeyNow(),weekStart:fmt(weekStart(new Date())),monthKey:monthKeyNow(),streak:0,lastStudyDate:''}
};}

/* ---------------- Load / save ---------------- */
const LS='mhf_v3_data';
let S;
function load(){try{const r=localStorage.getItem(LS);if(r){S=JSON.parse(r);return;}}catch(e){}S=seed();}
let saveT=null;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}},150);}

/* ---------------- Lookup helpers ---------------- */
const driveById=id=>S.drives.find(d=>d.id===id);
function subById(did,sid){const d=driveById(did);if(!d)return[null,null];return[d,d.subs.find(s=>s.id===sid)];}
const habitById=id=>S.habits.find(h=>h.id===id);

/* ---------------- Statistik ---------------- */
function collect(driveId,subId){
 const t=todayStr();const items=[],sessions=[];
 S.drives.forEach(d=>{if(driveId&&d.id!==driveId)return;
  d.subs.forEach(s=>{if(subId&&s.id!==subId)return;
   if(s.kind==='to')return;
   (s.plan||[]).forEach(pl=>items.push({date:pl.deadline||pl.tanggal||t,done:!!pl.done}));});});
 S.assignments.forEach(a=>{if(driveId&&a.driveId!==driveId)return;items.push({date:a.deadline||t,done:!!a.done});});
 S.daily.forEach(r=>{if(driveId&&r.driveId!==driveId)return;if(subId&&r.subId!==subId)return;sessions.push(r);});
 return{items,sessions};
}
function filterRange(arr,a,b){return arr.filter(x=>x.date>=a&&x.date<=b);}
function stats(driveId,subId,a,b){
 const t=todayStr();
 const it=collect(driveId,subId).items.filter(i=>i.date>=a&&i.date<=b);
 const ss=filterRange(collect(driveId,subId).sessions,a,b);
 let done=it.filter(i=>i.done).length+ss.filter(r=>r.done).length;
 let total=it.length+ss.length;
 S.habits.forEach(h=>{ if(driveId&&h.driveId!==driveId&&h.driveId!==subId)return; if(a<=t&&t<=b){total++;if(h.log[t])done++;}});
 const hours=ss.filter(r=>r.done).reduce((sum,r)=>sum+durJam(r.mulai,r.selesai),0);
 return{hours:Math.round(hours*10)/10,done,total,pct:total?Math.round(done/total*100):0};
}
function statQuad(driveId,subId){
 const[a1,b1]=rangeOf('day'),[a2,b2]=rangeOf('week'),[a3,b3]=rangeOf('month'),[a4,b4]=rangeOf('year');
 return{h:stats(driveId,subId,a1,b1),w:stats(driveId,subId,a2,b2),m:stats(driveId,subId,a3,b3),y:stats(driveId,subId,a4,b4)};
}
function overdue(driveId,subId){
 const t=todayStr();const out=[];
 S.drives.forEach(d=>{if(driveId&&d.id!==driveId)return;d.subs.forEach(s=>{if(subId&&s.id!==subId)return;if(s.kind==='to')return;
  (s.plan||[]).forEach(pl=>{if(pl.deadline&&!pl.done&&pl.deadline<t)out.push({kind:'Plan',title:pl.materi||'(tanpa materi)',deadline:pl.deadline,where:s.title});});});});
 S.assignments.forEach(a=>{if(a.deadline&&!a.done&&a.deadline<t&&(!driveId||a.driveId===driveId))out.push({kind:'PR',title:a.matkul+' — '+a.tugas,deadline:a.deadline,where:a.matkul});});
 return out.sort((x,y)=>x.deadline.localeCompare(y.deadline));
}
function touchStreak(){
 const t=todayStr();
 if(S.meta.lastStudyDate===t)return;
 S.meta.streak=(S.meta.lastStudyDate===yesterdayStr())?(S.meta.streak||0)+1:1;
 S.meta.lastStudyDate=t;save();
}
/* Reset mingguan Senin / bulanan tgl 1 */
function archive(){
 const wk=weekKeyNow(),mk=monthKeyNow();
 if(S.meta.weekKey!==wk){
  if(S.meta.weekKey){const a=S.meta.weekStart;const b=fmt(new Date(new Date(a+'T00:00:00').getTime()+6*864e5));S.history.weeks[S.meta.weekKey]=Object.assign({label:weekLabelOf(a)},stats(null,null,a,b));}
  S.meta.weekKey=wk;S.meta.weekStart=fmt(weekStart(new Date()));
 }
 if(S.meta.monthKey!==mk){
  if(S.meta.monthKey){const y=+S.meta.monthKey.slice(0,4),m=+S.meta.monthKey.slice(5,7);const b=fmt(new Date(y,m,0));S.history.months[S.meta.monthKey]=Object.assign({label:monthLabelOf(S.meta.monthKey)},stats(null,null,S.meta.monthKey+'-01',b));}
  S.meta.monthKey=mk;
 }
 save();
}

/* ---------------- XP & Badges ---------------- */
function totalDoneCount(){
 let n=0;
 S.drives.forEach(d=>d.subs.forEach(s=>{if(s.kind==='to'){n+=(s.toRecords||[]).length;return;}(s.plan||[]).forEach(p=>{if(p.done)n++;});}));
 S.assignments.forEach(a=>{if(a.done)n++;});
 S.daily.forEach(r=>{if(r.done)n++;});
 S.habits.forEach(h=>Object.keys(h.log).forEach(k=>{if(h.log[k])n++;}));
 return n;
}
function calcXP(){return totalDoneCount()*10+(S.meta.streak||0)*2;}
function calcLevel(xp){return Math.floor(xp/120)+1;}
function badgeList(){
 const t=todayStr();const[wa,wb]=rangeOf('week');const[ma,mb]=rangeOf('month');
 const wk=stats(null,null,wa,wb);const odW=overdue().filter(o=>o.deadline>=wa);
 const odM=overdue().filter(o=>o.deadline>=ma);
 const goalsD=S.goals.daily;
 let early=0;S.daily.forEach(r=>{if(r.done&&r.mulai&&r.mulai<'07:00')early++;});
 let toUp=false;
 S.drives.forEach(d=>d.subs.forEach(s=>{if(s.kind==='to'){const r=[...(s.toRecords||[])].sort((a,b)=>a.tanggal.localeCompare(b.tanggal));for(let i=1;i<r.length;i++)if(+r[i].skor>+r[i-1].skor)toUp=true;}}));
 const goalsAllDone=goalsD.length>0&&goalsD.every(g=>g.done);
 const st=S.meta.streak||0;
 return[
  {ic:'🔥',n:'Streak 7 Hari',d:'Belajar 7 hari tanpa bolong',got:st>=7},
  {ic:'🔥',n:'Streak 30 Hari',d:'Belajar 30 hari tanpa bolong',got:st>=30},
  {ic:'🔥',n:'Streak 90 Hari',d:'Belajar 90 hari tanpa bolong',got:st>=90},
  {ic:'⏰',n:'Deadline Slayer',d:'Minggu ini 0 keterlambatan & ada progres',got:wk.done>0&&odW.length===0},
  {ic:'🛡️',n:'Hukuman Dihindari',d:'Sebulan tanpa hukuman aktif',got:odM.length===0},
  {ic:'🌅',n:'Early Bird',d:'5 sesi belajar sebelum jam 7 pagi',got:early>=5},
  {ic:'📈',n:'TO Naik',d:'Skor TO lebih tinggi dari sebelumnya',got:toUp},
  {ic:'🎯',n:'Target Hunter',d:'Semua goal hari ini selesai',got:goalsAllDone},
  {ic:'✅',n:'10 Tugas',d:'10 tugas/selesai total',got:totalDoneCount()>=10},
  {ic:'✅',n:'50 Tugas',d:'50 tugas selesai total',got:totalDoneCount()>=50}
 ];
}

/* ---------------- Router ---------------- */
let view={tab:'home',driveId:null,subId:null,f:'today',goalTab:'daily'};
function route(){
 const h=location.hash||'#/';
 let m=h.match(/^#\/sub\/([^/]+)\/([^/]+)/),m2=h.match(/^#\/drive\/([^/]+)/),m3=h.match(/^#\/to\/([^/]+)/);
 if(m){view.tab='home';view.driveId=m[1];view.subId=m[2];}
 else if(m3){view.tab='home';view.driveId=m3[1];view.subId='__to__';}
 else if(m2){view.tab='home';view.driveId=m2[1];view.subId=null;}
 else{view.driveId=null;view.subId=null;
  if(h.startsWith('#/deck'))view.tab='deck';
  else if(h.startsWith('#/stats'))view.tab='stats';
  else if(h.startsWith('#/badges'))view.tab='badges';
  else view.tab='home';}
 render();
}
function topbar(title,back,right){
 return `<div class="topbar">${back?`<a class="btn ghost" href="${back}">←</a>`:''}
 <div class="tb-mid"><h1>${title}</h1><div id="clock" class="clock">…</div></div>
 ${right||''}</div>`;
}
function tick(){const c=$('#clock');if(!c)return;const n=new Date();c.textContent='🔥 '+(S.meta.streak||0)+' hari • '+DAYS[n.getDay()]+', '+n.getDate()+' '+MONTHS[n.getMonth()]+' '+n.getFullYear()+' • '+p2(n.getHours())+':'+p2(n.getMinutes())+':'+p2(n.getSeconds());}
function render(){
 const app=$('#app');
 if(view.driveId&&view.subId&&view.subId!=='__to__')app.innerHTML=vSub(view.driveId,view.subId);
 else if(view.driveId&&view.subId==='__to__')app.innerHTML=vTO(view.driveId);
 else if(view.driveId)app.innerHTML=vDrive(view.driveId);
 else if(view.tab==='deck')app.innerHTML=vDeck();
 else if(view.tab==='stats')app.innerHTML=vStats();
 else if(view.tab==='badges')app.innerHTML=vBadges();
 else app.innerHTML=vHome();
 $$('.bnav a').forEach(a=>a.classList.toggle('on',a.dataset.tab===view.tab&&!view.driveId));
 tick();drawCharts();
}

/* ---------------- Komponen kecil ---------------- */
function miniBars(st){
 const r=(l,x)=>`<div class="mbar"><span>${l}</span><div class="bar"><i style="width:${x.pct}%"></i></div><b>${x.pct}%</b></div>`;
 return r('Hari',st.h)+r('Minggu',st.w)+r('Bulan',st.m)+r('Tahun',st.y);
}
function dlPill(dl){if(!dl)return'<span class="pill">—</span>';const n=daysLeft(dl);
 if(n<0)return`<span class="pill red">Lewat ${-n} hr</span>`;if(n===0)return'<span class="pill org">HARI INI</span>';if(n<=2)return`<span class="pill org">H-${n}</span>`;return`<span class="pill grn">H-${n}</span>`;}
function riwayatHtml(){
 const wks=Object.entries(S.history.weeks).sort((a,b)=>b[0].localeCompare(a[0]));
 const mos=Object.entries(S.history.months).sort((a,b)=>b[0].localeCompare(a[0]));
 const row=e=>`<tr><td>${esc(e[1].label)}</td><td class="num">${e[1].hours} jam</td><td class="num">${e[1].done}/${e[1].total}</td><td class="num"><b>${e[1].pct}%</b></td></tr>`;
 const tbl=(list,title)=>`<div><h4>${title}</h4>${list.length?`<table class="mini"><thead><tr><th>Periode</th><th>Jam</th><th>Sesi</th><th>%</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table>`:'<p class="hint">Belum ada — otomatis tersimpan tiap Senin / tanggal 1.</p>'}</div>`;
 return `<h3>🕘 Riwayat Tersimpan</h3><div class="riw">${tbl(wks,'🗓️ Mingguan')}${tbl(mos,'📅 Bulanan')}</div>`;
}
function punishBox(text,onchange,genArgs){
 return `<div class="card">
 <h3>🚨 Hukuman ${genArgs?`<button class="btn small" onclick="openPunish(${genArgs})">🎲 Generator ide</button>`:''}</h3>
 <input class="tin" placeholder="Contoh: Traktir 3 teman + setor Rp50.000 ke Ibu…" value="${esc(text)}" onchange="${onchange}">
 <p class="hint" style="margin-top:6px">Konsekuensi disepakati SEBELUM gagal & dijaga orang lain. Hukum kegagalan jadwal — bukan nilai jelek.</p></div>`;
}

/* ---------------- TAB HOME ---------------- */
function driveCard(d){
 const st=statQuad(d.id,null);
 const od=overdue(d.id,null).length;
 const toSub=d.subs.find(s=>s.kind==='to');
 let toInfo='';
 if(toSub&&toSub.toRecords&&toSub.toRecords.length){
  const latest=[...toSub.toRecords].sort((a,b)=>b.tanggal.localeCompare(a.tanggal))[0];
  toInfo=`<span>🏆 TO terakhir: <b>${esc(latest.skor)}</b></span>`;
 }
 return `<div class="card drive">
 <a href="#/drive/${d.id}" style="text-decoration:none;color:inherit">
  <div class="d-head"><span class="d-ic">${d.icon}</span>
   <div class="d-tt"><h3>${esc(d.title)}</h3><p>${esc(d.target)}</p></div>
   ${od?`<span class="pill red">⚠ ${od} lewat</span>`:''}</div>
  <div class="mbars">${miniBars(st)}</div>
  <div class="d-foot"><span>⏱ ${st.h.hours} jam hari ini</span><span>✅ ${st.h.done}/${st.h.total}</span><span>🗓️ ${st.w.hours} jam minggu ini</span>${toInfo}</div>
  <div class="d-pun">🚨 ${esc(d.punishment.text||'belum ada hukuman')} <span class="hint">· penjaga: ${esc(d.punishment.keeper||'—')}</span></div>
 </a>
 <div class="row" style="margin-top:8px"><button class="btn tiny" onclick="openDriveForm('${d.id}')">✎ Edit drive</button><button class="btn tiny" onclick="delDrive('${d.id}')">🗑 Hapus</button></div>
 </div>`;
}
function vHome(){
 const lg=S.lifeGoals||S.lifeGoal;const life=lg;
 const[a1,b1]=rangeOf('day'),[a2,b2]=rangeOf('week'),[a3,b3]=rangeOf('month'),[a4,b4]=rangeOf('year');
 const td=stats(null,null,a1,b1),wk=stats(null,null,a2,b2),mo=stats(null,null,a3,b3),yr=stats(null,null,a4,b4);
 const odAll=overdue();
 /* drive paling tertinggal */
 let worst=null;S.drives.forEach(d=>{const s=statQuad(d.id,null).w;if(!worst||s.pct<worst.st.pct)worst={d:d,st:s};});
 return topbar('🎯 Misi Hidup Farel',null,`<div class="tb-btns"><button class="btn ghost" onclick="exportData()">↓ Export</button><button class="btn ghost" onclick="document.getElementById('impFile').click()">↑ Import</button><input type="file" id="impFile" accept=".json" style="display:none" onchange="importData(event)"></div>`)+`
 ${worst&&worst.st.pct<70?`<div class="odbox" style="border-color:var(--or);background:rgba(210,153,34,.08)">⚡ <b>Drive paling tertinggal:</b> ${worst.d.icon} ${esc(worst.d.title)} (${worst.st.pct}% minggu ini) — kejar dulu sebelum yang lain.</div>`:''}
 ${odAll.length?`<div class="odbox"><b>⏰ ${odAll.length} tugas lewat deadline:</b><ul>${odAll.slice(0,5).map(o=>`<li><span class="pill red">${o.deadline}</span> ${esc(o.title)} <span class="hint">(${esc(o.where)})</span></li>`).join('')}</ul>${odAll.length>5?`<p class="hint">…dan ${odAll.length-5} lainnya</p>`:''}</div>`:''}
 <section class="card">
  <h3>📖 Buku Misi — Halaman 1 <span class="tag">akar pohon</span></h3>
  <label class="fld">Tujuan 5 Tahun</label>
  <input class="tin big" value="${esc(life.fiveTitle)}" onchange="uLife('fiveTitle',this.value)">
  <textarea class="tin" rows="2" onchange="uLife('fiveDesc',this.value)">${esc(life.fiveDesc)}</textarea>
  <div class="d-pun" style="margin-top:8px">🔗 Rantai target: ${esc(life.dep)}</div>
  <div class="goal2">
   <div><label class="fld">🗓️ Goal tahun ini</label><input class="tin" value="${esc(life.year)}" onchange="uLife('year',this.value)"></div>
   <div><label class="fld">📆 Goal bulan ini</label><input class="tin" value="${esc(life.month)}" onchange="uLife('month',this.value)"></div>
  </div>
 </section>
 <div class="sec-h">🚩 Drive Besar <span class="hint">— fleksibel: tambah/edit/hapus</span></div>
 ${S.drives.map(driveCard).join('')}
 <button class="btn add" onclick="openDriveForm()">＋ Tambah Drive Baru</button>
 <section class="card sumrow" style="margin-top:14px">
  <div class="sum"><span>⏱ Jam hari ini</span><b>${td.hours} jam</b><i>${td.done}/${td.total} selesai</i></div>
  <div class="sum"><span>🗓️ Minggu ini</span><b>${wk.hours} jam · ${wk.pct}%</b><i>${wk.done}/${wk.total} selesai</i></div>
  <div class="sum"><span>📅 Bulan ini</span><b>${mo.hours} jam · ${mo.pct}%</b><i>${mo.done}/${mo.total} selesai</i></div>
  <div class="sum"><span>🗓️ Tahun ini</span><b>${yr.hours} jam · ${yr.pct}%</b><i>${yr.done}/${yr.total} selesai</i></div>
 </section>
 <section class="card">${riwayatHtml()}</section>
 <p class="foot-note">💾 Auto-save di browser • Rajin Export JSON sebagai backup.</p>`;
}

/* ---------------- HALAMAN DRIVE (level 2 -> 3) ---------------- */
function subCard(d,s){
 const st=statQuad(d.id,s.id);
 const od=overdue(d.id,s.id).length;
 const doneJam=st.w.hours;
 return `<div class="card">
 <a href="#/sub/${d.id}/${s.id}" style="text-decoration:none;color:inherit">
  <div class="d-head"><div class="d-tt"><h3>${esc(s.title)}</h3><p>📅 ${(s.routine.days||[]).join(', ')||'fleksibel'} • ${(s.routine.fases||[]).length} fase/hari</p></div>
  ${od?`<span class="pill red">⚠ ${od} lewat</span>`:''}</div>
  <div class="mbars">${miniBars(st)}</div>
  <div class="d-foot"><span>⏱ ${doneJam} jam / ${s.targetJam||'—'} jam target mingguan</span><span>📝 ${s.plan.length} rencana</span></div>
 </a>
 <div class="row" style="margin-top:8px"><button class="btn tiny" onclick="openSubForm('${d.id}','${s.id}')">✎ Edit</button><button class="btn tiny" onclick="delSub('${d.id}','${s.id}')">🗑 Hapus</button></div>
 </div>`;
}
function toCardDrive(d,s){
 const recs=[...(s.toRecords||[])].sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
 const latest=recs[0];
 return `<div class="card" style="border-color:var(--or)">
 <a href="#/to/${d.id}" style="text-decoration:none;color:inherit">
  <div class="d-head"><span class="d-ic">📝</span><div class="d-tt"><h3>Try Out</h3><p>Modul terpisah — semua subtes dalam satu TO</p></div>
  ${latest?`<span class="pill blu">🏆 ${esc(latest.skor)}</span>`:''}</div>
  <div class="d-foot"><span>📊 ${recs.length}x TO tercatat</span><span>🎯 Target: <b>${esc(s.toTarget||'—')}</b></span>
  ${latest?`<span>Terakhir: ${niceDate(latest.tanggal)}</span>`:''}</div>
 </a>
 <div class="row" style="margin-top:8px"><a class="btn tiny" href="#/to/${d.id}">✎ Kelola TO</a></div>
 </div>`;
}
function vDrive(did){
 const d=driveById(did);if(!d)return vHome();
 const[ma,mb]=rangeOf('month');
 const bars=d.subs.filter(s=>s.kind!=='to').map(s=>{const st=stats(did,s.id,ma,mb);const short=s.title.split('—')[0].trim();return`<div class="hbar"><span class="hb-l" title="${esc(s.title)}">${esc(short)}</span><div class="bar h"><i style="width:${st.pct}%"></i></div><b>${st.pct}%</b></div>`;}).join('');
 return topbar(`${d.icon} ${esc(d.title)}`,'#/')+`
 <div class="crumb"><a href="#/">🏠 Home</a> › <b>${esc(d.title)}</b></div>
 <section class="card pun">
  <h3>🚨 Hukuman Drive</h3>
  <input class="tin" value="${esc(d.punishment.text)}" onchange="uDrivePun('${d.id}','text',this.value)">
  <div class="pun-row"><label>👮 Penjaga komitmen:</label><input class="tin w50" value="${esc(d.punishment.keeper)}" onchange="uDrivePun('${d.id}','keeper',this.value)"></div>
 </section>
 <div class="sec-h">📚 Bidang / Subtes <span class="hint">— fleksibel, bisa tambah</span></div>
 ${d.subs.filter(s=>s.kind!=='to').map(s=>subCard(d,s)).join('')}
 ${d.subs.filter(s=>s.kind==='to').map(s=>toCardDrive(d,s)).join('')}
 <button class="btn add" onclick="openSubForm('${d.id}')">＋ Tambah Bidang Baru</button>
 <button class="btn add" style="margin-top:6px" onclick="addToModule('${d.id}')">＋ Tambah Modul Try Out</button>
 <section class="card" style="margin-top:14px"><h3>📊 Progres Bulanan per Bidang</h3>${bars||'<p class="empty">Belum ada bidang.</p>'}</section>`;
}

/* ---------------- HALAMAN BIDANG (level 3 -> 4) ---------------- */
function routineHtml(d,s){
 const r=s.routine||{days:[],fases:[]};
 const dayChips=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(day=>
  `<button class="chip ${r.days.includes(day)?'on':''}" onclick="tglRoutineDay('${d.id}','${s.id}','${day}')">${day}</button>`).join('');
 const faseRows=(r.fases||[]).map((f,i)=>`<tr>
  <td><input class="tin" value="${esc(f.name)}" onchange="updFase('${d.id}','${s.id}',${i},'name',this.value)"></td>
  <td><input type="time" class="tin" value="${f.mulai}" onchange="updFase('${d.id}','${s.id}',${i},'mulai',this.value)"></td>
  <td><input type="time" class="tin" value="${f.selesai}" onchange="updFase('${d.id}','${s.id}',${i},'selesai',this.value)"></td>
  <td><input class="tin" placeholder="Fokus…" value="${esc(f.fokus)}" onchange="updFase('${d.id}','${s.id}',${i},'fokus',this.value)"></td>
  <td><button class="x" onclick="delFase('${d.id}','${s.id}',${i})">✕</button></td></tr>`).join('');
 const autoJam=(r.fases||[]).reduce((a,f)=>a+durJam(f.mulai,f.selesai),0);
 return `<section class="card">
 <h3>🗓️ Jadwal Rutin <span class="tag">per fase</span></h3>
 <label class="fld">Hari belajar:</label>
 <div class="chips">${dayChips}</div>
 <div class="tw"><table class="sheet" data-kind="routine" data-cols="4">
 <thead><tr><th>Fase</th><th>Mulai</th><th>Selesai</th><th>Fokus</th><th></th></tr></thead>
 <tbody>${faseRows||`<tr><td colspan="5" class="empty">Belum ada fase — tambah di bawah 👇</td></tr>`}</tbody></table></div>
 <button class="btn add" onclick="addFase('${d.id}','${s.id}')">＋ Tambah fase</button>
 <div class="pun-row"><label>Target jam / minggu:</label><input type="number" class="tin w20" value="${s.targetJam||''}" onchange="uTargetJam('${d.id}','${s.id}',this.value)">
 <span class="hint">grid ini = ${Math.round(autoJam*(r.days||[]).length*10)/10} jam/minggu</span></div>
 </section>`;
}
function planSheet(d,s){
 const cols=s.planColumns||['Latsol 1'];
 const colTh=cols.map((c,ci)=>`<th>${esc(c)} <button class="x" style="padding:0 2px" onclick="renPlanCol('${d.id}','${s.id}',${ci})" title="Rename">✎</button><button class="x" style="padding:0 2px" onclick="delPlanCol('${d.id}','${s.id}',${ci})" title="Hapus kolom">✕</button></th>`).join('');
 const trs=(s.plan||[]).map((p,i)=>{
  const lats=cols.map((c,ci)=>{
   const L=(p.latsols||[])[ci]||{nama:'',jumlah:''};
   return `<td><div class="lat"><input class="tin" placeholder="ket/nama…" value="${esc(L.nama)}" onchange="updLatsol('${d.id}','${s.id}',${i},${ci},'nama',this.value)"><input type="number" class="tin num" placeholder="jml soal" value="${L.jumlah}" onchange="updLatsol('${d.id}','${s.id}',${i},${ci},'jumlah',this.value)"></div></td>`;}).join('');
  const totalSoal=(p.latsols||[]).reduce((a,L)=>a+(+((L||{}).jumlah)||0),0);
  const dlCls=p.deadline&&!p.done&&p.deadline<todayStr()?'overdue':'';
  return `<tr class="${p.done?'done':''}">
   <td><input type="checkbox" ${p.done?'checked':''} onchange="tglPlan('${d.id}','${s.id}',${i},this.checked)"></td>
   <td><input type="date" class="tin" value="${p.tanggal}" onchange="updPlan('${d.id}','${s.id}',${i},'tanggal',this.value)"></td>
   <td><input type="date" class="tin ${dlCls}" value="${p.deadline}" onchange="updPlan('${d.id}','${s.id}',${i},'deadline',this.value)"></td>
   <td><input class="tin" placeholder="Materi…" value="${esc(p.materi)}" onchange="updPlan('${d.id}','${s.id}',${i},'materi',this.value)"></td>
   ${lats}
   <td class="num">${totalSoal||'—'}</td>
   <td><input class="tin" placeholder="Catatan…" value="${esc(p.catatan)}" onchange="updPlan('${d.id}','${s.id}',${i},'catatan',this.value)"></td>
   <td><button class="x" onclick="delPlan('${d.id}','${s.id}',${i})">✕</button></td></tr>`;}).join('');
 const ncol=5+2*cols.length;
 return `<section class="card">
 <div class="t-head"><h3>📋 Plan Belajar <span class="tag">kolom dinamis</span></h3>
 <button class="btn tiny" onclick="addPlanCol('${d.id}','${s.id}')">＋ Kolom latsol</button></div>
 <div class="tw"><table class="sheet" data-kind="plan" data-cols="${ncol}" data-d="${d.id}" data-s="${s.id}">
 <thead><tr><th>✓</th><th>Tanggal</th><th>Deadline</th><th>Materi</th>${colTh}<th>Total Soal</th><th>Catatan</th><th></th></tr></thead>
 <tbody>${trs||`<tr><td colspan="${6+cols.length}" class="empty">Belum ada plan — tambah baris di bawah 👇</td></tr>`}</tbody></table></div>
 <button class="btn add" onclick="addPlan('${d.id}','${s.id}')">＋ Tambah baris</button>
 </section>`;
}
function vSub(did,sid){
 const pair=subById(did,sid);const d=pair[0],s=pair[1];
 if(!d||!s||s.kind==='to')return vHome();
 const st=statQuad(did,sid);
 const od=overdue(did,sid);
 const odHtml=od.length?`<div class="odbox"><b>⏰ ${od.length} rencana/PR terlewat deadline:</b><ul>${od.map(o=>`<li><span class="pill red">${o.deadline}</span> ${esc(o.title)}</li>`).join('')}</ul></div>`:'';
 const statCard=(t,x)=>`<div class="sum"><span>${t}</span><b>${x.hours} jam · ${x.pct}%</b><i>${x.done}/${x.total} selesai</i></div>`;
 return topbar(esc(s.title),`#/drive/${did}`)+`
 <div class="crumb"><a href="#/">🏠 Home</a> › <a href="#/drive/${did}">${esc(d.title)}</a> › <b>${esc(s.title)}</b></div>
 ${odHtml}
 <section class="card sumrow">${statCard('☀️ Hari ini',st.h)}${statCard('🗓️ Minggu ini',st.w)}${statCard('📅 Bulan ini',st.m)}${statCard('🗓️ Tahun ini',st.y)}</section>
 ${routineHtml(d,s)}
 ${planSheet(d,s)}
 <section class="card">
  <h3>🚨 Hukuman Khusus Bidang Ini <button class="btn small" onclick="openPunish('${did}','${sid}')">🎲 Generator</button></h3>
  <input class="tin" placeholder="Kosongkan = pakai hukuman level drive…" value="${esc(s.punishment||'')}" onchange="uSubPun('${did}','${sid}',this.value)">
 </section>`;
}

/* ---------------- HALAMAN TRY OUT (modul sejajar) ---------------- */
function toSub(did){const d=driveById(did);return d?d.subs.find(s=>s.kind==='to'):null;}
function vTO(did){
 const d=driveById(did);const s=toSub(did);
 if(!d||!s)return vHome();
 const recs=[...(s.toRecords||[])].sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
 const sibs=d.subs.filter(x=>x.kind!=='to');
 const recCards=recs.map(r=>{
  const bars=sibs.map(sb=>{const v=(r.perSubtes||{})[sb.id]||{b:0,s:0};const tot=(+v.b||0)+(+v.s||0);const pct=tot?Math.round((+v.b||0)/tot*100):0;
   const short=sb.title.split('—')[0].trim();
   return`<div class="hbar"><span class="hb-l">${esc(short)}</span><div class="bar h"><i style="width:${pct}%"></i></div><b>${v.b||0}/${tot||'—'}</b></div>`;}).join('');
  return `<div class="rec">
   <div class="rh2"><div><b>${esc(r.nama)}</b> <span class="hint">${niceDate(r.tanggal)}</span></div>
   <div><b class="sk">${esc(r.skor)}</b> <button class="btn tiny" onclick="openToForm('${did}','${r.id}')">✎</button><button class="x" onclick="delTORecord('${did}','${r.id}')">✕</button></div></div>
   <div class="d-foot" style="margin:4px 0"><span>✅ Benar: <b>${r.total.benar||0}</b></span><span>❌ Salah: <b>${r.total.salah||0}</b></span><span>⬜ Kosong: <b>${r.total.kosong||0}</b></span></div>
   ${bars}
  </div>`;}).join('');
 const avgSub=sibs.map(sb=>{let b=0,t=0;recs.forEach(r=>{const v=(r.perSubtes||{})[sb.id]||{b:0,s:0};b+=+v.b||0;t+=(+v.b||0)+(+v.s||0);});
  const pct=t?Math.round(b/t*100):0;const short=sb.title.split('—')[0].trim();
  return`<div class="hbar"><span class="hb-l" title="akurasi">${esc(short)}</span><div class="bar h"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;}).join('');
 return topbar('📝 Try Out — '+esc(d.title),`#/drive/${did}`)+`
 <div class="crumb"><a href="#/">🏠 Home</a> › <a href="#/drive/${did}">${esc(d.title)}</a> › <b>Try Out</b></div>
 <section class="card">
  <div class="t-head"><h3>🎯 Target & Grafik</h3>
  <div class="pun-row" style="margin:0"><label>Target skor:</label><input type="number" class="tin w20" value="${s.toTarget||''}" onchange="uToTarget('${did}',this.value)"></div></div>
  ${recs.length?`<canvas id="chTo" class="chart" data-to="${did}"></canvas>`:'<p class="empty">Belum ada TO tercatat.</p>'}
 </section>
 <section class="card"><h3>🎯 Akurasi per Subtes (semua TO)</h3>${avgSub||'<p class="empty">Belum ada data.</p>'}</section>
 <div class="sec-h">📋 Riwayat Try Out</div>
 ${recCards||''}
 <button class="btn add" onclick="openToForm('${did}')">＋ Tambah Hasil TO</button>`;
}

/* ---------------- TAB DECK ---------------- */
function dailyTable(){
 const f=view.f;const t=todayStr();const[a7]=rangeOf('week');
 let rows=S.daily.filter(r=>f==='today'?r.date===t:f==='week'?(r.date>=a7&&r.date<=t):true)
  .sort((x,y)=>x.date.localeCompare(y.date)||String(x.mulai).localeCompare(String(y.mulai)));
 const opts=(curD,curS)=>S.drives.map(d=>`<optgroup label="${esc(d.title)}">${d.subs.filter(s=>s.kind!=='to').map(s=>`<option value="${d.id}|${s.id}" ${(d.id===curD&&s.id===curS)?'selected':''}>${esc(s.title)}</option>`).join('')}</optgroup>`).join('');
 const trs=rows.map(r=>{const h=durJam(r.mulai,r.selesai);return `<tr class="${r.done?'done':''}">
  <td><input type="checkbox" ${r.done?'checked':''} onchange="tglDaily('${r.id}',this.checked)"></td>
  <td><input type="date" class="tin" value="${r.date}" onchange="updDaily('${r.id}','date',this.value)"></td>
  <td><input type="time" class="tin" value="${r.mulai}" onchange="updDaily('${r.id}','mulai',this.value)"></td>
  <td><input type="time" class="tin" value="${r.selesai}" onchange="updDaily('${r.id}','selesai',this.value)"></td>
  <td class="num">${h?h.toFixed(1):'—'}</td>
  <td><select class="tin" onchange="updDailySub('${r.id}',this.value)">${opts(r.driveId,r.subId)}</select></td>
  <td><input class="tin" placeholder="Kegiatan…" value="${esc(r.kegiatan)}" onchange="updDaily('${r.id}','kegiatan',this.value)"></td>
  <td><button class="x" onclick="delDaily('${r.id}')">✕</button></td></tr>`;}).join('');
 const seg=`<div class="segs">${['today','week','all'].map(k=>`<button class="seg ${f===k?'on':''}" onclick="setFilter('${k}')">${k==='today'?'Hari ini':k==='week'?'7 hari':'Semua'}</button>`).join('')}</div>`;
 return `<section class="card"><div class="t-head"><h3>📋 Rencana Harian <span class="tag">study_items</span></h3>${seg}</div>
 <div class="tw"><table class="sheet" data-kind="daily" data-cols="4">
 <thead><tr><th>✓</th><th>Tanggal</th><th>Mulai</th><th>Selesai</th><th>Jam</th><th>Drive / Bidang</th><th>Kegiatan</th><th></th></tr></thead>
 <tbody>${trs||`<tr><td colspan="8" class="empty">Belum ada rencana${f==='today'?' hari ini':''} — tambah baris di bawah 👇</td></tr>`}</tbody></table></div>
 <button class="btn add" onclick="addDaily()">＋ Tambah baris</button></section>`;
}
function assignTable(){
 const rows=[...S.assignments].sort((a,b)=>(a.done-b.done)||String(a.deadline).localeCompare(String(b.deadline)));
 const act=rows.filter(a=>!a.done).length;
 const near=rows.filter(a=>!a.done&&a.deadline&&daysLeft(a.deadline)>=0&&daysLeft(a.deadline)<=2).length;
 const matkuls=[...new Set(S.assignments.map(a=>a.matkul))];
 const trs=rows.map(a=>`<tr class="${a.done?'done':''}">
  <td><input type="checkbox" ${a.done?'checked':''} onchange="tglAssign('${a.id}',this.checked)"></td>
  <td><input class="tin" list="mk" placeholder="Matkul…" value="${esc(a.matkul)}" onchange="updAssign('${a.id}','matkul',this.value)"></td>
  <td><input class="tin" placeholder="Tugas / PR…" value="${esc(a.tugas)}" onchange="updAssign('${a.id}','tugas',this.value)"></td>
  <td><input type="date" class="tin" value="${a.deadline}" onchange="updAssign('${a.id}','deadline',this.value)"></td>
  <td>${dlPill(a.deadline)}</td>
  <td><button class="x" onclick="delAssign('${a.id}')">✕</button></td></tr>`).join('');
 return `<section class="card"><div class="t-head"><h3>🎓 Tugas / PR Kuliah <span class="tag">weekly_assignments</span></h3>
  <div><span class="pill blu">${act} aktif</span> <span class="pill ${near?'org':'grn'}">⚠ ${near} deadline ≤2 hari</span></div></div>
 <datalist id="mk">${matkuls.map(m=>`<option value="${esc(m)}">`).join('')}</datalist>
 <div class="tw"><table class="sheet" data-kind="assign" data-cols="3"><thead><tr><th>✓</th><th>Matkul</th><th>Tugas / PR</th><th>Deadline</th><th>Sisa</th><th></th></tr></thead><tbody>${trs||'<tr><td colspan="6" class="empty">Belum ada tugas.</td></tr>'}</tbody></table></div>
 <button class="btn add" onclick="addAssign()">＋ Tambah baris</button></section>`;
}
function goalsHtml(){
 const tabs=[['daily','Hari ini'],['weekly','Minggu'],['monthly','Bulan'],['yearly','Tahun']];
 const k=view.goalTab;
 const items=(S.goals[k]||[]).map(g=>`<div class="pun-row" style="margin:4px 0">
  <input type="checkbox" ${g.done?'checked':''} onchange="tglGoal('${k}','${g.id}',this.checked)" style="width:18px;height:18px">
  <input class="tin ${g.done?'':''}" style="flex:1;${g.done?'text-decoration:line-through;opacity:.55':''}" value="${esc(g.text)}" onchange="updGoal('${k}','${g.id}',this.value)">
  <button class="x" onclick="delGoal('${k}','${g.id}')">✕</button></div>`).join('');
 return `<section class="card"><div class="t-head"><h3>🎯 Goals <span class="hint">sasaran hasil</span></h3>
 <div class="segs">${tabs.map(t=>`<button class="seg ${k===t[0]?'on':''}" onclick="setGoalTab('${t[0]}')">${t[1]}</button>`).join('')}</div></div>
 ${items||'<p class="empty">Belum ada goal di periode ini.</p>'}
 <div class="pun-row"><input class="tin" id="newGoal" placeholder="Tulis goal baru…" style="flex:1" onkeydown="if(event.key==='Enter')addGoal('${k}')"><button class="btn small" onclick="addGoal('${k}')">＋</button></div>
 </section>`;
}
function habitsHtml(){
 const t=todayStr();
 const items=S.habits.map(h=>{
  let dots='';for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=fmt(d);dots+=`<i class="${h.log[k]?'on':''}" title="${k}"></i>`;}
  let streak=0;for(let i=0;;i++){const d=new Date();d.setDate(d.getDate()-i);const k=fmt(d);if(h.log[k])streak++;else{if(k===t)continue;break;}}
  const drv=S.drives.find(d=>d.id===h.driveId);const sub=S.drives.flatMap(d=>d.subs).find(s=>s.id===h.driveId);
  const linked=drv?drv.title:(sub?sub.title:'—');
  return `<div class="pun-row" style="margin:6px 0;align-items:center">
  <input type="checkbox" ${h.log[t]?'checked':''} onchange="tglHabit('${h.id}',this.checked)" style="width:18px;height:18px">
  <div style="flex:1;min-width:0"><b>${esc(h.title)}</b> <span class="hint">→ ${esc(linked)}</span>
  <div class="dots" style="margin-top:3px">${dots}</div></div>
  <span class="pill ${streak>=7?'grn':''}">🔥 ${streak}</span>
  <button class="x" onclick="delHabit('${h.id}')">✕</button></div>`;}).join('');
 return `<section class="card"><h3>🔁 Habits <span class="hint">sasaran proses • centang tiap hari</span></h3>
 ${items||'<p class="empty">Belum ada habit.</p>'}
 <div class="pun-row"><input class="tin" id="newHabit" placeholder="Habit baru… misal: Bangun 04.00" style="flex:1" onkeydown="if(event.key==='Enter')addHabit()">
 <select class="tin" id="habitDrive" style="max-width:150px">${S.drives.map(d=>`<option value="${d.id}">${esc(d.title)}</option>`).join('')}</select>
 <button class="btn small" onclick="addHabit()">＋</button></div>
 </section>`;
}
function vDeck(){
 return topbar('🗂 Deck — Meja Kerja Harian',null)+`
 <p class="hint" style="margin:-8px 0 12px">Semua yang dikerjakan <b>sekarang</b> ada di sini — tanpa perlu menyusuri drive.</p>
 ${dailyTable()}
 ${assignTable()}
 ${goalsHtml()}
 ${habitsHtml()}`;
}

/* ---------------- TAB STATS ---------------- */
function vStats(){
 const[a1,b1]=rangeOf('day'),[a2,b2]=rangeOf('week'),[a3,b3]=rangeOf('month'),[a4,b4]=rangeOf('year');
 const td=stats(null,null,a1,b1),wk=stats(null,null,a2,b2),mo=stats(null,null,a3,b3),yr=stats(null,null,a4,b4);
 const dist=S.drives.map(d=>{const st=stats(d.id,null,a3,b3);return{l:d.icon+' '+d.title,v:st.hours};}).filter(x=>x.v>0);
 const toDrive=S.drives.find(d=>d.subs.some(s=>s.kind==='to'));
 return topbar('📊 Stats — Bukti Usaha',null)+`
 <section class="card sumrow">
  <div class="sum"><span>☀️ Hari ini</span><b>${td.hours} jam</b><i>${td.done}/${td.total} tugas</i></div>
  <div class="sum"><span>🗓️ Minggu ini</span><b>${wk.hours} jam · ${wk.pct}%</b><i>${wk.done}/${wk.total}</i></div>
  <div class="sum"><span>📅 Bulan ini</span><b>${mo.hours} jam · ${mo.pct}%</b><i>${mo.done}/${mo.total}</i></div>
  <div class="sum"><span>🗓️ Tahun ini</span><b>${yr.hours} jam · ${yr.pct}%</b><i>${yr.done}/${yr.total}</i></div>
 </section>
 <section class="card"><h3>⏱ Grafik Jam Belajar (7 hari)</h3><canvas id="chWeek" class="chart"></canvas></section>
 <section class="card"><h3>🗓️ Jam per Bulan (tahun ini)</h3><canvas id="chMonth" class="chart"></canvas></section>
 <section class="card"><h3>🥧 Distribusi Waktu Bulan Ini</h3>${dist.length?dist.map(x=>{const max=Math.max(...dist.map(y=>y.v),1);return`<div class="hbar"><span class="hb-l">${esc(x.l)}</span><div class="bar h"><i style="width:${Math.round(x.v/max*100)}%"></i></div><b>${x.v}j</b></div>`;}).join(''):'<p class="empty">Belum ada jam belajar bulan ini.</p>'}</section>
 <section class="card"><h3>📝 Grafik Try Out ${toDrive?`— ${esc(toDrive.title)}`:''}</h3>
 ${toDrive?`<canvas id="chTo" class="chart" data-to="${toDrive.id}"></canvas>`:'<p class="empty">Belum ada modul TO.</p>'}</section>`;
}

/* ---------------- TAB BADGES ---------------- */
function vBadges(){
 const xp=calcXP();const lvl=calcLevel(xp);const base=(lvl-1)*120;const prog=Math.round((xp-base)/120*100);
 const badges=badgeList();const got=badges.filter(b=>b.got).length;
 return topbar('🏆 Badges — Karakter & Konsistensi',null)+`
 <section class="card center">
  <h3>Level ${lvl} 🏆</h3>
  <div style="font-size:26px;font-weight:700;color:var(--gr)">${xp} XP</div>
  <div class="xpbar"><i style="width:${prog}%"></i></div>
  <p class="hint">${120-(xp-base)} XP lagi ke Level ${lvl+1} • XP dari tugas selesai (10) & streak (2/hari)</p>
  <p style="margin-top:10px"><span class="pill grn">🔥 Streak ${S.meta.streak||0} hari</span> <span class="pill blu">${got}/${badges.length} badge</span></p>
 </section>
 <div class="sec-h">Lencana <span class="hint">— proses, bukan hasil</span></div>
 <div class="bgrid">${badges.map(b=>`<div class="badge ${b.got?'got':''}"><span class="bi">${b.ic}</span><b>${esc(b.n)}</b><span>${esc(b.d)}</span>${b.got?'<span class="pill grn" style="margin-top:6px">✓ Dapat</span>':'<span class="pill" style="margin-top:6px">🔒 Terkunci</span>'}</div>`).join('')}</div>
 <section class="card" style="margin-top:16px"><h3>📜 Prinsip</h3>
 <blockquote style="border-left:3px solid var(--bl);padding:6px 12px;color:var(--mut);font-style:italic;margin:8px 0">"No result? Keep working. Bad result? Keep working. Good result? Keep working."</blockquote>
 <p class="hint">Badge diberikan untuk proses & konsistensi — bukan nilai — karena proses selalu bisa kamu kontrol.</p></section>`;
}

/* ---------------- Charts (canvas, tanpa library) ---------------- */
function setupCv(cv,h){const dpr=window.devicePixelRatio||1;const w=cv.clientWidth||300;cv.width=w*dpr;cv.height=(h||170)*dpr;cv.style.height=(h||170)+'px';const c=cv.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h||170);return[c,w,h||170];}
function barChart(cv,labels,vals,color){
 const[c,w,h]=setupCv(cv);const max=Math.max(1,...vals)*1.2;const pad=22;const bw=(w-pad*2)/labels.length;
 c.strokeStyle='#21262d';c.beginPath();c.moveTo(pad,8);c.lineTo(pad,h-20);c.lineTo(w-4,h-20);c.stroke();
 labels.forEach((l,i)=>{const v=vals[i];const bh=(h-30)*(v/max);const x=pad+i*bw+bw*0.15;
  c.fillStyle=color||'#58a6ff';c.beginPath();c.roundRect(x,h-20-bh,bw*0.7,bh,3);c.fill();
  c.fillStyle='#8b949e';c.font='9px sans-serif';c.textAlign='center';
  c.fillText(String(v),x+bw*0.35,h-24-bh);c.fillText(l,x+bw*0.35,h-8);});
}
function lineChart(cv,labels,vals,target){
 const[c,w,h]=setupCv(cv);
 const all=[...vals.map(Number),...(target!=null&&target!==''?[Number(target)]:[])];const max=Math.max(1,...all)*1.15;const min=Math.max(0,Math.min(...all)*0.9);
 const pad=30;const X=i=>pad+(w-pad-14)*(labels.length<=1?0.5:i/(labels.length-1));
 const Y=v=>14+(h-40)*(1-(v-min)/(max-min||1));
 c.strokeStyle='#21262d';c.beginPath();c.moveTo(pad,8);c.lineTo(pad,h-24);c.lineTo(w-4,h-24);c.stroke();
 if(target!=null&&target!==''){c.strokeStyle='#d29922';c.setLineDash([5,4]);c.beginPath();c.moveTo(pad,Y(target));c.lineTo(w-4,Y(target));c.stroke();c.setLineDash([]);
  c.fillStyle='#e3b341';c.font='9px sans-serif';c.textAlign='right';c.fillText('🎯 '+target,w-6,Y(target)-4);}
 c.strokeStyle='#58a6ff';c.lineWidth=2;c.beginPath();
 vals.forEach((v,i)=>{if(i===0)c.moveTo(X(i),Y(v));else c.lineTo(X(i),Y(v));});c.stroke();
 vals.forEach((v,i)=>{c.fillStyle='#3fb950';c.beginPath();c.arc(X(i),Y(v),3.5,0,7);c.fill();
  c.fillStyle='#e6edf3';c.font='9px sans-serif';c.textAlign='center';c.fillText(String(v),X(i),Y(v)-8);
  c.fillStyle='#8b949e';c.fillText(labels[i],X(i),h-10);});
}
function drawCharts(){
 const cw=$('#chWeek');
 if(cw){const labels=[],vals=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=fmt(d);
  const ss=S.daily.filter(r=>r.date===k&&r.done);labels.push(DAYS3[d.getDay()]);vals.push(Math.round(ss.reduce((a,r)=>a+durJam(r.mulai,r.selesai),0)*10)/10);}barChart(cw,labels,vals);}
 const cm=$('#chMonth');
 if(cm){const labels=[],vals=[];const y=+monthKeyNow().slice(0,4);for(let m=1;m<=12;m++){const k=y+'-'+p2(m);
  const h=S.history.months[k]?S.history.months[k].hours:0;labels.push(MONTHS[m-1]);vals.push(h);}
 const cur=S.history.months[monthKeyNow()];vals[+monthKeyNow().slice(5,7)-1]=cur?cur.hours:stats(null,null,...rangeOf('month')).hours;
 barChart(cm,labels,vals,'#3fb950');}
 $$('#chTo').forEach(cv=>{const d=driveById(cv.dataset.to);const s=toSub(d.id);if(!s)return;
  const recs=[...(s.toRecords||[])].sort((a,b)=>a.tanggal.localeCompare(b.tanggal));
  if(!recs.length)return;
  lineChart(cv,recs.map(r=>r.tanggal.slice(5)),recs.map(r=>+r.skor),+s.toTarget||null);});
}

/* ---------------- Modal & form CRUD ---------------- */
function openModal(html){$('#modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal card">${html}</div></div>`;}
function closeModal(){$('#modal-root').innerHTML='';}
function openDriveForm(id){
 const d=id?driveById(id):null;
 openModal(`<h3>${d?'✎ Edit Drive':'＋ Drive Baru'} <button class="x" style="float:right" onclick="closeModal()">✕</button></h3>
 <label class="fld">Ikon (emoji)</label><input class="tin" id="fIcon" value="${esc(d?d.icon:'🎯')}">
 <label class="fld">Judul drive</label><input class="tin" id="fTitle" value="${esc(d?d.title:'')}" placeholder="misal: Lolos UTBK">
 <label class="fld">Target</label><input class="tin" id="fTarget" value="${esc(d?d.target:'')}" placeholder="misal: Masuk ITB 2027 — skor 750+">
 <label class="fld">Hukuman (commitment device)</label><input class="tin" id="fPun" value="${esc(d?d.punishment.text:'')}" placeholder="misal: Traktir 3 teman…">
 <label class="fld">Penjaga komitmen</label><input class="tin" id="fKeeper" value="${esc(d?d.punishment.keeper:'')}" placeholder="Ibu / Ayah / sahabat">
 <div class="row" style="margin-top:14px"><button class="btn primary" onclick="saveDrive('${id||''}')">💾 Simpan</button><button class="btn" onclick="closeModal()">Batal</button></div>`);
}
function saveDrive(id){
 const v=k=>$('#'+k).value.trim();
 if(!v('fTitle'))return alert('Judul wajib diisi');
 if(id){const d=driveById(id);Object.assign(d,{icon:v('fIcon')||'🎯',title:v('fTitle'),target:v('fTarget')});d.punishment.text=v('fPun');d.punishment.keeper=v('fKeeper');}
 else S.drives.push({id:uid(),icon:v('fIcon')||'🎯',title:v('fTitle'),target:v('fTarget'),punishment:{text:v('fPun'),keeper:v('fKeeper')},subs:[]});
 save();closeModal();render();
}
function delDrive(id){if(!confirm('Hapus drive ini beserta semua bidangnya?'))return;S.drives=S.drives.filter(d=>d.id!==id);if(view.driveId===id){view.driveId=null;location.hash='#/';}save();render();}
function openSubForm(did,sid){
 const pair=subById(did,sid);const s=pair[1];
 openModal(`<h3>${s?'✎ Edit Bidang':'＋ Bidang Baru'} <button class="x" style="float:right" onclick="closeModal()">✕</button></h3>
 <label class="fld">Nama bidang / subtes</label><input class="tin" id="fTitle" value="${esc(s?s.title:'')}" placeholder="misal: PK — Penalaran Kuantitatif">
 <label class="fld">Target jam / minggu</label><input type="number" class="tin" id="fJam" value="${s?s.targetJam||'':''}">
 <label class="fld">Hukuman khusus bidang (opsional)</label><input class="tin" id="fPun" value="${esc(s?s.punishment||'':'')}" placeholder="Kosongkan = pakai hukuman drive">
 <div class="row" style="margin-top:14px"><button class="btn primary" onclick="saveSub('${did}','${sid||''}')">💾 Simpan</button><button class="btn" onclick="closeModal()">Batal</button></div>`);
}
function saveSub(did,sid){
 const d=driveById(did);const title=$('#fTitle').value.trim();if(!title)return alert('Nama wajib diisi');
 const pun=$('#fPun').value.trim();const jam=+$('#fJam').value||0;
 if(sid){const s=d.subs.find(x=>x.id===sid);s.title=title;s.targetJam=jam;s.punishment=pun;}
 else d.subs.push({id:uid(),title,targetJam:jam,punishment:pun,kind:'sub',routine:{days:[],fases:[{name:'Malam',mulai:'19:00',selesai:'21:00',fokus:''}]},planColumns:['Latsol 1'],plan:[]});
 save();closeModal();render();
}
function delSub(did,sid){if(!confirm('Hapus bidang ini?'))return;const d=driveById(did);d.subs=d.subs.filter(x=>x.id!==sid);if(view.subId===sid){view.subId=null;location.hash='#/drive/'+did;}save();render();}
function addToModule(did){const d=driveById(did);
 if(d.subs.some(s=>s.kind==='to'))return alert('Modul TO sudah ada');
 d.subs.push({id:uid(),title:'Try Out',kind:'to',toTarget:'',toRecords:[]});save();render();}
function openToForm(did,recId){
 const s=toSub(did);const r=recId?(s.toRecords||[]).find(x=>x.id===recId):null;
 const d=driveById(did);const sibs=d.subs.filter(x=>x.kind!=='to');
 const subRows=sibs.map(sb=>{const v=(r&&(r.perSubtes||{})[sb.id])||{b:'',s:''};
  return `<div class="pun-row" style="margin:4px 0"><label style="min-width:150px">${esc(sb.title)}</label>
  <input type="number" class="tin w20" placeholder="benar" value="${v.b}" id="ts_${sb.id}_b">
  <input type="number" class="tin w20" placeholder="salah" value="${v.s}" id="ts_${sb.id}_s"></div>`;}).join('');
 openModal(`<h3>${r?'✎ Edit Hasil TO':'＋ Tambah Hasil TO'} <button class="x" style="float:right" onclick="closeModal()">✕</button></h3>
 <div class="goal2">
 <div><label class="fld">Nama TO</label><input class="tin" id="fNama" value="${esc(r?r.nama:'TO #'+((s.toRecords||[]).length+1))}"></div>
 <div><label class="fld">Tanggal</label><input type="date" class="tin" id="fTgl" value="${r?r.tanggal:todayStr()}"></div>
 <div><label class="fld">Skor total</label><input type="number" class="tin" id="fSkor" value="${r?r.skor:''}"></div>
 <div><label class="fld">Benar (total)</label><input type="number" class="tin" id="fB" value="${r?r.total.benar:''}"></div>
 <div><label class="fld">Salah (total)</label><input type="number" class="tin" id="fS" value="${r?r.total.salah:''}"></div>
 <div><label class="fld">Kosong (total)</label><input type="number" class="tin" id="fK" value="${r?r.total.kosong:0}"></div>
 </div>
 <h4>Rincian per subtes (benar / salah)</h4>${subRows||'<p class="hint">Tidak ada bidang lain di drive ini.</p>'}
 <div class="row" style="margin-top:14px"><button class="btn primary" onclick="saveTORecord('${did}','${recId||''}')">💾 Simpan</button><button class="btn" onclick="closeModal()">Batal</button></div>`);
}
function saveTORecord(did,recId){
 const s=toSub(did);const d=driveById(did);
 const perSubtes={};d.subs.filter(x=>x.kind!=='to').forEach(sb=>{perSubtes[sb.id]={b:+($('#ts_'+sb.id+'_b').value)||0,s:+($('#ts_'+sb.id+'_s').value)||0};});
 const rec={id:recId||uid(),nama:$('#fNama').value,tanggal:$('#fTgl').value,skor:+$('#fSkor').value||0,
  total:{benar:+$('#fB').value||0,salah:+$('#fS').value||0,kosong:+$('#fK').value||0},perSubtes};
 if(recId){const i=s.toRecords.findIndex(x=>x.id===recId);s.toRecords[i]=rec;}
 else{s.toRecords=s.toRecords||[];s.toRecords.push(rec);}
 save();closeModal();render();
}
function delTORecord(did,recId){if(!confirm('Hapus hasil TO ini?'))return;const s=toSub(did);s.toRecords=s.toRecords.filter(x=>x.id!==recId);save();render();}
function uToTarget(did,v){const s=toSub(did);s.toTarget=+v||'';save();render();}

/* ---------------- Generator Hukuman ---------------- */
let punCtx={d:null,s:null},punCat=0;
function openPunish(did,sid){
 punCtx={d:did,s:sid};punCat=0;
 openModal(`<h3>🎲 Generator Hukuman <button class="x" style="float:right" onclick="closeModal()">✕</button></h3>
 <p class="hint">Commitment device: konsekuensi disepakati SEBELUM gagal & dijaga orang lain.</p>
 <div class="segs" id="punCats" style="margin-top:10px">${PUNISH.map((c,i)=>`<button class="seg ${i===0?'on':''}" data-i="${i}" onclick="setPunCat(${i})">${c[0]}</button>`).join('')}<button class="seg" data-i="-1" onclick="setPunCat(-1)">🎲 Acak semua</button></div>
 <div class="pun-res" id="punRes">Tekan «Acak» untuk dapat ide hukuman…</div>
 <div class="row"><button class="btn" onclick="spinPunish()">🎲 Acak</button><button class="btn primary" onclick="applyPunish()">✅ Pakai</button></div>`);
}
function setPunCat(i){punCat=i;$$('#punCats .seg').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));}
function spinPunish(){const items=punCat===-1?PUNISH.flatMap(c=>c[1]):PUNISH[punCat][1];
 const t=items[Math.floor(Math.random()*items.length)];const el=$('#punRes');el.textContent=t;el.dataset.v=t;}
function applyPunish(){const v=$('#punRes').dataset.v;if(!v)return;
 if(punCtx.s){const pair=subById(punCtx.d,punCtx.s);if(pair[1])pair[1].punishment=v;}
 else{const d=driveById(punCtx.d);if(d)d.punishment.text=v;}
 save();closeModal();render();}

/* ---------------- HANDLERS: data kecil ---------------- */
function uLife(f,v){S.lifeGoal[f]=v;save();}
function uDrivePun(id,f,v){const d=driveById(id);if(d)d.punishment[f]=v;save();}
function uSubPun(did,sid,v){const pair=subById(did,sid);if(pair[1])pair[1].punishment=v;save();}
function uTargetJam(did,sid,v){const pair=subById(did,sid);if(pair[1])pair[1].targetJam=+v||0;save();}
function setFilter(f){view.f=f;render();}
function setGoalTab(k){view.goalTab=k;render();}
/* routine */
function tglRoutineDay(did,sid,day){const pair=subById(did,sid);const r=pair[1].routine;
 const i=r.days.indexOf(day);if(i>=0)r.days.splice(i,1);else r.days.push(day);save();render();}
function updFase(did,sid,i,f,v){const pair=subById(did,sid);const fa=pair[1].routine.fases;if(!fa[i])return;fa[i][f]=v;save();}
function addFase(did,sid){const pair=subById(did,sid);pair[1].routine.fases.push({name:'Fase '+(pair[1].routine.fases.length+1),mulai:'',selesai:'',fokus:''});save();render();}
function delFase(did,sid,i){const pair=subById(did,sid);pair[1].routine.fases.splice(i,1);save();render();}
/* plan */
function updPlan(did,sid,i,f,v){const pair=subById(did,sid);const p=pair[1].plan[i];if(!p)return;p[f]=v;save();render();}
function tglPlan(did,sid,i,c){const pair=subById(did,sid);const p=pair[1].plan[i];if(!p)return;p.done=c;if(c)touchStreak();save();render();}
function addPlan(did,sid){const pair=subById(did,sid);const s=pair[1];
 s.plan.push({id:uid(),tanggal:todayStr(),deadline:'',materi:'',latsols:s.planColumns.map(()=>({nama:'',jumlah:''})),done:false,catatan:''});save();render();}
function delPlan(did,sid,i){const pair=subById(did,sid);pair[1].plan.splice(i,1);save();render();}
function updLatsol(did,sid,i,ci,f,v){const pair=subById(did,sid);const p=pair[1].plan[i];if(!p)return;
 if(!p.latsols)p.latsols=[];if(!p.latsols[ci])p.latsols[ci]={nama:'',jumlah:''};p.latsols[ci][f]=v;save();}
function addPlanCol(did,sid){const pair=subById(did,sid);const s=pair[1];
 s.planColumns.push('Latsol '+s.planColumns.length);s.plan.forEach(p=>{p.latsols=p.latsols||[];p.latsols.push({nama:'',jumlah:''});});save();render();}
function renPlanCol(did,sid,ci){const pair=subById(did,sid);const s=pair[1];
 const v=prompt('Nama kolom:',s.planColumns[ci]);if(v==null)return;s.planColumns[ci]=v.trim()||s.planColumns[ci];save();render();}
function delPlanCol(did,sid,ci){const pair=subById(did,sid);const s=pair[1];if(!confirm('Hapus kolom "'+s.planColumns[ci]+'"?'))return;
 s.planColumns.splice(ci,1);s.plan.forEach(p=>{if(p.latsols)p.latsols.splice(ci,1);});save();render();}
/* daily */
function updDaily(id,f,v){const r=S.daily.find(x=>x.id===id);if(!r)return;r[f]=v;save();render();}
function updDailySub(id,v){const r=S.daily.find(x=>x.id===id);if(!r)return;const p=v.split('|');r.driveId=p[0];r.subId=p[1];save();render();}
function tglDaily(id,c){const r=S.daily.find(x=>x.id===id);if(!r)return;r.done=c;if(c)touchStreak();save();render();}
function addDaily(){S.daily.push({id:uid(),date:todayStr(),driveId:S.drives[0].id,subId:(S.drives[0].subs.find(s=>s.kind!=='to')||{}).id||'',mulai:'',selesai:'',kegiatan:'',done:false});save();render();}
function delDaily(id){S.daily=S.daily.filter(x=>x.id!==id);save();render();}
/* assign */
function updAssign(id,f,v){const a=S.assignments.find(x=>x.id===id);if(!a)return;a[f]=v;save();render();}
function tglAssign(id,c){const a=S.assignments.find(x=>x.id===id);if(!a)return;a.done=c;if(c)touchStreak();save();render();}
function addAssign(){S.assignments.push({id:uid(),driveId:S.drives[0].id,matkul:'',tugas:'',deadline:'',done:false});save();render();}
function delAssign(id){S.assignments=S.assignments.filter(x=>x.id!==id);save();render();}
/* goals */
function addGoal(k){const el=$('#newGoal');const v=el.value.trim();if(!v)return;S.goals[k].push({id:uid(),text:v,done:false});save();render();}
function updGoal(k,id,v){const g=S.goals[k].find(x=>x.id===id);if(g)g.text=v;save();}
function tglGoal(k,id,c){const g=S.goals[k].find(x=>x.id===id);if(g)g.done=c;if(c)touchStreak();save();render();}
function delGoal(k,id){S.goals[k]=S.goals[k].filter(x=>x.id!==id);save();render();}
/* habits */
function addHabit(){const el=$('#newHabit');const v=el.value.trim();if(!v)return;
 S.habits.push({id:uid(),title:v,driveId:$('#habitDrive').value,log:{}});save();render();}
function tglHabit(id,c){const h=habitById(id);if(!h)return;
 if(c){h.log[todayStr()]=true;touchStreak();}else delete h.log[todayStr()];save();render();}
function delHabit(id){S.habits=S.habits.filter(x=>x.id!==id);save();render();}

/* ---------------- Keyboard nav ala Sheets ---------------- */
document.addEventListener('keydown',e=>{
 const t=e.target;
 if(!t.classList||!t.classList.contains('tin')||t.tagName==='SELECT')return;
 if(t.id==='newGoal'||t.id==='newHabit')return;
 const table=t.closest('table');if(!table||!table.dataset.cols)return;
 const cols=+table.dataset.cols;
 const inputs=Array.from(table.querySelectorAll('.tin')).filter(el=>el.tagName!=='SELECT');
 const i=inputs.indexOf(t);
 if(e.key==='Enter'&&!e.shiftKey){
  e.preventDefault();const n=i+cols;
  if(n>=inputs.length){
   const k=table.dataset.kind;
   if(k==='daily')addDaily();
   else if(k==='assign')addAssign();
   else if(k==='plan')addPlan(table.dataset.d,table.dataset.s);
  }else inputs[n].focus();
 }else if(e.key==='ArrowDown'&&t.type!=='number'){e.preventDefault();if(i+cols<inputs.length)inputs[i+cols].focus();}
 else if(e.key==='ArrowUp'&&t.type!=='number'){e.preventDefault();if(i-cols>=0)inputs[i-cols].focus();}
});

/* ---------------- Export / Import ---------------- */
function exportData(){
 const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download='lifeos-v3-'+todayStr()+'.json';a.click();URL.revokeObjectURL(a.href);
}
function importData(ev){
 const f=ev.target.files[0];if(!f)return;
 const r=new FileReader();
 r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.drives)throw new Error('bad');S=d;archive();save();render();}catch(e){alert('File tidak valid');}};
 r.readAsText(f);ev.target.value='';
}

/* ---------------- BOOT ---------------- */
load();archive();
window.addEventListener('hashchange',route);
if(!location.hash)location.hash='#/';
route();
setInterval(tick,1000);
