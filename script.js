// ================= NAVBAR SCROLL =================
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if(window.scrollY > 50){
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ================= TESTIMONI =================
//localStorage.removeItem("testimonials"); // hapus data lama (sekali saja)


let selectedRating = 0;
let testimonialSwiper;

document.addEventListener("DOMContentLoaded", () => {

  // --- Inisialisasi Swiper ---
  testimonialSwiper = new Swiper(".testimonial-swiper", {
  slidesPerView: 1.25,      // tampil 3 “terlihat” di HP
  centeredSlides: true,     // WAJIB supaya ada slide tengah
  spaceBetween: 14,

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  breakpoints:{
    768:{ 
      slidesPerView: 2.2,
      spaceBetween: 18,
      centeredSlides: true
    },
    992:{ 
      slidesPerView: 3.2,
      spaceBetween: 22,
      centeredSlides: true
    }
  }
});

  // --- Load testimoni dari localStorage ---
  const data = JSON.parse(localStorage.getItem("testimonials")) || [];
  data.reverse().forEach(showTestimonial);

  // --- Bintang interaktif di FORM ---
  document.querySelectorAll(".rating-input span").forEach((star, i) => {
    star.addEventListener("click", () => {
      selectedRating = i + 1;
      document.querySelectorAll(".rating-input span")
        .forEach((s, idx) => s.classList.toggle("active", idx < selectedRating));
    });
  });
});

function addTestimonial(){

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const photoInput = document.getElementById("photo");

  if(!name || !message || selectedRating === 0){
    alert("Lengkapi nama, ulasan, dan rating ⭐");
    return;
  }

  // --- Baca foto (kalau ada) ---
let photoData = "img/default-user.png"; // default

if(photoInput.files.length > 0){
  const reader = new FileReader();
  reader.readAsDataURL(photoInput.files[0]);

  reader.onload = function(){
    photoData = reader.result;

    const testimonial = {
      name,
      message,
      rating: selectedRating,
      photo: photoData
    };

    // simpan ke localStorage
    const data = JSON.parse(localStorage.getItem("testimonials")) || [];
    data.push(testimonial);
    localStorage.setItem("testimonials", JSON.stringify(data));

    // tampilkan di carousel
    showTestimonial(testimonial, true);
    resetForm();
  };

  return; // penting supaya tidak lanjut sebelum foto selesai diproses
}

  const testimonial = {
    name,
    message,
    rating: selectedRating,
    photo: photoURL
  };

  // Simpan ke localStorage
  const data = JSON.parse(localStorage.getItem("testimonials")) || [];
  data.push(testimonial);
  localStorage.setItem("testimonials", JSON.stringify(data));

  // Tampilkan di carousel
  showTestimonial(testimonial, true);

  // Reset form
  resetForm();
}

function showTestimonial({name, message, rating, photo}, prepend=false){

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  const slide = `
    <div class="swiper-slide">
      <div class="testimonial-card-new">
        <div class="testimonial-avatar">
          <img src="${photo}" alt="${name}">
        </div>

        <h6>${name}</h6>

        <div class="testimonial-stars-result">
          ${stars}
        </div>

        <p>"${message}"</p>
      </div>
    </div>
  `;

  prepend
    ? testimonialSwiper.prependSlide(slide)
    : testimonialSwiper.appendSlide(slide);
}

function resetForm(){
  document.getElementById("name").value="";
  document.getElementById("message").value="";
  document.getElementById("photo").value="";
  selectedRating=0;

  document.querySelectorAll(".rating-input span")
    .forEach(s=>s.classList.remove("active"));
}

// ================= UMKM WHATSAPP =================
document.querySelectorAll(".order-btn").forEach(btn => {
  btn.addEventListener("click", function(e){
    e.preventDefault();

    const serviceCode = this.dataset.service; // contoh: OJK, ANG, BRH, DLL
    const serviceName = this.dataset.name;    // contoh: "Ojek", "Angkut Barang"

    const today = new Date();

    // FORMAT TANGGAL UNTUK ID (DDMMYYYY)
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const dateCode = `${day}${month}${year}`;

    // ======= COUNTER PER LAYANAN (PENTING!) =======
    const counterKey = `orderCounter_${serviceCode}`;  
    let lastNumber = localStorage.getItem(counterKey) || 0;
    lastNumber = parseInt(lastNumber) + 1;
    localStorage.setItem(counterKey, lastNumber);
    // ===============================================

    const orderID = `${serviceCode}-${dateCode}-${lastNumber}`;

    const message =
`JEKPINSIPINTAR — DETAIL PESANAN

ID Pesanan : ${orderID}
Layanan    : ${serviceName}
Paket      :             *(isi)
Tanggal    : ${today.toLocaleDateString("id-ID")}

-------------------------------
Silakan isi data berikut:

• Jenis paket / opsi yang dipilih:
• Lokasi penjemputan / layanan:
• Jam layanan:
• Catatan tambahan (jika ada):

Terima kasih telah menggunakan JekPinSiPintar`;

    const encoded = encodeURIComponent(message);
    const waURL = `https://wa.me/6285748542321?text=${encoded}`;

    window.open(waURL, "_blank");
  });
});

// ================== VARIABEL GLOBAL (WAJIB) ==================
let map, routingControl;
let originCoords = null;
let destCoords = null;

// ================== NAVBAR SCROLL (tetap dipakai) ==================
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if(window.scrollY > 50){
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ================== INIT MAP (BANYUWANGI) ==================
window.onload = function () {
  map = L.map("map").setView([-8.2192, 114.3691], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
};

// ================== SHARE LOKASI CLIENT ==================
function ambilLokasiClient() {
  if (!navigator.geolocation) {
    alert("Browser kamu tidak mendukung lokasi.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      originCoords = [pos.coords.latitude, pos.coords.longitude];

      document.getElementById("origin").value =
        `Lokasi saya: ${originCoords[0]}, ${originCoords[1]}`;

      map.setView(originCoords, 14);

      L.marker(originCoords).addTo(map)
        .bindPopup("Lokasi Anda")
        .openPopup();
    },
    function () {
      alert("Aktifkan izin lokasi di browser.");
    }
  );
}

// ================== GEOCODING (ALAMAT → KOORDINAT) ==================
async function geocodeAddress(address) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&q=" +
    encodeURIComponent(address + ", Banyuwangi");

  const res = await fetch(url);
  const data = await res.json();

  if (data.length === 0) {
    alert("Alamat tidak ditemukan.");
    return null;
  }

  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// ================== HITUNG RUTE + TARIF ==================
async function hitungOjek() {
  const originText = document.getElementById("origin").value;
  const destinationText = document.getElementById("destination").value;

  if (!originText || !destinationText) {
    alert("Isi jemput dan tujuan!");
    return;
  }

  // Jika user tidak share lokasi, kita geocode alamat jemput juga
  if (!originCoords) {
    originCoords = await geocodeAddress(originText);
    if (!originCoords) return;
  }

  // PAKAI KOORDINAT DARI AUTOCOMPLETE JIKA ADA
if (selectedDestCoords) {
  destCoords = selectedDestCoords;
} else {
  destCoords = await geocodeAddress(destinationText);
  if (!destCoords) return;
}

  // Hapus rute lama kalau ada
  if (routingControl) map.removeControl(routingControl);

  // Tampilkan rute di peta
  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(originCoords[0], originCoords[1]),
      L.latLng(destCoords[0], destCoords[1])
    ],
    routeWhileDragging: false,
    showAlternatives: false
  }).addTo(map);

  // Ambil jarak dari OSRM
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originCoords[1]},${originCoords[0]};` +
    `${destCoords[1]},${destCoords[0]}?overview=false`;

  const res = await fetch(url);
  const data = await res.json();

  const jarakKm = (data.routes[0].distance / 1000).toFixed(1);

// === CEK PILIHAN MOTOR ATAU MOBIL ===
const kendaraan = document.querySelector('input[name="vehicle"]:checked').value;

let harga;
const d = parseFloat(jarakKm);

if (kendaraan === "motor") {
  // TARIF MOTOR
  if (d <= 3) harga = 12000;
  else if (d <= 8) harga = 20000;
  else harga = 30000 + (d - 8) * 1500;
} else {
  // TARIF MOBIL (LEBIH MAHAL)
  if (d <= 3) harga = 18000;
  else if (d <= 8) harga = 32000;
  else harga = 45000 + (d - 8) * 2000;
}


  document.getElementById("jarak").innerText = jarakKm + " km";
  document.getElementById("harga").innerText =
    "Rp " + Math.round(harga).toLocaleString("id-ID");

  // Siapkan pesan WA otomatis
// ===== BUAT ID PESANAN OTOMATIS =====
const today = new Date();
const day = String(today.getDate()).padStart(2, "0");
const month = String(today.getMonth() + 1).padStart(2, "0");
const year = today.getFullYear();
const dateCode = `${day}${month}${year}`;

// counter khusus ojek
const counterKey = "orderCounter_OJK";
let lastNumber = localStorage.getItem(counterKey) || 0;
lastNumber = parseInt(lastNumber) + 1;
localStorage.setItem(counterKey, lastNumber);

const orderID = `OJK-${dateCode}-${lastNumber}`;
// ===== LINK GOOGLE MAPS (BENAR & AMAN) =====
const gmapsJemput =
  `https://www.google.com/maps?q=${originCoords[0]},${originCoords[1]}`;

