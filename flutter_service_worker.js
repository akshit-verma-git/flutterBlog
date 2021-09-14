'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "index.html": "96956fde30c36702185b6cac330218fb",
"/": "96956fde30c36702185b6cac330218fb",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "882aaf283d14f755d721850da6a18022",
"assets/assets/fonts/Rajdhani-Regular.ttf": "fb987593d286bb6bd93d3de8457c5eb4",
"assets/assets/fonts/Hugolers_Stylish_Modern.ttf": "b8dca0ff32281278e1d38053cb29bee4",
"assets/assets/images/isi/acm-grad-image.png": "50741bbaaaf34f905d90744b07b57a57",
"assets/assets/images/isi/filter-3.png": "3dfae4d7bc6a411669c167099022f222",
"assets/assets/images/isi/filter-4.png": "e6614cd8b359ca41a7ccbe18f0c55b95",
"assets/assets/images/isi/filter-1.png": "9694a0e99a95e0575a65110304854630",
"assets/assets/images/isi/filter-2.png": "c4dc4d220fc5da65959ec43d867ae871",
"assets/assets/images/isi/heart.gif": "f5241e84bf5920c5a39b9cc8bc685bce",
"assets/assets/images/freszo/home.png": "d0fbf3c459ef43d70cf21b55f6064542",
"assets/assets/images/freszo/offers.png": "43750f5d164b2716398def8c8bea91cb",
"assets/assets/images/freszo/settings.png": "3de0a790a5eff48e66699f3fbe280dd4",
"assets/assets/images/freszo/stocks.png": "a7cfebf17ea0d0240f2d0c183209ebaa",
"assets/assets/images/freszo/messages.png": "21ea7bc61e16026d91096f9bad63f0bd",
"assets/assets/images/freszo/cart.png": "041a22fbd2a305369a964cf45f4820eb",
"assets/assets/images/mypic.jpg": "9c050968668ae61d375795c190d66e3c",
"assets/assets/images/certificates/isi.png": "d113684243e82816126bd8d34c6ea097",
"assets/assets/images/certificates/deepLearning.png": "f2a0a7b58996200d47eb57f0b56f4b85",
"assets/assets/images/certificates/machineLearning.png": "a95bc4665d1b4e0e6805330ec06c66e0",
"assets/assets/images/certificates/aws.png": "90309b4cd8aa3d792f030d8324178253",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/AssetManifest.json": "3c22d20c65e2001ebd1e51c7fd84fc00",
"assets/FontManifest.json": "6870f8ad46a0a40ee991bb7899a91039",
"main.dart.js": "b4710b6045b63be83cf53e7ca9ad0613",
"manifest.json": "dd3f453044a9dc9f820c225adec3771c",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"version.json": "584af039f3a939c582bc7483baf3b284",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
