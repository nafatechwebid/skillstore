/* ================================================================
   LOGIKA PANEL ADMIN (admin.html)
   ================================================================ */

let MENTORS = [], PRODUCTS = [], FREEBIES = [];

function showMsg(elId, text, type='success'){
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = `msg show ${type}`;
  setTimeout(()=> el.classList.remove('show'), 3500);
}

document.getElementById('productImageFile').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const preview = document.getElementById('productImagePreview');
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';
});

/* ---------------- AUTH ---------------- */
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if(error){
    const m = document.getElementById('loginMsg');
    m.textContent = 'Email atau kata sandi salah.';
    m.classList.add('show');
    return;
  }
  enterDashboard();
});

document.getElementById('logoutBtn').addEventListener('click', async ()=>{
  await supabaseClient.auth.signOut();
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('loginView').style.display = 'flex';
});

async function checkSession(){
  const { data } = await supabaseClient.auth.getSession();
  if(data.session){ enterDashboard(); }
}

async function enterDashboard(){
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('dashboardView').style.display = 'block';
  await loadAll();
}

/* ---------------- TABS ---------------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});

/* ---------------- LOAD DATA ---------------- */
async function loadAll(){
  [MENTORS, PRODUCTS, FREEBIES] = await Promise.all([fetchMentors(), fetchProducts(), fetchFreebies()]);
  renderMentorTable();
  renderProductTable();
  renderFreebieTable();
  fillMentorDropdown();
}

function fillMentorDropdown(){
  const sel = document.getElementById('productMentor');
  sel.innerHTML = MENTORS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
}

/* ================================================================
   PRODUK
   ================================================================ */
function renderProductTable(){
  const body = document.getElementById('productTableBody');
  if(PRODUCTS.length===0){ body.innerHTML = `<tr><td colspan="4">Belum ada produk.</td></tr>`; return; }
  body.innerHTML = PRODUCTS.map(p => {
    const mentor = MENTORS.find(m=>m.id===p.mentor_id);
    return `
      <tr>
        <td>${p.title}</td>
        <td>${mentor ? mentor.name : '—'}</td>
        <td>${CATEGORY_LABEL[p.category] || p.category}</td>
        <td class="row-actions">
          <button data-edit="${p.id}">Edit</button>
          <button class="danger" data-delete="${p.id}">Hapus</button>
        </td>
      </tr>`;
  }).join('');
  body.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=> openProductForm(b.dataset.edit)));
  body.querySelectorAll('[data-delete]').forEach(b=> b.addEventListener('click', ()=> deleteProduct(b.dataset.delete)));
}

function openProductForm(id){
  const form = document.getElementById('productForm');
  form.classList.add('open');
  if(id){
    const p = PRODUCTS.find(x=>x.id===id);
    document.getElementById('productFormTitle').textContent = 'Edit Produk';
    document.getElementById('productId').value = p.id;
    document.getElementById('productTitle').value = p.title;
    document.getElementById('productMentor').value = p.mentor_id;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productDesc').value = p.description;
    document.getElementById('productSalesLink').value = p.sales_link || '';
    document.getElementById('productLink').value = p.link;
    document.getElementById('productImageUrl').value = p.image_url || '';
    const preview = document.getElementById('productImagePreview');
    if(p.image_url){ preview.src = p.image_url; preview.style.display = 'block'; }
    else { preview.style.display = 'none'; }
    document.getElementById('productImageFile').value = '';
  } else {
    document.getElementById('productFormTitle').textContent = 'Tambah Produk Baru';
    ['productId','productTitle','productDesc','productSalesLink','productLink','productImageUrl'].forEach(id=> document.getElementById(id).value = '');
    document.getElementById('productImagePreview').style.display = 'none';
    document.getElementById('productImageFile').value = '';
  }
}
function closeProductForm(){ document.getElementById('productForm').classList.remove('open'); }

document.getElementById('btnNewProduct').addEventListener('click', ()=> openProductForm(null));
document.getElementById('btnCancelProduct').addEventListener('click', closeProductForm);