const gmapsTujuan =
  `https://www.google.com/maps?q=${destCoords[0]},${destCoords[1]}`;

// ===== FORMAT PESAN FINAL (SATU SAJA — URUTAN BARU) =====
const waText =
  "JEKPINSIPINTAR — PESAN OJEK\n\n" +
  "ID Pesanan: " + orderID + "\n" +
  "Tanggal: " + today.toLocaleDateString("id-ID") + "\n\n" +

  "Jenis Kendaraan: " + (kendaraan === "motor" ? "Motor" : "Mobil") + "\n" +
  "Lokasi Jemput: " + originText + "\n" +
  "Buka Jemput di Maps:\n" + gmapsJemput + "\n\n" +

  "Lokasi Tujuan: " + destinationText + "\n" +
  "Buka Tujuan di Maps:\n" + gmapsTujuan + "\n\n" +

  "Jarak Tempuh: " + jarakKm + " km\n" +
  "Estimasi Harga: Rp " +
    Math.round(harga).toLocaleString("id-ID") + "\n\n" +

  "Terima kasih telah menggunakan JekPinSiPintar 🙏";


// --- SET LINK WHATSAPP (HARUS DI PALING AKHIR FUNGSI) ---
document.getElementById("waBtn").href =
  "https://wa.me/6285748542321?text=" +
  encodeURIComponent(waText);
}
let selectedDestCoords = null;   // SIMPAN KOORDINAT TUJUAN

async function cariTujuan(query) {
  const list = document.getElementById("suggestions");

  if (query.length < 2) {
    list.style.display = "none";
    return;
  }

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" +
    encodeURIComponent(query + ", Banyuwangi");

  const res = await fetch(url);
  const data = await res.json();

  list.innerHTML = "";
  list.style.display = "block";

  data.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item.display_name;

    li.onclick = function (e) {
      e.stopPropagation();

      document.getElementById("destination").value = item.display_name;

      // 👉 SIMPAN KOORDINAT TUJUAN (PALING PENTING!)
      selectedDestCoords = [
        parseFloat(item.lat),
        parseFloat(item.lon)
      ];

      list.style.display = "none";
    };

    list.appendChild(li);
  });
}
