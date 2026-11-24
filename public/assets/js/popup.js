/* ==========================================================
   Fauna AI Quest — Pop-up Dialog Module
   API:
     FaunaDialog.confirmExit(onExit, onStay)
     FaunaDialog.ensureEnoughImages(count, min)
     FaunaDialog.open({ title, lines, buttons: [{ label, ghost, onClick }], onClose })
     FaunaDialog.close()
   ========================================================== */
(function () {
  'use strict';

  function robotSVG(scale) {
    return '<svg viewBox="0 0 320 310" width="' + (320 * scale) + '" height="' + (310 * scale) + '" aria-label="Fauna AI">' +
      '<ellipse cx="160" cy="288" rx="82" ry="22" fill="#f2f6f9" stroke="#d3dce4" stroke-width="1.5"/>' +
      '<circle cx="36" cy="152" r="22" fill="#6fd3ea"/><circle cx="284" cy="152" r="22" fill="#6fd3ea"/>' +
      '<rect x="26" y="128" width="16" height="50" rx="8" fill="#052540"/><rect x="278" y="128" width="16" height="50" rx="8" fill="#052540"/>' +
      '<path d="M27 92 L31 131" stroke="#9aa9b8" stroke-width="5" stroke-linecap="round"/><path d="M293 92 L289 131" stroke="#9aa9b8" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="25" cy="86" r="6" fill="#6fd3ea"/><circle cx="295" cy="86" r="6" fill="#6fd3ea"/>' +
      '<path d="M41 89 H279 V255 a20 20 0 0 1 -20 20 H61 a20 20 0 0 1 -20 -20 Z" fill="#e6ebef" stroke="#b3bfcb" stroke-width="1.5"/>' +
      '<rect x="60" y="112" width="201" height="96" rx="48" fill="#052540"/>' +
      '<circle cx="126" cy="150" r="11" fill="#6fd3ea"/><circle cx="192" cy="150" r="11" fill="#6fd3ea"/>' +
      '<path d="M144 171 Q160 190 177 171" stroke="#6fd3ea" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<text x="160" y="248" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-weight="800" font-size="17" fill="#0b2f4e">Fauna.AI</text>' +
      '<path d="M41 89 A119 64 0 0 1 279 89 Z" fill="#e6ebef" stroke="#b3bfcb" stroke-width="1.5"/></svg>';
  }

  var DECOR = '<svg class="decor" viewBox="0 0 1568 690" aria-hidden="true">' +
    '<circle cx="165" cy="570" r="112" fill="#8cbf9d"/><circle cx="130" cy="585" r="82" fill="#96d1a6"/><circle cx="58" cy="510" r="82" fill="#b2dec5"/><circle cx="111" cy="581" r="13" fill="#efe3ab"/>' +
    '<circle cx="1395" cy="590" r="100" fill="#8cbf9d"/><circle cx="1470" cy="588" r="95" fill="#96d1a6"/><circle cx="1476" cy="492" r="78" fill="#b2dec5"/><circle cx="1465" cy="566" r="13" fill="#efe3ab"/></svg>';

  var root = null, keyHandler = null, lastFocus = null;

  function ensureRoot() {
    if (root) return root;
    root = document.createElement('div');
    root.className = 'fauna-modal';
    root.hidden = true;
    document.body.appendChild(root);
    window.addEventListener('resize', fit);
    return root;
  }

  function fit() {
    // Skala dialog mengikuti lebar dan tinggi layar (maks 0.52)
    var s = Math.min(0.52, (window.innerWidth * 0.94) / 1568 * 1.06, (window.innerHeight * 0.9) / 690);
    ensureRoot().style.setProperty('--s', s);
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function close() {
    if (!root) return;
    root.hidden = true;
    root.innerHTML = '';
    document.removeEventListener('keydown', keyHandler);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function open(opts) {
    var m = ensureRoot();
    fit();
    lastFocus = document.activeElement;
    m.innerHTML =
      '<div class="dlg-wrap" role="dialog" aria-modal="true" aria-label="' + esc(opts.title) + '"><div class="dlg">' +
      '<div class="dlg-card">' + DECOR + '</div>' +
      '<div class="robot-wrap">' + robotSVG(1.3) + '</div>' +
      '<h3 class="dlg-title">' + esc(opts.title) + '</h3>' +
      '<p class="dlg-text">' + opts.lines.map(esc).join('<br>') + '</p>' +
      '<div class="dlg-actions"></div>' +
      '<button type="button" class="dlg-close" aria-label="Tutup">' +
      '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#2d5870" stroke-width="3.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
      '</button>' +
      '</div></div>';

    var actions = m.querySelector('.dlg-actions');
    (opts.buttons || []).forEach(function (b) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'dlg-btn' + (b.ghost ? ' ghost' : '');
      el.textContent = b.label;
      el.addEventListener('click', function () {
        close();
        if (b.onClick) b.onClick();
      });
      actions.appendChild(el);
    });

    m.querySelector('.dlg-close').addEventListener('click', function () {
      close();
      if (opts.onClose) opts.onClose();
    });

    keyHandler = function (e) {
      if (e.key === 'Escape') {
        close();
        if (opts.onClose) opts.onClose();
      }
    };
    document.addEventListener('keydown', keyHandler);

    m.hidden = false;
    var primary = actions.querySelector('.dlg-btn:not(.ghost)') || actions.firstChild;
    if (primary) primary.focus();
  }

  function confirmExit(onExit, onStay) {
    open({
      title: 'Keluar dari Misi?',
      lines: ['Progres tidak disimpan jika kamu keluar', 'sekarang.'],
      buttons: [
        { label: 'Keluar', ghost: true, onClick: onExit },
        { label: 'Lanjut', onClick: onStay }
      ],
      onClose: onStay
    });
  }

  function ensureEnoughImages(count, min) {
    min = min || 15;
    if (count >= min) return true;
    open({
      title: 'Gambar Belum Cukup!',
      lines: ['Kamu perlu memilih minimal ' + min + ' gambar untuk', 'lanjut ke tahap berikutnya.'],
      buttons: [{ label: 'Ok' }]
    });
    return false;
  }

  window.FaunaDialog = {
    open: open,
    close: close,
    confirmExit: confirmExit,
    ensureEnoughImages: ensureEnoughImages
  };
})();