document.getElementById('btnSaveProduct').addEventListener('click', async ()=>{
  const id = document.getElementById('productId').value;
  const file = document.getElementById('productImageFile').files[0];
  let imageUrl = document.getElementById('productImageUrl').value || null;

  if(file){
    const filePath = `${Date.now()}-${file.name.replace(/\s+/g,'-')}`;
    const { error: uploadError } = await supabaseClient.storage.from('product-images').upload(filePath, file);
    if(uploadError){ showMsg('productMsg', 'Gagal upload gambar: ' + uploadError.message, 'error'); return; }
    const { data: urlData } = supabaseClient.storage.from('product-images').getPublicUrl(filePath);
    imageUrl = urlData.publicUrl;
  }

  const payload = {
    title: document.getElementById('productTitle').value.trim(),
    mentor_id: document.getElementById('productMentor').value,
    category: document.getElementById('productCategory').value,
    description: document.getElementById('productDesc').value.trim(),
    sales_link: document.getElementById('productSalesLink').value.trim() || null,
    link: document.getElementById('productLink').value.trim(),
    image_url: imageUrl,
  };
  if(!payload.title || !payload.description || !payload.link){
    showMsg('productMsg', 'Semua kolom wajib diisi.', 'error'); return;
  }
  const { error } = id
    ? await supabaseClient.from('products').update(payload).eq('id', id)
    : await supabaseClient.from('products').insert(payload);
  if(error){ showMsg('productMsg', 'Gagal menyimpan: ' + error.message, 'error'); return; }
  showMsg('productMsg', 'Produk berhasil disimpan.');
  closeProductForm();
  await loadAll();
});

