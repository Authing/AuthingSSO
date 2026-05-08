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


function getReferrerOrigin(): string {
  try {
    const referrer = document.referrer;
    if (!referrer) return '';

    const url = new URL(referrer);
    return `${url.host}`;
  } catch {
    return '';
  }
}


export { isInElectron, isInChrome, isIE, getReferrerOrigin }
