// eslint-disable-next-line no-unused-vars
const log = console.log
function getEl(name) {
  return document.getElementById(name)
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

function downloadJSON() {
  const DOWNLOAD_EL_NAME = 'downloadhref'
  // FIXME
  const json = {}

  if( !getEl(DOWNLOAD_EL_NAME)) {
    document.body.appendChild(
      createElementFromHTML('<a id="' + DOWNLOAD_EL_NAME + '" hidden download="dicestat.gs-dozen.json"></a>')
    )
  }

  getEl(DOWNLOAD_EL_NAME).href = 'data:application/json;charset=utf-8, ' + JSON.stringify(json)
  getEl(DOWNLOAD_EL_NAME).click()
}

function uploadJSON() {
  const UPLOAD_EL_NAME = 'fileUploadEl'

  if( !getEl(UPLOAD_EL_NAME)) {
    document.body.appendChild(
      createElementFromHTML('<input type="file" id="' + UPLOAD_EL_NAME + '" name="fileUploadEl" hidden/>')
    )
    getEl(UPLOAD_EL_NAME).addEventListener('change', handleSaveFileSelect, false)
  }

  getEl(UPLOAD_EL_NAME).click()
}

function handleSaveFileSelect(evt) {
  //see FileList
  const file = evt.target.files[0]

  if(file.type != 'application/json') {
    alert('should be .gs-dozen.json file!')
    return
  }

  const reader = new FileReader()
  reader.onload = (function(_) {
    // FIXME implement!
    // allPage.innerHTML = e.target.result
  } )
  reader.readAsText(file)
}

function main() {
  getEl('b__downloadData').addEventListener('click', downloadJSON, false)
  getEl('b__upoadData').addEventListener('click', uploadJSON, false)
}

main()