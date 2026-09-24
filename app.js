/* ================================================================
   MISI HIDUP FAREL v2.0 — Life OS
   Buku 3 halaman: Home (misi hidup) -> Drive -> Subtest (plan sheet)
   Data: localStorage (auto-save) + Export/Import JSON
   Waktu: real-time clock, reset mingguan tiap Senin, bulanan tiap tgl 1
   ================================================================ */
'use strict';

/* ---------------- Utils ---------------- */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const uid=()=>Math.random().toString(36).slice(2,10);
const p2=n=>String(n).padStart(2,'0');
const fmt=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const todayStr=()=>fmt(new Date());
const DAYS=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function niceDate(s){if(!s)return'—';const d=new Date(s+'T00:00:00');if(isNaN(d))return s;return DAYS[d.getDay()]+', '+d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();}
function daysLeft(s){return Math.round((new Date(s+'T00:00:00')-new Date(todayStr()+'T00:00:00'))/864e5);}
function durJam(a,b){if(!a||!b)return 0;const x=a.split(':'),y=b.split(':');let t=(+y[0]*60+(+y[1]))-(+x[0]*60+(+x[1]));if(t<0)t+=1440;return t/60;}
function weekStart(d){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;} // SENIN
function isoWeek(t){const d=new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()));d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)+3);const f=new Date(Date.UTC(d.getUTCFullYear(),0,4));f.setUTCDate(f.getUTCDate()-((f.getUTCDay()+6)%7)+3);return 1+Math.round((d-f)/6048e5);}
const weekKeyNow=()=>{const w=weekStart(new Date());return w.getFullYear()+'-W'+p2(isoWeek(w));};
const monthKeyNow=()=>todayStr().slice(0,7);
function weekLabelOf(ws){const a=new Date(ws+'T00:00:00');const b=new Date(a.getTime()+6*864e5);const f=d=>d.getDate()+' '+MONTHS[d.getMonth()];return f(a)+' – '+f(b)+' '+b.getFullYear();}
const monthLabelOf=k=>{const y=+k.slice(0,4),m=+k.slice(5,7);return MONTHS[m-1]+' '+y;};
function rangeOf(period){const n=new Date();
 if(period==='day')return[todayStr(),todayStr()];
 if(period==='week'){const a=fmt(weekStart(n));const b=fmt(new Date(weekStart(n).getTime()+6*864e5));return[a,b];}
 const a=n.getFullYear()+'-'+p2(n.getMonth()+1)+'-01';const b=fmt(new Date(n.getFullYear(),n.getMonth()+1,0));return[a,b];}

/* ---------------- Bank ide hukuman (commitment devices) ---------------- */
const PUNISH=[
 ['💸 Finansial',['Setor Rp25.000 ke orang tua, tidak boleh diminta balik','Traktir satu teman makan siang (min. Rp30.000)','Belikan sesuatu untuk adik/keluarga — bukan untuk dirimu sendiri','Tabung Rp50.000 ke rekening khusus "dana gagal" yang hanya boleh dipakai kalau target tercapai']],
 ['⏰ Waktu & Tubuh',['Bangun jam 04.00 selama 3 hari berturut-turut','Lari 3 km besok pagi SEBELUM belajar','Hapus 1 aplikasi game, baru install lagi setelah drive ini tercapai','No HP & media sosial 24 jam penuh']],
 ['📚 Belajar Ekstra',['Ulang materi minggu ini dari nol + 1 paket latsol tambahan','Tulis rangkuman tangan 5 halaman tentang materi yang terlewat','Kerjakan 1 try out tambahan di hari libur','Bikin flashcard 20 kartu dari materi yang kamu bolongi']],
 ['📣 Sosial (Support System)',['Lapor jujur ke penjaga komitmen & jalani konsekuensi yang disepakati','Posting story jujur: "Minggu ini saya gagal komitmen, evaluasi diri"','Minta sahabat mengecek progres setiap malam selama 1 minggu','Ceritakan ke orang tua target minggu ini yang gagal + alasannya']]
];

