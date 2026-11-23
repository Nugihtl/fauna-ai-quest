/* ==========================================================================
   Fauna Quest — Opening interaction (vanilla JS)
   Mengelola navigasi antar tiga tampilan Opening dan pemilihan mode.
   Tidak menggunakan localStorage / backend; state hidup hanya selama sesi.
   ========================================================================== */

(function () {
  const views = {
    1: document.getElementById("view-1"),
    2: document.getElementById("view-2"),
    3: document.getElementById("view-3"),
  };

  const steps = document.querySelectorAll(".progress__step");

  // State aplikasi Opening.
  const state = {
    currentView: 1,
    selectedMode: null, // null | "binary" | "kelompokkan"
  };

  const cards = document.querySelectorAll(".mode__card");
  const modeButtons = document.querySelectorAll(".mode__card button");

  // ---------- Progress indicator ----------
  function updateProgress(view) {
    steps.forEach((step) => {
      const n = parseInt(step.dataset.step, 10);
      const active = n === view;
      step.classList.toggle("progress__step--active", active);
    });
  }

  // ---------- Tampilkan tampilan ----------
  function showView(view) {
    if (view < 1 || view > 3) return;

    Object.values(views).forEach((el) => {
      el.classList.remove("view--active");
      el.setAttribute("aria-hidden", "true");
    });

    const target = views[view];
    target.classList.add("view--active");
    target.removeAttribute("aria-hidden");

    state.currentView = view;
    updateProgress(view);
  }

  // ---------- Pemilihan mode ----------
  function setCardSelected(modeEl, selected) {
    modeEl.classList.toggle("mode__card--selected", selected);
    const badge = modeEl.querySelector(".mode__select-badge");
    if (badge) badge.style.display = selected ? "inline-flex" : "none";
  }

  function selectMode(mode) {
    state.selectedMode = mode;

    cards.forEach((card) => {
      const isSelected = card.dataset.mode === mode;
      setCardSelected(card, isSelected);
    });
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  }

  // ---------- Dialog Keluar Misi ----------
  const overlay = document.getElementById("overlay-exit");
  const btnExit = document.getElementById("btn-exit");
  const btnExitCancel = document.getElementById("btn-exit-cancel");
  const btnExitConfirm = document.getElementById("btn-exit-confirm");

  function openExitDialog() {
    overlay.classList.add("overlay--open");
    overlay.removeAttribute("aria-hidden");
    btnExitCancel.focus();
  }

  function closeExitDialog() {
    overlay.classList.remove("overlay--open");
    overlay.setAttribute("aria-hidden", "true");
    btnExit.focus();
  }

  // ---------- Inisialisasi ----------
  function init() {
    // Tampilan 1: Mulai Misi -> tampilan 2
    document.getElementById("btn-start").addEventListener("click", () => {
      showView(2);
    });

    // Tampilan 2: Kembali -> tampilan 1 ; Lanjut -> tampilan 3
    document.getElementById("btn-back-1").addEventListener("click", () => {
      showView(1);
    });
    document.getElementById("btn-continue").addEventListener("click", () => {
      showView(3);
    });

    // Tampilan 3: Kembali -> tampilan 2
    document.getElementById("btn-back-2").addEventListener("click", () => {
      showView(2);
    });

    // Kartu mode: klik kartu memilih mode; tombol Mulai Misi memberi feedback.
    cards.forEach((card) => {
      const mode = card.dataset.mode;
      const btn = card.querySelector("button");

      card.addEventListener("click", (e) => {
        // Hindari ganda-pemanggilan saat tombol di dalam kartu diklik.
        if (e.target.tagName === "BUTTON") return;
        selectMode(mode);
      });

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectMode(mode);
        if (state.selectedMode) {
          const label =
            mode === "binary" ? "Binary" : mode === "kelompokkan" ? "Kelompokkan" : mode;
          showToast(`Mode ${label} telah dipilih. Gameplay akan segera tersedia.`);
        }
      });
    });

    // Keluar Misi: dialog konfirmasi, jangan langsung menutup tab/browser.
    btnExit.addEventListener("click", openExitDialog);
    btnExitCancel.addEventListener("click", closeExitDialog);
    btnExitConfirm.addEventListener("click", () => {
      closeExitDialog();
      showView(1);
      state.selectedMode = null;
      cards.forEach((card) => setCardSelected(card, false));
      showToast("Anda telah keluar dari misi.");
    });

    // Tutup dialog dengan tombol Esc.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("overlay--open")) {
        closeExitDialog();
      }
    });

    // Tampilkan tampilan awal.
    showView(1);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
