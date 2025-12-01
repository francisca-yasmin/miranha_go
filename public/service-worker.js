const CACHE_NAME = "dsgo-cache-v1"; //nome do armario onde o navegador vai guardar os arquivos
//a lista de arquivos que devem funcionar mesmo sem internet
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/logo_miles.png'
];

//instala e adiciona arquivos ao cache
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Workrer e ccheando arquivos');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(URLS_TO_CACHE))
        .then(() => self.skipWaiting())
    );
});

//ativa e remove caches antigos
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker e removendo cahces antigos...');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)) //apaga cache antigo
            )
        )
    );
    self.caches.claim();
});

//interpreta requisições
self.addEventListener('fetch', (event) =>{
    if(event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => response)
                .catch(() => caches.match('/failback-offline.html'))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
    }
});