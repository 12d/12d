
self.addEventListener('activate', function(event) {

  const CACHE_NAME = __wpo.name + ':' + __wpo.version

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
    function cachesMatch (request, cacheName) {
      return caches.match(request, {
        cacheName: cacheName
      }).then(function (response) {
        return response
      })
      // Return void if error happened (cache not found)
      ['catch'](function () {})
    }
    function cacheFirst(cacheUrl, CACHE_NAME) {
      var resource = cachesMatch(cacheUrl, CACHE_NAME).then(function (response) {
        if (response) {
          return response;
        }
        // Load and cache known assets
        var fetching = fetch(urlString).then(function (response) {
          if (!response.ok) {
            return response;
          }
          (function () {
            var responseClone = response.clone();
            var storing = caches.open(CACHE_NAME).then(function (cache) {
              return cache.put(urlString, responseClone);
            }).then(function () {
              console.log('[SW]:', 'Cache asset: ' + urlString);
            });
            event.waitUntil(storing);
          })();
  
          return response;
        });
  
        return fetching;
      })
      return resource
    }
    function netWorkFirst(cacheUrl, CACHE_NAME) {
      var resource = fetch(cacheUrl).then(response => {
        if (response.ok) {
          var responseClone = response.clone()
          var storing = caches.open(CACHE_NAME).then(function (cache) {
            cache.put(cacheUrl, responseClone);
          }).then(function () {
            console.log('[SW]:', 'Cache asset: ' + cacheUrl);
          });
          event.waitUntil(storing);
          return response;
        }
        // Throw to reach the code in the catch below
        throw new Error('Response is not ok');
      })
      ['catch'](function () {
        return cachesMatch(cacheUrl, CACHE_NAME);
      });
      return resource
    }
  
    var url = new URL(event.request.url)
    url.hash = ''
    var pathname = url.pathname
    var urlString = url.toString()
    var cacheUrl = urlString
    var IS_12D = /12d\.github\.io/
    var IS_BANK_Static =/bank-static-stg\.pingan\.com\.cn/
    var IS_STATIC = /\/static\//
   //var IS_HOME = /^\/(e|u|n)\/(\d+)$/
    var IS_INDEX = /\/home\/index./
    //var IS_PREVIEW = /^\/preview(?!\.)/
    var CACHE_PREFIX = __wpo.name
    var CACHE_TAG = __wpo.version
    var CACHE_NAME = CACHE_PREFIX + ':' + CACHE_TAG
    var resource = undefined
    var isGET = event.request.method === 'GET'
    // 以缓存优先的形式缓存 static/* 静态资源
    if ((cacheUrl.match(IS_BANK_Static)) && isGET) {
      resource = cacheFirst(cacheUrl, CACHE_NAME)
      event.respondWith(resource)
    }
    // 以网络优先的形式缓存 index页面
    if ((pathname.match(IS_INDEX)) && isGET) {
      resource = netWorkFirst(cacheUrl, CACHE_NAME)
      event.respondWith(resource)
    }
  })