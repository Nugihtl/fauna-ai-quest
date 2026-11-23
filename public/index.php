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
  <div class="viewport" id="viewport">
    <div class="stage" id="stage" data-screen="intro">

      <!-- Latar pemandangan (aset Figma resmi, PNG dari repo) -->
      <img class="scene-bg" src="assets/images/background/landscape.png" alt="Latar pemandangan" aria-hidden="true">

      <!-- ============ HEADER ============ -->
      <header class="topbar">
        <div class="brand">
          <img class="brand-logo" src="assets/images/icons/logo.svg" alt="Logo Fauna AI Quest">
          <span class="brand-name">FAUNA AI QUEST</span>
        </div>

        <nav class="stepper" id="stepper" aria-label="Progres misi"></nav>

        <button class="btn-exit" id="btnExit" type="button">Keluar Misi</button>
      </header>

      <!-- ============ LAYAR 1: INTRO (latar saja + tombol Mulai Misi) ============ -->
      <section class="screen" id="screen-intro" aria-hidden="true">
        <button class="btn-start btn-start-intro" id="btnStart" type="button">Mulai Misi</button>
      </section>

      <!-- ============ LAYAR 2: SELAMAT DATANG ============ -->
      <section class="screen" id="screen-welcome" aria-labelledby="welcomeTitle" aria-hidden="true">
        <article class="welcome-panel">
          <h1 id="welcomeTitle">Selamat Datang di Misi Fauna AI!</h1>
          <div class="instruction">
            <span class="instruction-label">PETUNJUK AKTIVITAS</span>
            <p>Baca instruksi dengan saksama, amati karakteristik hewan, lalu pilih jawaban atau kelompokkan gambar sesuai mode permainan.</p>
          </div>
          <div class="welcome-body">
            <h2>Yuk, bantu Fauna AI mengenali dunia hewan!</h2>
            <p>Bantu Fauna AI mengelompokkan hewan vertebrata. Amati gambar, berikan label, dan lihat bagaimana contoh yang kamu pilih memengaruhi hasil klasifikasi.</p>
          </div>
        </article>
        <img class="robot robot-welcome" src="assets/images/mascot/fauna.png" alt="Maskot Fauna AI">
        <button class="btn-start btn-start-welcome" id="btnContinue" type="button">Lanjut</button>
        <button class="btn-back btn-back-welcome" id="btnBackWelcome" type="button">Kembali</button>
      </section>

      <!-- ============ LAYAR 3: PILIH MODE ============ -->
      <section class="screen" id="screen-mode" aria-labelledby="modeTitle" aria-hidden="true">
        <img class="robot robot-mode" src="assets/images/mascot/fauna.png" alt="Maskot Fauna AI">

        <div class="bubble">
          <h2 id="modeTitle">Pilih Mode Permainanmu!</h2>
          <p>Pilih salah satu cara kamu ingin mengenali hewan vertebrata.</p>
        </div>

        <!-- Kartu Binary -->
        <article class="mode-card mode-binary">
          <h3 class="pill">Binary</h3>
          <p class="mode-desc">Tentukan apakah hewan yang ditampilkan termasuk kelas yang dipilih atau bukan.</p>
          <div class="mode-art mode-art-binary">
            <img src="assets/images/modes/kucing.webp" alt="Kucing">
            <span class="vline"></span>
            <img src="assets/images/modes/camar.webp" alt="Burung camar">
          </div>
          <div class="mode-select-badge" aria-hidden="true"><span>&#10004;</span> Terpilih</div>
          <button class="btn-start" type="button" data-mode="binary">Mulai Misi</button>
        </article>

        <!-- Kartu Kelompokkan -->
        <article class="mode-card mode-kelompokkan">
          <h3 class="pill">Kelompokkan</h3>
          <p class="mode-desc">Kelompokkan setiap gambar ke dalam salah satu dari lima kelas vertebrata: Mamalia, Aves, Reptil, Amfibi, atau Pisces.</p>
          <div class="mode-art mode-art-kelompokkan">
            <img src="assets/images/modes/katak.webp" alt="Katak">
            <img src="assets/images/modes/kudalaut.webp" alt="Kuda laut">
            <img src="assets/images/modes/pinguin.webp" alt="Pinguin">
            <img src="assets/images/modes/bunglon.webp" alt="Bunglon">
          </div>
          <div class="mode-select-badge" aria-hidden="true"><span>&#10004;</span> Terpilih</div>
          <button class="btn-start" type="button" data-mode="kelompokkan">Mulai Misi</button>
        </article>

        <button class="btn-back btn-back-mode" id="btnBackMode" type="button">Kembali</button>
      </section>

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
  <div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true"></div>

  <script src="assets/js/opening.js"></script>
</body>
</html>
