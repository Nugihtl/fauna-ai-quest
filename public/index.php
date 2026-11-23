<?php
// Fauna Quest — entry point (PHP built-in server: php -S 127.0.0.1:8000 -t public)
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fauna AI Quest — Opening</title>
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/opening.css">
</head>
<body>
  <div class="app">
    <div class="app__wrap">
      <header class="header">
        <a class="header__brand" href="#" aria-label="Beranda Fauna AI Quest">
          <img class="header__logo" src="assets/images/icons/logo.svg" alt="Logo Fauna AI Quest">
          <span class="header__wordmark">FAUNA AI QUEST</span>
        </a>

        <div class="header__progress" aria-label="Progress misi">
          <span class="progress__step" id="step-1" data-step="1" aria-current="step">1</span>
          <span class="progress__step" data-step="2">2</span>
          <span class="progress__step" data-step="3">3</span>
          <span class="progress__step" data-step="4">4</span>
          <span class="progress__step" data-step="5">5</span>
          <span class="progress__step" data-step="6">6</span>
          <span class="progress__step" data-step="7">7</span>
          <span class="progress__step" data-step="8">8</span>
          <span class="progress__step" data-step="9">9</span>
        </div>

        <div class="header__actions">
          <button class="btn-ghost" id="btn-exit" type="button" aria-label="Keluar Misi">Keluar Misi</button>
        </div>
      </header>

      <main class="views">

        <!-- Tampilan 1 — Opening / halaman awal -->
        <section class="view view--active" id="view-1" aria-labelledby="view-1-title" role="region">
          <div class="opening">
            <h1 class="opening__title" id="view-1-title">Fauna AI Quest</h1>
            <p class="opening__subtitle">Mulai misi mengenali dunia hewan vertebrata.</p>
            <button class="btn-primary" id="btn-start" type="button">Mulai Misi</button>
          </div>
        </section>

        <!-- Tampilan 2 — Selamat datang dan petunjuk aktivitas -->
        <section class="view" id="view-2" aria-labelledby="view-2-title" role="region" aria-hidden="true">
          <div class="welcome">
            <img class="welcome__mascot" src="assets/images/mascot/fauna.png" alt="Maskot Fauna AI" width="320" height="480">

            <div class="welcome__panel">
              <span class="welcome__kicker">Petunjuk aktivitas</span>
              <h2 class="welcome__title" id="view-2-title">Selamat Datang di Misi Fauna AI!</h2>
              <p class="welcome__lead">Yuk, bantu Fauna AI mengenali dunia hewan!</p>
              <p class="welcome__desc">
                Bantu Fauna AI mengelompokkan hewan vertebrata. Amati gambar, berikan label, dan lihat
                bagaimana contoh yang kamu pilih memengaruhi hasil klasifikasi.
              </p>
              <p class="welcome__desc">
                Baca instruksi dengan saksama, amati karakteristik hewan, lalu pilih jawaban atau
                kelompokkan gambar sesuai mode permainan.
              </p>
              <div class="welcome__actions">
                <button class="btn-ghost" id="btn-back-1" type="button">Kembali</button>
                <button class="btn-primary" id="btn-continue" type="button">Lanjut</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Tampilan 3 — Pemilihan mode permainan -->
        <section class="view" id="view-3" aria-labelledby="view-3-title" role="region" aria-hidden="true">
          <div class="mode">
            <img class="mode__mascot" src="assets/images/mascot/fauna.png" alt="Maskot Fauna AI" width="260" height="390">
            <div>
              <p class="mode__dialog" id="view-3-title">Pilih Mode Permainanmu!</p>
              <p class="mode__dialog-sub">Pilih salah satu cara kamu ingin mengenali hewan vertebrata.</p>
            </div>

            <div class="mode__cards">
              <!-- Kartu Binary -->
              <article class="mode__card" id="card-binary" data-mode="binary">
                <div class="mode__illustration" aria-hidden="true"></div>
                <h3 class="mode__card-title">Binary</h3>
                <p class="mode__card-desc">Tentukan apakah hewan yang ditampilkan termasuk kelas yang dipilih atau bukan.</p>
                <div class="mode__select-badge" aria-hidden="true">
                  <span aria-hidden="true">&#10004;</span> Terpilih
                </div>
                <button class="btn-primary" type="button" data-mode="binary">Mulai Misi</button>
              </article>

              <!-- Kartu Kelompokkan -->
              <article class="mode__card" id="card-kelompokkan" data-mode="kelompokkan">
                <div class="mode__illustration" aria-hidden="true"></div>
                <h3 class="mode__card-title">Kelompokkan</h3>
                <p class="mode__card-desc">Kelompokkan setiap gambar ke dalam salah satu dari lima kelas vertebrata: Mamalia, Aves, Reptil, Amfibi, atau Pisces.</p>
                <div class="mode__select-badge" aria-hidden="true">
                  <span aria-hidden="true">&#10004;</span> Terpilih
                </div>
                <button class="btn-primary" type="button" data-mode="kelompokkan">Mulai Misi</button>
              </article>
            </div>

            <div class="mode__footer">
              <button class="btn-ghost" id="btn-back-2" type="button">Kembali</button>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>

  <!-- Dialog konfirmasi Keluar Misi -->
  <div class="overlay" id="overlay-exit" aria-hidden="true">
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title" aria-describedby="exit-desc">
      <h2 class="dialog__title" id="exit-title">Keluar Misi?</h2>
      <p class="dialog__desc" id="exit-desc">Yakin ingin keluar dari misi ini? Perpanaman akan dibatalkan.</p>
      <div class="dialog__actions">
        <button class="btn-ghost" id="btn-exit-cancel" type="button">Batal</button>
        <button class="btn-primary" id="btn-exit-confirm" type="button">Keluar</button>
      </div>
    </div>
  </div>

  <!-- Toast feedback -->
  <div class="toast" id="toast" aria-live="polite" aria-atomic="true" style="display:none;"></div>

  <script src="assets/js/opening.js"></script>
</body>
</html>
