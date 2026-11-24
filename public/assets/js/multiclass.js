/* ==========================================================
   Fauna AI Quest — Multiclass (Kelompokkan) Gameplay Engine
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Data Hewan, Kelas & Fitur Visual ---------- */
  const CLASSES = ['Mamalia', 'Aves', 'Reptil', 'Amfibi', 'Pisces'];

  // f = fitur visual sederhana: [berbulu, di air, bersayap, bersisik, berkaki, kulit licin]
  const ANIMALS = {
    sapiperah: { name: 'Sapi Perah',    img: 'assets/images/animals/sapiperah.jpeg', cls: 0, f: [1, 0, 0, 0, 1, 0] },
    harimau:   { name: 'Harimau',       img: 'assets/images/animals/harimau.jpeg',   cls: 0, f: [1, 0, 0, 0, 1, 0] },
    lumba:     { name: 'Lumba-Lumba',   img: 'assets/images/animals/lumba.jpeg',     cls: 0, f: [0, 1, 0, 0, 0, 1] },
    penguin:   { name: 'Penguin',       img: 'assets/images/animals/penguin.jpeg',   cls: 1, f: [0, 0.5, 1, 0, 0, 0] },
    panda:     { name: 'Panda',         img: 'assets/images/animals/panda.jpeg',     cls: 0, f: [1, 0, 0, 0, 1, 0] },
    komodo:    { name: 'Komodo',        img: 'assets/images/animals/komodo.jpeg',    cls: 2, f: [0, 0, 0, 1, 1, 0] },
    kucing:    { name: 'Kucing',        img: 'assets/images/animals/kucing.jpeg',    cls: 0, f: [1, 0, 0, 0, 1, 0] },
    katak:     { name: 'Katak',         img: 'assets/images/animals/katak.jpeg',     cls: 3, f: [0, 0.5, 0, 0, 1, 1] },
    pesut:     { name: 'Pesut Sungai',  img: 'assets/images/animals/pesut.jpeg',     cls: 0, f: [0, 1, 0, 0, 0, 1] },
    kudalaut:  { name: 'Kuda Laut',     img: 'assets/images/animals/kudalaut.jpeg',  cls: 4, f: [0, 1, 0, 0.5, 0, 0] },
    kucingbw:  { name: 'Kucing Belang', img: 'assets/images/animals/kucingbw.jpeg', cls: 0, f: [1, 0, 0, 0, 1, 0] },
    sapi:      { name: 'Sapi',          img: 'assets/images/animals/sapi.jpeg',      cls: 0, f: [1, 0, 0, 0, 1, 0] }
  };

  const TEACH_ORDER = ['sapiperah', 'harimau', 'lumba', 'penguin', 'panda', 'komodo', 'kucing', 'katak', 'pesut', 'kudalaut', 'kucingbw', 'sapi'];
  const SCAN_ORDER  = ['harimau', 'sapi', 'panda', 'lumba', 'kucing', 'sapiperah', 'pesut', 'penguin', 'komodo', 'katak', 'kucingbw', 'kudalaut'];

  const GROUPS = [
    { name: 'Mamalia', img: 'assets/images/animals/kucingbw.jpeg', desc: 'Memiliki rambut atau bulu dan menyusui anaknya.', ex: 'Contoh: Harimau, Kucing, Lumba-lumba' },
    { name: 'Aves',    img: 'assets/images/animals/penguin.jpeg',  desc: 'Memiliki bulu dan paruh.', ex: 'Contoh: Elang, Merpati, Penguin' },
    { name: 'Reptil',  img: 'assets/images/animals/komodo.jpeg',   desc: 'Umumnya memiliki kulit kering bersisik.', ex: 'Contoh: Penyu, Komodo, Iguana' },
    { name: 'Amfibi',  img: 'assets/images/animals/katak.jpeg',    desc: 'Umumnya memiliki kulit lembap dan mengalami perubahan selama hidupnya.', ex: 'Contoh: Katak, Salamander' },
    { name: 'Pisces',  img: 'assets/images/animals/kudalaut.jpeg', desc: 'Hewan vertebrata yang hidup di air dan bernapas menggunakan insang.', ex: 'Contoh: Ikan Mas, Hiu, Kuda Laut' }
  ];

  /* ---------- State Gameplay Multiclass ---------- */
  const state = {
    labels: {},        // id -> indeks kelompok (0-4)
    teachIndex: 0,
    results: [],       // hasil prediksi Fauna AI
    page: 0,
    active: false
  };

  let scanToken = 0;
  let currentScreen = '';

  /* ---------- Helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on', 'show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      t.classList.remove('is-on', 'show');
    }, 2400);
  }

  /* ---------- Robot Fauna AI SVG ---------- */
  function robotSVG(scale = 1) {
    return `
<svg class="robot" viewBox="0 0 320 310" width="${320 * scale}" height="${310 * scale}" aria-label="Fauna AI">
  <ellipse cx="160" cy="288" rx="82" ry="22" fill="#f2f6f9" stroke="#d3dce4" stroke-width="1.5"/>
  <circle cx="36" cy="152" r="22" fill="#6fd3ea"/><circle cx="284" cy="152" r="22" fill="#6fd3ea"/>
  <rect x="26" y="128" width="16" height="50" rx="8" fill="#052540"/>
  <rect x="278" y="128" width="16" height="50" rx="8" fill="#052540"/>
  <path d="M27 92 L31 131" stroke="#9aa9b8" stroke-width="5" stroke-linecap="round"/>
  <path d="M293 92 L289 131" stroke="#9aa9b8" stroke-width="5" stroke-linecap="round"/>
  <circle cx="25" cy="86" r="6" fill="#6fd3ea"/><circle cx="295" cy="86" r="6" fill="#6fd3ea"/>
  <path d="M41 89 H279 V255 a20 20 0 0 1 -20 20 H61 a20 20 0 0 1 -20 -20 Z" fill="#e6ebef" stroke="#b3bfcb" stroke-width="1.5"/>
  <rect x="60" y="112" width="201" height="96" rx="48" fill="#052540"/>
  <circle cx="126" cy="150" r="11" fill="#6fd3ea"/><circle cx="192" cy="150" r="11" fill="#6fd3ea"/>
  <path d="M144 171 Q160 190 177 171" stroke="#6fd3ea" stroke-width="6" stroke-linecap="round" fill="none"/>
  <text x="160" y="248" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-weight="800" font-size="17" fill="#0b2f4e">Fauna.AI</text>
  <g class="dome"><path d="M41 89 A119 64 0 0 1 279 89 Z" fill="#e6ebef" stroke="#b3bfcb" stroke-width="1.5"/></g>
</svg>`;
  }

  function renderRobots() {
    $$('#mc-intro [data-robot], #mc-teach [data-robot], #mc-check [data-robot], #mc-recap [data-robot], #mc-predict [data-robot]').forEach(el => {
      const scale = parseFloat(el.dataset.scale || 1);
      el.innerHTML = robotSVG(scale);
    });
  }

  /* ---------- Navigasi Layar Multiclass ---------- */
  function go(name) {
    if (!state.active) return;
    scanToken++; // Batalkan scan async jika sedang berjalan
    currentScreen = name;

    // Sembunyikan layar multiclass lainnya
    $$('.screen[id^="mc-"]').forEach(s => s.classList.remove('active', 'is-visible'));

    const target = $('#mc-' + name);
    if (!target) return;
    target.classList.add('active', 'is-visible');

    // Update stepper
    const stepNum = parseInt(target.dataset.step, 10);
    if (window.renderFaunaStepper && !isNaN(stepNum)) {
      window.renderFaunaStepper(stepNum);
    }

    const initMap = {
      intro: initIntro,
      teach: initTeach,
      check: initCheck,
      recap: initRecap,
      predict: initPredict,
      results: initResults
    };
    if (initMap[name]) initMap[name]();
  }

  /* ---------- Layar 2: Intro (Kenali 5 Kelompok) ---------- */
  function initIntro() {
    const grid = $('#mc-group-grid');
    if (!grid || grid.children.length > 0) return;
    grid.innerHTML = GROUPS.map(g => `
      <div class="group-card">
        <img src="${g.img}" alt="${g.name}">
        <h3>${g.name}</h3>
        <p>${g.desc}</p>
        <div class="ex">${g.ex}</div>
      </div>
    `).join('');
  }

  /* ---------- Layar 3: Mengajari Fauna (5 Kelompok) ---------- */
  function setupChoices() {
    const choices = $('#mc-choices');
    if (!choices || choices.children.length > 0) return;
    choices.innerHTML = CLASSES.map((c, i) => `
      <button type="button" class="choice" data-c="${i}">${c}</button>
    `).join('');

    choices.addEventListener('click', e => {
      const b = e.target.closest('.choice');
      if (!b) return;
      const cIndex = parseInt(b.dataset.c, 10);
      const currentAnimalId = TEACH_ORDER[state.teachIndex];
      state.labels[currentAnimalId] = cIndex;

      $$('#mc-choices .choice').forEach(x => x.classList.toggle('sel', x === b));
      const nextBtn = $('#mc-teach-next');
      if (nextBtn) nextBtn.classList.remove('dim');
    });
  }

  function initTeach(keep) {
    if (!keep) {
      state.labels = {};
      state.teachIndex = 0;
    }
    setupChoices();
    showQuestion(true);
  }

  function showQuestion(instant) {
    const id = TEACH_ORDER[state.teachIndex];
    const img = $('#mc-q-img');
    const countEl = $('#mc-q-count');
    const nextBtn = $('#mc-teach-next');

    const apply = () => {
      if (img) {
        img.src = ANIMALS[id].img;
        img.alt = ANIMALS[id].name;
        img.classList.remove('swap');
      }
      if (countEl) countEl.textContent = state.teachIndex + 1;
      $$('#mc-choices .choice').forEach(b => {
        b.classList.toggle('sel', state.labels[id] === parseInt(b.dataset.c, 10));
      });
      if (nextBtn) {
        nextBtn.classList.toggle('dim', state.labels[id] === undefined);
      }
    };

    if (instant) return apply();
    if (img) img.classList.add('swap');
    setTimeout(apply, 280);
  }

  /* ---------- Pemindai Animasi (Layar 4 & 6) ---------- */
  const PITCH = 267;
  async function runScan(screenId, ids, labelFn) {
    const root = $('#' + screenId);
    if (!root) return;
    const track = $('.scan-track', root);
    const chip = $('.class-chip', root);
    const cap = $('.class-cap', root);
    const token = ++scanToken;

    if (!track) return;
    track.innerHTML = ids.map(id => `
      <div class="scan-card"><img src="${ANIMALS[id].img}" alt="${ANIMALS[id].name}"></div>
    `).join('');

    const cards = $$('.scan-card', track);
    const place = cur => cards.forEach((c, k) => {
      const rel = k - cur;
      c.style.transform = `translateX(${rel * PITCH}px)`;
      c.classList.toggle('hidden', rel > 0 || rel < -3);
    });

    const clear = () => {
      if (chip) chip.classList.remove('show');
      if (cap) cap.classList.remove('show');
    };

    clear();
    cards.forEach(c => (c.style.transition = 'none'));
    place(-1);
    void track.offsetWidth;
    cards.forEach(c => (c.style.transition = ''));
    await wait(350);

    for (let i = 0; i < ids.length; i++) {
      if (token !== scanToken) return;
      place(i);
      await wait(1000);
      if (token !== scanToken) return;

      const classIdx = labelFn(ids[i]);
      const className = CLASSES[classIdx] || 'Tidak Diketahui';

      if (chip) {
        chip.textContent = className;
        chip.classList.add('show');
      }
      if (cap) {
        cap.textContent = `Fauna.AI mengklasifikasikan gambar ini sebagai ${className}.`;
        cap.classList.add('show');
      }

      await wait(1700);
      if (token !== scanToken) return;
      clear();
      await wait(250);
    }
  }

  /* ---------- Layar 4: Fauna Memeriksa Jawabanmu ---------- */
  function initCheck() {
    runScan('mc-check', SCAN_ORDER, id => state.labels[id]);
  }

  /* ---------- Layar 5: Rekap Data Dipelajari ---------- */
  function initRecap() {
    const tabs = $('#mc-tabs');
    if (tabs && tabs.children.length === 0) {
      tabs.innerHTML = CLASSES.map((c, i) => `
        <button type="button" class="tab ${i === 0 ? 'active' : ''}" data-tab="${i}">${c}</button>
      `).join('');
      tabs.addEventListener('click', e => {
        const t = e.target.closest('.tab');
        if (t) setTab(parseInt(t.dataset.tab, 10));
      });
    }
    setTab(0);
  }

  function setTab(tabIndex) {
    $$('#mc-tabs .tab').forEach(t => t.classList.toggle('active', parseInt(t.dataset.tab, 10) === tabIndex));
    const ids = TEACH_ORDER.filter(id => state.labels[id] === tabIndex).slice(0, 16);
    const grid = $('#mc-thumb-grid');
    if (!grid) return;

    if (!ids.length) {
      grid.innerHTML = '<div class="empty-msg" style="grid-column:1/-1;text-align:center;padding:40px 0;font-size:20px;font-weight:700;color:var(--navy-200)">Belum ada contoh di kelompok ini.</div>';
      return;
    }

    grid.innerHTML = ids.map((id, i) => `
      <div class="thumb" style="animation-delay:${i * 40}ms" title="${ANIMALS[id].name}">
        <img src="${ANIMALS[id].img}" alt="${ANIMALS[id].name}">
      </div>
    `).join('');
  }

  /* ---------- Model Prediksi Fauna AI (k-NN, k=3) ---------- */
  function predict(testId) {
    const f = ANIMALS[testId].f;
    const neigh = Object.keys(state.labels)
      .map(id => ({
        d: Math.hypot(...ANIMALS[id].f.map((v, i) => v - f[i])),
        label: state.labels[id]
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);

    const votes = CLASSES.map(() => 0);
    neigh.forEach(n => {
      votes[n.label] += 1 / (n.d + 0.1);
    });
    return votes.indexOf(Math.max(...votes));
  }

  function computeResults() {
    state.results = SCAN_ORDER.map(id => {
      const guess = predict(id);
      return { id, guess, correct: guess === ANIMALS[id].cls };
    });
  }

  /* ---------- Layar 6: Fauna Menebak Data Baru ---------- */
  function initPredict() {
    computeResults();
    const byId = Object.fromEntries(state.results.map(r => [r.id, r]));
    runScan('mc-predict', SCAN_ORDER, id => byId[id].guess);
  }

  /* ---------- Layar 7: Hasil Analisis & Akurasi ---------- */
  const PER_PAGE = 5;
  function initResults() {
    if (!state.results.length) computeResults();
    state.page = 0;
    const total = state.results.length;
    const ok = state.results.filter(r => r.correct).length;
    const pct = (ok / total) * 100;

    const sub = $('#mc-result-sub');
    if (sub) sub.textContent = `Fauna AI sudah menyelesaikan ${total} prediksi.`;

    const sv = $('#mc-score-value');
    if (sv) {
      sv.textContent = pct.toFixed(1).replace('.', ',').replace(',0', '') + '%';
      sv.className = 'score-value ' + (pct >= 75 ? '' : pct >= 50 ? 'mid' : 'low');
    }

    const chipOk = $('#mc-chip-ok');
    if (chipOk) chipOk.textContent = `${ok} Benar`;
    const chipBad = $('#mc-chip-bad');
    if (chipBad) chipBad.textContent = `${total - ok} Salah`;

    const wrongLabels = Object.keys(state.labels).filter(id => state.labels[id] !== ANIMALS[id].cls).length;
    const reasons = $('#mc-reasons');
    if (reasons) {
      if (total - ok > 0) {
        const items = [];
        if (wrongLabels) items.push('Label data kurang tepat');
        items.push('Variasi data masih terbatas');
        reasons.innerHTML = `<h4>Mengapa Fauna masih melakukan kesalahan?</h4><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
      } else {
        reasons.innerHTML = '<h4>Mengapa Fauna bisa menebak dengan tepat?</h4><ul><li>Label dari kamu sudah benar semua</li><li>Contoh gambar cukup beragam</li></ul>';
      }
    }
    renderPage();
  }

  function renderPage() {
    const pages = Math.ceil(state.results.length / PER_PAGE);
    const slice = state.results.slice(state.page * PER_PAGE, state.page * PER_PAGE + PER_PAGE);
    const row = $('#mc-result-row');
    if (row) {
      row.innerHTML = slice.map(r => `
        <div class="r-card">
          <img src="${ANIMALS[r.id].img}" alt="${ANIMALS[r.id].name}">
          <div class="nm">${ANIMALS[r.id].name}</div>
          <span class="tag ${r.correct ? 'ok' : 'bad'}">${r.correct ? 'Benar' : 'Salah'}</span>
        </div>
      `).join('');
    }

    const pager = $('#mc-pager');
    if (pager) {
      const nums = Array.from({ length: pages }, (_, i) => `
        <button type="button" data-page="${i}" class="${i === state.page ? 'cur' : ''}">${i + 1}</button>
      `).join('');
      pager.innerHTML =
        `<button type="button" class="arrow" data-dir="-1" ${state.page === 0 ? 'disabled' : ''} aria-label="Sebelumnya">‹</button>${nums}` +
        `<button type="button" class="arrow" data-dir="1" ${state.page >= pages - 1 ? 'disabled' : ''} aria-label="Berikutnya">›</button>`;
    }
  }

  /* ---------- Event Bindings ---------- */
  function setupEvents() {
    // Tombol data-mc-go
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-mc-go]');
      if (b && state.active) {
        go(b.dataset.mcGo);
      }
    });

    // Tombol Next pada Layar Teach
    const teachNext = $('#mc-teach-next');
    if (teachNext) {
      teachNext.addEventListener('click', () => {
        const currentAnimalId = TEACH_ORDER[state.teachIndex];
        if (state.labels[currentAnimalId] === undefined) {
          toast('Pilih kelompok hewannya dulu ya!');
          return;
        }
        if (state.teachIndex >= TEACH_ORDER.length - 1) {
          go('thanks');
          return;
        }
        state.teachIndex++;
        showQuestion();
      });
    }

    // Tombol Back pada Layar Teach
    const teachBack = $('#mc-teach-back');
    if (teachBack) {
      teachBack.addEventListener('click', () => {
        if (state.teachIndex === 0) {
          go('intro');
          return;
        }
        state.teachIndex--;
        showQuestion();
      });
    }

    // Keyboard shortcut (1-5 untuk kelompok, Enter untuk lanjut)
    document.addEventListener('keydown', e => {
      if (!state.active || currentScreen !== 'teach') return;
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1;
        const choices = $$('#mc-choices .choice');
        if (choices[idx]) choices[idx].click();
      }
      if (e.key === 'Enter') {
        const nextBtn = $('#mc-teach-next');
        if (nextBtn) nextBtn.click();
      }
    });

    // Pager pagination
    const pager = $('#mc-pager');
    if (pager) {
      pager.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        const pages = Math.ceil(state.results.length / PER_PAGE);
        if (b.dataset.page !== undefined) state.page = parseInt(b.dataset.page, 10);
        if (b.dataset.dir !== undefined) state.page += parseInt(b.dataset.dir, 10);
        renderPage();
      });
    }

    // Tombol Latih Ulang
    const btnRetrain = $('#mc-btn-retrain');
    if (btnRetrain) {
      btnRetrain.addEventListener('click', () => {
        go('teach');
      });
    }

    // Listen mode selection dari opening: Kelompokkan
    document.addEventListener('fauna:mode', e => {
      if (e.detail && (e.detail.mode === 'kelompokkan' || e.detail.mode === 'multi')) {
        state.active = true;
        renderRobots();
        go('intro');
      }
    });

    // Reset saat keluar misi
    document.addEventListener('fauna:exit', () => {
      scanToken++;
      state.labels = {};
      state.results = [];
      state.active = false;
      currentScreen = '';
    });
  }

  // Inisialisasi awal
  setupEvents();

})();
