(function () {
  "use strict";

  var TOTAL_STEPS = 9;
  var stage = document.getElementById("stage");
  var stepper = document.getElementById("stepper");
  var toast = document.getElementById("toast");
  var screens = {
    welcome: document.getElementById("screen-welcome"),
    mode: document.getElementById("screen-mode")
  };
  var current = "intro";
  var toastTimer = null;
  var exitModal = document.getElementById("modal");
  var modalCancel = document.getElementById("modal-cancel");
  var modalOk = document.getElementById("modal-ok");

  /* ---------- Skala stage (desain 1440x1024) agar muat di layar apa pun ---------- */
  function fit() {
    var w = 1440, h = 1024;
    var s = Math.min(window.innerWidth / w, window.innerHeight / h);
    stage.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", fit);
  fit();

  /* ---------- Stepper 1..9 ---------- */
  function renderStepper(active) {
    if (!stepper) return;
    stepper.innerHTML = "";
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var el = document.createElement("span");
      el.className = "step" + (i === active ? " is-active" : i < active ? " is-done" : "");
      el.textContent = i < active ? "✓" : i;
      if (i === active) el.setAttribute("aria-current", "step");
      stepper.appendChild(el);
    }
  }
  // Expose stepper renderer for binary.js and future modes
  window.renderFaunaStepper = renderStepper;

  /* ---------- Navigasi antar layar opening ---------- */
  function show(name) {
    current = name;
    stage.dataset.screen = name;
    Object.keys(screens).forEach(function (k) {
      if (screens[k]) {
        screens[k].classList.toggle("is-visible", k === name);
        screens[k].classList.toggle("active", k === name);
      }
    });
    var stepMap = { intro: 1, welcome: 2, mode: 3 };
    if (stepMap[name]) renderStepper(stepMap[name]);
  }
  window.showFaunaScreen = show;

  function notify(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2600);
  }

  /* ---------- Event Listeners ---------- */
  var btnStart = document.getElementById("btnStart");
  if (btnStart) {
    btnStart.addEventListener("click", function () {
      show("mode");
    });
  }

  var btnExit = document.getElementById("btnExit");
  if (btnExit) {
    btnExit.addEventListener("click", function () {
      if (exitModal) {
        exitModal.removeAttribute("hidden");
      }
    });
  }

  if (modalCancel) {
    modalCancel.addEventListener("click", function () {
      if (exitModal) exitModal.setAttribute("hidden", "");
    });
  }

  if (modalOk) {
    modalOk.addEventListener("click", function () {
      if (exitModal) exitModal.setAttribute("hidden", "");
      document.dispatchEvent(new CustomEvent("fauna:exit"));
      // Sembunyikan semua layar binary
      document.querySelectorAll('.screen[id^="s-"]').forEach(function (s) {
        s.classList.remove("is-visible", "active");
      });
      show("intro");
      setTimeout(function () { show("welcome"); }, 900);
    });
  }

  document.querySelectorAll("[data-mode]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.dataset.mode;
      document.dispatchEvent(new CustomEvent("fauna:mode", { detail: { mode: mode } }));
      if (mode !== "binary") {
        notify("Mode Kelompokkan sedang disiapkan.");
      }
    });
  });

  /* ---------- Mulai ---------- */
  renderStepper(1);
  show("intro");
  // Layar 1 (latar saja) tampil sebentar, lalu sambutan masuk
  setTimeout(function () {
    if (current === "intro") show("welcome");
  }, 1200);
})();