/* ---------------- Default data (seed) ---------------- */
function seed(){return {
 version:2,
 lifeGoals:{
  fiveTitle:'S2 ke Luar Negeri (beasiswa penuh)',
  fiveDesc:'Lulus ITB → IPK tinggi → IELTS 7.0 → beasiswa S2. Setiap sesi belajar hari ini menambah persentase mimpi ini.',
  dep:'UNNES (sekarang) → UTBK ulang → ITB → S2 Luar Negeri',
  year:'2027: Lolos ITB, IELTS 7.0, IPK 4.0 semester 1',
  month:'September: selesaikan PK & PBM Bab 1–3, IELTS Reading 7.0, semua PR tepat waktu'
 },
 drives:[
  {id:'utbk',icon:'🎓',title:'Lolos UTBK',target:'Masuk ITB 2027 — skor 750+',
   punishment:{text:'Traktir 3 teman + setor Rp50.000 ke Ibu',keeper:'Ibu'},
   subs:[
    {id:'pk',title:'PK — Penalaran Kuantitatif',scheduleText:'Senin & Kamis • 3 sesi (pagi, siang, malam) • ±9 jam/minggu',targetJam:9,punishment:'',
     plan:[{id:uid(),tanggal:'2026-09-28',deadline:'2026-10-02',materi:'Eksponen & Logaritma',latsols:[{nama:'Big Book PK',jumlah:20},{nama:'Bank Soal Alpha',jumlah:15}],done:false,catatan:''}],
     to:{deadline:'2026-10-05',scores:[{tanggal:'2026-09-20',nilai:612,ket:'TO #1'}]}},
    {id:'ppu',title:'PPU — Pengetahuan Umum',scheduleText:'Selasa • 2 sesi • ±4 jam/minggu',targetJam:4,punishment:'',plan:[],to:{deadline:'2026-10-05',scores:[]}},
    {id:'pbm',title:'PBM — Pemahaman Bacaan',scheduleText:'Rabu & Sabtu • 2 sesi • ±6 jam/minggu',targetJam:6,punishment:'',
     plan:[{id:uid(),tanggal:'2026-09-25',deadline:'2026-09-27',materi:'Inference & Main Idea',latsols:[{nama:'Bank Soal PBM',jumlah:30}],done:false,catatan:''}],
     to:{deadline:'2026-10-05',scores:[]}},
    {id:'pu',title:'PU — Penalaran Umum',scheduleText:'Jumat • 2 sesi • ±4 jam/minggu',targetJam:4,punishment:'',plan:[],to:{deadline:'2026-10-05',scores:[]}},
    {id:'lbi',title:'Literasi Bahasa Indonesia',scheduleText:'Fleksibel • 1 sesi/hari • ±3 jam/minggu',targetJam:3,punishment:'',plan:[],to:{deadline:'2026-10-05',scores:[]}},
    {id:'lbe',title:'Literasi Bahasa Inggris',scheduleText:'Fleksibel • 1 sesi/hari • ±3 jam/minggu',targetJam:3,punishment:'',plan:[],to:{deadline:'2026-10-05',scores:[]}},
    {id:'pm',title:'Penalaran Matematika',scheduleText:'Minggu • 3 sesi • ±6 jam/minggu',targetJam:6,punishment:'',plan:[],to:{deadline:'2026-10-05',scores:[]}}
   ]},
  {id:'ielts',icon:'🌍',title:'IELTS 7.0+',target:'Overall 7.0 (min. 6.5 tiap band)',
   punishment:{text:'No YouTube 3 hari + speaking practice 2x sehari',keeper:'Sahabat'},
   subs:[
    {id:'reading',title:'Reading',scheduleText:'Senin & Kamis • 2 sesi • ±5 jam/minggu',targetJam:5,punishment:'',
     plan:[{id:uid(),tanggal:'2026-09-26',deadline:'2026-09-29',materi:'Cambridge 18 Test 1',latsols:[{nama:'C18 T1 Passage 1-3',jumlah:40}],done:false,catatan:''}],
     to:{deadline:'2026-10-10',scores:[{tanggal:'2026-09-15',nilai:6.5,ket:'Mock #1'}]}},
    {id:'listening',title:'Listening',scheduleText:'Selasa & Jumat • 2 sesi • ±4 jam/minggu',targetJam:4,punishment:'',plan:[],to:{deadline:'2026-10-10',scores:[]}},
    {id:'speaking',title:'Speaking',scheduleText:'Rabu • 2 sesi • ±3 jam/minggu',targetJam:3,punishment:'',plan:[],to:{deadline:'2026-10-10',scores:[]}},
    {id:'writing',title:'Writing',scheduleText:'Sabtu • 2 sesi • ±4 jam/minggu',targetJam:4,punishment:'',plan:[],to:{deadline:'2026-10-10',scores:[]}}
   ]},
  {id:'ipk',icon:'📚',title:'IPK 4.0 Semester 1',target:'Semua mata kuliah dapat A',
   punishment:{text:'Setor Rp50.000 + rangkum ulang materi 10 halaman',keeper:'Orang tua'},
   subs:[
    {id:'kalkulus',title:'Kalkulus',scheduleText:'Senin & Kamis • 2 sesi • ±6 jam/minggu',targetJam:6,punishment:'',plan:[],to:{deadline:'',scores:[]}},
    {id:'fisika',title:'Fisika Dasar',scheduleText:'Selasa • 2 sesi • ±4 jam/minggu',targetJam:4,punishment:'',plan:[],to:{deadline:'',scores:[]}},
    {id:'bing',title:'Bahasa Inggris Akademik',scheduleText:'Rabu • 1 sesi • ±2 jam/minggu',targetJam:2,punishment:'',plan:[],to:{deadline:'',scores:[]}},
    {id:'pti',title:'Pengantar TI',scheduleText:'Jumat • 1 sesi • ±2 jam/minggu',targetJam:2,punishment:'',plan:[],to:{deadline:'',scores:[]}}
   ]}
 ],
 daily:[
  {id:uid(),date:'2026-09-25',driveId:'utbk',subId:'pk',mulai:'04:00',selesai:'06:00',kegiatan:'Eksponen — materi + Big Book PK',done:false},
  {id:uid(),date:'2026-09-25',driveId:'utbk',subId:'pbm',mulai:'18:30',selesai:'21:00',kegiatan:'Inference — baca + 30 soal',done:false}
 ],
 assignments:[
  {id:uid(),driveId:'ipk',matkul:'Kalkulus',tugas:'Latihan Bab 2 no 1-20',deadline:'2026-09-28',done:false},
  {id:uid(),driveId:'ipk',matkul:'Fisika Dasar',tugas:'Tugas / PR minggu ini…',deadline:'2026-10-01',done:false}
 ],
 history:{weeks:{},months:{}},
 meta:{weekKey:weekKeyNow(),weekStart:fmt(weekStart(new Date())),monthKey:monthKeyNow()}
};}

