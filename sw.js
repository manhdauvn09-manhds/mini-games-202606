/* Generic offline service worker — identical for every games-core game origin.
   Gives each single-file game an offline cache + satisfies PWA install criteria
   (a fetch handler is required for the install prompt). Cache-first with a
   background network refresh so games load instantly and work with no network. */
var CACHE = 'gc-pwa-v1';

self.addEventListener('install', function(e){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    var keys = await caches.keys();
    await Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch(_){ return; }
  if(url.origin !== self.location.origin) return; // only cache same-origin assets

  e.respondWith((async function(){
    var cache = await caches.open(CACHE);
    var cached = await cache.match(req, { ignoreSearch:true });
    var network = fetch(req).then(function(res){
      if(res && res.ok && (res.type === 'basic' || res.type === 'default')){
        cache.put(req, res.clone()).catch(function(){});
      }
      return res;
    }).catch(function(){ return null; });
    // Cache-first for speed; fall back to network; for navigations fall back to cached page.
    if(cached) return cached;
    var net = await network;
    if(net) return net;
    if(req.mode === 'navigate'){
      var idx = await cache.match('./index.html') || await cache.match('./');
      if(idx) return idx;
    }
    return new Response('Offline', { status:503, statusText:'Offline' });
  })());
});
