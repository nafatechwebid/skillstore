/* ================================================================
   KONSTANTA & FUNGSI BERSAMA
   Dipakai oleh store.js (halaman publik) dan admin.js (panel admin)
   ================================================================ */

const CATEGORY_LABEL = { ecourse:'Ecourse', ebook:'Ebook', plugin:'Plugin WordPress', theme:'Theme', tool:'Tools/Software' };

const ICONS = {
  ecourse: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  ebook:   `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5V4.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>`,
  plugin:  `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M9 3v4M15 3v4M6 7h12l-1 5a5 5 0 0 1-10 0L6 7Z"/><path d="M12 16v5"/></svg>`,
  theme:   `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 9h18M8 14h3"/></svg>`,
  tool:    `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3Z"/></svg>`,
  free:    `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M12 3v18M5 8l7-5 7 5M4 21h16"/></svg>`,
};

async function fetchMentors(){
  const { data, error } = await supabaseClient.from('mentors').select('*').order('created_at');
  if(error){ console.error(error); return []; }
  return data;
}
async function fetchProducts(){
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at');
  if(error){ console.error(error); return []; }
  return data;
}
async function fetchFreebies(){
  const { data, error } = await supabaseClient.from('freebies').select('*').order('created_at');
  if(error){ console.error(error); return []; }
  return data;
}

// Rapikan teks yang ditempel dari WhatsApp/sumber lain:
// - escape HTML (aman dari kode nyasar)
// - *teks* (format bold ala WhatsApp) -> <strong>teks</strong>
// - baris baru -> <br> (supaya paragraf tidak numpuk jadi satu baris)
function formatPastedText(str){
  if(!str) return '';
  let safe = str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  safe = safe.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\n/g, '<br>');
  return safe;
}
