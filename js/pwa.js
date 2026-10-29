/* ═══ TIKÈ LAKAY AS AN APP (29 Oct 2026) ═══════════════════════════════════
 * 1. Registers the service worker (sw.js) so the app can be installed.
 * 2. "📲 Enstale app la": Android/desktop get the real install prompt; an
 *    iPhone gets the two taps Safari needs (Share → Add to Home Screen),
 *    because iOS has no install prompt at all.
 * 3. MOVING FROM haitibiznis.com: an organiser's own events and their manage
 *    codes live in the phone's storage FOR THAT WEBSITE (tl_events,
 *    tl_manage). The old pages forward people here with that data in the part
 *    of the address after "#" (never sent to any server); it is merged in
 *    once and wiped from the address at once, so nobody loses the way to edit
 *    their own event.
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  // 3. take over what the old site handed us
  try {
    var m = /[#&]tlmig=([A-Za-z0-9_-]+)/.exec(location.hash || '');
    if (m) {
      var json = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/'))));
      var d = JSON.parse(json) || {};
      var mine = []; try { mine = JSON.parse(localStorage.getItem('tl_events') || '[]'); } catch (e) {}
      var seen = {}; mine.forEach(function (e) { seen[e._id || e.id] = 1; });
      (d.tl_events || []).forEach(function (e) { if (!seen[e._id || e.id]) mine.push(e); });
      localStorage.setItem('tl_events', JSON.stringify(mine));
      var man = {}; try { man = JSON.parse(localStorage.getItem('tl_manage') || '{}'); } catch (e) {}
      Object.keys(d.tl_manage || {}).forEach(function (k) { if (!man[k]) man[k] = d.tl_manage[k]; });
      localStorage.setItem('tl_manage', JSON.stringify(man));
      ['tl_lang', 'tl_door_code', 'tl_door_id'].forEach(function (k) { if (d[k] && !localStorage.getItem(k)) localStorage.setItem(k, d[k]); });
      var rest = (location.hash || '').replace(/[#&]tlmig=[A-Za-z0-9_-]+/, '').replace(/^&/, '#');
      history.replaceState(null, '', location.pathname + location.search + (rest && rest !== '#' ? rest : ''));
    }
  } catch (e) { /* a broken hand-over must never stop the page */ }

  // 1. service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  // 2. install
  var T = {
    ht: ['📲 Enstale app Tikè Lakay', 'Enstale', 'Sou iPhone: peze bouton Pataje ⬆ anba a, epi "Sou Ekran Akèy" (Add to Home Screen).'],
    fr: ['📲 Installer l’app Tikè Lakay', 'Installer', 'Sur iPhone : touchez Partager ⬆ en bas, puis « Sur l’écran d’accueil ».'],
    en: ['📲 Install the Tikè Lakay app', 'Install', 'On iPhone: tap Share ⬆ at the bottom, then "Add to Home Screen".'],
    es: ['📲 Instala la app Tikè Lakay', 'Instalar', 'En iPhone: toca Compartir ⬆ abajo y luego «Agregar a inicio».'],
    pt: ['📲 Instale o app Tikè Lakay', 'Instalar', 'No iPhone: toque em Compartilhar ⬆ e depois «Adicionar à Tela de Início».']
  };
  function tx(i) { var l = 'ht'; try { l = localStorage.getItem('tl_lang') || 'ht'; } catch (e) {} return (T[l] || T.ht)[i]; }
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var deferred = null;
  function bar(onTap, isIos) {
    if (standalone || document.getElementById('tlInstall')) return;
    try { if (sessionStorage.getItem('tl_install_closed')) return; } catch (e) {}
    var b = document.createElement('div'); b.id = 'tlInstall';
    b.setAttribute('style', 'position:fixed;left:12px;right:12px;bottom:calc(64px + env(safe-area-inset-bottom));z-index:60;background:#0A0E1A;color:#fff;border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.35);font:600 14px/1.35 system-ui,sans-serif;max-width:520px;margin:0 auto');
    b.innerHTML = '<img src="assets/icon-192.png" alt="" style="width:36px;height:36px;border-radius:9px;background:#fff">' +
      '<div style="flex:1">' + tx(0) + (isIos ? '<div style="font-weight:500;font-size:12.5px;color:#C9D6FF;margin-top:3px">' + tx(2) + '</div>' : '') + '</div>' +
      (isIos ? '' : '<button id="tlInstallGo" style="background:#D21034;color:#fff;border:0;border-radius:10px;padding:9px 12px;font:800 13px system-ui,sans-serif">' + tx(1) + '</button>') +
      '<button id="tlInstallX" aria-label="Fèmen" style="background:none;border:0;color:#9AA6BF;font-size:20px;padding:0 4px">×</button>';
    document.body.appendChild(b);
    var go = document.getElementById('tlInstallGo'); if (go) go.onclick = onTap;
    document.getElementById('tlInstallX').onclick = function () { b.remove(); try { sessionStorage.setItem('tl_install_closed', '1'); } catch (e) {} };
  }
  if (!document.querySelector('meta[name="tl-install"]')) return;   // only the pages that ask for it
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    bar(function () { deferred.prompt(); deferred.userChoice.finally(function () { var x = document.getElementById('tlInstall'); if (x) x.remove(); deferred = null; }); }, false);
  });
  var ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) {
    window.addEventListener('load', function () { setTimeout(function () { bar(null, true); }, 2500); });
  }
})();
