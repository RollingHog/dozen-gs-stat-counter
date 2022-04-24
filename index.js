const ECharacteristicsList = [
  'Бой',
  'Внимательность',
  'Выживание',
  'Знание',
  'Коварство',

  'Ловкость',
  'Ремесло',
  'Социализация',
  'Телосложение',
]

/** @type {HTMLTableElement} */
const STATS_TABLE_EL = getEl('table__stats')

////////////////////// COMMON ///////////////////////

// eslint-disable-next-line no-unused-vars
const log = console.log
function getEl(name) {
  return document.getElementById(name)
}

function createElementFromHTML(htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstElementChild
}

////////////// LOCALSTORAGE OPERATIONS /////////////

const LS_STATS_JSON_KEY = 'STATS'

function saveToStorage() {
  localStorage.setItem(LS_STATS_JSON_KEY, JSON.stringify(serializeTable()))
}

function loadFromStorage() {
  unserializeTable(localStorage.getItem(LS_STATS_JSON_KEY))
}

//////////////////// DATA SERIALIZATION/SAVING/LOADING ///////////////////////

function serializeTable() {
  const json = {
    // FIXME add game name requesting!
    gameName: 'test',
    sessionsCount: 0,
    stats: {
      session: {},
      total:   {}
    }
  }

  for (let i of ECharacteristicsList) {
    json.stats.session[i] = +getEl(`${i}-сессия`).innerText
    json.stats.total[i]   = +getEl(`${i}-всего`).innerText
  }

  return json
}

function unserializeTable(str) {
  if(!str) return null

  let json
  json = JSON.parse(str)

  for (let i of ECharacteristicsList) {
    getEl(`${i}-сессия`).innerText = +json.stats.session[i]
    getEl(`${i}-всего`).innerText = +json.stats.total[i]
  }

  //TODO add save/load of other fields
}

function downloadJSON() {
  const DOWNLOAD_EL_NAME = 'downloadhref'
  const json = serializeTable()

  if (!getEl(DOWNLOAD_EL_NAME)) {
    document.body.appendChild(
      createElementFromHTML(`<a id="${DOWNLOAD_EL_NAME}" hidden download="dicestat.gs-dozen.json"></a>`)
    )
  }

  getEl(DOWNLOAD_EL_NAME).href = 'data:application/json;charset=utf-8, ' + JSON.stringify(json, null, '\t')
  getEl(DOWNLOAD_EL_NAME).click()
}

function uploadJSON() {
  const UPLOAD_EL_NAME = 'fileUploadEl'

  if (!getEl(UPLOAD_EL_NAME)) {
    document.body.appendChild(
      createElementFromHTML(`<input type="file" id="${UPLOAD_EL_NAME}" name="fileUploadEl" hidden/>`)
    )
    getEl(UPLOAD_EL_NAME).addEventListener('change', handleSaveFileSelect, false)
  }

  getEl(UPLOAD_EL_NAME).click()
}

function handleSaveFileSelect(evt) {
  //see FileList
  const file = evt.target.files[0]

  if (file.type != 'application/json') {
    alert('should be "<name>.gs-dozen.json" file!')
    return
  }

  const reader = new FileReader()
  reader.onload = (function (e) {
    try {
      unserializeTable(e.target.result)
    } catch(e) {
      alert(e)
      console.error(e)
    }
  })
  reader.readAsText(file)
}

////////////////////// STAT TABLE ///////////////////////

function fillStatTable(statJSON = {}) {
  STATS_TABLE_EL.tBodies[0].innerHTML = ''

  let statName = null
  for (let i in ECharacteristicsList) {
    statName = ECharacteristicsList[i]
    STATS_TABLE_EL.tBodies[0].innerHTML +=
      `<tr id='${statName}-row'>
      <td>${+i + 1}</td>
      <td id='${statName}-кнопка' onclick=statTableClick(this)>${statName}</td>
      <td id='${statName}-сессия' class="сессия">0</td>
      <td id='${statName}-всего'  contenteditable=false class="всего" >${statJSON[statName] || 0}</td>
      </tr>`
  }
}

let lastStats = []

/** @param {HTMLTableCellElement} el*/
// eslint-disable-next-line no-unused-vars
function statTableClick(el) {
  const statName = el.innerText
  getEl(`${statName}-сессия`).innerText = +getEl(`${statName}-сессия`).innerText + 1
  getEl(`${statName}-всего`).innerText = +getEl(`${statName}-всего`).innerText + 1

  if(lastStats.length == 10) lastStats.shift()
  lastStats.push(statName)

  saveToStorage()
}

function undoClick() {
  const lastStat = lastStats.pop()
  if(!lastStat) return

  getEl(`${lastStat}-сессия`).innerText = +getEl(`${lastStat}-сессия`).innerText - 1
  getEl(`${lastStat}-всего`).innerText  = +getEl(`${lastStat}-всего`).innerText  - 1

  saveToStorage()
}

function endSessionClick() {
  if(!confirm('Закончить сессию?')) return
  for (let i of document.querySelectorAll('.сессия')) {
    i.innerText = 0
  }
  saveToStorage()
  lastStats = []
}

function switchSummaryEditClick() {
  for(let i of Array.from(document.querySelectorAll('.всего')) ) {
    log(JSON.stringify(i.contentEditable))
    i.contentEditable = i.contentEditable == 'true' ? 'false' : 'true'
    log(JSON.stringify(i.contentEditable))
  }
}

function onVisibility() {
  if (document.visibilityState === 'hidden') {
    //TODO set LS flag "closed properly"
  }
}

function init() {
  getEl('b__downloadData').onclick = downloadJSON
  getEl('b__uploadData').addEventListener('click', uploadJSON, false)
  getEl('b__endSession').onclick = endSessionClick
  getEl('b__undo').onclick = undoClick
  getEl('b__allowEditSummary').onclick = switchSummaryEditClick

  document.addEventListener("visibilitychange", onVisibility)

  fillStatTable()

  loadFromStorage()
}

try {
  init()
} catch (e) {
  alert(e)
  console.error(e)
}