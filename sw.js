const CACHE='mealflow-v6-1';
const ASSETS=['./','./index.html','./data.js','./nutrition.js','./app.js','./v6.js','./v5.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
// Wait for existing tabs to close before activating, so releases are never mixed.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>/^mealflow-v\d/.test(key)&&key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(event.request,{ignoreSearch:true});
  if(cached)return cached;
  try{return await fetch(event.request)}catch(error){
   if(event.request.mode==='navigate')return cache.match('./index.html');
   throw error;
  }
 }));
});
