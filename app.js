// ============================================================
// MISI HIDUP FAREL — app.js (v1.1)
// Dua tabel sheet-editable: study_items & weekly_assignments
// Navigasi keyboard ala Sheets: Enter/↓ pindah ke bawah,
// Shift+Tab ke sel sebelumnya, Tab/→ ke sel berikutnya.
// ============================================================

const STORAGE_KEY = "misiHidupFarel_v2";
const OLD_KEY     = "misiHidupFarel_v1"; // migrasi dari v1

// ---- Drive besar ----
const DRIVES = [
  { key:"utbk",  nama:"🎓 Lolos UTBK",         warna:"#58a6ff" },
  { key:"ielts", nama:"🌍 IELTS 7.0+",          warna:"#3fb950" },
  { key:"ipk",   nama:"📚 IPK 4.0 Semester 1",  warna:"#f0883e" },
];
const JENIS_BELAJAR = ["Materi","Latsol A","Latsol B","Latsol C","Recall","Big Book","Try Out","Lainnya"];
const JENIS_TUGAS   = ["PR","Tugas Besar","Kuis","Ujian","Proyek","Presentasi","Lainnya"];

// ---- State ----
let studyItems = [];       // rencana harian (dengan jam mulai-selesai)
let assignments = [];      // tugas/PR kuliah (dengan deadline)
let filter = "hari";

// ---- Util tanggal lokal ----
function toISO(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function todayISO(){ return toISO(new Date()); }
function parseISO(s){ const p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function namaHari(d){ return ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][d.getDay()]; }
function formatTanggalID(iso){
  const d=parseISO(iso);
  return namaHari(d)+", "+d.getDate()+" "+["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][d.getMonth()]+" "+d.getFullYear();
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }

// ---- Load / Save (dengan migrasi v1) ----
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ const d=JSON.parse(raw); studyItems=d.studyItems||[]; assignments=d.assignments||[]; return; }
    // migrasi dari v1: latsol/materi/recall -> study_items, PR/Tugas -> assignments
    const old = localStorage.getItem(OLD_KEY);
    if(old){
      const t = JSON.parse(old);
      studyItems = t.filter(x=>x.jenis!=="PR/Tugas")
                    .map(x=>({id:x.id,done:x.done,tanggal:x.tanggal,mulai:x.mulai,selesai:x.selesai,
                              drive:x.drive,bidang:x.bidang,kegiatan:x.kegiatan,jenis:x.jenis}));
      assignments = t.filter(x=>x.jenis==="PR/Tugas")
                     .map(x=>({id:x.id,done:x.done,matkul:x.bidang,tugas:x.kegiatan,jenis:"PR",deadline:x.tanggal}));
      save(); return;
    }
  }catch(e){}
  // Contoh pertama kali
  const t = todayISO();
  studyItems = [
    { id:uid(), done:false, tanggal:t, mulai:"04:00", selesai:"06:00",
      drive:"utbk", bidang:"PK", kegiatan:"Eksponen, Bentuk Akar, Logaritma", jenis:"Materi" },
    { id:uid(), done:false, tanggal:t, mulai:"18:30", selesai:"21:00",
      drive:"utbk", bidang:"PBM", kegiatan:"Pola & Inti Kalimat + Variasi Kalimat", jenis:"Recall" },
  ];
  assignments = [
    { id:uid(), done:false, matkul:"Kalkulus", tugas:"Latihan Bab 2 no 1-20", jenis:"PR", deadline:toISO(addDays(new Date(),2)) },
  ];
  save();
}
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({studyItems, assignments}));
}

