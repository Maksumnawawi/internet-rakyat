# Analisis & Redesign UI/UX - Internet Rakyat (Area Pelanggan)

Proyek ini merupakan tugas mata kuliah **Desain Antarmuka Pengguna (User Interface & User Experience)** yang menganalisis dan mengembangkan prototipe antarmuka baru untuk layanan portal pelanggan *Internet Rakyat*.

---

## 📁 Struktur Direktori Proyek

```
c:\internet rakyat\
│
├── index.html                  # Landing Page resmi (Promo Vidio, modem IRA, tombol Login)
├── login.html                  # Portal Login IRA (Form nomor HP & footer PT Telemedia)
├── register.html               # Form Registrasi IRA (3-step onboarding & verifikasi OTP)
├── dashboard.html              # Area Pelanggan (Dashboard solusi tugas UI/UX: Diagnostik & WiFi)
├── README.md                   # Dokumentasi proyek & analisis UI/UX lengkap
├── favicon.svg                 # Root browser favicon
│
└── assets/
    ├── css/
    │   └── style.css           # Seluruh stylesheet terstruktur (Font: Be Vietnam Pro)
    │
    ├── js/
    │   └── app.js              # Logika interaktif dashboard (Tabs, network check, wifi manager)
    │
    └── images/
        ├── bg_hero.webp        # Background resmi landing page Internet Rakyat
        ├── modem_ira.png       # Modem ONT Fiber resmi Internet Rakyat
        ├── icon_vidio.svg      # Logo resmi Vidio
        ├── vidio_1.webp        # Poster Vidio Eredivisie
        ├── vidio_2.webp        # Poster Vidio Benda Keramat
        ├── vidio_3.webp        # Poster Vidio Love is a Story
        ├── cs_button.png       # Maskot CS Customer Care 24/7
        ├── girl_model.png      # Foto model pelanggan resmi (resolusi HD & utuh)
        └── banner_edc.png      # Ilustrasi mesin EDC panduan pembayaran
```

---

## 🎯 Fitur Baru yang Diusulkan (After)

### 1. Fitur 1: Live Status Koneksi & Indikator Gangguan (Network Status)
* **Latar Belakang (Before):** Pengguna tidak tahu apakah modem mereka sedang terhubung atau ada gangguan massal di wilayah mereka saat internet mengalami kendala.
* **Solusi UI/UX (After):**
  * Status bar terpadu di bagian atas halaman: `🟢 Online (Status Normal)`.
  * Metrik latensi/ping (`14 ms`) dan kecepatan unduh (`98.5 Mbps`).
  * Tombol **"Cek Jaringan"** interaktif untuk diagnostik mandiri (*self-service*).
* **Prinsip Heuristik Nielsen:** **#1 - Visibility of System Status** (Sistem selalu mengomunikasikan status koneksi terkini secara jelas dan real-time).

---

### 2. Fitur 2: Quick WiFi Manager (Kelola WiFi Rumah Mandiri)
* **Latar Belakang (Before):** Pengguna harus mengakses IP router manual `192.168.1.1` jika ingin melihat/mengubah kata sandi atau merestart modem. Ini sangat menyulitkan pelanggan awam.
* **Solusi UI/UX (After):**
  * Widget ringkas tepat di dashboard utama.
  * Tampilan nama WiFi (SSID) + tombol **"Ubah Nama"** (modal popup).
  * Kata sandi tersamarkan (`••••••••`) + tombol **"Lihat"** dan tombol **"Salin"**.
  * Aksi cepat: **"Ganti Password"** (modal validasi) & **"Restart Modem"** (simulasi reboot otomatis).
* **Prinsip Heuristik Nielsen:**
  * **#7 - Flexibility and Efficiency of Use** (Mempercepat alur kerja pengguna awam).
  * **#3 - User Control and Freedom** (Memberi kendali penuh me-restart perangkat secara mandiri).

---

## 📊 Matriks Perbandingan Before vs After

| Elemen UI / UX | Before (Web Asli) | After (Solusi Desain) | Keuntungan UX |
| :--- | :--- | :--- | :--- |
| **Status Jaringan** | Tidak ada info koneksi modem | Indikator live status + Ping + Tombol Cek | Mengurangi kecemasan (*anxiety*) pelanggan |
| **Pengelolaan WiFi** | Harus login IP router 192.168.1.1 | Widget Quick WiFi di dashboard utama | Efisiensi tinggi & ramah pengguna awam |
| **Kontrol Sandi** | Tidak tersedia di web | Fitur intip & salin kata sandi 1-klik | Mencegah kesalahan input sandi |
| **Reboot Router** | Cabut colokan kabel fisik | Tombol remote restart bersimulasi | Aman & tidak perlu menyentuh perangkat fisik |
| **Tipografi** | Font bervariasi | Be Vietnam Pro (Font resmi web asli) | Konsistensi visual dan kemudahan membaca |

---

## 🚀 Cara Menjalankan di Lokal

1. Buka terminal/PowerShell di folder proyek:
   ```powershell
   cd "c:\internet rakyat"
   python -m http.server 8080
   ```
2. Buka browser di alamat:
   ```
   http://localhost:8080/
   ```
3. Tekan **`Ctrl + F5`** untuk memuat seluruh aset dan gaya terbaru.

