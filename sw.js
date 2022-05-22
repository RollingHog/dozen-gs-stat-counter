const GHP_PATH = '/dozen-gs-stat-counter'

// eslint-disable-next-line no-unused-vars
const APP_PREFIX = 'rh_ghp_dsc'

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…).
// eslint-disable-next-line no-unused-vars
const VERSION = '2.0.2'

// The files to make available for offline use
// eslint-disable-next-line no-unused-vars
const URLS = [
  `${GHP_PATH}/`,
  `${GHP_PATH}/index.html`,
  `${GHP_PATH}/src/index.js`
]

// https://stackoverflow.com/questions/46541071/progressive-web-app-does-not-work-offline-error
self.addEventListener('fetch', function (event) {
  event.respondWith(async function () {
    try {
      var res = await fetch(event.request)
      var cache = await caches.open('cache')
      cache.put(event.request.url, res.clone())
      return res
    }
    catch (error) {
      return caches.match(event.request)
    }
  }())
})