/* ---------------- Load / save / arsip periode ---------------- */
const LS='mhf_v2_data';
let S;
function load(){try{const r=localStorage.getItem(LS);if(r){S=JSON.parse(r);return;}}catch(e){}S=seed();}
let saveT=null;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}},150);}

function findSub(did,sid){const d=S.drives.find(x=>x.id===did);if(!d)return[null,null];return[d,d.subs.find(x=>x.id===sid)];}
function collect(driveId,subId){
 const items=[],sessions=[];
 S.drives.forEach(d=>{if(driveId&&d.id!==driveId)return;
  d.subs.forEach(s=>{if(subId&&s.id!==subId)return;
   (s.plan||[]).forEach(pl=>items.push({date:pl.tanggal||pl.deadline||todayStr(),done:!!pl.done}));});});
 S.assignments.forEach(a=>{if(driveId&&a.driveId!==driveId)return;items.push({date:a.deadline||todayStr(),done:!!a.done});});
 S.daily.forEach(r=>{if(driveId&&r.driveId!==driveId)return;if(subId&&r.subId!==subId)return;sessions.push(r);});
 return{items,sessions};
}
function stats(driveId,subId,a,b){
 const c=collect(driveId,subId);
 const it=c.items.filter(i=>i.date>=a&&i.date<=b);
 const ss=c.sessions.filter(r=>r.date>=a&&r.date<=b);
 const done=it.filter(i=>i.done).length+ss.filter(r=>r.done).length;
 const total=it.length+ss.length;
 const hours=ss.filter(r=>r.done).reduce((sum,r)=>sum+durJam(r.mulai,r.selesai),0);
 return{hours:Math.round(hours*10)/10,done,total,pct:total?Math.round(done/total*100):0};
}
function overdue(driveId,subId){
 const t=todayStr();const out=[];
 S.drives.forEach(d=>{if(driveId&&d.id!==driveId)return;d.subs.forEach(s=>{if(subId&&s.id!==subId)return;
  (s.plan||[]).forEach(pl=>{if(pl.deadline&&!pl.done&&pl.deadline<t)out.push({kind:'plan',title:pl.materi||'(tanpa materi)',deadline:pl.deadline,where:s.title});});});});
 S.assignments.forEach(a=>{if(a.deadline&&!a.done&&a.deadline<t&&(!driveId||a.driveId===driveId))out.push({kind:'PR',title:a.matkul+' — '+a.tugas,deadline:a.deadline,where:a.matkul});});
 return out.sort((x,y)=>x.deadline.localeCompare(y.deadline));
}
/* Reset mingguan tiap SENIN, bulanan tiap TANGGAL 1 — periode lama otomatis diarsip */
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

