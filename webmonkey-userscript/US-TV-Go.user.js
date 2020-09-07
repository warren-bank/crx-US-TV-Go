// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      2.0.1
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

// =============================================================================

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
  }

  return hls_url
}

// =============================================================================

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

// =============================================================================

const process_page = () => {
  const hls_url = get_hls_url()

  if (hls_url) {
    const extras = ['referUrl', get_referer_url()]

    GM_startIntent(/* action= */ 'android.intent.action.VIEW', /* data= */ hls_url, /* type= */ 'application/x-mpegurl', /* extras: */ ...extras);
  }
}

// =============================================================================

if (unsafeWindow.location.hostname.toLowerCase() === 'ustvgo.tv') {
  const iframe = document.querySelector('iframe[src^="https://tvguide.to/"]')
  if (iframe) {
    const url     = iframe.getAttribute('src')
    const headers = ['Referer', get_referer_url()]

    GM_loadUrl(url, ...headers)
  }
}
else {
  process_page()
}

// =============================================================================
