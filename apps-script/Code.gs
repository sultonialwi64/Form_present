// ============================================================
//  LIVE ASPIRASI FEEDBACK SYSTEM - Backend API
//  Google Apps Script
// ============================================================

const SHEET_NAME = "Aspirasi"; // Nama tab di Google Sheets

function pancingIzin() {
  UrlFetchApp.fetch("https://google.com");
}

function doPost(e) {
  // Set up response headers for CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parsing payload JSON dari frontend
    const payloadStr = e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(payloadStr);

    if (data.action === "submit") {
      // Mencegah Race Condition (Tabrakan data) saat ratusan orang submit bersamaan
      const lock = LockService.getScriptLock();
      
      // Tunggu hingga 10 detik jika ada proses penulisan lain yang sedang berjalan
      if (lock.tryLock(10000)) {
        try {
          const ss = SpreadsheetApp.getActiveSpreadsheet();
          let sheet = ss.getSheetByName(SHEET_NAME);
          
          // Jika tab belum ada, buat otomatis beserta header
          if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAME);
            sheet.appendRow(["timestamp", "nama", "unit_kerja", "saran"]);
            sheet.getRange("A1:D1").setFontWeight("bold");
            sheet.setFrozenRows(1);
          }

          const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
          const nama = data.nama || "Anonim";
          const unitKerja = data.unit_kerja || "-";
          const saran = data.saran || "";

          sheet.appendRow([timestamp, nama, unitKerja, saran]);

          return respond({ status: "success", message: "Data berhasil disimpan!" }, headers);
        } finally {
          // Selalu lepaskan lock setelah selesai atau error
          lock.releaseLock();
        }
      } else {
        return respond({ status: "error", message: "Server sedang sibuk (Trafik tinggi). Silakan coba beberapa detik lagi." }, headers, 429);
      }
    } else if (data.action === "clear") {
      const lock = LockService.getScriptLock();
      if (lock.tryLock(10000)) {
        try {
          const ss = SpreadsheetApp.getActiveSpreadsheet();
          let sheet = ss.getSheetByName(SHEET_NAME);
          if (sheet) {
            const lastRow = sheet.getLastRow();
            if (lastRow > 1) {
              sheet.deleteRows(2, lastRow - 1);
            }
          }
          return respond({ status: "success", message: "Data berhasil dihapus!" }, headers);
        } finally {
          lock.releaseLock();
        }
      } else {
        return respond({ status: "error", message: "Server sedang sibuk." }, headers, 429);
      }
    }

    return respond({ status: "error", message: "Action tidak valid" }, headers, 400);

  } catch (error) {
    return respond({ status: "error", message: error.toString() }, headers, 500);
  }
}

function doGet(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return respond({ status: "success", data: [], last_row: 0, total: 0 }, headers);
    }

    // Efisiensi: O(1) Read All Data
    const raw = sheet.getDataRange().getValues();
    
    if (raw.length <= 1) {
       return respond({ status: "success", data: [], last_row: 1, total: 0 }, headers);
    }

    // Sistem Cursor (last_row) agar payload ringan saat auto-refresh tiap 5 detik
    let startIdx = 1; // Lewati header di row 0
    if (e.parameter.last_row) {
      const paramLastRow = parseInt(e.parameter.last_row, 10);
      if (!isNaN(paramLastRow) && paramLastRow >= 1) {
         // array index = row number - 1
         startIdx = paramLastRow; 
      }
    }

    const items = [];
    for (let i = startIdx; i < raw.length; i++) {
      const row = raw[i];
      // Jika baris kosong, skip
      if (!row[0] && !row[1] && !row[3]) continue;

      items.push({
        id: i + 1, // Nomor baris sebagai ID unik
        timestamp: row[0],
        nama: row[1],
        unit_kerja: row[2],
        saran: row[3]
      });
    }

    // Return chronological or reverse depending on frontend needs.
    // Presenter dashboard usually renders top-down, so we send the new items and frontend prepends them.

    return respond({ 
      status: "success", 
      data: items, 
      last_row: raw.length, 
      total: raw.length - 1 
    }, headers);

  } catch (error) {
    return respond({ status: "error", message: error.toString() }, headers, 500);
  }
}

// Handler untuk preflight OPTIONS request (CORS)
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return respond({}, headers);
}

// Helper function untuk output JSON
function respond(obj, customHeaders, code = 200) {
  let output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ========================================================
// FUNGSI UNTUK GENERATE DUMMY DATA (STRESS TEST)
// ========================================================
function isikanDummyAspirasi() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear();
  }
  
  sheet.appendRow(["timestamp", "nama", "unit_kerja", "saran"]);
  
  const dummyData = [
    [new Date(), "Budi Santoso", "Subbag Perencanaan", "Perlu ada penambahan kuota diklat untuk staff administrasi di tahun 2026."],
    [new Date(), "Siti Aminah", "Bidang PAUD", "Sistem absensi berbasis fingerprint sering error saat hujan, mohon pertimbangkan absensi via aplikasi mobile."],
    [new Date(), "Agus Riyadi", "Bidang SMP", "Fasilitas proyektor di ruang rapat lantai 2 resolusinya sangat buram, mohon segera di-upgrade ke smart TV atau proyektor resolusi tinggi."],
    [new Date(), "Rina Mulyani", "Sekretariat", "Usulan agar program senam jumat pagi diadakan kembali secara rutin untuk menjaga kebugaran pegawai."],
    [new Date(), "Dedi Hermawan", "Subbag Keuangan", "Proses pencairan SPPD masih memakan waktu lama akibat birokrasi tanda tangan fisik, harap diubah ke sistem digital signature."],
    [new Date(), "Anonim", "Bidang SD", "Lingkungan kerja di area belakang terlalu bising karena mesin genset yang sering menyala saat pemadaman."],
    [new Date(), "Yuni Astuti", "Subbag Umum", "Mohon tambahan tempat sampah terpilah organik & anorganik di setiap sudut koridor."],
  ];
  
  dummyData.forEach(row => {
    // Format tanggal
    row[0] = Utilities.formatDate(row[0], "GMT+7", "dd/MM/yyyy HH:mm:ss");
    sheet.appendRow(row);
  });
  
  sheet.getRange("A1:D1").setFontWeight("bold");
  sheet.setFrozenRows(1);
  
  return "Data Dummy Aspirasi berhasil ditambahkan!";
}
