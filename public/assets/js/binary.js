/* ==========================================================
   Fauna AI Quest — Binary Klasifikasi Gameplay Engine
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Data Hewan & Fitur Visual ---------- */
  // f = [berbulu, di air, bersayap, bersisik, berkaki, kulit licin]
  const ANIMALS = {
    harimau:  { name: 'Harimau',          img: 'assets/images/animals/harimau.jpeg',  mammal: true,  f: [1, 0, 0, 0, 1, 0] },
    lumba:    { name: 'Lumba-Lumba',      img: 'assets/images/animals/lumba.jpeg',    mammal: true,  f: [0, 1, 0, 0, 0, 1] },
    sapi:     { name: 'Sapi',             img: 'assets/images/animals/sapi.jpeg',     mammal: true,  f: [1, 0, 0, 0, 1, 0] },
    merpati:  { name: 'Merpati',          img: 'assets/images/animals/merpati.jpeg',  mammal: false, f: [0, 0, 1, 0, 0, 0] },
    panda:    { name: 'Panda',            img: 'assets/images/animals/panda.jpeg',    mammal: true,  f: [1, 0, 0, 0, 1, 0] },
    komodo:   { name: 'Komodo',           img: 'assets/images/animals/komodo.jpeg',   mammal: false, f: [0, 0, 0, 1, 1, 0] },
    kucing:   { name: 'Kucing',           img: 'assets/images/animals/kucing.jpeg',   mammal: true,  f: [1, 0, 0, 0, 1, 0] },
    katak:    { name: 'Katak',            img: 'assets/images/animals/katak.jpeg',    mammal: false, f: [0, 0.5, 0, 0, 1, 1] },
    pesut:    { name: 'Pesut Sungai',     img: 'assets/images/animals/pesut.jpeg',    mammal: true,  f: [0, 1, 0, 0, 0, 1] },
    penguin:  { name: 'Penguin',          img: 'assets/images/animals/penguin.jpeg',  mammal: false, f: [0, 0.5, 1, 0, 0, 0] },
    kucingbw: { name: 'Kucing Belang',    img: 'assets/images/animals/kucingbw.jpeg', mammal: true,  f: [1, 0, 0, 0, 1, 0] },
    kudalaut: { name: 'Kuda Laut',        img: 'assets/images/animals/kudalaut.jpeg', mammal: false, f: [0, 1, 0, 0.5, 0, 0] }
  };

  const TEACH_ORDER = ['harimau', 'lumba', 'sapi', 'merpati', 'panda', 'komodo', 'kucing', 'katak', 'pesut', 'penguin', 'kucingbw', 'kudalaut'];
  const SCAN_ORDER  = ['harimau', 'sapi', 'panda', 'lumba', 'kucing', 'pesut', 'merpati', 'komodo', 'penguin', 'katak', 'kucingbw', 'kudalaut'];

  const GROUPS = [
    { id: 'mamalia', name: 'Mamalia', img: 'assets/images/animals/kucingbw.jpeg', desc: 'Memiliki rambut atau bulu dan menyusui anaknya.', ex: 'Contoh: Harimau, Kucing, Lumba-lumba', enabled: true },
    { id: 'aves',    name: 'Aves',    img: 'assets/images/animals/penguin.jpeg',   desc: 'Memiliki bulu dan paruh.', ex: 'Contoh: Elang, Merpati, Penguin' },
    { id: 'reptil',  name: 'Reptil',  img: 'assets/images/animals/komodo.jpeg',    desc: 'Umumnya memiliki kulit kering bersisik.', ex: 'Contoh: Penyu, Komodo, Iguana' },
    { id: 'amfibi',  name: 'Amfibi',  img: 'assets/images/animals/katak.jpeg',     desc: 'Umumnya memiliki kulit lembap dan mengalami perubahan selama hidupnya.', ex: 'Contoh: Katak, Salamander' },
    { id: 'pisces',  name: 'Pisces',  img: 'assets/images/animals/kudalaut.jpeg',  desc: 'Hewan vertebrata yang hidup di air dan bernapas menggunakan insang.', ex: 'Contoh: Ikan Mas, Hiu, Kuda Laut' }
  ];

  /* ---------- State Gameplay ---------- */
  const state = {
    labels: {},        // id -> true (Mamalia) / false (Bukan Mamalia)
    teachIndex: 0,
    results: [],       // hasil prediksi Fauna AI
    page: 0,
    busy: false,
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

  /* ---------- Robot Fauna AI (SVG Beranimasi) ---------- */
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
    $$('[data-robot]').forEach(el => {
      el.innerHTML = robotSVG(parseFloat(el.dataset.scale || 1));
    });
    const teachRobot = $('#teach-robot');
    if (teachRobot) {
      teachRobot.innerHTML = robotSVG(1.2);
    }
  }

  /* ---------- Stepper Integration ---------- */
  function updateStepper(step) {
    if (typeof window.renderFaunaStepper === 'function') {
      window.renderFaunaStepper(step);
    }
  }

  /* ---------- Navigasi Antar Layar Binary ---------- */
  function go(name) {
    scanToken++; // Menghentikan scanning yang mungkin sedang berjalan
    currentScreen = name;

    // Sembunyikan layar opening jika masih terlihat
    const welcome = $('#screen-welcome');
    const mode = $('#screen-mode');
    if (welcome) welcome.classList.remove('is-visible', 'active');
    if (mode) mode.classList.remove('is-visible', 'active');

    // Sembunyikan semua layar binary
    $$('.screen[id^="s-"]').forEach(s => s.classList.remove('is-visible', 'active'));

    const el = $('#s-' + name);
    if (!el) return;

    el.classList.add('is-visible', 'active');
    const stepNum = parseInt(el.dataset.step, 10) || 2;
    updateStepper(stepNum);

    const initMap = {
      pick: initPick,
      teach: initTeach,
      check: initCheck,
      recap: initRecap,
      predict: initPredict,
      results: initResults
    };
    if (initMap[name]) initMap[name]();
  }

  /* ---------- Layar 2: Pilih Kelompok ---------- */
  function initPick() {
    state.busy = false;
    $$('.group-card').forEach(c => c.classList.remove('selected'));
  }

  function setupPickGrid() {
    const grid = $('#group-grid');
    if (!grid) return;
    grid.innerHTML = GROUPS.map(g => `
      <button type="button" class="group-card" data-group="${g.id}">
        <img src="${g.img}" alt="${g.name}">
        <h3>${g.name}</h3>
        <p>${g.desc}</p>
        <div class="ex">${g.ex}</div>
      </button>`).join('');

    grid.addEventListener('click', async e => {
      const card = e.target.closest('.group-card');
      if (!card || state.busy) return;
      const g = GROUPS.find(x => x.id === card.dataset.group);
      $$('.group-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (!g || !g.enabled) {
        toast('Misi ini baru tersedia untuk kelompok Mamalia.');
        return;
      }
      state.busy = true;
      await wait(450);
      go('teach');
    });
  }

  /* ---------- Layar 3: Mengajari Fauna ---------- */
  const CARD_PITCH = 440;

  function initTeach() {
    state.labels = {};
    state.teachIndex = 0;
    state.busy = false;
    const cnt = $('#learn-count');
    if (cnt) cnt.textContent = '0';
    const robot = $('#teach-robot .robot');
    if (robot) robot.classList.remove('open');

    const track = $('#teach-track');
    if (track) {
      track.innerHTML = TEACH_ORDER.map(id =>
        `<div class="t-card"><img src="${ANIMALS[id].img}" alt="${ANIMALS[id].name}"><h3>${ANIMALS[id].name}</h3></div>`
      ).join('');
    }
    layoutTeach();
    const bYes = $('#btn-yes'), bNo = $('#btn-no');
    if (bYes && bNo) bYes.disabled = bNo.disabled = false;
  }

  function layoutTeach() {
    $$('#teach-track .t-card').forEach((c, i) => {
      const rel = i - state.teachIndex;
      c.style.transform = `translateX(${rel * CARD_PITCH}px)`;
      c.classList.toggle('hidden', rel < -1 || rel > 1);
    });
  }

  async function labelCurrent(isMammal) {
    if (state.busy) return;
    const id = TEACH_ORDER[state.teachIndex];
    if (!id) return;

    state.busy = true;
    state.labels[id] = isMammal;
    const cards = $$('#teach-track .t-card');
    const card = cards[state.teachIndex];
    const robot = $('#teach-robot .robot');

    if (robot) robot.classList.add('open');

    // Animasi kartu terbang menuju robot
    if (card) {
      card.classList.add('fly');
      card.style.transform = `translate(${1090 - 86 - 100}px, -10px) scale(0.22)`;
    }

    await wait(420);

    const cnt = $('#learn-count');
    if (cnt) {
      cnt.textContent = Object.keys(state.labels).length;
      cnt.classList.remove('bump');
      void cnt.offsetWidth;
      cnt.classList.add('bump');
    }

    state.teachIndex++;
    layoutTeach();

    await wait(450);
    if (robot) robot.classList.remove('open');

    if (state.teachIndex >= TEACH_ORDER.length) {
      await wait(450);
      state.busy = false;
      go('thanks');
      return;
    }
    state.busy = false;
  }

  /* ---------- Pemindai / Scanner (Layar 4 & 6) ---------- */
  const ICON_OK  = '<svg viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_BAD = '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const PITCH = 355;

  async function runScan(screenId, ids, verdictFn, captionFn) {
    const root = $('#' + screenId);
    if (!root) return;
    const track = $('.scan-track', root);
    const beam = $('.beam', root);
    const frame = $('.verdict-frame', root);
    const icon = $('.verdict-icon', root);
    const cap = $('.verdict-cap', root);
    const token = ++scanToken;

    if (!track) return;
    track.innerHTML = ids.map(id => `<div class="scan-card"><img src="${ANIMALS[id].img}" alt="${ANIMALS[id].name}"></div>`).join('');
    const cards = $$('.scan-card', track);

    const place = cur => cards.forEach((c, k) => {
      const rel = k - cur;
      c.style.transform = `translateX(${rel * PITCH}px)`;
      c.classList.toggle('hidden', rel < -1 || rel > 1);
    });

    const clear = () => {
      if (beam) beam.className = 'beam';
      if (frame) frame.className = 'verdict-frame';
      if (icon) { icon.className = 'verdict-icon'; icon.innerHTML = ''; }
      if (cap) cap.className = 'verdict-cap';
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
      await wait(950);
      if (token !== scanToken) return;

      const ok = verdictFn(ids[i]);
      if (beam) beam.classList.add(ok ? 'ok' : 'bad');
      await wait(250);
      if (frame) frame.classList.add(ok ? 'ok' : 'bad');
      if (icon) {
        icon.classList.add(ok ? 'ok' : 'bad');
        icon.innerHTML = ok ? ICON_OK : ICON_BAD;
      }
      if (captionFn && cap) {
        cap.textContent = captionFn(ids[i]);
        cap.classList.add('show');
      }
      await wait(1500);
      if (token !== scanToken) return;
      clear();
      await wait(120);
    }

    if (token !== scanToken) return;
    place(ids.length);
  }

  /* ---------- Layar 4: Fauna Memeriksa Jawaban ---------- */
  function initCheck() {
    runScan('s-check', SCAN_ORDER, id => state.labels[id] === ANIMALS[id].mammal);
  }

  /* ---------- Layar 5: Rekap Data Pelabelan ---------- */
  function initRecap() {
    setTab('yes');
  }

  function setTab(tab) {
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    const want = tab === 'yes';
    const ids = TEACH_ORDER.filter(id => state.labels[id] === want).slice(0, 16);
    const grid = $('#thumb-grid');
    if (!grid) return;

    if (!ids.length) {
      grid.innerHTML = '<div class="empty-msg">Belum ada contoh di kelompok ini.</div>';
      return;
    }
    grid.innerHTML = ids.map((id, i) =>
      `<div class="thumb" style="animation-delay:${i * 40}ms" title="${ANIMALS[id].name}"><img src="${ANIMALS[id].img}" alt="${ANIMALS[id].name}"></div>`
    ).join('');
  }

  /* ---------- Model Simulasi Klasifikasi Fauna AI (Nearest Neighbor) ---------- */
  function predict(testId) {
    const f = ANIMALS[testId].f;
    const neigh = Object.keys(state.labels)
      .filter(id => id !== testId) // Evaluasi terhadap contoh lainnya
      .map(id => ({
        d: Math.hypot(...ANIMALS[id].f.map((v, i) => v - f[i])),
        label: state.labels[id]
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);

    if (!neigh.length) return false;
    let yes = 0, no = 0;
    neigh.forEach(n => {
      const w = 1 / (n.d + 0.1);
      if (n.label) yes += w;
      else no += w;
    });
    return yes >= no;
  }

  function computeResults() {
    state.results = SCAN_ORDER.map(id => {
      const guess = predict(id);
      return { id, guess, correct: guess === ANIMALS[id].mammal };
    });
  }

  /* ---------- Layar 6: Fauna Menebak (s-predict) ---------- */
  function initPredict() {
    computeResults();
    const byId = Object.fromEntries(state.results.map(r => [r.id, r]));
    runScan('s-predict', SCAN_ORDER, id => byId[id].correct,
      id => 'Tebakan Fauna: ' + (byId[id].guess ? 'Mamalia' : 'Bukan Mamalia')
    );
  }

  /* ---------- Layar 7: Hasil Analisis (s-results) ---------- */
  const PER_PAGE = 5;

  function initResults() {
    if (!state.results.length) computeResults();
    state.page = 0;
    const total = state.results.length;
    const ok = state.results.filter(r => r.correct).length;
    const pct = (ok / total) * 100;

    const sub = $('#result-sub');
    if (sub) sub.textContent = `Fauna AI sudah menyelesaikan ${total} prediksi.`;

    const sv = $('#score-value');
    if (sv) {
      sv.textContent = pct.toFixed(1).replace('.', ',').replace(',0', '') + '%';
      sv.className = 'score-value ' + (pct >= 75 ? '' : pct >= 50 ? 'mid' : 'low');
    }

    const cOk = $('#chip-ok');
    const cBad = $('#chip-bad');
    if (cOk) cOk.textContent = `${ok} Benar`;
    if (cBad) cBad.textContent = `${total - ok} Salah`;

    const wrongLabels = Object.keys(state.labels).filter(id => state.labels[id] !== ANIMALS[id].mammal).length;
    const reasons = $('#reasons');
    if (reasons) {
      if (total - ok > 0) {
        const items = [];
        if (wrongLabels) items.push('Label data kurang tepat dari contoh yang kamu berikan');
        items.push('Variasi karakteristik visual masih terbatas');
        reasons.innerHTML = `<h4>Mengapa Fauna masih melakukan kesalahan?</h4><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
      } else {
        reasons.innerHTML = '<h4>Mengapa Fauna bisa menebak dengan tepat?</h4><ul><li>Semua label yang kamu berikan sudah akurat</li><li>Contoh gambar mewakili ciri fisik dengan jelas</li></ul>';
      }
    }
    renderPage();
  }

  function renderPage() {
    const pages = Math.ceil(state.results.length / PER_PAGE);
    const slice = state.results.slice(state.page * PER_PAGE, state.page * PER_PAGE + PER_PAGE);
    const row = $('#result-row');
    if (row) {
      row.innerHTML = slice.map(r => `
        <div class="r-card">
          <img src="${ANIMALS[r.id].img}" alt="${ANIMALS[r.id].name}">
          <div class="nm">${ANIMALS[r.id].name}</div>
          <span class="tag ${r.correct ? 'ok' : 'bad'}">${r.correct ? 'Benar' : 'Salah'}</span>
        </div>`).join('');
    }

    const pager = $('#pager');
    if (pager) {
      const nums = Array.from({ length: pages }, (_, i) =>
        `<button type="button" data-page="${i}" class="${i === state.page ? 'cur' : ''}">${i + 1}</button>`
      ).join('');
      pager.innerHTML =
        `<button type="button" class="arrow" data-dir="-1" ${state.page === 0 ? 'disabled' : ''} aria-label="Sebelumnya">‹</button>${nums}` +
        `<button type="button" class="arrow" data-dir="1" ${state.page >= pages - 1 ? 'disabled' : ''} aria-label="Berikutnya">›</button>`;
    }
  }

  /* ---------- Event Handlers ---------- */
  function setupEvents() {
    // Tombol navigasi data-go
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-go]');
      if (b) {
        go(b.dataset.go);
      }
    });

    // Tombol Ya (Mamalia) / Tidak (Bukan Mamalia)
    const bYes = $('#btn-yes'), bNo = $('#btn-no');
    if (bYes) bYes.addEventListener('click', () => labelCurrent(true));
    if (bNo)  bNo.addEventListener('click', () => labelCurrent(false));

    // Keyboard shortcut panah kiri / kanan untuk melatih
    document.addEventListener('keydown', e => {
      if (currentScreen !== 'teach') return;
      if (e.key === 'ArrowLeft') labelCurrent(true);
      if (e.key === 'ArrowRight') labelCurrent(false);
    });

    // Tab pada layar rekap
    $$('.tab').forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));

    // Pagination pada layar hasil
    const pager = $('#pager');
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

    // Tombol latih ulang
    const btnRetrain = $('#btn-retrain');
    if (btnRetrain) {
      btnRetrain.addEventListener('click', () => go('teach'));
    }

    // Hook dari Opening: ketika user memilih mode binary
    document.addEventListener('fauna:mode', e => {
      if (e.detail && e.detail.mode === 'binary') {
        state.active = true;
        renderRobots();
        go('pick');
      }
    });

    // Reset jika keluar misi
    document.addEventListener('fauna:exit', () => {
      scanToken++;
      state.labels = {};
      state.results = [];
      state.active = false;
      currentScreen = '';
    });
  }

  // Inisialisasi awal
  setupPickGrid();
  setupEvents();

})();
