const CACHE_NAME='liyu-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(['/','/yuelongmen/','/moyu/'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))}else{e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cl=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,cl));return r})))}});
