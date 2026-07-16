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

// Format Date ke WIB
function formatWIB(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // fallback
    
    const options = { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' 
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date).replace(',', ' -') + ' WIB';
  } catch (e) {
    return dateString;
  }
}

// Render 1 Kartu Aspirasi
function createCard(item) {
  const div = document.createElement("div");
  div.className = "aspirasi-card px-2";
  
  // Pastikan nama adalah string untuk menghindari error charAt
  const namaStr = String(item.nama || "Anonim");
  const initial = namaStr.charAt(0).toUpperCase();
  const formattedTime = formatWIB(item.timestamp);
  
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
        <span class="text-[10px] text-slate-500 font-medium uppercase tracking-widest">${formattedTime}</span>
      </div>
    </div>
  `;
  return div;
}

let isFetching = false;

// Fetch data terbaru
async function fetchLatestData() {
  if (isFetching) return;
  
  if (WEB_APP_URL === "GANTI_DENGAN_URL_WEB_APP_GOOGLE_SCRIPT_ANDA_DISINI") {
    statusText.innerText = "Error: Config belum diatur";
    statusText.classList.replace("text-slate-300", "text-red-400");
    return;
  }

  try {
    isFetching = true;
    // Gunakan cursor last_row agar payload sangat kecil
    const res = await fetch(`${WEB_APP_URL}?last_row=${lastRow}`);
    const json = await res.json();

    if (json.status === "success") {
      statusText.innerText = "LIVE (Sinkron)";
      
      const newItems = json.data;
      if (newItems.length > 0) {
        // Update tracking DULUAN sebelum DOM manipulation untuk mencegah duplikasi jika gagal render
        lastRow = json.last_row;
        totalItems = json.total;
        
        // Hilangkan empty state
        if(emptyState) emptyState.style.display = 'none';

        // Reverse array agar data terbaru berada di paling atas
        const elems = newItems.reverse().map(item => createCard(item));
        
        // Masukkan elemen persis setelah grid-sizer agar DOM rapi
        const gridSizer = gridEl.querySelector('.grid-sizer');
        if (gridSizer) {
          gridSizer.after(...elems);
        } else {
          gridEl.prepend(...elems);
        }
        
        // Hancurkan dan buat ulang Masonry secara instan untuk menjamin layout 100% sempurna
        if (masonryInstance) {
          masonryInstance.destroy();
          initMasonry();
        }

        // Update UI Counter dengan animasi
        totalCountEl.innerText = totalItems;
      }
    }
  } catch (err) {
    console.error("Fetch error:", err);
    statusText.innerText = "LIVE (Koneksi terputus)";
  } finally {
    isFetching = false;
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

// Perbaiki Masonry jika tab lama tidak dibuka (background tab)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && masonryInstance) {
    masonryInstance.layout();
  }
});