/* ---------------- Router & kerangka render ---------------- */
let view={page:'home',driveId:null,subId:null,f:'today'};
function route(){
 const h=location.hash||'#/';
 const m=h.match(/^#\/sub\/([^/]+)\/([^/]+)/),m2=h.match(/^#\/drive\/([^/]+)/);
 if(m){view.page='sub';view.driveId=m[1];view.subId=m[2];}
 else if(m2){view.page='drive';view.driveId=m2[1];view.subId=null;}
 else{view.page='home';view.driveId=null;view.subId=null;}
 render();
}
function topbar(title,back){
 return `<div class="topbar">${back?`<a class="btn ghost" href="${back}">←</a>`:''}
 <div class="tb-mid"><h1>${title}</h1><div id="clock" class="clock">…</div></div>
 ${view.page==='home'?`<div class="tb-btns"><button class="btn ghost" onclick="exportData()">↓ Export</button><button class="btn ghost" onclick="document.getElementById('impFile').click()">↑ Import</button><input type="file" id="impFile" accept=".json" style="display:none" onchange="importData(event)"></div>`:''}
 </div>`;
}
function tick(){const c=$('#clock');if(!c)return;const n=new Date();c.textContent=DAYS[n.getDay()]+', '+n.getDate()+' '+MONTHS[n.getMonth()]+' '+n.getFullYear()+' • '+p2(n.getHours())+':'+p2(n.getMinutes())+':'+p2(n.getSeconds());}
function render(){
 const app=$('#app');
 app.innerHTML=view.page==='home'?vHome():view.page==='drive'?vDrive(view.driveId):vSub(view.driveId,view.subId);
 tick();
 const af=$('[data-autofocus]');if(af){af.focus();af.removeAttribute('data-autofocus');}
}

/* ---------------- Komponen kecil ---------------- */
function miniBars(st){
 return `<div class="mbar"><span>Hari</span><div class="bar"><i style="width:${st.h.pct}%"></i></div><b>${st.h.pct}%</b></div>
 <div class="mbar"><span>Minggu</span><div class="bar"><i style="width:${st.w.pct}%"></i></div><b>${st.w.pct}%</b></div>
 <div class="mbar"><span>Bulan</span><div class="bar"><i style="width:${st.m.pct}%"></i></div><b>${st.m.pct}%</b></div>`;
}
function statTriple(driveId,subId){
 const[a1,b1]=rangeOf('day'),[a2,b2]=rangeOf('week'),[a3,b3]=rangeOf('month');
 return{h:stats(driveId,subId,a1,b1),w:stats(driveId,subId,a2,b2),m:stats(driveId,subId,a3,b3)};
}
function dlPill(dl){if(!dl)return'<span class="pill">—</span>';const n=daysLeft(dl);
 if(n<0)return`<span class="pill red">Lewat ${-n} hr</span>`;if(n===0)return'<span class="pill org">HARI INI</span>';if(n<=2)return`<span class="pill org">H-${n}</span>`;return`<span class="pill grn">H-${n}</span>`;}

/* ---------------- HALAMAN 1: HOME ---------------- */
function driveCard(d){
 const st=statTriple(d.id,null);
 const od=overdue(d.id,null).length;
 return `<a class="card drive" href="#/drive/${d.id}">
  <div class="d-head"><span class="d-ic">${d.icon}</span>
   <div class="d-tt"><h3>${esc(d.title)}</h3><p>${esc(d.target)}</p></div>
   ${od?`<span class="pill red">⚠ ${od} lewat</span>`:''}</div>
  <div class="mbars">${miniBars(st)}</div>
  <div class="d-foot"><span>⏱ ${st.h.hours} jam hari ini</span><span>✅ ${st.h.done}/${st.h.total} sesi</span><span>🗓️ ${st.w.hours} jam minggu ini</span></div>
  <div class="d-pun">🚨 ${esc(d.punishment.text||'belum ada hukuman')} <span class="keeper">· penjaga: ${esc(d.punishment.keeper||'—')}</span></div>
 </a>`;
}
function vHome(){
 const lg=S.lifeGoals;
 const[a1,b1]=rangeOf('day'),[a2,b2]=rangeOf('week'),[a3,b3]=rangeOf('month');
 const td=stats(null,null,a1,b1),wk=stats(null,null,a2,b2),mo=stats(null,null,a3,b3);
 return topbar('🎯 Misi Hidup Farel',null)+`
 <section class="card book">
  <h3>📖 Buku Misi — Halaman 1 <span class="tag">akar pohon</span></h3>
  <label class="fld">Tujuan 5 Tahun (tidak bisa dilangkahi — ini yang memberi arti semua drive)</label>
  <input class="tin big" value="${esc(lg.fiveTitle)}" onchange="uLife('fiveTitle',this.value)">
  <textarea class="tin" rows="2" onchange="uLife('fiveDesc',this.value)">${esc(lg.fiveDesc)}</textarea>
  <div class="dep">🔗 Rantai target: ${esc(lg.dep)}</div>
  <div class="goal2">
   <div><label class="fld">🗓️ Goal tahun ini</label><input class="tin" value="${esc(lg.year)}" onchange="uLife('year',this.value)"></div>
   <div><label class="fld">📆 Goal bulan ini</label><input class="tin" value="${esc(lg.month)}" onchange="uLife('month',this.value)"></div>
  </div>
 </section>
 <div class="sec-h">🚩 Drive Besar <span class="hint">— ketuk untuk buka halaman 2 →</span></div>
 <section>${S.drives.map(driveCard).join('')}</section>
 <section class="card sumrow">
  <div class="sum"><span>⏱ Jam hari ini</span><b>${td.hours} jam</b><i>dari ${td.total} sesi terjadwal</i></div>
  <div class="sum"><span>✅ Sesi selesai</span><b>${td.done} / ${td.total}</b><i>${td.total-td.done} tersisa</i></div>
  <div class="sum"><span>🗓️ Minggu ini</span><b>${wk.hours} jam · ${wk.pct}%</b><i>${wk.done}/${wk.total} selesai</i></div>
  <div class="sum"><span>📅 Bulan ini</span><b>${mo.hours} jam · ${mo.pct}%</b><i>${mo.done}/${mo.total} selesai</i></div>
 </section>
 <section class="card">${dailyTable()}</section>
 <section class="card">${assignTable()}</section>
 <section class="card">${riwayat()}</section>
 <p class="foot-note">💾 Auto-save di browser • Enter/↓ = baris bawah, Tab = kolom, Enter di baris terakhir = tambah baris • Rajin Export JSON sebagai backup.</p>`;
}
/* Tabel: Rencana Harian (dapat difilter per drive/subtest) */
function dailyTable(dId,sId){
 const f=(dId||sId)?'all':view.f;const t=todayStr();const[a7]=rangeOf('week');
 let rows=S.daily.filter(r=>(!dId||r.driveId===dId)&&(!sId||r.subId===sId));
 rows=rows.filter(r=>f==='today'?r.date===t:f==='week'?(r.date>=a7&&r.date<=t):true)
  .sort((x,y)=>x.date.localeCompare(y.date)||String(x.mulai).localeCompare(String(y.mulai)));
 const opts=(curD,curS)=>S.drives.filter(dd=>!dId||dd.id===dId).map(d=>`<optgroup label="${esc(d.title)}">${d.subs.filter(ss=>!sId||ss.id===sId).map(s=>`<option value="${d.id}|${s.id}" ${(d.id===curD&&s.id===curS)?'selected':''}>${esc(s.title)}</option>`).join('')}</optgroup>`).join('');
 const trs=rows.map(r=>{const h=durJam(r.mulai,r.selesai);return `<tr class="${r.done?'done':''}">
  <td><input type="checkbox" ${r.done?'checked':''} onchange="tglDaily('${r.id}',this.checked)"></td>
  <td><input type="date" class="tin" value="${r.date}" onchange="updDaily('${r.id}','date',this.value)"></td>
  <td><input type="time" class="tin" value="${r.mulai}" onchange="updDaily('${r.id}','mulai',this.value)"></td>
  <td><input type="time" class="tin" value="${r.selesai}" onchange="updDaily('${r.id}','selesai',this.value)"></td>
  <td class="num">${h?h.toFixed(1):'—'}</td>
  <td><select class="tin" onchange="updDailySub('${r.id}',this.value)">${opts(r.driveId,r.subId)}</select></td>
  <td><input class="tin" placeholder="Kegiatan…" value="${esc(r.kegiatan)}" onchange="updDaily('${r.id}','kegiatan',this.value)"></td>
  <td><button class="x" onclick="delDaily('${r.id}')">✕</button></td></tr>`;}).join('');
 const seg=(dId||sId)?'':`<div class="segs">${['today','week','all'].map(k=>`<button class="seg ${f===k?'on':''}" onclick="setFilter('${k}')">${k==='today'?'Hari ini':k==='week'?'7 hari':'Semua'}</button>`).join('')}</div>`;
 return `<div class="t-head"><h3>📋 Rencana Harian <span class="tag">study_items</span></h3>${seg}</div>
 <div class="tw"><table class="sheet" data-kind="daily" data-cols="4">
 <thead><tr><th>✓</th><th>Tanggal</th><th>Mulai</th><th>Selesai</th><th>Jam</th><th>Drive / Bidang</th><th>Kegiatan</th><th></th></tr></thead>
 <tbody>${trs||`<tr><td colspan="8" class="empty">Belum ada rencana${f==='today'?' hari ini':''} — tambah baris di bawah 👇</td></tr>`}</tbody></table></div>
 <button class="btn add" onclick="addDaily()">＋ Tambah baris</button>`;
}
/* Tabel: Tugas / PR Kuliah */
function assignTable(dId){
 const rows=[...S.assignments].filter(a=>!dId||a.driveId===dId).sort((a,b)=>(a.done-b.done)||String(a.deadline).localeCompare(String(b.deadline)));
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
 return `<div class="t-head"><h3>🎓 Tugas / PR Kuliah <span class="tag">weekly_assignments</span></h3>
  <div class="sum2"><span class="pill blu">${act} aktif</span><span class="pill ${near?'org':'grn'}">⚠ ${near} deadline ≤2 hari</span></div></div>
 <datalist id="mk">${matkuls.map(m=>`<option value="${esc(m)}">`).join('')}</datalist>
 <div class="tw"><table class="sheet" data-kind="assign" data-cols="3"><thead><tr><th>✓</th><th>Matkul</th><th>Tugas / PR</th><th>Deadline</th><th>Sisa</th><th></th></tr></thead><tbody>${trs||'<tr><td colspan="6" class="empty">Belum ada tugas.</td></tr>'}</tbody></table></div>
 <button class="btn add" onclick="addAssign('${dId||'ipk'}')">＋ Tambah baris</button>`;
}
/* Riwayat: periode lama yang sudah diarsip otomatis */
function riwayat(){
 const wks=Object.entries(S.history.weeks).sort((a,b)=>b[0].localeCompare(a[0]));
 const mos=Object.entries(S.history.months).sort((a,b)=>b[0].localeCompare(a[0]));
 const row=e=>`<tr><td>${esc(e[1].label)}</td><td class="num">${e[1].hours} jam</td><td class="num">${e[1].done}/${e[1].total}</td><td class="num"><b>${e[1].pct}%</b></td></tr>`;
 const tbl=(list,title)=>`<div class="rh"><h4>${title}</h4>${list.length?`<table class="mini"><thead><tr><th>Periode</th><th>Jam</th><th>Sesi</th><th>%</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table>`:'<p class="hint">Belum ada — otomatis tersimpan tiap Senin / tanggal 1.</p>'}</div>`;
 return `<h3>🕘 Riwayat Tersimpan <span class="hint">mingguan reset tiap Senin · bulanan reset tiap tanggal 1</span></h3>
 <div class="riw">${tbl(wks,'🗓️ Mingguan')}${tbl(mos,'📅 Bulanan')}</div>`;
}

/* ---------------- HALAMAN 2: DRIVE ---------------- */
function vDrive(did){
 const d=S.drives.find(x=>x.id===did);
 if(!d)return vHome();
 const subs=d.subs.map(s=>{
  const st=statTriple(d.id,s.id);
  const od=overdue(d.id,s.id).length;
  const latest=s.to.scores.length?s.to.scores[s.to.scores.length-1]:null;
  return `<a class="card" href="#/sub/${d.id}/${s.id}">
   <div class="d-head"><div class="d-tt"><h3>${esc(s.title)}</h3><p>📅 ${esc(s.scheduleText)}</p></div>${od?`<span class="pill red">⚠ ${od} lewat</span>`:''}</div>
   <div class="mbars">${miniBars(st)}</div>
   <div class="d-foot"><span>⏱ ${st.w.hours} jam / ${s.targetJam||'—'} jam target mingguan</span><span>📝 ${s.plan.length} rencana</span>${latest?`<span>🏆 TO terakhir: <b>${esc(latest.nilai)}</b></span>`:''}</div>
   ${s.to.deadline?`<div class="d-pun">⏳ TO: ${niceDate(s.to.deadline)} · ${daysLeft(s.to.deadline)>=0?'sisa '+daysLeft(s.to.deadline)+' hari':'⚠ lewat '+(-daysLeft(s.to.deadline))+' hari'}</div>`:''}
  </a>`;}).join('');
 const[a3,b3]=rangeOf('month');
 const bars=d.subs.map(s=>{const st=stats(d.id,s.id,a3,b3);const short=s.title.split('—')[0].trim();return`<div class="hbar"><span class="hb-l" title="${esc(s.title)}">${esc(short)}</span><div class="bar h"><i style="width:${st.pct}%"></i></div><b>${st.pct}%</b></div>`;}).join('');
 return topbar(`${d.icon} ${esc(d.title)}`,'#/')+`
 <section class="card pun">
  <h3>🚨 Hukuman Drive <button class="btn small" onclick="openPunish('${d.id}','')">🎲 Generator ide</button></h3>
  <input class="tin" placeholder="Contoh: Traktir 3 teman + setor Rp50.000 ke Ibu…" value="${esc(d.punishment.text)}" onchange="uDrive('${d.id}','punishment.text',this.value)">
  <div class="pun-row"><label>👮 Penjaga komitmen (saksi):</label><input class="tin w50" placeholder="Ibu / Ayah / sahabat…" value="${esc(d.punishment.keeper)}" onchange="uDrive('${d.id}','punishment.keeper',this.value)"></div>
  <p class="hint" style="margin-top:6px">Rasa takut positif: konsekuensi disepakati SEBELUM gagal & dijaga orang lain (metode stickK/Beeminder). Hukum kegagalan jadwal — bukan nilai jelek.</p>
 </section>
 <div class="sec-h">📚 Bidang / Subtes <span class="hint">— ketuk untuk buka halaman 3 (plan sheet) →</span></div>
 <section>${subs}</section>
 <section class="card"><h3>📊 Progres Bulanan per Bidang</h3>${bars}</section>
 <section class="card">${dailyTable(d.id)}</section>
 <section class="card">${assignTable(d.id)}</section>`;
}

/* ---------------- HALAMAN 3: SUBTEST (paling dalam) ---------------- */
function vSub(did,sid){
 const pair=findSub(did,sid);const d=pair[0],s=pair[1];
 if(!d||!s)return vHome();
 const st=statTriple(did,sid);
 const od=overdue(did,sid);
 const odHtml=od.length?`<div class="odbox"><b>⏰ ${od.length} rencana/PR terlewat deadline (belum dikerjakan):</b><ul>${od.map(o=>`<li><span class="pill red">${o.deadline}</span> ${esc(o.title)}</li>`).join('')}</ul></div>`:'';
 const statCard=(t,x)=>`<div class="sum"><span>${t}</span><b>${x.hours} jam · ${x.pct}%</b><i>${x.done}/${x.total} selesai</i></div>`;
 return topbar(`${esc(s.title)}`,`#/drive/${did}`)+`
 <div class="crumb"><a href="#/">🏠 Home</a> › <a href="#/drive/${did}">${esc(d.title)}</a> › <b>${esc(s.title)}</b></div>
 ${odHtml}
 <section class="card sumrow">${statCard('☀️ Hari ini',st.h)}${statCard('🗓️ Minggu ini',st.w)}${statCard('📅 Bulan ini',st.m)}</section>
 <section class="card">
  <h3>🗓️ Jadwal Rutin</h3>
  <input class="tin" value="${esc(s.scheduleText)}" onchange="uSub('${did}','${sid}','scheduleText',this.value)">
  <div class="pun-row"><label>Target jam / minggu:</label><input type="number" class="tin w20" value="${s.targetJam||''}" onchange="uSub('${did}','${sid}','targetJam',this.value)"><span class="hint">jam · minggu ini baru ${st.w.hours} jam</span></div>
  <p class="hint" style="margin-top:6px">Contoh: “Senin & Kamis, 3 sesi (pagi, siang, malam), total ±9 jam”. Angka ini cuma acuan — yang dihitung persen tetap dari tugas yang selesai.</p>
 </section>
 <section class="card">${planSheet(d,s)}</section>
 <section class="card">${toCard(d,s)}</section>
 <section class="card pun">
  <h3>🚨 Hukaman Khusus Bidang Ini <button class="btn small" onclick="openPunish('${did}','${sid}')">🎲 Generator</button></h3>
  <input class="tin" placeholder="Kosongkan = pakai hukuman level drive…" value="${esc(s.punishment||'')}" onchange="uSub('${did}','${sid}','punishment',this.value)">
 </section>
 <section class="card">${dailyTable(did,sid)}</section>`;
}
/* Plan sheet: tanggal, deadline, materi, latsol 1-3 (nama + jml soal), total soal, ceklis, catatan */
function planSheet(d,s){
 const maxL=Math.min(3,Math.max(1,...s.plan.map(p=>((p.latsols||[]).length)||1),1));
 const latCols=Array.from({length:maxL},(_,i)=>`<th>Latsol ${i+1} <span class="hint">nama · jml soal</span></th>`).join('');
 const trs=s.plan.map((p,i)=>{
  const lats=Array.from({length:maxL},(_,li)=>{
   const L=(p.latsols||[])[li];
   if(L)return `<td><div class="lat"><input class="tin" placeholder="Nama latsol…" value="${esc(L.nama)}" onchange="updLatsol('${d.id}','${s.id}',${i},${li},'nama',this.value)"><input type="number" class="tin num" placeholder="jml soal" value="${L.jumlah}" onchange="updLatsol('${d.id}','${s.id}',${i},${li},'jumlah',this.value)"></div></td>`;
   if(li===(p.latsols||[]).length&&(p.latsols||[]).length<3)return `<td><button class="btn tiny" onclick="addLatsol('${d.id}','${s.id}',${i})">＋ latsol</button></td>`;
   return '<td class="dim">—</td>';
  }).join('');
  const totalSoal=(p.latsols||[]).reduce((a,L)=>a+(+L.jumlah||0),0);
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
 return `<div class="t-head"><h3>📋 Plan Belajar <span class="tag">media informasi — sheet</span></h3><span class="hint">kolom latsol bertambah otomatis sesuai kebutuhan (maks 3)</span></div>
 <div class="tw"><table class="sheet" data-kind="plan" data-cols="${4+2*maxL}" data-d="${d.id}" data-s="${s.id}">
 <thead><tr><th>✓</th><th>Tanggal</th><th>Deadline</th><th>Materi</th>${latCols}<th>Total Soal</th><th>Catatan</th><th></th></tr></thead>
 <tbody>${trs||`<tr><td colspan="${7+maxL}" class="empty">Belum ada plan — tambah baris di bawah 👇</td></tr>`}</tbody></table></div>
 <button class="btn add" onclick="addPlan('${d.id}','${s.id}')">＋ Tambah baris</button>`;
}
/* Try Out / Mock: deadline + riwayat nilai + grafik */
function toCard(d,s){
 const sc=s.to.scores;
 const max=Math.max(1,...sc.map(x=>+x.nilai||0))*1.15;
 const bars=sc.map(x=>`<div class="hbar"><span class="hb-l">${esc(x.tanggal)} ${esc(x.ket)}</span><div class="bar h"><i style="width:${Math.min(100,((+x.nilai||0)/max)*100)}%"></i></div><b>${esc(x.nilai)}</b></div>`).join('');
 const rows=sc.map((x,i)=>`<tr><td><input type="date" class="tin" value="${x.tanggal}" onchange="updScore('${d.id}','${s.id}',${i},'tanggal',this.value)"></td>
  <td><input type="number" class="tin num" value="${x.nilai}" onchange="updScore('${d.id}','${s.id}',${i},'nilai',this.value)"></td>
  <td><input class="tin" placeholder="ket…" value="${esc(x.ket)}" onchange="updScore('${d.id}','${s.id}',${i},'ket',this.value)"></td>
  <td><button class="x" onclick="delScore('${d.id}','${s.id}',${i})">✕</button></td></tr>`).join('');
 const dl=s.to.deadline?`<span class="pill ${daysLeft(s.to.deadline)<0?'red':daysLeft(s.to.deadline)<=2?'org':'grn'}">${niceDate(s.to.deadline)} · ${daysLeft(s.to.deadline)>=0?'sisa '+daysLeft(s.to.deadline)+' hr':'⚠ lewat '+(-daysLeft(s.to.deadline))+' hr'}</span>`:'<span class="pill">belum diatur</span>';
 return `<div class="t-head"><h3>📝 Try Out / Mock Test</h3>${dl}</div>
 <div class="pun-row"><label>Deadline TO berikutnya:</label><input type="date" class="tin w50" value="${s.to.deadline}" onchange="uTO('${d.id}','${s.id}',this.value)"></div>
 <div class="tw"><table class="sheet" data-kind="score" data-cols="3" data-d="${d.id}" data-s="${s.id}"><thead><tr><th>Tanggal</th><th>Nilai</th><th>Ket</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="4" class="empty">Belum ada nilai — tambah setiap selesai TO.</td></tr>'}</tbody></table></div>
 <button class="btn add" onclick="addScore('${d.id}','${s.id}')">＋ Tambah nilai TO</button>
 ${bars?`<h4>📊 Grafik Nilai</h4>${bars}`:''}`;
}

/* ---------------- Generator Hukuman (modal) ---------------- */
let punCtx={d:null,s:null},punCat=0;
function openPunish(did,sid){
 punCtx={d:did,s:sid};punCat=0;
 $('#modal-root').innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal card">
 <h3>🎲 Generator Hukuman <button class="x" style="float:right" onclick="closeModal()">✕</button></h3>
 <p class="hint">Commitment device: konsekuensi disepakati SEBELUM gagal & dijaga orang lain (prinsip stickK/Beeminder). Pilih kategori lalu acak.</p>
 <div class="segs" id="punCats" style="margin-top:10px">${PUNISH.map((c,i)=>`<button class="seg ${i===0?'on':''}" data-i="${i}" onclick="setPunCat(${i})">${c[0]}</button>`).join('')}<button class="seg" data-i="-1" onclick="setPunCat(-1)">🎲 Acak semua</button></div>
 <div class="pun-res" id="punRes">Tekan «Acak» untuk dapat ide hukuman…</div>
 <div class="row"><button class="btn" onclick="spinPunish()">🎲 Acak</button><button class="btn primary" onclick="applyPunish()">✅ Pakai hukuman ini</button></div>
 </div></div>`;
}
function setPunCat(i){punCat=i;$$('#punCats .seg').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));}
function spinPunish(){
 const items=punCat===-1?PUNISH.flatMap(c=>c[1]):PUNISH[punCat][1];
 const t=items[Math.floor(Math.random()*items.length)];
 const el=$('#punRes');el.textContent=t;el.dataset.v=t;
}
function applyPunish(){
 const v=$('#punRes').dataset.v;if(!v)return;
 const pair=findSub(punCtx.d,punCtx.s);
 if(punCtx.s&&pair[1]){pair[1].punishment=v;}else if(pair[0]){pair[0].punishment.text=v;}
 save();closeModal();render();
}
function closeModal(){$('#modal-root').innerHTML='';}

/* ---------------- HANDLERS: edit data ---------------- */
function uLife(f,v){S.lifeGoals[f]=v;save();}
function uDrive(id,f,v){const d=S.drives.find(x=>x.id===id);if(!d)return;
 if(f==='punishment.text')d.punishment.text=v;else if(f==='punishment.keeper')d.punishment.keeper=v;save();}
function uSub(did,sid,f,v){const pair=findSub(did,sid);if(!pair[1])return;
 pair[1][f]=f==='targetJam'?(+v||0):v;save();}
function uTO(did,sid,v){const pair=findSub(did,sid);if(!pair[1])return;pair[1].to.deadline=v;save();render();}
function setFilter(f){view.f=f;render();}
/* daily */
function updDaily(id,f,v){const r=S.daily.find(x=>x.id===id);if(!r)return;r[f]=v;save();render();}
function updDailySub(id,v){const r=S.daily.find(x=>x.id===id);if(!r)return;const p=v.split('|');r.driveId=p[0];r.subId=p[1];save();render();}
function tglDaily(id,c){const r=S.daily.find(x=>x.id===id);if(!r)return;r.done=c;save();render();}
function addDaily(){S.daily.push({id:uid(),date:todayStr(),driveId:S.drives[0].id,subId:S.drives[0].subs[0].id,mulai:'',selesai:'',kegiatan:'',done:false});save();render();}
function delDaily(id){S.daily=S.daily.filter(x=>x.id!==id);save();render();}
/* assign */
function updAssign(id,f,v){const a=S.assignments.find(x=>x.id===id);if(!a)return;a[f]=v;save();render();}
function tglAssign(id,c){const a=S.assignments.find(x=>x.id===id);if(!a)return;a.done=c;save();render();}
function addAssign(did){S.assignments.push({id:uid(),driveId:did||'ipk',matkul:'',tugas:'',deadline:'',done:false});save();render();}
function delAssign(id){S.assignments=S.assignments.filter(x=>x.id!==id);save();render();}
/* plan */
function updPlan(did,sid,i,f,v){const pair=findSub(did,sid);if(!pair[1]||!pair[1].plan[i])return;pair[1].plan[i][f]=v;save();render();}
function tglPlan(did,sid,i,c){const pair=findSub(did,sid);if(!pair[1]||!pair[1].plan[i])return;pair[1].plan[i].done=c;save();render();}
function addPlan(did,sid){const pair=findSub(did,sid);if(!pair[1])return;
 pair[1].plan.push({id:uid(),tanggal:todayStr(),deadline:'',materi:'',latsols:[{nama:'',jumlah:''}],done:false,catatan:''});save();render();}
function delPlan(did,sid,i){const pair=findSub(did,sid);if(!pair[1])return;pair[1].plan.splice(i,1);save();render();}
function addLatsol(did,sid,i){const pair=findSub(did,sid);const p=pair[1]&&pair[1].plan[i];if(!p)return;
 if(!p.latsols)p.latsols=[];if(p.latsols.length<3)p.latsols.push({nama:'',jumlah:''});save();render();}
function updLatsol(did,sid,i,li,f,v){const pair=findSub(did,sid);const p=pair[1]&&pair[1].plan[i];if(!p||!p.latsols[li])return;p.latsols[li][f]=v;save();render();}
/* scores */
function updScore(did,sid,i,f,v){const pair=findSub(did,sid);if(!pair[1]||!pair[1].to.scores[i])return;pair[1].to.scores[i][f]=v;save();render();}
function addScore(did,sid){const pair=findSub(did,sid);if(!pair[1])return;pair[1].to.scores.push({tanggal:todayStr(),nilai:'',ket:''});save();render();}
function delScore(did,sid,i){const pair=findSub(did,sid);if(!pair[1])return;pair[1].to.scores.splice(i,1);save();render();}

/* ---------------- Navigasi keyboard ala Sheets ---------------- */
document.addEventListener('keydown',e=>{
 const t=e.target;
 if(!t.classList||!t.classList.contains('tin')||t.tagName==='SELECT')return;
 const table=t.closest('table');if(!table)return;
 const cols=+table.dataset.cols||1;
 const inputs=Array.from(table.querySelectorAll('.tin')).filter(el=>el.tagName!=='SELECT');
 const i=inputs.indexOf(t);
 if(e.key==='Enter'&&!e.shiftKey){
  e.preventDefault();const n=i+cols;
  if(n>=inputs.length){
   const k=table.dataset.kind;
   if(k==='daily')addDaily();
   else if(k==='assign')addAssign(table.dataset.d||'ipk');
   else if(k==='plan')addPlan(table.dataset.d,table.dataset.s);
   else if(k==='score')addScore(table.dataset.d,table.dataset.s);
  }else inputs[n].focus();
 }else if(e.key==='ArrowDown'&&t.type!=='number'){e.preventDefault();if(i+cols<inputs.length)inputs[i+cols].focus();}
 else if(e.key==='ArrowUp'&&t.type!=='number'){e.preventDefault();if(i-cols>=0)inputs[i-cols].focus();}
});

/* ---------------- Export / Import ---------------- */
function exportData(){
 const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download='misi-hidup-farel-'+todayStr()+'.json';a.click();URL.revokeObjectURL(a.href);
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
