/* ================================================================
   LOGIKA HALAMAN PUBLIK (index.html)
   Tidak perlu diedit — semua pengaturan produk dilakukan lewat
   admin.html, bukan lewat file ini.
   ================================================================ */

let MENTORS = [];
let PRODUCTS = [];
let FREEBIES = [];
let state = { category:'all', mentor:'all' };

const mentorById = id => MENTORS.find(m => m.id === id);

function renderStats(){
  document.getElementById('statPanel').innerHTML = `
    <div class="stat-row"><span class="stat-num">${PRODUCTS.length}</span><span class="stat-label">produk terkurasi dari seluruh mentor</span></div>
    <div class="stat-row"><span class="stat-num">${MENTORS.length}</span><span class="stat-label">mentor yang kami rekomendasikan langsung</span></div>
    <div class="stat-row"><span class="stat-num">${FREEBIES.length}</span><span class="stat-label">materi bisa diambil gratis</span></div>
  `;
}

function renderChips(){
  const cats = ['all', ...Object.keys(CATEGORY_LABEL)];
  const el = document.getElementById('categoryChips');
  el.innerHTML = cats.map(c => `
    <button class="chip ${state.category===c?'active':''}" data-cat="${c}">
      ${c==='all' ? 'Semua Kategori' : CATEGORY_LABEL[c]}
    </button>
  `).join('');
  el.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{ state.category = btn.dataset.cat; renderChips(); renderProducts(); });
  });
}

function renderMentorSelect(){
  const el = document.getElementById('mentorSelect');
  el.innerHTML = `<option value="all">Semua Mentor</option>` +
    MENTORS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  el.value = state.mentor;
  el.addEventListener('change', ()=>{ state.mentor = el.value; renderProducts(); });
}

function renderProducts(){
  const list = PRODUCTS.filter(p =>
    (state.category==='all' || p.category===state.category) &&
    (state.mentor==='all' || p.mentor_id===state.mentor)
  );
  const grid = document.getElementById('productGrid');
  if(list.length===0){
    grid.innerHTML = `<div class="empty-state">Belum ada produk untuk kombinasi filter ini.</div>`;
    return;
  }
  grid.innerHTML = list.map(p => {
    const mentor = mentorById(p.mentor_id);
    return `
      <article class="card">
        <div class="card-icon">${p.image_url ? `<img src="${p.image_url}" alt="${p.title}">` : (ICONS[p.category] || '')}</div>
        <div class="card-body">
          <span class="card-tag">${CATEGORY_LABEL[p.category] || p.category}</span>
          <h3>${p.title}</h3>
          <div class="mentor-name">oleh ${mentor ? mentor.name : '—'}</div>
          <p>${formatPastedText(p.description)}</p>
          <a class="card-cta" href="${p.sales_link || p.link}" target="_blank" rel="noopener">Lihat produk <span aria-hidden="true">↗</span></a>
          ${p.sales_link ? `<a class="card-cta-secondary" href="${p.link}" target="_blank" rel="noopener">Checkout langsung ↗</a>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

let countdownTimer = null;

function formatCountdown(ms){
  if(ms <= 0) return null;
  const totalSec = Math.floor(ms/1000);
  const d = Math.floor(totalSec/86400);
  const h = Math.floor((totalSec%86400)/3600);
  const m = Math.floor((totalSec%3600)/60);
  const s = totalSec%60;
  const parts = [];
  if(d>0) parts.push(`${d}h`);
  parts.push(`${String(h).padStart(2,'0')}j`, `${String(m).padStart(2,'0')}m`, `${String(s).padStart(2,'0')}d`);
  return parts.join(' ');
}

function freebieCardHtml(f){
  if(f.type === 'webinar'){
    const target = f.scheduled_at ? new Date(f.scheduled_at).getTime() : null;
    const jadwalText = target ? new Date(target).toLocaleString('id-ID', { dateStyle:'full', timeStyle:'short' }) : '';
    return `
      <div class="free-card free-card-webinar" data-target="${target || ''}">
        <div class="free-card-head">
          ${ICONS.free}
          <span class="free-badge">Webinar</span>
        </div>
        <h3>${f.title}</h3>
        <p>${formatPastedText(f.description)}</p>
        <p class="free-schedule">🗓️ ${jadwalText} WIB</p>
        ${(f.meeting_id || f.passcode) ? `<p class="free-meeting-info">${f.meeting_id ? `Meeting ID: <strong>${f.meeting_id}</strong>` : ''}${(f.meeting_id && f.passcode) ? ' &nbsp;•&nbsp; ' : ''}${f.passcode ? `Passcode: <strong>${f.passcode}</strong>` : ''}</p>` : ''}
        <div class="countdown" data-role="countdown">Menghitung...</div>
        <a href="${f.link}" target="_blank" rel="noopener" class="free-btn" data-role="joinbtn">Gabung Sekarang ↗</a>
      </div>`;
  }
  return `
    <div class="free-card">
      <div class="free-card-head">${ICONS.free}<span class="free-badge">Ebook</span></div>
      <h3>${f.title}</h3>
      <p>${formatPastedText(f.description)}</p>
      <a href="${f.link}" target="_blank" rel="noopener" class="free-btn">Baca Ebook ↗</a>
    </div>`;
}

function tickCountdowns(){
  document.querySelectorAll('.free-card-webinar').forEach(card=>{
    const target = Number(card.dataset.target);
    const countdownEl = card.querySelector('[data-role="countdown"]');
    const btnEl = card.querySelector('[data-role="joinbtn"]');
    if(!target){ countdownEl.textContent = 'Jadwal belum diatur'; return; }
    const remaining = target - Date.now();
    if(remaining <= 0){
      countdownEl.textContent = '🔴 Sedang berlangsung sekarang';
      countdownEl.classList.add('live');
      btnEl.classList.add('active');
    } else {
      countdownEl.textContent = 'Dimulai dalam ' + formatCountdown(remaining);
      countdownEl.classList.remove('live');
      btnEl.classList.remove('active');
    }
  });
}

function renderFreebies(){
  const grid = document.getElementById('freeGrid');
  if(FREEBIES.length===0){ grid.innerHTML = `<div class="empty-state">Belum ada materi gratis saat ini.</div>`; return; }
  grid.innerHTML = FREEBIES.map(freebieCardHtml).join('');
  if(countdownTimer) clearInterval(countdownTimer);
  tickCountdowns();
  countdownTimer = setInterval(tickCountdowns, 1000);
}

function renderMentors(){
  const grid = document.getElementById('mentorGrid');
  grid.innerHTML = MENTORS.map(m => `
    <div class="mentor-card">
      <div class="avatar" style="background:${m.color}">${m.name.trim().charAt(0)}</div>
      <div><h3>${m.name}</h3><div class="niche">${m.niche}</div></div>
      <p class="bio">${m.bio}</p>
      <button data-mentor="${m.id}">Lihat produk →</button>
    </div>
  `).join('');
  grid.querySelectorAll('button[data-mentor]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.mentor = btn.dataset.mentor; state.category = 'all';
      renderChips(); document.getElementById('mentorSelect').value = state.mentor; renderProducts();
      document.getElementById('produk').scrollIntoView({behavior:'smooth'});
    });
  });
}

async function init(){
  [MENTORS, PRODUCTS, FREEBIES] = await Promise.all([fetchMentors(), fetchProducts(), fetchFreebies()]);
  renderStats();
  renderChips();
  renderMentorSelect();
  renderProducts();
  renderFreebies();
  renderMentors();
  document.getElementById('year').textContent = new Date().getFullYear();
}

init();
