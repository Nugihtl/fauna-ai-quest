/* ==========================================================
   Fauna AI Quest — Mode Kelompokkan (Class Prototype Similarity)
   - 5 kelas vertebrata: Mamalia, Aves, Reptil, Amfibi, Pisces
   - 50 foto contoh (foto 1 & 2) diberi label ke salah satu dari 5 kelas
   - 5 prototipe kelas dibentuk dari label siswa
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

  var CLASS_IDS = FD.CLASSES.map(function (c) { return c.id; });
  var CLASS_MAP = FD.getClassMap();
  var SAMPLE_IMAGES = FD.getSampleImages(false); // tanpa classId
  var TEST_IMAGES = FD.getTestImages(false);     // tanpa classId

  var state = {
    labels: {},        // imageId -> classId ('mamalia'|'aves'|'reptil'|'amfibi'|'pisces')
    teachIndex: 0,
    evaluation: null,
    page: 0,
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

  function className(cid) {
    return CLASS_MAP[cid] ? CLASS_MAP[cid].name : 'Tidak Diketahui';
  }

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
    $$('#mc-intro [data-robot], #mc-teach [data-robot], #mc-check [data-robot], #mc-recap [data-robot], #mc-predict [data-robot]').forEach(function (el) {
      el.innerHTML = robotSVG(parseFloat(el.dataset.scale || 1));
    });
  }

  /* ---------- Navigasi Layar Kelompokkan ---------- */
  function go(name, opts) {
    if (!state.active) return;
    scanToken++;
    currentScreen = name;

    $$('.screen[id^="mc-"]').forEach(function (s) {
      s.classList.remove('active', 'is-visible');
    });

    var target = $('#mc-' + name);
    if (!target) return;
    target.classList.add('active', 'is-visible');

    var stepNum = parseInt(target.dataset.step, 10);
    if (window.renderFaunaStepper && !isNaN(stepNum)) {
      window.renderFaunaStepper(stepNum);
    }

    var initMap = {
      intro: initIntro,
      teach: function () { initTeach(opts && opts.keepLabels); },
      check: initCheck,
      recap: initRecap,
      predict: initPredict,
      results: initResults
    };
    if (initMap[name]) initMap[name]();
  }

  /* ---------- Layar 2: Intro (Kenali 5 Kelompok) ---------- */
  function initIntro() {
    var grid = $('#mc-group-grid');
    if (!grid || grid.children.length > 0) return;
    grid.innerHTML = FD.CLASSES.map(function (g) {
      return (
        '<div class="group-card">' +
        '<img src="' + g.img + '" alt="' + g.name + '">' +
        '<h3>' + g.name + '</h3>' +
        '<p>' + g.desc + '</p>' +
        '<div class="ex">' + g.ex + '</div>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- Layar 3: Mengajari Fauna (50 Foto Contoh) ---------- */
  function setupChoices() {
    var choices = $('#mc-choices');
    if (!choices || choices.children.length > 0) return;
    choices.innerHTML = FD.CLASSES.map(function (c) {
      return '<button type="button" class="choice" data-c="' + c.id + '">' + c.name + '</button>';
    }).join('');

    choices.addEventListener('click', function (e) {
      var b = e.target.closest('.choice');
      if (!b) return;
      var cid = b.dataset.c;
      var item = SAMPLE_IMAGES[state.teachIndex];
      if (!item) return;
      state.labels[item.id] = cid;

      $$('#mc-choices .choice').forEach(function (x) { x.classList.toggle('sel', x === b); });
      var nextBtn = $('#mc-teach-next');
      if (nextBtn) nextBtn.classList.remove('dim');
    });
  }

  function initTeach(keep) {
    if (!keep) {
      state.labels = {};
      state.teachIndex = 0;
      state.evaluation = null;
    } else if (state.teachIndex >= SAMPLE_IMAGES.length) {
      state.teachIndex = SAMPLE_IMAGES.length - 1;
    }
    setupChoices();
    showQuestion(true);
  }

  function showQuestion(instant) {
    var item = SAMPLE_IMAGES[state.teachIndex];
    var img = $('#mc-q-img');
    var countEl = $('#mc-q-count');
    var nextBtn = $('#mc-teach-next');

    var apply = function () {
      if (img && item) {
        img.src = item.src;
        img.alt = item.displayName + ' (Contoh ' + item.order + ')';
        img.classList.remove('swap');
      }
      if (countEl) countEl.textContent = (state.teachIndex + 1) + '/' + SAMPLE_IMAGES.length;
      $$('#mc-choices .choice').forEach(function (b) {
        b.classList.toggle('sel', Boolean(item && state.labels[item.id] === b.dataset.c));
      });
      if (nextBtn) {
        nextBtn.classList.toggle('dim', !item || state.labels[item.id] === undefined);
      }
    };

    if (instant) return apply();
    if (img) img.classList.add('swap');
    setTimeout(apply, 220);
  }

  /* ---------- Pemindai Animasi (Layar 4 & 6) ---------- */
  var PITCH = 267;
  async function runScan(screenId, items, labelFn, captionFn, dwellMs) {
    var root = $('#' + screenId);
    if (!root) return;
    var track = $('.scan-track', root);
    var chip = $('.class-chip', root);
    var cap = $('.class-cap', root);
    var token = ++scanToken;
    var dwell = dwellMs || 1200;

    if (!track) return;
    track.innerHTML = items.map(function (it) {
      return '<div class="scan-card"><img src="' + it.src + '" alt="' + it.displayName + '"></div>';
    }).join('');

    var cards = $$('.scan-card', track);
    var place = function (cur) {
      cards.forEach(function (c, k) {
        var rel = k - cur;
        c.style.transform = 'translateX(' + (rel * PITCH) + 'px)';
        c.classList.toggle('hidden', rel > 0 || rel < -3);
      });
    };

    var clear = function () {
      if (chip) chip.classList.remove('show');
      if (cap) cap.classList.remove('show');
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
      await wait(550);
      if (token !== scanToken) return;

      var cText = labelFn(items[i]);
      if (chip) {
        chip.textContent = cText;
        chip.classList.add('show');
      }
      if (cap && captionFn) {
        cap.textContent = captionFn(items[i], cText);
        cap.classList.add('show');
      }

      await wait(dwell);
      if (token !== scanToken) return;
      clear();
      await wait(150);
    }
  }

  /* ---------- Layar 4: Fauna Memeriksa 50 Foto Contoh ---------- */
  function initCheck() {
    runScan(
      'mc-check',
      SAMPLE_IMAGES,
      function (it) { return className(state.labels[it.id]); },
      function (it, cText) {
        return it.displayName + ' (Contoh ' + it.order + ') kamu labeli sebagai ' + cText + '.';
      },
      750
    );
  }

  /* ---------- Layar 5: Rekap Data Dipelajari (5 Tab) ---------- */
  function initRecap() {
    var tabs = $('#mc-tabs');
    if (tabs && tabs.children.length === 0) {
      tabs.innerHTML = FD.CLASSES.map(function (c, i) {
        return '<button type="button" class="tab ' + (i === 0 ? 'active' : '') + '" data-tab="' + c.id + '">' + c.name + '</button>';
      }).join('');
      tabs.addEventListener('click', function (e) {
        var t = e.target.closest('.tab');
        if (t) setTab(t.dataset.tab);
      });
    }
    setTab(CLASS_IDS[0]);
  }

  function setTab(cid) {
    $$('#mc-tabs .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === cid);
    });
    var items = SAMPLE_IMAGES.filter(function (it) { return state.labels[it.id] === cid; });
    var grid = $('#mc-thumb-grid');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = '<div class="empty-msg" style="grid-column:1/-1;text-align:center;padding:40px 0;font-size:20px;font-weight:700;color:var(--navy-200)">Belum ada contoh di kelompok ini.</div>';
      return;
    }

    grid.innerHTML = items.map(function (it, i) {
      return (
        '<div class="thumb" style="animation-delay:' + Math.min(i * 25, 400) + 'ms" title="' + it.displayName + ' (Contoh ' + it.order + ')">' +
        '<img src="' + it.src + '" alt="' + it.displayName + '">' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- Prototipe & Prediksi 5 Kelas (Tanpa trueClass) ---------- */
  function runMulticlassPrediction() {
    if (Object.keys(state.labels).length < SAMPLE_IMAGES.length) {
      toast('Lengkapi semua 50 label gambar contoh terlebih dahulu.');
      return false;
    }

    var built = FS.buildClassPrototypes(
      SAMPLE_IMAGES,
      state.labels,
      CLASS_IDS,
      function (id) { return FF.get(id); }
    );

    if (built.emptyClasses.length > 0) {
      var missingNames = built.emptyClasses.map(className);
      toast('Kelas berikut belum memiliki contoh berlabel: ' + missingNames.join(', ') + '.');
      return false;
    }

    var predictionsByTestId = {};
    for (var i = 0; i < TEST_IMAGES.length; i++) {
      var t = TEST_IMAGES[i];
      predictionsByTestId[t.id] = FS.predictImage(t.features, built.prototypes);
    }

    var sampleWithTruth = FD.getSampleImages(true);
    var testWithTruth = FD.getTestImages(true);
    state.evaluation = FS.evaluateMulticlass(
      sampleWithTruth,
      state.labels,
      testWithTruth,
      predictionsByTestId,
      CLASS_IDS
    );
    return true;
  }

  /* ---------- Layar 6: Fauna Menebak 25 Foto Uji ---------- */
  function initPredict() {
    if (!runMulticlassPrediction()) {
      go('teach', { keepLabels: true });
      return;
    }

    var byId = {};
    state.evaluation.details.forEach(function (d) { byId[d.id] = d; });

    runScan(
      'mc-predict',
      TEST_IMAGES,
      function (it) {
        var d = byId[it.id];
        return d.status === 'classified' ? className(d.predictedClass) : 'Belum Cukup Info';
      },
      function (it, cText) {
        var d = byId[it.id];
        if (d.status !== 'classified') {
          return it.displayName + ': ' + (d.message || 'Informasi visual belum cukup');
        }
        var simText = d.similarity !== null ? ' (Kecocokan fitur: ' + Math.round(d.similarity) + '%)' : '';
        return it.displayName + ' diprediksi sebagai ' + cText + simText;
      },
      1200
    );
  }

  /* ---------- Layar 7: Hasil Analisis & Akurasi Terpisah ---------- */
  var PER_PAGE = 5;

  function fmtPct(v) {
    return v.toFixed(1).replace('.', ',').replace(',0', '') + '%';
  }

  function initResults() {
    if (!state.evaluation && !runMulticlassPrediction()) {
      go('teach', { keepLabels: true });
      return;
    }

    var ev = state.evaluation;
    state.page = 0;

    var sub = $('#mc-result-sub');
    if (sub) {
      sub.textContent = 'Diuji pada ' + ev.totalTest + ' foto baru (foto ke-3 dari tiap hewan).';
    }

    var sv = $('#mc-score-value');
    if (sv) {
      sv.textContent = fmtPct(ev.predictionAccuracy);
      sv.className = 'score-value ' + (ev.predictionAccuracy >= 75 ? '' : ev.predictionAccuracy >= 50 ? 'mid' : 'low');
    }

    var sl = $('#mc-results .score-label');
    if (sl) {
      sl.textContent = 'Akurasi Prediksi Fauna • Ketepatan Label Siswa: ' + fmtPct(ev.labelAccuracy) + ' (' + ev.correctSampleLabels + '/' + ev.totalSamples + ')';
    }

    var chipOk = $('#mc-chip-ok');
    if (chipOk) chipOk.textContent = ev.correctPredictions + ' Prediksi Benar';

    var chipBad = $('#mc-chip-bad');
    if (chipBad) {
      chipBad.textContent = ev.wrongPredictions + ' Salah' + (ev.unclassifiedCount ? ' • ' + ev.unclassifiedCount + ' Unclassified' : '');
    }

    var reasons = $('#mc-reasons');
    if (reasons) {
      var perClassSummary = CLASS_IDS.map(function (cid) {
        var st = ev.perClass[cid];
        return className(cid) + ': <b>' + st.correct + '/' + st.total + '</b>';
      }).join(' • ');

      reasons.innerHTML =
        '<h4>Ketepatan Tiap Kelas (dari 5 foto uji per kelas)</h4>' +
        '<ul>' +
        '<li>' + perClassSummary + '</li>' +
        '<li>Ketepatan label contohmu (' + ev.correctSampleLabels + '/50) memengaruhi prototipe setiap kelas.</li>' +
        '</ul>';
    }
    renderPage();
  }

  function renderPage() {
    var ev = state.evaluation;
    if (!ev) return;
    var pages = Math.ceil(ev.details.length / PER_PAGE);
    var slice = ev.details.slice(state.page * PER_PAGE, state.page * PER_PAGE + PER_PAGE);
    var row = $('#mc-result-row');
    if (row) {
      row.innerHTML = slice.map(function (r) {
        var predLabel = r.status === 'classified' ? className(r.predictedClass) : 'Unclassified';
        var simStr = r.similarity !== null ? ' • ' + Math.round(r.similarity) + '%' : '';
        var tagCls = r.status !== 'classified' ? 'bad' : (r.correct ? 'ok' : 'bad');
        var tagTxt = r.status !== 'classified' ? 'Belum Cukup Info' : (r.correct ? 'Benar' : 'Salah');
        var warn = r.lowMargin ? ' title="Selisih jarak antar kelas sangat tipis"' : '';

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

    var pager = $('#mc-pager');
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

  /* ---------- Event Bindings ---------- */
  function setupEvents() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('#mc-intro [data-mc-go], #mc-teach [data-mc-go], #mc-thanks [data-mc-go], #mc-check [data-mc-go], #mc-recap [data-mc-go], #mc-predictIntro [data-mc-go], #mc-predict [data-mc-go], #mc-results [data-mc-go]');
      if (!b || !state.active) return;
      var target = b.dataset.mcGo;
      if (target === 'predict') {
        if (!runMulticlassPrediction()) return;
      }
      go(target, { keepLabels: true });
    });

    var teachNext = $('#mc-teach-next');
    if (teachNext) {
      teachNext.addEventListener('click', function () {
        var item = SAMPLE_IMAGES[state.teachIndex];
        if (!item || state.labels[item.id] === undefined) {
          toast('Pilih kelompok hewannya dulu ya!');
          return;
        }
        if (state.teachIndex >= SAMPLE_IMAGES.length - 1) {
          if (Object.keys(state.labels).length < SAMPLE_IMAGES.length) {
            state.teachIndex = SAMPLE_IMAGES.findIndex(function (s) { return !state.labels[s.id]; });
            showQuestion(false);
            toast('Masih ada contoh yang belum dilabeli.');
            return;
          }
          go('thanks');
          return;
        }
        state.teachIndex++;
        showQuestion(false);
      });
    }

    var teachBack = $('#mc-teach-back');
    if (teachBack) {
      teachBack.addEventListener('click', function () {
        if (state.teachIndex === 0) {
          go('intro');
          return;
        }
        state.teachIndex--;
        showQuestion(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!state.active || currentScreen !== 'teach') return;
      if (e.key >= '1' && e.key <= '5') {
        var idx = parseInt(e.key, 10) - 1;
        var choices = $$('#mc-choices .choice');
        if (choices[idx]) choices[idx].click();
      }
      if (e.key === 'Enter') {
        var nextBtn = $('#mc-teach-next');
        if (nextBtn) nextBtn.click();
      }
    });

    var pager = $('#mc-pager');
    if (pager) {
      pager.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || b.disabled || !state.evaluation) return;
        if (b.dataset.page !== undefined) state.page = parseInt(b.dataset.page, 10);
        if (b.dataset.dir !== undefined) state.page += parseInt(b.dataset.dir, 10);
        renderPage();
      });
    }

    var btnRetrain = $('#mc-btn-retrain');
    if (btnRetrain) {
      btnRetrain.addEventListener('click', function () {
        state.teachIndex = 0;
        go('teach', { keepLabels: true });
      });
    }

    document.addEventListener('fauna:mode', function (e) {
      if (e.detail && (e.detail.mode === 'kelompokkan' || e.detail.mode === 'multi')) {
        state.active = true;
        state.labels = {};
        state.evaluation = null;
        state.teachIndex = 0;
        renderRobots();
        go('intro');
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

  setupEvents();
})();
