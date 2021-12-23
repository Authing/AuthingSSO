const isInElectron = window.navigator.userAgent.includes('Electron')
const isInChrome = window.navigator.userAgent.includes('Chrome')

const isIE = () => { //ie?
  // @ts-ignore
  if (
    window.navigator.userAgent.indexOf("MSIE") >= 1 ||
    (window.navigator.userAgent.indexOf("Trident") >= 1 && window.navigator.userAgent.indexOf("rv") >= 1) ||
    window.navigator.userAgent.indexOf("Edge") >= 1
  ) {
    return true
  }

  return false
}

export { isInElectron, isInChrome, isIE }