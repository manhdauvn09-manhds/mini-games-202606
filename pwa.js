/* Shared PWA runtime for every games-core game.
   - Registers the offline service worker.
   - Shows a floating "Install app" button when the browser reports the game is
     installable (Chrome / Edge / Android). Clicking it fires the native install prompt.
   - On iOS Safari (no install API) the button opens short Add-to-Home-Screen instructions.
   - Hides itself once the game is already running as an installed standalone app. */
(function(){
  "use strict";

  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){});
    });
  }

  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
                   || window.navigator.standalone === true;
  if(standalone) return; // already installed → nothing to prompt

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
              || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS
  var deferred = null, btn = null, iosMode = false;

  function lang(){ var l = (document.documentElement.getAttribute('lang') || 'vi').toLowerCase();
    return l.indexOf('ja') === 0 ? 'ja' : (l.indexOf('en') === 0 ? 'en' : 'vi'); }
  function t(o){ return o[lang()] || o.vi; }

  function makeBtn(){
    if(btn) return btn;
    btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', t({vi:'Cài đặt ứng dụng',en:'Install app',ja:'アプリをインストール'}));
    btn.innerHTML = '<span style="font-size:16px;line-height:1">📲</span><span class="pwaTxt">'
      + t({vi:'Cài ứng dụng',en:'Install app',ja:'インストール'}) + '</span>';
    btn.style.cssText = 'position:fixed;z-index:2147483000;right:calc(12px + env(safe-area-inset-right));'
      + 'bottom:calc(14px + env(safe-area-inset-bottom));display:none;align-items:center;gap:7px;'
      + 'padding:11px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.30);'
      + 'background:linear-gradient(135deg,#ffce54,#ff8f3f);color:#1a1205;'
      + 'font:800 13px/1 "Segoe UI",system-ui,-apple-system,sans-serif;letter-spacing:.2px;'
      + 'box-shadow:0 10px 30px rgba(0,0,0,.45);cursor:pointer;-webkit-tap-highlight-color:transparent;'
      + 'animation:pwaPop .35s ease;';
    if(!document.getElementById('pwaCss')){
      var st = document.createElement('style'); st.id='pwaCss';
      st.textContent = '@keyframes pwaPop{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}'
        + '#pwaInstallBtn:active{transform:scale(.95)}';
      document.head.appendChild(st);
    }
    btn.addEventListener('click', onClick);
    (document.body || document.documentElement).appendChild(btn);
    return btn;
  }
  function show(){ makeBtn().style.display = 'inline-flex'; }
  function hide(){ if(btn) btn.style.display = 'none'; }

  function onClick(){
    if(deferred){
      deferred.prompt();
      var c = deferred.userChoice;
      if(c && c.then) c.then(function(){ deferred = null; hide(); });
      else { deferred = null; hide(); }
    } else if(iosMode){
      showIOSHelp();
    }
  }

  function showIOSHelp(){
    var back = document.createElement('div');
    back.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:flex;align-items:flex-end;'
      + 'justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);'
      + '-webkit-backdrop-filter:blur(3px);padding:0 0 22px;animation:pwaPop .25s ease;';
    back.innerHTML = '<div style="max-width:340px;margin:0 14px;background:#0e1428;color:#eaf0ff;'
      + 'border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:18px;'
      + 'font:500 14px/1.55 \'Segoe UI\',system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6)">'
      + '<div style="font-weight:800;font-size:16px;margin-bottom:8px">📲 '
      + t({vi:'Cài lên Màn hình chính',en:'Add to Home Screen',ja:'ホーム画面に追加'}) + '</div>'
      + '<div style="color:#9fb0d4">'
      + t({vi:'Mở bằng <b>Safari</b>, nhấn nút <b>Chia sẻ</b> <span style="display:inline-block;transform:translateY(2px)">⬆️</span> rồi chọn <b>“Thêm vào MH chính”</b>.',
           en:'Open in <b>Safari</b>, tap the <b>Share</b> button <span style="display:inline-block;transform:translateY(2px)">⬆️</span> then choose <b>“Add to Home Screen”</b>.',
           ja:'<b>Safari</b>で開き、<b>共有</b> <span style="display:inline-block;transform:translateY(2px)">⬆️</span> から<b>「ホーム画面に追加」</b>を選択。'}) + '</div>'
      + '<button id="pwaOk" style="margin-top:14px;width:100%;padding:11px;border-radius:12px;border:0;'
      + 'background:#ffce54;color:#1a1205;font-weight:800;font-size:14px;cursor:pointer">'
      + t({vi:'Đã hiểu',en:'Got it',ja:'OK'}) + '</button></div>';
    back.addEventListener('click', function(){ back.remove(); });
    document.body.appendChild(back);
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferred = e;
    show();
  });
  window.addEventListener('appinstalled', function(){ hide(); deferred = null; });

  // iOS never fires beforeinstallprompt — offer the manual path instead.
  if(isIOS){ iosMode = true; window.addEventListener('load', show); }
})();