async function deleteProduct(id){
  if(!confirm('Hapus produk ini?')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if(error){ showMsg('productMsg', 'Gagal menghapus: ' + error.message, 'error'); return; }
  showMsg('productMsg', 'Produk dihapus.');
  await loadAll();
}

/* ================================================================
   MENTOR
   ================================================================ */
function renderMentorTable(){
  const body = document.getElementById('mentorTableBody');
  if(MENTORS.length===0){ body.innerHTML = `<tr><td colspan="3">Belum ada mentor.</td></tr>`; return; }
  body.innerHTML = MENTORS.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.niche}</td>
      <td class="row-actions">
        <button data-edit="${m.id}">Edit</button>
        <button class="danger" data-delete="${m.id}">Hapus</button>
      </td>
    </tr>`).join('');
  body.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=> openMentorForm(b.dataset.edit)));
  body.querySelectorAll('[data-delete]').forEach(b=> b.addEventListener('click', ()=> deleteMentor(b.dataset.delete)));
}

function openMentorForm(id){
  const form = document.getElementById('mentorForm');
  form.classList.add('open');
  const idField = document.getElementById('mentorIdField');
  if(id){
    const m = MENTORS.find(x=>x.id===id);
    document.getElementById('mentorFormTitle').textContent = 'Edit Mentor';
    idField.dataset.original = m.id;
    document.getElementById('mentorId').value = m.id;
    document.getElementById('mentorId').disabled = true;
    document.getElementById('mentorName').value = m.name;
    document.getElementById('mentorNiche').value = m.niche;
    document.getElementById('mentorColor').value = m.color;
    document.getElementById('mentorBio').value = m.bio;
  } else {
    document.getElementById('mentorFormTitle').textContent = 'Tambah Mentor Baru';
    idField.dataset.original = '';
    document.getElementById('mentorId').disabled = false;
    ['mentorId','mentorName','mentorNiche','mentorBio'].forEach(fid=> document.getElementById(fid).value = '');
    document.getElementById('mentorColor').value = '#1F6F5C';
  }
}
function closeMentorForm(){ document.getElementById('mentorForm').classList.remove('open'); }

document.getElementById('btnNewMentor').addEventListener('click', ()=> openMentorForm(null));
document.getElementById('btnCancelMentor').addEventListener('click', closeMentorForm);

document.getElementById('btnSaveMentor').addEventListener('click', async ()=>{
  const original = document.getElementById('mentorIdField').dataset.original;
  const payload = {
    id: document.getElementById('mentorId').value.trim(),
    name: document.getElementById('mentorName').value.trim(),
    niche: document.getElementById('mentorNiche').value.trim(),
    color: document.getElementById('mentorColor').value,
    bio: document.getElementById('mentorBio').value.trim(),
  };
  if(!payload.id || !payload.name || !payload.niche || !payload.bio){
    showMsg('mentorMsg', 'Semua kolom wajib diisi.', 'error'); return;
  }
  const { error } = original
    ? await supabaseClient.from('mentors').update(payload).eq('id', original)
    : await supabaseClient.from('mentors').insert(payload);
  if(error){ showMsg('mentorMsg', 'Gagal menyimpan: ' + error.message, 'error'); return; }
  showMsg('mentorMsg', 'Mentor berhasil disimpan.');
  closeMentorForm();
  await loadAll();
});

async function deleteMentor(id){
  if(!confirm('Hapus mentor ini? Produk miliknya juga akan ikut terhapus.')) return;
  const { error } = await supabaseClient.from('mentors').delete().eq('id', id);
  if(error){ showMsg('mentorMsg', 'Gagal menghapus: ' + error.message, 'error'); return; }
  showMsg('mentorMsg', 'Mentor dihapus.');
  await loadAll();
}

/* ================================================================
   MATERI GRATIS
   ================================================================ */
function renderFreebieTable(){
  const body = document.getElementById('freebieTableBody');
  if(FREEBIES.length===0){ body.innerHTML = `<tr><td colspan="3">Belum ada materi gratis.</td></tr>`; return; }
  body.innerHTML = FREEBIES.map(f => `
    <tr>
      <td>${f.title}</td>
      <td>${f.type==='webinar' ? 'Webinar' : 'Ebook'}</td>
      <td class="row-actions">
        <button data-edit="${f.id}">Edit</button>
        <button class="danger" data-delete="${f.id}">Hapus</button>
      </td>
    </tr>`).join('');
  body.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=> openFreebieForm(b.dataset.edit)));
  body.querySelectorAll('[data-delete]').forEach(b=> b.addEventListener('click', ()=> deleteFreebie(b.dataset.delete)));
}

function openFreebieForm(id){
  const form = document.getElementById('freebieForm');
  form.classList.add('open');
  if(id){
    const f = FREEBIES.find(x=>x.id===id);
    document.getElementById('freebieFormTitle').textContent = 'Edit Materi Gratis';
    document.getElementById('freebieId').value = f.id;
    document.getElementById('freebieType').value = f.type || 'ebook';
    document.getElementById('freebieTitle').value = f.title;
    document.getElementById('freebieDesc').value = f.description;
    document.getElementById('freebieLink').value = f.link;
    document.getElementById('freebieScheduledAt').value = f.scheduled_at ? toDatetimeLocalValue(new Date(f.scheduled_at)) : '';
  } else {
    document.getElementById('freebieFormTitle').textContent = 'Tambah Materi Gratis';
    document.getElementById('freebieType').value = 'ebook';
    ['freebieId','freebieTitle','freebieDesc','freebieLink','freebieScheduledAt'].forEach(fid=> document.getElementById(fid).value = '');
  }
  updateFreebieFormFields();
}
function closeFreebieForm(){ document.getElementById('freebieForm').classList.remove('open'); }

document.getElementById('freebieType').addEventListener('change', updateFreebieFormFields);
function updateFreebieFormFields(){
  const type = document.getElementById('freebieType').value;
  const isWebinar = type === 'webinar';
  document.getElementById('freebieScheduleGroup').style.display = isWebinar ? 'block' : 'none';
  document.getElementById('freebieScheduledAt').required = isWebinar;
  document.getElementById('freebieLinkLabel').textContent = isWebinar ? 'Link Zoom Meeting' : 'Link Download/Akses';
  document.getElementById('freebieLinkHelp').textContent = isWebinar
    ? 'Link Zoom — otomatis terbuka lewat aplikasi Zoom saat waktunya tiba'
    : 'Boleh link Google Drive, PDF, atau halaman baca online';
}

// format Date -> "YYYY-MM-DDTHH:mm" (waktu lokal, untuk isi input datetime-local)
function toDatetimeLocalValue(date){
  const pad = n => String(n).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

document.getElementById('btnNewFreebie').addEventListener('click', ()=> openFreebieForm(null));
document.getElementById('btnCancelFreebie').addEventListener('click', closeFreebieForm);

document.getElementById('btnSaveFreebie').addEventListener('click', async ()=>{
  const id = document.getElementById('freebieId').value;
  const type = document.getElementById('freebieType').value;
  const scheduledRaw = document.getElementById('freebieScheduledAt').value;
  const payload = {
    type,
    title: document.getElementById('freebieTitle').value.trim(),
    description: document.getElementById('freebieDesc').value.trim(),
    link: document.getElementById('freebieLink').value.trim(),
    scheduled_at: (type==='webinar' && scheduledRaw) ? new Date(scheduledRaw).toISOString() : null,
  };
  if(!payload.title || !payload.description || !payload.link){
    showMsg('freebieMsg', 'Semua kolom wajib diisi.', 'error'); return;
  }
  if(type==='webinar' && !payload.scheduled_at){
    showMsg('freebieMsg', 'Waktu pelaksanaan wajib diisi untuk webinar.', 'error'); return;
  }
  const { error } = id
    ? await supabaseClient.from('freebies').update(payload).eq('id', id)
    : await supabaseClient.from('freebies').insert(payload);
  if(error){ showMsg('freebieMsg', 'Gagal menyimpan: ' + error.message, 'error'); return; }
  showMsg('freebieMsg', 'Materi gratis berhasil disimpan.');
  closeFreebieForm();
  await loadAll();
});

async function deleteFreebie(id){
  if(!confirm('Hapus materi gratis ini?')) return;
  const { error } = await supabaseClient.from('freebies').delete().eq('id', id);
  if(error){ showMsg('freebieMsg', 'Gagal menghapus: ' + error.message, 'error'); return; }
  showMsg('freebieMsg', 'Materi dihapus.');
  await loadAll();
}

checkSession();
