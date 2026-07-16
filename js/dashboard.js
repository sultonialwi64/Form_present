import { WEB_APP_URL } from "./config.js";

const gridEl = document.getElementById("aspirasiGrid");
const totalCountEl = document.getElementById("totalCount");
const statusText = document.getElementById("statusText");
const emptyState = document.getElementById("emptyState");

let lastRow = 0; // Cursor untuk fetching data efisien
let totalItems = 0;
let masonryInstance = null;
let pollInterval;

// Inisialisasi Masonry
function initMasonry() {
  masonryInstance = new Masonry(gridEl, {
    itemSelector: '.aspirasi-card',
    columnWidth: '.grid-sizer',
    percentPosition: true,
    gutter: 0,
    transitionDuration: '0.3s'
  });
}

// Render 1 Kartu Aspirasi
function createCard(item) {
  const div = document.createElement("div");
  div.className = "aspirasi-card px-2";
  
  // Ambil inisial nama
  const initial = item.nama.charAt(0).toUpperCase();
  
  div.innerHTML = `
    <div class="premium-card-inner rounded-2xl p-7">
      <div class="flex items-start gap-4 mb-5">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-xl font-bold text-slate-900 shrink-0 shadow-lg" style="font-family: 'Playfair Display', serif;">
          ${initial}
        </div>
        <div class="overflow-hidden pt-1">
          <h3 class="font-bold text-lg text-slate-100 truncate tracking-wide" style="font-family: 'Playfair Display', serif;">${item.nama}</h3>
          <p class="text-[11px] text-yellow-500/80 uppercase tracking-widest truncate font-semibold mt-1">${item.unit_kerja}</p>
        </div>
      </div>
      <p class="text-slate-300 leading-relaxed text-sm font-light">${item.saran}</p>
      <div class="mt-5 pt-4 border-t border-slate-700/50 flex justify-end">
        <span class="text-[10px] text-slate-500 font-medium uppercase tracking-widest">${item.timestamp}</span>
      </div>
    </div>
  `;
  return div;
}

// Fetch data terbaru
async function fetchLatestData() {
  if (WEB_APP_URL === "GANTI_DENGAN_URL_WEB_APP_GOOGLE_SCRIPT_ANDA_DISINI") {
    statusText.innerText = "Error: Config belum diatur";
    statusText.classList.replace("text-slate-300", "text-red-400");
    return;
  }

  try {
    // Gunakan cursor last_row agar payload sangat kecil
    const res = await fetch(`${WEB_APP_URL}?last_row=${lastRow}`);
    const json = await res.json();

    if (json.status === "success") {
      statusText.innerText = "LIVE (Sinkron)";
      
      const newItems = json.data;
      if (newItems.length > 0) {
        // Hilangkan empty state
        if(emptyState) emptyState.style.display = 'none';

        // Reverse array agar data terbaru berada di paling atas
        const elems = newItems.reverse().map(item => createCard(item));
        
        // Prepend semua sekaligus sesuai urutan DOM yang benar
        gridEl.prepend(...elems);
        
        // Beri tahu Masonry ada elemen baru, lalu setel ulang layout
        if(masonryInstance) {
          masonryInstance.prepended(elems);
          setTimeout(() => masonryInstance.layout(), 50); // Delay kecil agar animasi CSS terproses
        }

        // Update tracking
        lastRow = json.last_row;
        totalItems = json.total;
        
        // Update UI Counter dengan animasi
        totalCountEl.innerText = totalItems;
      }
    }
  } catch (err) {
    console.error("Fetch error:", err);
    statusText.innerText = "LIVE (Koneksi terputus)";
  }
}

// Reset Data
window.resetData = async () => {
  if (!confirm("Yakin ingin menghapus SEMUA data aspirasi? Aksi ini tidak dapat dibatalkan.")) return;
  
  try {
    statusText.innerText = "LIVE (Menghapus...)";
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "clear" }),
    });
    const json = await res.json();
    
    if (json.status === "success") {
      alert("Semua data berhasil dihapus dari Spreadsheet!");
      // Reset UI
      gridEl.querySelectorAll('.aspirasi-card').forEach(el => el.remove());
      if(masonryInstance) masonryInstance.layout();
      lastRow = 0;
      totalItems = 0;
      totalCountEl.innerText = totalItems;
      if(emptyState) emptyState.style.display = 'flex';
      statusText.innerText = "LIVE (Sinkron)";
    } else {
      alert("Gagal menghapus: " + json.message);
    }
  } catch(e) {
    alert("Terjadi kesalahan koneksi.");
  }
};

// Jalankan ketika halaman dimuat
window.addEventListener("DOMContentLoaded", () => {
  initMasonry();
  
  // Panggilan pertama
  fetchLatestData();

  // Polling setiap 5 detik
  pollInterval = setInterval(fetchLatestData, 5000);
});
