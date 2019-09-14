const CACHE = "cache";
const FILES = ["index.html"];
self.addEventListener("install", e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(FILES))
  );
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (CACHE.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});