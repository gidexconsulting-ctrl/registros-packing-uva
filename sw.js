/* Service worker: la app abre al instante y funciona sin internet. */
const V='uva-v2';
const CORE=['app.html','manifest.webmanifest','imagenes/icon-192.png','imagenes/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const CDN=/^(https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.(googleapis|gstatic)\.com))\//;
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 // la página: primero la red (para recibir actualizaciones), si no hay señal, la copia guardada
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('app.html'))));return}
 // imágenes propias y librerías: la copia guardada al instante y se actualiza en segundo plano
 if((u.origin===location.origin&&/\.(webp|png|js|webmanifest)$/.test(u.pathname))||CDN.test(r.url)){
  e.respondWith(caches.open(V).then(async c=>{const m=await c.match(r);const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>m);return m||net}))}});
