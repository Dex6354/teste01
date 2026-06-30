// Removemos a lista de ASSETS e a criação do cache

self.addEventListener('install', () => {
  // Pula a espera para ativar o SW imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Limpa qualquer cache antigo existente para garantir que nada fique guardado
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepta as requisições, mas busca tudo direto da rede (Network Only)
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
