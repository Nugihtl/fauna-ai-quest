# Fauna Quest — Opening

Mini-game edukasi tentang klasifikasi hewan vertebrata untuk siswa SD hingga SMA, yang akan digunakan sebagai bagian dari website edukasi Kabiru. Tahap ini hanya mengimplementasikan **Opening Fauna Quest** (tiga tampilan Opening + navigasi + pemilihan mode permainan).

## Teknologi yang digunakan

- HTML5 (struktur semantik + atribut accessibility)
- CSS3 (custom properties/design tokens, layout responsif, tanpa framework CSS)
- JavaScript vanilla (interaksi dan navigasi antartampilan)
- PHP (entry point aplikasi, dijalankan dengan PHP built-in development server)

Tidak menggunakan: Next.js / React / Vue / Angular, NestJS / backend framework, TypeScript, Bootstrap / Tailwind, library eksternal, CDN, Docker, database, atau backend API.

## Struktur folder

```text
fauna-quest/
├── design-reference/
│   ├── Opening.pdf
│   ├── color pallete.pdf
│   └── komponen utama.pdf
├── public/
│   ├── index.php                 # Entry point aplikasi
│   └── assets/
│       ├── css/
│       │   ├── tokens.css        # Design system tokens (warna, tipografi, @font-face Nunito)
│       │   └── opening.css       # Layout & komponen Opening
│       ├── js/
│       │   └── opening.js        # State, navigasi, pemilihan mode
│       ├── fonts/
│       │   └── Nunito-*.ttf      # Font resmi Nunito (lokal; WOFF2 belum tersedia)
│       └── images/
│           ├── background/
│           │   └── landscape.png # Ilustrasi pemandangan (aset Figma resmi)
│           ├── mascot/
│           │   └── fauna.png     # Maskot Fauna (aset Figma resmi)
│           ├── icons/
│           │   └── logo.svg      # Logo (aset Figma resmi, SVG)
│           └── modes/            # (kosong sengaja — ilustrasi kartu mode belum tersedia)
├── README.md
└── .gitignore
```

## Cara menjalankan aplikasi

Pastikan PHP terinstal, lalu jalankan built-in development server dari folder root repository:

```bash
php -S 127.0.0.1:8000 -t public
```

Buka browser di:

```
http://127.0.0.1:8000
```

## Lingkup fitur yang sudah selesai (tahap Opening)

1. Project initialization & struktur folder.
2. Design system dasar: CSS custom properties (warna navy/blue/cyan/red/green/neutral/yellow dengan token `--navy-50` s.d `--yellow-500`, tipografi sesuai hierarki Figma: Heading/H1/H2, Body/large/default, Caption).
3. Tiga tampilan Opening sesuai `Opening.pdf`:
   - Tampilan 1: Opening / halaman awal (background pemandangan, header, progress indicator 1–9, tombol Keluar Misi, tombol Mulai Misi).
   - Tampilan 2: Selamat datang dan petunjuk aktivitas (panel, judul, subjudul, maskot, teks pengantar, tombol Lanjut/Kembali).
   - Tampilan 3: Pemilihan mode permainan (maskot dengan dialog, dua kartu Binary & Kelompokkan dengan ilustrasi, judul, deskripsi, tombol Mulai Misi; dua kartu berdampingan di desktop, vertikal di layar sempit).
4. Interaksi navigasi antartampilan Opening (Opening → Sambutan → Pemilihan Mode) dengan tombol Kembali.
5. Tombol Keluar Misi menampilkan dialog konfirmasi (tidak langsung menutup tab/browser).
6. Pemilihan mode Binary atau Kelompokkan disimpan pada state JavaScript, ditampilkan indikator "Terpilih", dan tombol Mulai Misi memberi feedback.
7. Responsif (desktop, tablet, mobile), navigasi dapat digunakan dengan keyboard, fokus terlihat (focus-visible).
8. README dan instruksi menjalankan aplikasi.

## Aset Figma yang belum tersedia / catatan

- Tiga aset resmi digunakan: `background/landscape.png`, `mascot/fauna.png`, `icons/logo.svg` (semua dari Figma, tidak ada screenshot PDF).
- Font Nunito diterapkan melalui `@font-face` dari file lokal `public/assets/fonts/Nunito-*.ttf` (hanya TTF tersedia; WOFF2 belum tersedia, tidak ada CDN).
- Ilustrasi kartu Binary dan Kelompokkan belum tersedia. Ruang ilustrasi dipertahankan sebagai kosong (`.mode__illustration`) tanpa gambar pengganti yang tampak seperti aset final. Apabila aset individual per mode tersedia nanti, sisipkan gambar di `public/assets/images/modes/`.
- Maskot menggunakan aset asli dari Figma; tidak dibuat maskot pengganti.

## Catatan pengembangan tahap berikutnya

- Jangan mengimplementasikan gameplay Binary maupun Kelompokkan pada tahap ini.
- Jangan membuat daftar hewan, karakteristik/feature vector, bobot kemiripan, rumus similarity, dataset, atau mekanisme evaluasi klasifikasi.
- Sistem klasifikasi nantinya menggunakan pendekatan similarity-based simulation (bukan machine learning, bukan KNN, tidak ada TensorFlow/PyTorch/MobileNet).
- Data contoh berlabel nantinya disimpan sementara selama satu sesi permainan.
- Implementasikan mekanisme similarity dan gameplay pada tahap pengembangan berikutnya.

## Catatan

Jangan melakukan commit Git secara otomatis (hanya saat diminta pengguna).
