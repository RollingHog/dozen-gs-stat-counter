/* global
  VERSION
*/
const ECharacteristicsList = [
  'Бой',
  'Внешность',
  'Внимательность',
  'Знание',

  'Защита',
  'Коварство',
  'Красноречие',
  'Ловкость',

  'Медицина',
  'Местность',
  'Ремесло',
  'Телосложение',

  'Удача',
  'Скверна',
  'Воля',
  'Мягкосердечие',
]

let stateData = {
  sessions: {
    count: 0,
    history: [],
  },
}

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

/**
 * localStorage wrapper
 */
const lsw = {
  table: {
    key: 'STATS.LATEST',
    save() {
      localStorage.setItem(this.key, JSON.stringify(serializeTable()))
    },

    load() {
      unserializeTable(localStorage.getItem(this.key))
    },

    clear() {
      localStorage.removeItem(this.key)
    },
  },

  sessions: {
    key: 'SESSIONS',
    save() {
      localStorage.setItem(this.key, JSON.stringify(stateData.sessions) )
    },

    load() {
      stateData.sessions = JSON.parse(localStorage.getItem(this.key)) || stateData.sessions
    },

    clear() {
      localStorage.removeItem(this.key)
    },
  },

  all: {
    save() {
      lsw.table.save()
      lsw.sessions.save()
    },

    load() {
      lsw.table.load()
      lsw.sessions.load()
    },

    clear() {
      lsw.table.clear()
      lsw.sessions.clear()
    },
  },
}

//////////////////// DATA SERIALIZATION/SAVING/LOADING ///////////////////////

function serializeTable() {
  const json = {
    // FIXME add game name requesting!
    gameName: 'test',
    version: VERSION,
    timestamp: (new Date()).toJSON(),
    stats: {
      session: {},
      total:   {}
    }
  }

  for (let i of ECharacteristicsList) {
    json.stats.session[i] = +getEl(`${i}-сессия`).innerText || 0
    json.stats.total[i]   = +getEl(`${i}-всего`).innerText  || 0
  }

  return json
}

function unserializeTable(str) {
  if(!str) return null

  let json
  if(typeof str == 'string')
    json = JSON.parse(str)
  else
    json = str

  for (let i of ECharacteristicsList) {
    getEl(`${i}-сессия`).innerText = +json.stats.session[i]
    getEl(`${i}-всего`).innerText = +json.stats.total[i]
  }

  //TODO add save/load of other fields
}

function serializeAll() {
  let json = serializeTable()

  json = Object.assign(json, {
    sessions: stateData.sessions,
  })

  return json
}

function unserializeAll(str) {
  if(!str) return null

  let json = JSON.parse(str)

  stateData.sessions = json.sessions || stateData.sessions

  unserializeTable(json)

}

function downloadJSON() {
  const DOWNLOAD_EL_NAME = 'downloadhref'
  const json = serializeAll()

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
      unserializeAll(e.target.result)
    } catch(e) {
      alert(e)
      console.error(e)
    }
    lsw.all.save()
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
      <td id='${statName}-кнопка' onclick="statTableClick('${statName}')" >${statName}</td>
      <td id='${statName}-сессия' onclick="statTableClick('${statName}')" class="сессия">0</td>
      <td id='${statName}-всего'  contenteditable=false                   class="всего" >${statJSON[statName] || 0}</td>
      </tr>`
  }
}

let lastStats = {
  maxSize: 5,
  data: [],
  push(statName) {
    if(this.data.length == this.maxSize) this.data.shift()
    this.data.push(statName)
    this.redraw()
  },
  pop() {
    const res = this.data.pop()
    this.redraw()
    return res
  },
  clear() {
    this.data = []
    this.redraw()
  },
  redraw() {
    const unique = new Set(this.data)
    let el = null
    for(let i of ECharacteristicsList) {
      el = getEl(`${i}-row`)
      if(!el) continue
      if(unique.has(i))
        el.style.background = 'green'
      else
        el.style.background = ''
    }
  },
}

/** @param {HTMLTableCellElement} el*/
// eslint-disable-next-line no-unused-vars
function statTableClick(statName) {
  getEl(`${statName}-сессия`).innerText = +getEl(`${statName}-сессия`).innerText + 1
  getEl(`${statName}-всего`).innerText = +getEl(`${statName}-всего`).innerText + 1

  lastStats.push(statName)

  lsw.table.save()
}

function undoClick() {
  const lastStat = lastStats.pop()
  if(!lastStat) return

  getEl(`${lastStat}-сессия`).innerText = +getEl(`${lastStat}-сессия`).innerText - 1
  getEl(`${lastStat}-всего`).innerText  = +getEl(`${lastStat}-всего`).innerText  - 1

  lsw.table.save()
}

function endSessionClick() {
  const comment = prompt('Закончить сессию?')
  if(comment === null) return

  const json = {
    timestamp: (new Date()).toJSON(),
    comment,
    data: serializeTable().stats.session
  }
  stateData.sessions.count += 1
  stateData.sessions.history.push(json)

  for (let i of document.querySelectorAll('.сессия')) {
    i.innerText = 0
  }

  lsw.all.save()
  lastStats.clear()
}

function switchSummaryEditClick() {
  getEl('b__allowEditSummary').style.textDecoration =
    getEl('b__allowEditSummary').style.textDecoration == 'underline'
    ? ''
    : 'underline'
  for(let i of Array.from(document.querySelectorAll('.всего')) ) {
    i.contentEditable = i.contentEditable == 'true' ? 'false' : 'true'
  }
  lsw.table.save()
}

function onClearStorageClick() {
  if(!confirm('Это не требуется при обычном использовании. Сохраните данные!')) return
  lsw.all.clear()
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
  getEl('b__clearStorage').onclick = onClearStorageClick

  document.addEventListener("visibilitychange", onVisibility)

  fillStatTable()

  lsw.all.load()

  getEl('el__version').innerText = VERSION

}

try {
  init()
} catch (e) {
  alert(e)
  console.error(e)
}
