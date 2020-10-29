// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      2.0.3
// @match        https://ustvgo.tv/*
// @match        https://tvguide.to/*
// @icon         http://ustvgo.tv/favicon.ico
// @run-at       document-end
// @homepage     https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es6
// @supportURL   https://github.com/warren-bank/crx-US-TV-Go/issues
// @downloadURL  https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es6/webmonkey-userscript/US-TV-Go.user.js
// @updateURL    https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es6/webmonkey-userscript/US-TV-Go.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ============================================================================= common

const get_referer_url = () => {
  let referer_url
  try {
    referer_url = unsafeWindow.top.location.href
  }
  catch(e) {
    referer_url = unsafeWindow.location.href
  }
  return referer_url
}

// ============================================================================= iframe

const get_hls_url = () => {
  if (unsafeWindow.filePath)
    return unsafeWindow.filePath

  const player = unsafeWindow.player
  let hls_url  = null

  // assert: Clappr
  if (player) {
    if (!hls_url) {
      try {
        hls_url = player.playerInfo.options.source
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.playerInfo.options.sources[0]
      }
      catch(err){}
    }
  }

  // assert: JW Player
  if (player) {
    if (!hls_url) {
      try {
        hls_url = player.getPlaylistItem().file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getPlaylist()[0].file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getConfig().playlistItem.allSources[0].file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getConfig().file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getConfig().playlist[0].file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.playerInfo.options.sources[0]
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        const regex = /^.*\{'file':([^\}]+)\}.*$/
        const txt   = document.querySelector('body > script').innerHTML.replace(/[\r\n]+/g, '')

        if (! regex.test(txt))
          throw ''

        const code = txt.replace(regex, '$1')

        hls_url = eval(code)
      }
      catch(err){}
    }
  }

  return hls_url
}

const process_iframe_window = () => {
  const hls_url = get_hls_url()

  if (hls_url) {
    const extras = ['referUrl', get_referer_url()]

    GM_startIntent(/* action= */ 'android.intent.action.VIEW', /* data= */ hls_url, /* type= */ 'application/x-mpegurl', /* extras: */ ...extras);
  }

  return !!hls_url
}

// ============================================================================= parent

const get_iframe_url = () => {
  const urls = [
    'https://tvguide.to/clappr.php',
    'https://tvguide.to/',
    'https://ustvgo.tv/clappr.php'
  ]

  let iframe
  for (let i=0; (i < urls.length) && !iframe; i++) {
    iframe = document.querySelector('iframe[src^="' + urls[i] + '"]')
  }

  return (iframe) ? iframe.getAttribute('src') : null
}

const process_parent_window = () => {
  const iframe_url = get_iframe_url()

  if (iframe_url) {
    const headers = ['Referer', get_referer_url()]

    GM_loadUrl(iframe_url, ...headers)
  }

  return !!iframe_url
}

// ============================================================================= common bootstrap

const init = () => {
  if (process_iframe_window())
    return

  process_parent_window()
}

init()

// =============================================================================
