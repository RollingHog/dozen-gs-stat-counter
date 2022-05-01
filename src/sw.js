// Change this to your repository name
const GHP_PATH = '/dozen-gs-stat-counter'

// Choose a different app prefix name
const APP_PREFIX = 'rh_ghp_dsc'

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…).
// If you don't change the version, the service worker will give your
// users the old files!
const VERSION = '1_0_0'

// The files to make available for offline use. make sure to add
// others to this list
const URLS = [
  `${GHP_PATH}/`,
  `${GHP_PATH}/index.html`,
  `${GHP_PATH}/src/index.js`
]