// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      1.0.0
// @match        https://ustvgo.tv/*
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
  const player = unsafeWindow.player
  let hls_url  = null

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

const process_iframe = () => {
  const iframe = document.querySelector('iframe[src^="https://ustvgo.tv/"]')
  if (iframe)
    unsafeWindow.location = iframe.getAttribute('src')
}

// =============================================================================

const process_page = () => {
  const hls_url = get_hls_url()

  if (hls_url) {
    const extras = ['referUrl', get_referer_url()]

    GM_startIntent(/* action= */ 'android.intent.action.VIEW', /* data= */ hls_url, /* type= */ 'application/x-mpegurl', /* extras: */ ...extras);
  }
  else {
    process_iframe()
  }
}

// =============================================================================

process_page()