// ---- Export / Import ----
function exportData(){
  const blob = new Blob([JSON.stringify({studyItems,assignments},null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="misi-hidup-farel-"+todayISO()+".json";
  a.click();
}
function importData(e){
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(Array.isArray(d)){ // file v1
        studyItems=d.filter(x=>x.jenis!=="PR/Tugas").map(x=>({id:x.id||uid(),done:!!x.done,tanggal:x.tanggal||todayISO(),mulai:x.mulai||"",selesai:x.selesai||"",drive:x.drive||"utbk",bidang:x.bidang||"",kegiatan:x.kegiatan||"",jenis:x.jenis||"Materi"}));
        assignments=d.filter(x=>x.jenis==="PR/Tugas").map(x=>({id:x.id||uid(),done:!!x.done,matkul:x.bidang||"",tugas:x.kegiatan||"",jenis:"PR",deadline:x.tanggal||""}));
      } else {
        studyItems=d.studyItems||[]; assignments=d.assignments||[];
      }
      save(); render(); alert("✅ Import berhasil!");
    }catch(err){ alert("File tidak valid."); }
  };
  r.readAsText(f); e.target.value="";
}

// ============================================================
// TABEL 1: RENCANA HARIAN (study_items)
// ============================================================
function setFilter(f,el){
  filter=f;
  document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
  el.classList.add("active"); render();
}
function passFilter(t){
  if(filter==="semua") return true;
  const tgl=parseISO(t.tanggal), now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(filter==="hari") return toISO(tgl)===todayISO();
  return tgl>=start && tgl<=addDays(start,6);
}
function addStudy(){
  studyItems.push({id:uid(),done:false,tanggal:todayISO(),mulai:"",selesai:"",
                   drive:"utbk",bidang:"",kegiatan:"",jenis:"Materi"});
  save(); renderStudy();
  const rows=document.querySelectorAll("#studyBody .kegiatan-input");
  if(rows.length) rows[rows.length-1].focus();
}
function deleteStudy(id){
  if(!confirm("Hapus baris ini?")) return;
  studyItems=studyItems.filter(t=>t.id!==id); save(); render();
}
function updateStudy(id,field,value){
  const t=studyItems.find(x=>x.id===id); if(!t) return;
  t[field]=value; save();
  renderSummary(); renderDrives();
  const el=document.getElementById("jam-"+id);
  if(el){ const j=durasiMenit(t); el.textContent=j>0?formatMenit(j):"–"; }
}
function durasiMenit(t){
  if(!t.mulai||!t.selesai) return 0;
  const [h1,m1]=t.mulai.split(":").map(Number), [h2,m2]=t.selesai.split(":").map(Number);
  let d=(h2*60+m2)-(h1*60+m1); if(d<0) d+=24*60;
  return d;
}
function formatMenit(m){
  const j=Math.floor(m/60), mnt=m%60;
  return j===0 ? mnt+" mnt" : j+" jam "+mnt+" mnt";
}
function renderStudy(){
  const body=document.getElementById("studyBody"); body.innerHTML="";
  const shown=studyItems.filter(passFilter)
                        .sort((a,b)=>(a.tanggal+a.mulai).localeCompare(b.tanggal+b.mulai));
  for(const t of shown){
    const tr=document.createElement("tr");
    if(t.done) tr.classList.add("done");
    const jam=durasiMenit(t);
    tr.innerHTML=`
      <td class="col-check"><input type="checkbox" ${t.done?"checked":""} onchange="updateStudy('${t.id}','done',this.checked)"></td>
      <td><input type="date" value="${t.tanggal}" onchange="updateStudy('${t.id}','tanggal',this.value)"></td>
      <td><input type="time" value="${t.mulai}" onchange="updateStudy('${t.id}','mulai',this.value)"></td>
      <td><input type="time" value="${t.selesai}" onchange="updateStudy('${t.id}','selesai',this.value)"></td>
      <td><select onchange="updateStudy('${t.id}','drive',this.value)">
        ${DRIVES.map(d=>`<option value="${d.key}" ${t.drive===d.key?"selected":""}>${d.nama}</option>`).join("")}
      </select></td>
      <td><input type="text" placeholder="mis. PK" value="${esc(t.bidang)}" onchange="updateStudy('${t.id}','bidang',this.value)"></td>
      <td class="kegiatan-cell"><input class="kegiatan-input" type="text" placeholder="Kegiatan / materi..." value="${esc(t.kegiatan)}" onchange="updateStudy('${t.id}','kegiatan',this.value)"></td>
      <td><select onchange="updateStudy('${t.id}','jenis',this.value)">
        ${JENIS_BELAJAR.map(j=>`<option ${t.jenis===j?"selected":""}>${j}</option>`).join("")}
      </select></td>
      <td class="col-jam" id="jam-${t.id}">${jam>0?formatMenit(jam):"–"}</td>
      <td class="col-del"><button class="del-btn" onclick="deleteStudy('${t.id}')" title="Hapus">✕</button></td>`;
    body.appendChild(tr);
  }
}

// ============================================================
// TABEL 2: TUGAS / PR KULIAH (weekly_assignments)
// ============================================================
function addAssign(){
  assignments.push({id:uid(),done:false,matkul:"",tugas:"",jenis:"PR",deadline:""});
  save(); renderAssign();
  const rows=document.querySelectorAll("#assignBody .kegiatan-input");
  if(rows.length) rows[rows.length-1].focus();
}
function deleteAssign(id){
  if(!confirm("Hapus baris ini?")) return;
  assignments=assignments.filter(t=>t.id!==id); save(); render();
}
function updateAssign(id,field,value){
  const t=assignments.find(x=>x.id===id); if(!t) return;
  t[field]=value; save(); renderAssignSummary();
}
function sisaHari(deadline){
  if(!deadline) return null;
  const d=parseISO(deadline), now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  return Math.round((d-start)/86400000);
}
function renderAssign(){
  const body=document.getElementById("assignBody"); body.innerHTML="";
  const shown=assignments.slice().sort((a,b)=>(a.deadline||"9999").localeCompare(b.deadline||"9999"));
  for(const t of shown){
    const tr=document.createElement("tr");
    if(t.done) tr.classList.add("done");
    const s=sisaHari(t.deadline);
    let pill="–";
    if(s!==null){
      const cls = s<0 ? "sisa-lewat" : s<=2 ? "sisa-dekat" : "sisa-aman";
      const txt = s<0 ? "Lewat "+Math.abs(s)+" hr" : s===0 ? "HARI INI!" : "H-"+s;
      pill=`<span class="sisa-pill ${cls}">${txt}</span>`;
    }
    tr.innerHTML=`
      <td class="col-check"><input type="checkbox" ${t.done?"checked":""} onchange="updateAssign('${t.id}','done',this.checked)"></td>
      <td><input type="text" placeholder="Matkul" value="${esc(t.matkul)}" onchange="updateAssign('${t.id}','matkul',this.value)"></td>
      <td class="kegiatan-cell"><input class="kegiatan-input" type="text" placeholder="Tugas / PR minggu ini..." value="${esc(t.tugas)}" onchange="updateAssign('${t.id}','tugas',this.value)"></td>
      <td><select onchange="updateAssign('${t.id}','jenis',this.value)">
        ${JENIS_TUGAS.map(j=>`<option ${t.jenis===j?"selected":""}>${j}</option>`).join("")}
      </select></td>
      <td><input type="date" value="${t.deadline}" onchange="updateAssign('${t.id}','deadline',this.value)"></td>
      <td class="col-sisa">${pill}</td>
      <td class="col-del"><button class="del-btn" onclick="deleteAssign('${t.id}')" title="Hapus">✕</button></td>`;
    body.appendChild(tr);
  }
  renderAssignSummary();
}
function renderAssignSummary(){
  const open=assignments.filter(t=>!t.done);
  document.getElementById("assignOpen").textContent=open.length;
  document.getElementById("assignUrgent").textContent=open.filter(t=>{const s=sisaHari(t.deadline);return s!==null&&s<=2;}).length;
}

// ============================================================
// SUMMARY + DRIVE
// ============================================================
function renderSummary(){
  const todays=studyItems.filter(t=>t.tanggal===todayISO());
  const total=todays.reduce((s,t)=>s+durasiMenit(t),0);
  const done=todays.filter(t=>t.done).length;
  document.getElementById("totalJam").textContent=formatMenit(total);
  document.getElementById("doneCount").textContent=done+" / "+todays.length;
}
function renderDrives(){
  const wrap=document.getElementById("driveCards"); wrap.innerHTML="";
  for(const d of DRIVES){
    const all=[...studyItems.filter(t=>t.drive===d.key),
               ...assignments.filter(t=>d.key==="ipk")]; // tugas kuliah mengisi drive IPK
    const done=all.filter(t=>t.done).length;
    const pct=all.length?Math.round(done/all.length*100):0;
    wrap.innerHTML+=`
      <div class="drive-card">
        <h3>${d.nama}</h3>
        <div class="drive-pct" style="color:${d.warna}">${pct}%</div>
        <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${d.warna}"></div></div>
        <p style="color:var(--muted);font-size:.75rem;margin-top:6px">${done} dari ${all.length} tugas selesai</p>
      </div>`;
  }
}
function render(){ renderStudy(); renderAssign(); renderSummary(); renderDrives(); }

// ============================================================
// NAVIGASI KEYBOARD ALA SHEETS
// Enter / ArrowDown = sel di bawah (kolom sama) — kalau di baris
// terakhir, otomatis tambah baris baru. Shift+Enter/ArrowUp = ke atas.
// Tab / ArrowRight & Shift+Tab / ArrowLeft = pindah kolom.
// ============================================================
function setupKeyboardNav(tableId, addRowFn){
  const table=document.getElementById(tableId);
  table.addEventListener("keydown", e=>{
    const el=e.target;
    if(!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
    if(el.type==="checkbox") return; // checkbox pakai spasi/klik biasa
    const td=el.closest("td"), tr=el.closest("tr");
    const colIndex=Array.from(tr.cells).indexOf(td);
    const rows=Array.from(table.tBodies[0].rows);
    const rowIndex=rows.indexOf(tr);
    const focusAt=(r,c)=>{
      const cell=rows[r] && rows[r].cells[c];
      const target=cell && cell.querySelector("input:not([type=checkbox]),select");
      if(target){ target.focus(); if(target.select) target.select(); return true; }
      return false;
    };
    switch(e.key){
      case "Enter":
      case "ArrowDown":
        e.preventDefault();
        if(el.tagName==="SELECT" && e.key==="ArrowDown"){ el.blur(); }
        if(rowIndex<rows.length-1){ focusAt(rowIndex+1,colIndex); }
        else { addRowFn(); setTimeout(()=>focusAt(rows.length,colIndex),0); }
        break;
      case "ArrowUp":
        e.preventDefault();
        if(rowIndex>0) focusAt(rowIndex-1,colIndex);
        break;
      case "ArrowRight":
        if(el.tagName==="INPUT" && el.selectionStart!==el.value.length) return; // biarkan kursor jalan
        e.preventDefault(); focusAt(rowIndex,colIndex+1);
        break;
      case "ArrowLeft":
        if(el.tagName==="INPUT" && el.selectionStart!==0) return;
        e.preventDefault(); focusAt(rowIndex,colIndex-1);
        break;
    }
  });
}

// ---- Init ----
document.getElementById("tanggalHariIni").textContent=formatTanggalID(todayISO());
load();
render();
setupKeyboardNav("studyTable", addStudy);
setupKeyboardNav("assignTable", addAssign);
