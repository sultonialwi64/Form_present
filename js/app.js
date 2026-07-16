import { WEB_APP_URL } from "./config.js";

const form = document.getElementById("aspirasiForm");
const submitBtn = document.getElementById("submitBtn");
const btnSpinner = document.getElementById("btnSpinner");
const successState = document.getElementById("successState");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (WEB_APP_URL === "GANTI_DENGAN_URL_WEB_APP_GOOGLE_SCRIPT_ANDA_DISINI") {
    alert("Konfigurasi WEB_APP_URL belum diatur di config.js!");
    return;
  }

  // Ambil data
  const formData = new FormData(form);
  const data = {
    action: "submit",
    nama: formData.get("nama"),
    unit_kerja: formData.get("unit_kerja"),
    saran: formData.get("saran")
  };

  // UI state: loading
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-80", "cursor-not-allowed");
  btnSpinner.style.display = "block";
  submitBtn.querySelector("span").innerText = "Mengirim...";

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (json.status === "success") {
      // Tampilkan success overlay
      successState.classList.remove("hidden");
      successState.classList.add("flex");
    } else {
      alert("Gagal: " + json.message);
    }
  } catch (error) {
    alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    console.error(error);
  } finally {
    // Kembalikan UI button
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-80", "cursor-not-allowed");
    btnSpinner.style.display = "none";
    submitBtn.querySelector("span").innerText = "Kirim Aspirasi";
  }
});

window.resetForm = () => {
  form.reset();
  successState.classList.add("hidden");
  successState.classList.remove("flex");
  document.getElementById("nama").focus();
};
