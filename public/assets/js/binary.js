/* ==========================================================
   Fauna AI Quest — Mode Binary (Class Prototype Similarity)
   - 5 kelas target aktif (Mamalia, Aves, Reptil, Amfibi, Pisces)
   - 50 foto contoh (foto 1 & 2) diberi label Termasuk / Bukan [Target]
   - 2 prototipe (target & not_target) dibentuk dari label siswa
   - 25 foto uji (foto 3) diprediksi & dievaluasi terpisah
   ========================================================== */
(function () {
  'use strict';

  var FD = window.FaunaDataset;
  var FF = window.FaunaFeatures;
  var FS = window.FaunaSimilarity;

  if (!FD || !FF || !FS) {
    console.error('FaunaDataset, FaunaFeatures, atau FaunaSimilarity belum dimuat.');
    return;
  }

  var CLASS_MAP = FD.getClassMap();
  var SAMPLE_IMAGES = FD.getSampleImages(false); // tanpa classId
  var TEST_IMAGES = FD.getTestImages(false);     // tanpa classId

  var state = {
    targetClassId: 'mamalia',
    labels: {},        // imageId -> 'target' | 'not_target'
    teachIndex: 0,
    evaluation: null,  // hasil evaluasi lengkap setelah prediksi selesai
    page: 0,
    busy: false,
    active: false
  };

  var scanToken = 0;
  var currentScreen = '';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on', 'show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      t.classList.remove('is-on', 'show');
    }, 2800);
  }

  function targetName() {
    var cls = CLASS_MAP[state.targetClassId];
    return cls ? cls.name : 'Mamalia';
  }

  function updateTargetLabelsUI() {
    var name = targetName();
    var bYes = $('#btn-yes');
    var bNo = $('#btn-no');
    if (bYes) bYes.textContent = 'Termasuk ' + name;
    if (bNo) bNo.textContent = 'Bukan ' + name;

    var tYes = $('#s-recap .tab.is-yes');
    var tNo = $('#s-recap .tab.is-no');
    if (tYes) tYes.textContent = 'Termasuk ' + name;
    if (tNo) tNo.textContent = 'Bukan ' + name;
  }

  /* ---------- Robot Fauna AI (SVG Beranimasi) ---------- */
  function robotSVG(scale) {
    scale = scale || 1;
    return (
      '<svg class="robot" viewBox="0 0 320 310" width="' + (320 * scale) + '" height="' + (310 * scale) + '" aria-label="Fauna AI">' +
      '<ellipse cx="160" cy="288" rx="82" ry="22" fill="#f2f6f9" stroke="#d3dce4" stroke-width="1.5"/>' +
      '<circle cx="36" cy="152" r="22" fill="#6fd3ea"/><circle cx="284" cy="152" r="22" fill="#6fd3ea"/>' +
      '<rect x="26" y="128" width="16" height="50" rx="8" fill="#052540"/>' +
      '<rect x="278" y="128" width="16" height="50" rx="8" fill="#052540"/>' +
      '<path d="M27 92 L31 131" stroke="#9aa9b8" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M293 92 L289 131" stroke="#9aa9b8" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="25" cy="86" r="6" fill="#6fd3ea"/><circle cx="295" cy="86" r="6" fill="#6fd3ea"/>' +
      '<path d="M41 89 H279 V255 a20 20 0 0 1 -20 20 H61 a20 20 0 0 1 -20 -20 Z" fill="#e6ebef" stroke="#b3bfcb" stroke-width="1.5"/>' +
      '<rect x="60" y="112" width="201" height="96" rx="48" fill="#052540"/>' +
      '<circle cx="126" cy="150" r="11" fill="#6fd3ea"/><circle cx="192" cy="150" r="11" fill="#6fd3ea"/>' +
      '<path d="M144 171 Q160 190 177 171" stroke="#6fd3ea" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<text x="160" y="248" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-weight="800" font-size="17" fill="#0b2f4e">Fauna.AI</text>' +
      '<g class="dome"><path d="M41 89 A119 64 0 0 1 279 89 Z" fill="#e6ebef" stroke="#b3bfcb" stroke-width="1.5"/></g>' +
      '</svg>'
    );
  }

  function renderRobots() {
    $$('[data-robot]').forEach(function (el) {
      el.innerHTML = robotSVG(parseFloat(el.dataset.scale || 1));
    });
    var teachRobot = $('#teach-robot');
    if (teachRobot) {
      teachRobot.innerHTML = robotSVG(1.2);
    }
  }

  function updateStepper(step) {
    if (typeof window.renderFaunaStepper === 'function') {
      window.renderFaunaStepper(step);
    }
  }

  /* ---------- Navigasi Antar Layar Binary ---------- */
  function go(name, opts) {
    scanToken++;
    currentScreen = name;

    var welcome = $('#screen-welcome');
    var mode = $('#screen-mode');
    if (welcome) welcome.classList.remove('is-visible', 'active');
    if (mode) mode.classList.remove('is-visible', 'active');

    $$('.screen[id^="s-"]').forEach(function (s) {
      s.classList.remove('is-visible', 'active');
    });

    var el = $('#s-' + name);
    if (!el) return;

    el.classList.add('is-visible', 'active');
    var stepNum = parseInt(el.dataset.step, 10) || 2;
    updateStepper(stepNum);

    var initMap = {
      pick: initPick,
      teach: function () { initTeach(opts && opts.keepLabels); },
      check: initCheck,
      recap: initRecap,
      predict: initPredict,
      results: initResults
    };
    if (initMap[name]) initMap[name]();
  }

  /* ---------- Layar 2: Pilih Kelas Target (5 Kelas Aktif) ---------- */
  function initPick() {
    state.busy = false;
    $$('#group-grid .group-card').forEach(function (c) { c.classList.remove('selected'); });
  }

  function setupPickGrid() {
    var grid = $('#group-grid');
    if (!grid) return;
    grid.innerHTML = FD.CLASSES.map(function (g) {
      return (
        '<button type="button" class="group-card" data-group="' + g.id + '">' +
        '<img src="' + g.img + '" alt="' + g.name + '">' +
        '<h3>' + g.name + '</h3>' +
        '<p>' + g.desc + '</p>' +
        '<div class="ex">' + g.ex + '</div>' +
        '</button>'
      );
    }).join('');

    grid.addEventListener('click', async function (e) {
      var card = e.target.closest('.group-card');
      if (!card || state.busy) return;
      var clsId = card.dataset.group;
      if (!CLASS_MAP[clsId]) return;

      $$('#group-grid .group-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');

      state.targetClassId = clsId;
      state.labels = {};
      state.teachIndex = 0;
      state.evaluation = null;
      updateTargetLabelsUI();

      state.busy = true;
      await wait(400);
      go('teach', { keepLabels: false });
    });
  }

  /* ---------- Layar 3: Mengajari Fauna (50 Foto Contoh) ---------- */
  var CARD_PITCH = 440;

  function updateTeachCounter() {
    var cnt = $('#learn-count');
    if (cnt) {
      var doneCount = Object.keys(state.labels).length;
      cnt.textContent = doneCount + '/' + SAMPLE_IMAGES.length;
    }
  }

  function initTeach(keepLabels) {
    if (!keepLabels) {
      state.labels = {};
      state.teachIndex = 0;
      state.evaluation = null;
    } else if (state.teachIndex >= SAMPLE_IMAGES.length) {
      state.teachIndex = SAMPLE_IMAGES.length - 1;
    }
    state.busy = false;
    updateTargetLabelsUI();
    updateTeachCounter();

    var robot = $('#teach-robot .robot');
    if (robot) robot.classList.remove('open');

    var track = $('#teach-track');
    if (track) {
      track.innerHTML = SAMPLE_IMAGES.map(function (item) {
        return (
          '<div class="t-card">' +
          '<img src="' + item.src + '" alt="' + item.displayName + '">' +
          '<h3>' + item.displayName + ' <small style="font-weight:700;opacity:0.7">(Contoh ' + item.order + ')</small></h3>' +
          '</div>'
        );
      }).join('');
    }
    layoutTeach();

    var bYes = $('#btn-yes'), bNo = $('#btn-no');
    if (bYes && bNo) bYes.disabled = bNo.disabled = false;
  }

  function layoutTeach() {
    $$('#teach-track .t-card').forEach(function (c, i) {
      var rel = i - state.teachIndex;
      c.classList.remove('fly');
      c.style.transform = 'translateX(' + (rel * CARD_PITCH) + 'px)';
      c.classList.toggle('hidden', rel < -1 || rel > 1);
    });

    var currentItem = SAMPLE_IMAGES[state.teachIndex];
    var currentLbl = currentItem ? state.labels[currentItem.id] : undefined;
    var bYes = $('#btn-yes'), bNo = $('#btn-no');
    if (bYes) bYes.classList.toggle('is-selected', currentLbl === 'target');
    if (bNo) bNo.classList.toggle('is-selected', currentLbl === 'not_target');
  }

  async function labelCurrent(isTarget) {
    if (state.busy) return;
    var item = SAMPLE_IMAGES[state.teachIndex];
    if (!item) return;

    state.busy = true;
    state.labels[item.id] = isTarget ? 'target' : 'not_target';

    var cards = $$('#teach-track .t-card');
    var card = cards[state.teachIndex];
    var robot = $('#teach-robot .robot');

    if (robot) robot.classList.add('open');
    if (card) {
      card.classList.add('fly');
      card.style.transform = 'translate(' + (1090 - 86 - 100) + 'px, -10px) scale(0.22)';
    }

    await wait(320);

    updateTeachCounter();
    var cnt = $('#learn-count');
    if (cnt) {
      cnt.classList.remove('bump');
      void cnt.offsetWidth;
      cnt.classList.add('bump');
    }

    state.teachIndex++;
    layoutTeach();

    await wait(320);
    if (robot) robot.classList.remove('open');

    if (state.teachIndex >= SAMPLE_IMAGES.length) {
      var done = Object.keys(state.labels).length;
      if (done < SAMPLE_IMAGES.length) {
        state.teachIndex = SAMPLE_IMAGES.findIndex(function (s) { return !state.labels[s.id]; });
        layoutTeach();
        state.busy = false;
        return;
      }
      await wait(300);
      state.busy = false;
      go('thanks');
      return;
    }
    state.busy = false;
  }

  /* ---------- Pemindai / Scanner (Layar 4 & 6) ---------- */
  var ICON_OK = '<svg viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON_BAD = '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var PITCH = 355;

  async function runScan(screenId, items, verdictFn, captionFn, stepDelayMs) {
    var root = $('#' + screenId);
    if (!root) return;
    var track = $('.scan-track', root);
    var beam = $('.beam', root);
    var frame = $('.verdict-frame', root);
    var icon = $('.verdict-icon', root);
    var cap = $('.verdict-cap', root);
    var token = ++scanToken;
    var dwell = stepDelayMs || 1100;

    if (!track) return;
    track.innerHTML = items.map(function (it) {
      return '<div class="scan-card"><img src="' + it.src + '" alt="' + it.displayName + '"></div>';
    }).join('');
    var cards = $$('.scan-card', track);

    var place = function (cur) {
      cards.forEach(function (c, k) {
        var rel = k - cur;
        c.style.transform = 'translateX(' + (rel * PITCH) + 'px)';
        c.classList.toggle('hidden', rel < -1 || rel > 1);
      });
    };

    var clear = function () {
      if (beam) beam.className = 'beam';
      if (frame) frame.className = 'verdict-frame';
      if (icon) { icon.className = 'verdict-icon'; icon.innerHTML = ''; }
      if (cap) cap.className = 'verdict-cap';
    };

    clear();
    cards.forEach(function (c) { c.style.transition = 'none'; });
    place(-1);
    void track.offsetWidth;
    cards.forEach(function (c) { c.style.transition = ''; });
    await wait(280);

    for (var i = 0; i < items.length; i++) {
      if (token !== scanToken) return;
      place(i);
      await wait(450);
      if (token !== scanToken) return;

      var ok = verdictFn(items[i]);
      if (beam) beam.classList.add(ok ? 'ok' : 'bad');
      await wait(180);
      if (frame) frame.classList.add(ok ? 'ok' : 'bad');
      if (icon) {
        icon.classList.add(ok ? 'ok' : 'bad');
        icon.innerHTML = ok ? ICON_OK : ICON_BAD;
      }
      if (captionFn && cap) {
        cap.textContent = captionFn(items[i]);
        cap.classList.add('show');
      }
      await wait(dwell);
      if (token !== scanToken) return;
      clear();
      await wait(100);
    }

    if (token !== scanToken) return;
    place(items.length);
  }

  /* ---------- Layar 4: Fauna Memeriksa Contoh (hanya 50 foto contoh, bukan foto uji) ---------- */
  function initCheck() {
    var sampleWithTruth = FD.getSampleImages(true);
    var name = targetName();
    runScan(
      's-check',
      sampleWithTruth,
      function (it) {
        var expected = it.classId === state.targetClassId ? 'target' : 'not_target';
        return state.labels[it.id] === expected;
      },
      function (it) {
        var lbl = state.labels[it.id] === 'target' ? 'Termasuk ' + name : 'Bukan ' + name;
        return it.displayName + ' (Contoh ' + it.order + '): ' + lbl;
      },
      750
    );
  }

  /* ---------- Layar 5: Rekap Data Pelabelan ---------- */
  function initRecap() {
    updateTargetLabelsUI();
    setTab('yes');
  }

  function setTab(tab) {
    $$('#s-recap .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    var want = tab === 'yes' ? 'target' : 'not_target';
    var items = SAMPLE_IMAGES.filter(function (it) {
      return state.labels[it.id] === want;
    });
    var grid = $('#thumb-grid');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = '<div class="empty-msg">Belum ada contoh di kelompok ini.</div>';
      return;
    }
    grid.innerHTML = items.map(function (it, i) {
      return (
        '<div class="thumb" style="animation-delay:' + Math.min(i * 20, 400) + 'ms" title="' + it.displayName + ' (Contoh ' + it.order + ')">' +
        '<img src="' + it.src + '" alt="' + it.displayName + '">' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- Prototipe & Prediksi (Tanpa trueClass) ---------- */
  function runBinaryPrediction() {
    if (Object.keys(state.labels).length < SAMPLE_IMAGES.length) {
      toast('Lengkapi semua 50 label gambar contoh terlebih dahulu.');
      return false;
    }

    var built = FS.buildClassPrototypes(
      SAMPLE_IMAGES,
      state.labels,
      ['target', 'not_target'],
      function (id) { return FF.get(id); }
    );

    if (built.emptyClasses.length > 0) {
      var name = targetName();
      var missingNames = built.emptyClasses.map(function (c) {
        return c === 'target' ? 'Termasuk ' + name : 'Bukan ' + name;
      });
      toast('Kelompok belum punya contoh: ' + missingNames.join(', ') + '. Perbaiki label dulu.');
      return false;
    }

    // Prediksi pada 25 foto uji (hanya fitur uji + prototipe, tanpa trueClass)
    var predictionsByTestId = {};
    for (var i = 0; i < TEST_IMAGES.length; i++) {
      var t = TEST_IMAGES[i];
      predictionsByTestId[t.id] = FS.predictImage(t.features, built.prototypes);
    }

    // Evaluasi terpisah setelah prediksi selesai
    var sampleWithTruth = FD.getSampleImages(true);
    var testWithTruth = FD.getTestImages(true);
    state.evaluation = FS.evaluateBinary(
      sampleWithTruth,
      state.labels,
      testWithTruth,
      predictionsByTestId,
      state.targetClassId
    );
    return true;
  }

  /* ---------- Layar 6: Fauna Menebak 25 Foto Uji ---------- */
  function initPredict() {
    if (!runBinaryPrediction()) {
      go('teach', { keepLabels: true });
      return;
    }

    var name = targetName();
    var byId = {};
    state.evaluation.details.forEach(function (d) { byId[d.id] = d; });

    runScan(
      's-predict',
      TEST_IMAGES,
      function (it) { return byId[it.id].correct; },
      function (it) {
        var d = byId[it.id];
        if (d.status !== 'classified') {
          return it.displayName + ': ' + (d.message || 'Belum cukup informasi visual');
        }
        var labelText = d.predictedIsTarget ? 'Termasuk ' + name : 'Bukan ' + name;
        var simText = d.similarity !== null ? ' (Kecocokan fitur: ' + Math.round(d.similarity) + '%)' : '';
        return it.displayName + ': ' + labelText + simText;
      },
      1100
    );
  }

  /* ---------- Layar 7: Hasil Analisis & Evaluasi Terpisah ---------- */
  var PER_PAGE = 5;

  function fmtPct(v) {
    return v.toFixed(1).replace('.', ',').replace(',0', '') + '%';
  }

  function initResults() {
    if (!state.evaluation && !runBinaryPrediction()) {
      go('teach', { keepLabels: true });
      return;
    }

    var ev = state.evaluation;
    var name = targetName();
    state.page = 0;

    var sub = $('#result-sub');
    if (sub) {
      sub.textContent = 'Target: ' + name + ' • Diuji pada ' + ev.totalTest + ' foto baru (foto ke-3).';
    }

    var sv = $('#score-value');
    if (sv) {
      sv.textContent = fmtPct(ev.accuracy);
      sv.className = 'score-value ' + (ev.accuracy >= 75 ? '' : ev.accuracy >= 50 ? 'mid' : 'low');
    }

    var sl = $('#s-results .score-label');
    if (sl) {
      sl.textContent = 'Akurasi Prediksi Fauna • Ketepatan Label Siswa: ' + fmtPct(ev.labelAccuracy) + ' (' + ev.correctSampleLabels + '/' + ev.totalSamples + ')';
    }

    var cOk = $('#chip-ok');
    var cBad = $('#chip-bad');
    if (cOk) cOk.textContent = (ev.tp + ev.tn) + ' Prediksi Benar (TP:' + ev.tp + ', TN:' + ev.tn + ')';
    if (cBad) cBad.textContent = (ev.fp + ev.fn) + ' Salah (FP:' + ev.fp + ', FN:' + ev.fn + ')' + (ev.unclassifiedCount ? ' • ' + ev.unclassifiedCount + ' Unclassified' : '');

    var reasons = $('#reasons');
    if (reasons) {
      reasons.innerHTML =
        '<h4>Evaluasi Mode Binary (' + name + ')</h4>' +
        '<ul>' +
        '<li>Recall Target: <b>' + fmtPct(ev.recallTarget) + '</b> • Specificity: <b>' + fmtPct(ev.specificity) + '</b> • Balanced Accuracy: <b>' + fmtPct(ev.balancedAccuracy) + '</b></li>' +
        '<li>Prototipe "Bukan ' + name + '" menggabungkan 4 kelas berbeda, sehingga fitur non-target saling dirata-ratakan.</li>' +
        '</ul>';
    }
    renderPage();
  }

  function renderPage() {
    var ev = state.evaluation;
    if (!ev) return;
    var name = targetName();
    var pages = Math.ceil(ev.details.length / PER_PAGE);
    var slice = ev.details.slice(state.page * PER_PAGE, state.page * PER_PAGE + PER_PAGE);

    var row = $('#result-row');
    if (row) {
      row.innerHTML = slice.map(function (r) {
        var predLabel = r.status !== 'classified'
          ? 'Unclassified'
          : (r.predictedIsTarget ? name : 'Bukan ' + name);
        var simStr = r.similarity !== null ? ' • ' + Math.round(r.similarity) + '%' : '';
        var tagCls = r.status !== 'classified' ? 'bad' : (r.correct ? 'ok' : 'bad');
        var tagTxt = r.status !== 'classified' ? 'Belum Cukup Info' : (r.correct ? 'Benar' : 'Salah');
        var warn = r.lowMargin ? ' title="Selisih jarak antar prototipe tipis"' : '';

        return (
          '<div class="r-card"' + warn + '>' +
          '<img src="' + r.src + '" alt="' + r.displayName + '">' +
          '<div class="nm">' + r.displayName + '</div>' +
          '<div class="pred-meta">' + predLabel + simStr + '</div>' +
          '<span class="tag ' + tagCls + '">' + tagTxt + '</span>' +
          '</div>'
        );
      }).join('');
    }

    var pager = $('#pager');
    if (pager) {
      var nums = Array.from({ length: pages }, function (_, i) {
        return '<button type="button" data-page="' + i + '" class="' + (i === state.page ? 'cur' : '') + '">' + (i + 1) + '</button>';
      }).join('');
      pager.innerHTML =
        '<button type="button" class="arrow" data-dir="-1" ' + (state.page === 0 ? 'disabled' : '') + ' aria-label="Sebelumnya">‹</button>' +
        nums +
        '<button type="button" class="arrow" data-dir="1" ' + (state.page >= pages - 1 ? 'disabled' : '') + ' aria-label="Berikutnya">›</button>';
    }
  }

  /* ---------- Event Handlers ---------- */
  function setupEvents() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('#s-pick [data-go], #s-teach [data-go], #s-thanks [data-go], #s-check [data-go], #s-recap [data-go], #s-predictIntro [data-go], #s-predict [data-go], #s-results [data-go]');
      if (!b || !state.active) return;
      var target = b.dataset.go;
      if (target === 'predict') {
        if (!runBinaryPrediction()) return;
      }
      go(target, { keepLabels: true });
    });

    var bYes = $('#btn-yes'), bNo = $('#btn-no');
    if (bYes) bYes.addEventListener('click', function () { labelCurrent(true); });
    if (bNo) bNo.addEventListener('click', function () { labelCurrent(false); });

    var bTeachBack = $('#btn-teach-back');
    if (bTeachBack) {
      bTeachBack.addEventListener('click', function () {
        if (state.busy) return;
        if (state.teachIndex > 0) {
          state.teachIndex--;
          layoutTeach();
        } else {
          go('pick');
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!state.active || currentScreen !== 'teach') return;
      if (e.key === 'ArrowLeft') labelCurrent(true);
      if (e.key === 'ArrowRight') labelCurrent(false);
    });

    $$('#s-recap .tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.dataset.tab); });
    });

    var pager = $('#pager');
    if (pager) {
      pager.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || b.disabled || !state.evaluation) return;
        if (b.dataset.page !== undefined) state.page = parseInt(b.dataset.page, 10);
        if (b.dataset.dir !== undefined) state.page += parseInt(b.dataset.dir, 10);
        renderPage();
      });
    }

    var btnRetrain = $('#btn-retrain');
    if (btnRetrain) {
      btnRetrain.addEventListener('click', function () {
        state.teachIndex = 0;
        go('teach', { keepLabels: true });
      });
    }

    document.addEventListener('fauna:mode', function (e) {
      if (e.detail && e.detail.mode === 'binary') {
        state.active = true;
        state.labels = {};
        state.evaluation = null;
        renderRobots();
        go('pick');
      }
    });

    document.addEventListener('fauna:exit', function () {
      scanToken++;
      state.labels = {};
      state.evaluation = null;
      state.teachIndex = 0;
      state.active = false;
      currentScreen = '';
    });
  }

  setupPickGrid();
  setupEvents();
})();
