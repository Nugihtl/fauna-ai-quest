/* ==========================================================================
   Fauna Quest — Opening interaction (vanilla JS)
   Navigasi antar tiga tampilan Opening + pemilihan mode.
   State hidup hanya selama sesi (tidak localStorage / backend).
   ========================================================================== */

(function () {
  "use strict";

  var TOTAL_STEPS = 9;
  var stage = document.getElementById("stage");
  var stepper = document.getElementById("stepper");
  var toast = document.getElementById("toast");
  var screens = {
    welcome: document.getElementById("screen-welcome"),
    mode: document.getElementById("screen-mode"),
  };
  var current = "intro";
  var toastTimer = null;
  var selectedMode = null;

  /* ---------- Render stepper 1..9 (active / done / connecting lines) ---------- */
  function renderStepper(active) {
    stepper.innerHTML = "";
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var el = document.createElement("span");
      el.className = "step";
      if (i === active) {
        el.classList.add("is-active");
        el.setAttribute("aria-current", "step");
      } else if (i < active) {
        el.classList.add("is-done");
      }
      el.textContent = i;
      stepper.appendChild(el);
    }
  }

  /* ---------- Tampilkan layar (data-screen + is-visible) ---------- */
  function show(name) {
    current = name;
    stage.dataset.screen = name;

    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle("is-visible", k === name);
    });

    // Update stepper: intro=1, welcome=2, mode=3
    var stepMap = { intro: 1, welcome: 2, mode: 3 };
    renderStepper(stepMap[name] || 1);
  }

  /* ---------- Toast feedback ---------- */
  function notify(msg) {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- Pemilihan mode ---------- */
  function selectMode(mode) {
    selectedMode = mode;

    // Update visual badge pada kartu yang dipilih
    document.querySelectorAll(".mode-card").forEach(function (card) {
      var badge = card.querySelector(".mode-select-badge");
      if (card.dataset.mode === mode) {
        card.classList.add("mode-card--selected");
        if (badge) badge.style.display = "inline-flex";
      } else {
        card.classList.remove("mode-card--selected");
        if (badge) badge.style.display = "none";
      }
    });

    // Kirim event ke tahap selanjutnya (hook gameplay)
    document.dispatchEvent(
      new CustomEvent("fauna:mode", {
        detail: { mode: mode },
      })
    );

    var label = mode === "binary" ? "Binary" : mode === "kelompokkan" ? "Kelompokkan" : mode;
    notify("Mode " + label + " telah dipilih.");
  }

  /* ---------- Dialog Keluar Misi (custom, bukan window.confirm) ---------- */
  var overlay = document.getElementById("overlay-exit");
  var btnExit = document.getElementById("btnExit");
  var btnExitCancel = document.getElementById("btn-exit-cancel");
  var btnExitConfirm = document.getElementById("btn-exit-confirm");

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

  /* ---------- Event listener ---------- */
  function init() {
    // Layar 1 (intro): Mulai Misi → welcome (butuh klik, tidak auto)
    document.getElementById("btnStart").addEventListener("click", function () {
      show("welcome");
    });

    // Layar 2 (welcome): Lanjut → mode ; Kembali → intro
    document.getElementById("btnContinue").addEventListener("click", function () {
      show("mode");
    });
    document.getElementById("btnBackWelcome").addEventListener("click", function () {
      show("intro");
    });

    // Layar 3 (mode): Kembali → welcome
    document.getElementById("btnBackMode").addEventListener("click", function () {
      show("welcome");
    });

    // Kartu mode: klik tombol Mulai Misi pada kartu memilih mode
    document.querySelectorAll("[data-mode]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        selectMode(btn.dataset.mode);
      });
    });

    // Keluar Misi: dialog konfirmasi custom
    btnExit.addEventListener("click", openExitDialog);
    btnExitCancel.addEventListener("click", closeExitDialog);
    btnExitConfirm.addEventListener("click", function () {
      closeExitDialog();
      show("intro");
      selectedMode = null;
      document.querySelectorAll(".mode-card").forEach(function (card) {
        card.classList.remove("mode-card--selected");
        var badge = card.querySelector(".mode-select-badge");
        if (badge) badge.style.display = "none";
      });
      notify("Anda telah keluar dari misi.");
    });

    // Tutup dialog dengan tombol Esc
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("overlay--open")) {
        closeExitDialog();
      }
    });

    /* ---------- Mulai ---------- */
    renderStepper(1);
    show("intro");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
